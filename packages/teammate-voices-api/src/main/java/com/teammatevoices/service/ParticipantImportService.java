package com.teammatevoices.service;

import com.teammatevoices.dto.ParticipantImportResultDTO;
import com.teammatevoices.model.Participant;
import com.teammatevoices.repository.ParticipantRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class ParticipantImportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
        DateTimeFormatter.ofPattern("yyyy-MM-dd"),
        DateTimeFormatter.ofPattern("MM/dd/yyyy"),
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),
        DateTimeFormatter.ofPattern("M/d/yyyy")
    );

    private final ParticipantRepository participantRepository;

    public ParticipantImportService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    /**
     * Expected column headers (case-insensitive):
     * participantId, fullName, email, participantType, trainingProgram, cohort,
     * region, lineOfBusiness, managerName, hierarchyCode, startDate, expectedEndDate, isActive
     */
    public ParticipantImportResultDTO importFromExcel(MultipartFile file) throws IOException {
        int uploaded = 0, alreadyExists = 0, errorCount = 0;
        List<String> errorDetails = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                errorDetails.add("File is empty — no header row found");
                return new ParticipantImportResultDTO(0, 0, 0, 1, errorDetails);
            }

            // Build header → column index map (normalise to lowercase, strip spaces/hyphens)
            Map<String, Integer> colIndex = new HashMap<>();
            for (Cell cell : headerRow) {
                String header = getCellString(cell).trim().toLowerCase().replaceAll("[\\s_\\-]", "");
                colIndex.put(header, cell.getColumnIndex());
            }

            int totalRows = 0;
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;
                totalRows++;

                try {
                    // ── Validate required: email ──────────────────────────────
                    String email = getCol(row, colIndex, "email");
                    if (email == null || email.isBlank()) {
                        errorDetails.add("Row " + (i + 1) + ": email is required");
                        errorCount++;
                        continue;
                    }
                    email = email.trim().toLowerCase();

                    // ── Validate required: fullName ───────────────────────────
                    String fullName = getCol(row, colIndex, "fullname");
                    if (fullName == null || fullName.isBlank()) {
                        errorDetails.add("Row " + (i + 1) + " (" + email + "): fullName is required");
                        errorCount++;
                        continue;
                    }

                    // ── Validate required: startDate ──────────────────────────
                    String startDateStr = getCol(row, colIndex, "startdate");
                    LocalDate startDate = parseDate(startDateStr);
                    if (startDate == null) {
                        errorDetails.add("Row " + (i + 1) + " (" + email + "): startDate is missing or invalid"
                                + (startDateStr != null && !startDateStr.isBlank() ? " ('" + startDateStr + "')" : "")
                                + " — use MM/dd/yyyy or yyyy-MM-dd");
                        errorCount++;
                        continue;
                    }

                    // ── Skip if participant already exists (match by email) ───
                    if (participantRepository.findByEmail(email).isPresent()) {
                        alreadyExists++;
                        continue;
                    }

                    // ── Create new participant ────────────────────────────────
                    Participant p = new Participant();
                    String pid = getCol(row, colIndex, "participantid");
                    p.setParticipantId(pid != null && !pid.isBlank() ? pid.trim() : UUID.randomUUID().toString());

                    p.setEmail(email);
                    p.setFullName(fullName.trim());

                    String pType = getCol(row, colIndex, "participanttype");
                    p.setParticipantType(pType != null && !pType.isBlank() ? pType.trim().toUpperCase() : "EXISTING_RESOURCE");

                    p.setTrainingProgram(getColTrimmed(row, colIndex, "trainingprogram"));
                    p.setCohort(getColTrimmed(row, colIndex, "cohort"));
                    p.setRegion(getColTrimmed(row, colIndex, "region"));
                    p.setLineOfBusiness(getColTrimmed(row, colIndex, "lineofbusiness"));
                    p.setManagerName(getColTrimmed(row, colIndex, "managername"));
                    p.setHierarchyCode(getColTrimmed(row, colIndex, "hierarchycode"));
                    p.setStartDate(startDate);
                    p.setExpectedEndDate(parseDate(getCol(row, colIndex, "expectedenddate")));

                    String activeStr = getCol(row, colIndex, "isactive");
                    p.setIsActive(activeStr == null || activeStr.isBlank()
                            || (!"false".equalsIgnoreCase(activeStr.trim()) && !"0".equals(activeStr.trim())));

                    participantRepository.save(p);
                    uploaded++;

                } catch (Exception e) {
                    errorDetails.add("Row " + (i + 1) + ": unexpected error — " + e.getMessage());
                    errorCount++;
                }
            }

            return new ParticipantImportResultDTO(totalRows, uploaded, alreadyExists, errorCount, errorDetails);
        }
    }

    private String getCol(Row row, Map<String, Integer> colIndex, String key) {
        Integer idx = colIndex.get(key);
        if (idx == null) return null;
        Cell cell = row.getCell(idx);
        return cell != null ? getCellString(cell) : null;
    }

    private String getColTrimmed(Row row, Map<String, Integer> colIndex, String key) {
        String val = getCol(row, colIndex, key);
        return (val != null && !val.isBlank()) ? val.trim() : null;
    }

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toLocalDate().format(DATE_FMT);
                }
                double d = cell.getNumericCellValue();
                yield d == Math.floor(d) ? String.valueOf((long) d) : String.valueOf(d);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCachedFormulaResultType() == CellType.STRING
                ? cell.getStringCellValue()
                : String.valueOf(cell.getNumericCellValue());
            default -> "";
        };
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        for (DateTimeFormatter fmt : DATE_FORMATS) {
            try { return LocalDate.parse(s.trim(), fmt); } catch (DateTimeParseException ignored) {}
        }
        return null;
    }

    private boolean isRowEmpty(Row row) {
        for (Cell cell : row) {
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellString(cell).isBlank())
                return false;
        }
        return true;
    }
}
