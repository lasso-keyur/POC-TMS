package com.teammatevoices.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Combined DTO for the Program Detail page.
 * Top card: program info. Bottom grid: participants with dispatch statuses.
 */
public class ProgramDetailDTO {

    private ProgramDTO program;
    private List<ParticipantStatusRow> participants;
    private int totalParticipants;
    private int completedCount;
    private int pendingCount;
    private int sentCount;

    public ProgramDTO getProgram() { return program; }
    public void setProgram(ProgramDTO program) { this.program = program; }

    public List<ParticipantStatusRow> getParticipants() { return participants; }
    public void setParticipants(List<ParticipantStatusRow> participants) { this.participants = participants; }

    public int getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(int totalParticipants) { this.totalParticipants = totalParticipants; }

    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }

    public int getPendingCount() { return pendingCount; }
    public void setPendingCount(int pendingCount) { this.pendingCount = pendingCount; }

    public int getSentCount() { return sentCount; }
    public void setSentCount(int sentCount) { this.sentCount = sentCount; }

    /**
     * One row per participant in the grid, enriched with their latest dispatch status.
     */
    public static class ParticipantStatusRow {
        private String participantId;
        private String fullName;
        private String email;
        private String cohort;
        private String participantType;
        private boolean isActive;

        // Dispatch info (latest)
        private String dispatchStatus;    // PENDING, SENT, OPENED, SUBMITTED, FAILED, EXPIRED, or null
        private String surveyStage;       // ONBOARDING, MID_TRAINING, END_TRAINING
        private LocalDateTime sentAt;
        private LocalDateTime submittedAt;
        private int reminderCount;

        public String getParticipantId() { return participantId; }
        public void setParticipantId(String participantId) { this.participantId = participantId; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getCohort() { return cohort; }
        public void setCohort(String cohort) { this.cohort = cohort; }

        public String getParticipantType() { return participantType; }
        public void setParticipantType(String participantType) { this.participantType = participantType; }

        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }

        public String getDispatchStatus() { return dispatchStatus; }
        public void setDispatchStatus(String dispatchStatus) { this.dispatchStatus = dispatchStatus; }

        public String getSurveyStage() { return surveyStage; }
        public void setSurveyStage(String surveyStage) { this.surveyStage = surveyStage; }

        public LocalDateTime getSentAt() { return sentAt; }
        public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

        public LocalDateTime getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

        public int getReminderCount() { return reminderCount; }
        public void setReminderCount(int reminderCount) { this.reminderCount = reminderCount; }
    }
}
