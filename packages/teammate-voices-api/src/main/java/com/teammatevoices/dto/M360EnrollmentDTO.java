package com.teammatevoices.dto;

import java.time.LocalDateTime;

public class M360EnrollmentDTO {

    private Long enrollmentId;
    private Long cycleId;
    private String participantId;
    private String participantName;
    private String participantEmail;
    private String managerName;
    private String managerEmail;
    private String status;
    private String participantToken;
    private String managerToken;
    private LocalDateTime ratersSubmittedAt;
    private LocalDateTime ratersApprovedAt;
    private int raterCount;

    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }
    public String getParticipantId() { return participantId; }
    public void setParticipantId(String participantId) { this.participantId = participantId; }
    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }
    public String getParticipantEmail() { return participantEmail; }
    public void setParticipantEmail(String participantEmail) { this.participantEmail = participantEmail; }
    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }
    public String getManagerEmail() { return managerEmail; }
    public void setManagerEmail(String managerEmail) { this.managerEmail = managerEmail; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getParticipantToken() { return participantToken; }
    public void setParticipantToken(String participantToken) { this.participantToken = participantToken; }
    public String getManagerToken() { return managerToken; }
    public void setManagerToken(String managerToken) { this.managerToken = managerToken; }
    public LocalDateTime getRatersSubmittedAt() { return ratersSubmittedAt; }
    public void setRatersSubmittedAt(LocalDateTime ratersSubmittedAt) { this.ratersSubmittedAt = ratersSubmittedAt; }
    public LocalDateTime getRatersApprovedAt() { return ratersApprovedAt; }
    public void setRatersApprovedAt(LocalDateTime ratersApprovedAt) { this.ratersApprovedAt = ratersApprovedAt; }
    public int getRaterCount() { return raterCount; }
    public void setRaterCount(int raterCount) { this.raterCount = raterCount; }
}
