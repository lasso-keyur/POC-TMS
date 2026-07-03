package com.teammatevoices.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "M360_ENROLLMENTS")
public class M360Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENROLLMENT_ID")
    private Long enrollmentId;

    @Column(name = "CYCLE_ID", nullable = false)
    private Long cycleId;

    @Column(name = "PARTICIPANT_ID", nullable = false, length = 100)
    private String participantId;

    @Column(name = "MANAGER_NAME", length = 255)
    private String managerName;

    @Column(name = "MANAGER_EMAIL", length = 255)
    private String managerEmail;

    @Column(name = "STATUS", length = 30)
    private String status = "ENROLLED";

    @Column(name = "PARTICIPANT_TOKEN", length = 255)
    private String participantToken;

    @Column(name = "MANAGER_TOKEN", length = 255)
    private String managerToken;

    @Column(name = "RATERS_SUBMITTED_AT")
    private LocalDateTime ratersSubmittedAt;

    @Column(name = "RATERS_APPROVED_AT")
    private LocalDateTime ratersApprovedAt;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    public M360Enrollment() {
    }

    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }

    public String getParticipantId() { return participantId; }
    public void setParticipantId(String participantId) { this.participantId = participantId; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
