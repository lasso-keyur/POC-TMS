package com.teammatevoices.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "M360_RATER_ASSIGNMENTS")
public class M360RaterAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RATER_ASSIGNMENT_ID")
    private Long raterAssignmentId;

    @Column(name = "ENROLLMENT_ID", nullable = false)
    private Long enrollmentId;

    @Column(name = "RATER_PARTICIPANT_ID", length = 100)
    private String raterParticipantId;

    @Column(name = "RATER_NAME", nullable = false, length = 255)
    private String raterName;

    @Column(name = "RATER_EMAIL", nullable = false, length = 255)
    private String raterEmail;

    @Column(name = "RELATIONSHIP", nullable = false, length = 30)
    private String relationship;

    @Column(name = "ADDED_BY", length = 20)
    private String addedBy = "SELF";

    @Column(name = "STATUS", length = 30)
    private String status = "PENDING_APPROVAL";

    @Column(name = "REJECTION_REASON", length = 1000)
    private String rejectionReason;

    @Column(name = "FEEDBACK_TOKEN", length = 255)
    private String feedbackToken;

    @Column(name = "INVITED_AT")
    private LocalDateTime invitedAt;

    @Column(name = "FEEDBACK_SUBMITTED_AT")
    private LocalDateTime feedbackSubmittedAt;

    @Column(name = "EMAIL_STATUS", length = 20)
    private String emailStatus = "NOT_SENT";

    @Column(name = "EMAIL_TEMPLATE_ID")
    private Long emailTemplateId;

    @Column(name = "RESPONSE_ID")
    private Long responseId;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    public M360RaterAssignment() {
    }

    public Long getRaterAssignmentId() { return raterAssignmentId; }
    public void setRaterAssignmentId(Long raterAssignmentId) { this.raterAssignmentId = raterAssignmentId; }

    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }

    public String getRaterParticipantId() { return raterParticipantId; }
    public void setRaterParticipantId(String raterParticipantId) { this.raterParticipantId = raterParticipantId; }

    public String getRaterName() { return raterName; }
    public void setRaterName(String raterName) { this.raterName = raterName; }

    public String getRaterEmail() { return raterEmail; }
    public void setRaterEmail(String raterEmail) { this.raterEmail = raterEmail; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getAddedBy() { return addedBy; }
    public void setAddedBy(String addedBy) { this.addedBy = addedBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getFeedbackToken() { return feedbackToken; }
    public void setFeedbackToken(String feedbackToken) { this.feedbackToken = feedbackToken; }

    public LocalDateTime getInvitedAt() { return invitedAt; }
    public void setInvitedAt(LocalDateTime invitedAt) { this.invitedAt = invitedAt; }

    public LocalDateTime getFeedbackSubmittedAt() { return feedbackSubmittedAt; }
    public void setFeedbackSubmittedAt(LocalDateTime feedbackSubmittedAt) { this.feedbackSubmittedAt = feedbackSubmittedAt; }

    public String getEmailStatus() { return emailStatus; }
    public void setEmailStatus(String emailStatus) { this.emailStatus = emailStatus; }

    public Long getEmailTemplateId() { return emailTemplateId; }
    public void setEmailTemplateId(Long emailTemplateId) { this.emailTemplateId = emailTemplateId; }

    public Long getResponseId() { return responseId; }
    public void setResponseId(Long responseId) { this.responseId = responseId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
