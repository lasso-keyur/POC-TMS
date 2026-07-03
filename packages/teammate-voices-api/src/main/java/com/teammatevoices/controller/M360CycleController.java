package com.teammatevoices.controller;

import com.teammatevoices.dto.M360CycleDTO;
import com.teammatevoices.dto.M360EnrollmentDTO;
import com.teammatevoices.dto.M360ReportDTO;
import com.teammatevoices.dto.ParticipantImportResultDTO;
import com.teammatevoices.service.M360CycleService;
import com.teammatevoices.service.M360FeedbackService;
import com.teammatevoices.service.ParticipantImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/m360/cycles")
public class M360CycleController {

    private static final Logger log = LoggerFactory.getLogger(M360CycleController.class);

    private final M360CycleService cycleService;
    private final M360FeedbackService feedbackService;
    private final ParticipantImportService participantImportService;

    public M360CycleController(M360CycleService cycleService,
                               M360FeedbackService feedbackService,
                               ParticipantImportService participantImportService) {
        this.cycleService = cycleService;
        this.feedbackService = feedbackService;
        this.participantImportService = participantImportService;
    }

    @GetMapping
    public ResponseEntity<List<M360CycleDTO>> getCycles(@RequestParam(required = false) Long programId) {
        log.info("GET /m360/cycles?programId={}", programId);
        return ResponseEntity.ok(cycleService.getCyclesForProgram(programId));
    }

    @GetMapping("/{cycleId}")
    public ResponseEntity<M360CycleDTO> getCycle(@PathVariable Long cycleId) {
        return ResponseEntity.ok(cycleService.getCycle(cycleId));
    }

    @PostMapping
    public ResponseEntity<M360CycleDTO> createCycle(@RequestBody M360CycleDTO dto) {
        log.info("POST /m360/cycles");
        return ResponseEntity.status(HttpStatus.CREATED).body(cycleService.createCycle(dto));
    }

    @PutMapping("/{cycleId}")
    public ResponseEntity<M360CycleDTO> updateCycle(@PathVariable Long cycleId, @RequestBody M360CycleDTO dto) {
        return ResponseEntity.ok(cycleService.updateCycle(cycleId, dto));
    }

    @PutMapping("/{cycleId}/phases")
    public ResponseEntity<M360CycleDTO> savePhases(@PathVariable Long cycleId,
                                                   @RequestBody List<M360CycleDTO.PhaseDTO> phases) {
        return ResponseEntity.ok(cycleService.savePhases(cycleId, phases));
    }

    @PutMapping("/{cycleId}/criteria")
    public ResponseEntity<M360CycleDTO> saveCriteria(@PathVariable Long cycleId,
                                                     @RequestBody List<M360CycleDTO.CriteriaDTO> criteria) {
        return ResponseEntity.ok(cycleService.saveCriteria(cycleId, criteria));
    }

    @PostMapping("/{cycleId}/duplicate")
    public ResponseEntity<M360CycleDTO> duplicateCycle(@PathVariable Long cycleId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cycleService.duplicateCycle(cycleId));
    }

    @DeleteMapping("/{cycleId}")
    public ResponseEntity<Void> deleteCycle(@PathVariable Long cycleId) {
        cycleService.deleteCycle(cycleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{cycleId}/enrollments")
    public ResponseEntity<List<M360EnrollmentDTO>> getEnrollments(@PathVariable Long cycleId) {
        return ResponseEntity.ok(cycleService.getEnrollments(cycleId));
    }

    @PostMapping("/{cycleId}/enrollments")
    public ResponseEntity<List<M360EnrollmentDTO>> enrollParticipants(@PathVariable Long cycleId,
                                                                      @RequestBody Map<String, List<String>> body) {
        List<String> participantIds = body.getOrDefault("participantIds", List.of());
        return ResponseEntity.ok(cycleService.enrollParticipants(cycleId, participantIds));
    }

    @DeleteMapping("/{cycleId}/enrollments/{enrollmentId}")
    public ResponseEntity<Void> removeEnrollment(@PathVariable Long cycleId, @PathVariable Long enrollmentId) {
        cycleService.removeEnrollment(cycleId, enrollmentId);
        return ResponseEntity.noContent().build();
    }

    /** Bulk upload: import participants from .xlsx and enroll every row into this cycle. */
    @PostMapping("/{cycleId}/enrollments/import")
    public ResponseEntity<?> importEnrollments(@PathVariable Long cycleId,
                                               @RequestParam("file") MultipartFile file) {
        log.info("POST /m360/cycles/{}/enrollments/import — file={}, size={}",
                cycleId, file.getOriginalFilename(), file.getSize());
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No file uploaded"));
        }
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!filename.endsWith(".xlsx")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only .xlsx files are supported"));
        }
        if (file.getSize() > 25L * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("message", "Maximum upload file size is 25 MB"));
        }
        try {
            ParticipantImportResultDTO result = participantImportService.importFromExcel(file);
            List<M360EnrollmentDTO> enrollments =
                    cycleService.enrollParticipants(cycleId, result.getParticipantIds());
            return ResponseEntity.ok(Map.of("importResult", result, "enrollments", enrollments));
        } catch (IOException e) {
            log.error("Failed to parse Excel file for cycle {}", cycleId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "There was an issue with the file you are trying to upload. Please try again."));
        }
    }

    @GetMapping("/{cycleId}/participants/{participantId}/report")
    public ResponseEntity<M360ReportDTO> getReport(@PathVariable Long cycleId, @PathVariable String participantId) {
        return ResponseEntity.ok(feedbackService.getReport(cycleId, participantId));
    }

    @GetMapping("/{cycleId}/audit")
    public ResponseEntity<List<com.teammatevoices.model.WorkflowAuditLog>> getAuditTrail(@PathVariable Long cycleId) {
        return ResponseEntity.ok(cycleService.getAuditTrail(cycleId));
    }
}
