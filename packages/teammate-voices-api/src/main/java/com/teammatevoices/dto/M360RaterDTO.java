package com.teammatevoices.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Rater row + the token-page view payloads (selection/approval share one screen). */
public class M360RaterDTO {

    private Long raterAssignmentId;
    private String raterParticipantId;
    private String raterName;
    private String raterEmail;
    private String relationship;
    private String addedBy;
    private String addedByName;
    private String status;
    private String rejectionReason;
    private LocalDateTime invitedAt;
    private LocalDateTime feedbackSubmittedAt;

    public static class SelectionViewDTO {
        private Long enrollmentId;
        private Long cycleId;
        private String cycleName;
        private String mode; // SELECT | APPROVE
        private String participantId;
        private String participantName;
        private String participantTitle;
        private String participantOrg;
        private String enrollmentStatus;
        private LocalDateTime dueDate;
        private String reviewLabel;
        private LocalDateTime windowStartAt;
        private LocalDateTime windowEndAt;
        private Integer overallMinRaters;
        private Integer overallMaxRaters;
        private List<M360CycleDTO.CriteriaDTO> criteria = new ArrayList<>();
        private List<M360RaterDTO> raters = new ArrayList<>();

        public Long getEnrollmentId() { return enrollmentId; }
        public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }
        public Long getCycleId() { return cycleId; }
        public void setCycleId(Long cycleId) { this.cycleId = cycleId; }
        public String getCycleName() { return cycleName; }
        public void setCycleName(String cycleName) { this.cycleName = cycleName; }
        public String getMode() { return mode; }
        public void setMode(String mode) { this.mode = mode; }
        public String getParticipantId() { return participantId; }
        public void setParticipantId(String participantId) { this.participantId = participantId; }
        public String getParticipantName() { return participantName; }
        public void setParticipantName(String participantName) { this.participantName = participantName; }
        public String getParticipantTitle() { return participantTitle; }
        public void setParticipantTitle(String participantTitle) { this.participantTitle = participantTitle; }
        public String getParticipantOrg() { return participantOrg; }
        public void setParticipantOrg(String participantOrg) { this.participantOrg = participantOrg; }
        public String getEnrollmentStatus() { return enrollmentStatus; }
        public void setEnrollmentStatus(String enrollmentStatus) { this.enrollmentStatus = enrollmentStatus; }
        public LocalDateTime getDueDate() { return dueDate; }
        public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
        public String getReviewLabel() { return reviewLabel; }
        public void setReviewLabel(String reviewLabel) { this.reviewLabel = reviewLabel; }
        public LocalDateTime getWindowStartAt() { return windowStartAt; }
        public void setWindowStartAt(LocalDateTime windowStartAt) { this.windowStartAt = windowStartAt; }
        public LocalDateTime getWindowEndAt() { return windowEndAt; }
        public void setWindowEndAt(LocalDateTime windowEndAt) { this.windowEndAt = windowEndAt; }
        public Integer getOverallMinRaters() { return overallMinRaters; }
        public void setOverallMinRaters(Integer overallMinRaters) { this.overallMinRaters = overallMinRaters; }
        public Integer getOverallMaxRaters() { return overallMaxRaters; }
        public void setOverallMaxRaters(Integer overallMaxRaters) { this.overallMaxRaters = overallMaxRaters; }
        public List<M360CycleDTO.CriteriaDTO> getCriteria() { return criteria; }
        public void setCriteria(List<M360CycleDTO.CriteriaDTO> criteria) { this.criteria = criteria; }
        public List<M360RaterDTO> getRaters() { return raters; }
        public void setRaters(List<M360RaterDTO> raters) { this.raters = raters; }
    }

    public static class PersonSearchResultDTO {
        private String participantId;
        private String fullName;
        private String email;
        private String lineOfBusiness;
        private String region;

        public String getParticipantId() { return participantId; }
        public void setParticipantId(String participantId) { this.participantId = participantId; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getLineOfBusiness() { return lineOfBusiness; }
        public void setLineOfBusiness(String lineOfBusiness) { this.lineOfBusiness = lineOfBusiness; }
        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }
    }

    public Long getRaterAssignmentId() { return raterAssignmentId; }
    public void setRaterAssignmentId(Long raterAssignmentId) { this.raterAssignmentId = raterAssignmentId; }
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
    public String getAddedByName() { return addedByName; }
    public void setAddedByName(String addedByName) { this.addedByName = addedByName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDateTime getInvitedAt() { return invitedAt; }
    public void setInvitedAt(LocalDateTime invitedAt) { this.invitedAt = invitedAt; }
    public LocalDateTime getFeedbackSubmittedAt() { return feedbackSubmittedAt; }
    public void setFeedbackSubmittedAt(LocalDateTime feedbackSubmittedAt) { this.feedbackSubmittedAt = feedbackSubmittedAt; }
}
