package com.teammatevoices.dto;

import java.util.List;

public class ParticipantImportResultDTO {

    private int totalRows;      // Total data rows in the file
    private int uploaded;       // New records successfully created
    private int alreadyExists;  // Records skipped — email already in DB
    private int errors;         // Rows that failed due to validation/data errors
    private List<String> errorDetails; // Human-readable error messages per row

    public ParticipantImportResultDTO() {}

    public ParticipantImportResultDTO(int totalRows, int uploaded, int alreadyExists,
                                      int errors, List<String> errorDetails) {
        this.totalRows = totalRows;
        this.uploaded = uploaded;
        this.alreadyExists = alreadyExists;
        this.errors = errors;
        this.errorDetails = errorDetails;
    }

    public int getTotalRows()                   { return totalRows; }
    public void setTotalRows(int v)             { this.totalRows = v; }

    public int getUploaded()                    { return uploaded; }
    public void setUploaded(int v)              { this.uploaded = v; }

    public int getAlreadyExists()               { return alreadyExists; }
    public void setAlreadyExists(int v)         { this.alreadyExists = v; }

    public int getErrors()                      { return errors; }
    public void setErrors(int v)                { this.errors = v; }

    public List<String> getErrorDetails()       { return errorDetails; }
    public void setErrorDetails(List<String> v) { this.errorDetails = v; }
}
