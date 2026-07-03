package com.teammatevoices.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class M360CycleDTO {

    private Long cycleId;
    private Long programId;
    private Long surveyId;
    private String surveyTitle;
    private String name;
    private String description;
    private Integer version;
    private String versionLabel;
    private LocalDate startDate;
    private String status;
    private Boolean allowSelfSelection;
    private Boolean allowManagerSelection;
    private Boolean allowHrSelection;
    private Integer overallMinRaters;
    private Integer overallMaxRaters;
    private Long participantCount;
    private LocalDateTime scheduleStartAt;
    private LocalDateTime scheduleEndAt;
    private List<PhaseDTO> phases = new ArrayList<>();
    private List<CriteriaDTO> criteria = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class PhaseDTO {
        private Long phaseId;
        private String phaseType;
        private Boolean isEnabled;
        private LocalDateTime startAt;
        private LocalDateTime endAt;
        private String timezone;
        private List<ActivityDTO> activities = new ArrayList<>();

        public Long getPhaseId() { return phaseId; }
        public void setPhaseId(Long phaseId) { this.phaseId = phaseId; }
        public String getPhaseType() { return phaseType; }
        public void setPhaseType(String phaseType) { this.phaseType = phaseType; }
        public Boolean getIsEnabled() { return isEnabled; }
        public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }
        public LocalDateTime getStartAt() { return startAt; }
        public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }
        public LocalDateTime getEndAt() { return endAt; }
        public void setEndAt(LocalDateTime endAt) { this.endAt = endAt; }
        public String getTimezone() { return timezone; }
        public void setTimezone(String timezone) { this.timezone = timezone; }
        public List<ActivityDTO> getActivities() { return activities; }
        public void setActivities(List<ActivityDTO> activities) { this.activities = activities; }
    }

    public static class ActivityDTO {
        private Long activityId;
        private String activityName;
        private Long emailTemplateId;
        private String emailTemplateName;
        private LocalDate activityDate;
        private String activityTime;
        private Boolean isEnabled;
        private Integer sortOrder;

        public Long getActivityId() { return activityId; }
        public void setActivityId(Long activityId) { this.activityId = activityId; }
        public String getActivityName() { return activityName; }
        public void setActivityName(String activityName) { this.activityName = activityName; }
        public Long getEmailTemplateId() { return emailTemplateId; }
        public void setEmailTemplateId(Long emailTemplateId) { this.emailTemplateId = emailTemplateId; }
        public String getEmailTemplateName() { return emailTemplateName; }
        public void setEmailTemplateName(String emailTemplateName) { this.emailTemplateName = emailTemplateName; }
        public LocalDate getActivityDate() { return activityDate; }
        public void setActivityDate(LocalDate activityDate) { this.activityDate = activityDate; }
        public String getActivityTime() { return activityTime; }
        public void setActivityTime(String activityTime) { this.activityTime = activityTime; }
        public Boolean getIsEnabled() { return isEnabled; }
        public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }
        public Integer getSortOrder() { return sortOrder; }
        public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    }

    public static class CriteriaDTO {
        private Long criteriaId;
        private String category;
        private Integer minCount;
        private Integer maxCount;
        private Boolean autoLoad;
        private Boolean isEnabled;

        public Long getCriteriaId() { return criteriaId; }
        public void setCriteriaId(Long criteriaId) { this.criteriaId = criteriaId; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Integer getMinCount() { return minCount; }
        public void setMinCount(Integer minCount) { this.minCount = minCount; }
        public Integer getMaxCount() { return maxCount; }
        public void setMaxCount(Integer maxCount) { this.maxCount = maxCount; }
        public Boolean getAutoLoad() { return autoLoad; }
        public void setAutoLoad(Boolean autoLoad) { this.autoLoad = autoLoad; }
        public Boolean getIsEnabled() { return isEnabled; }
        public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }
    }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }
    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }
    public Long getSurveyId() { return surveyId; }
    public void setSurveyId(Long surveyId) { this.surveyId = surveyId; }
    public String getSurveyTitle() { return surveyTitle; }
    public void setSurveyTitle(String surveyTitle) { this.surveyTitle = surveyTitle; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
    public String getVersionLabel() { return versionLabel; }
    public void setVersionLabel(String versionLabel) { this.versionLabel = versionLabel; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getAllowSelfSelection() { return allowSelfSelection; }
    public void setAllowSelfSelection(Boolean allowSelfSelection) { this.allowSelfSelection = allowSelfSelection; }
    public Boolean getAllowManagerSelection() { return allowManagerSelection; }
    public void setAllowManagerSelection(Boolean allowManagerSelection) { this.allowManagerSelection = allowManagerSelection; }
    public Boolean getAllowHrSelection() { return allowHrSelection; }
    public void setAllowHrSelection(Boolean allowHrSelection) { this.allowHrSelection = allowHrSelection; }
    public Integer getOverallMinRaters() { return overallMinRaters; }
    public void setOverallMinRaters(Integer overallMinRaters) { this.overallMinRaters = overallMinRaters; }
    public Integer getOverallMaxRaters() { return overallMaxRaters; }
    public void setOverallMaxRaters(Integer overallMaxRaters) { this.overallMaxRaters = overallMaxRaters; }
    public Long getParticipantCount() { return participantCount; }
    public void setParticipantCount(Long participantCount) { this.participantCount = participantCount; }
    public LocalDateTime getScheduleStartAt() { return scheduleStartAt; }
    public void setScheduleStartAt(LocalDateTime scheduleStartAt) { this.scheduleStartAt = scheduleStartAt; }
    public LocalDateTime getScheduleEndAt() { return scheduleEndAt; }
    public void setScheduleEndAt(LocalDateTime scheduleEndAt) { this.scheduleEndAt = scheduleEndAt; }
    public List<PhaseDTO> getPhases() { return phases; }
    public void setPhases(List<PhaseDTO> phases) { this.phases = phases; }
    public List<CriteriaDTO> getCriteria() { return criteria; }
    public void setCriteria(List<CriteriaDTO> criteria) { this.criteria = criteria; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
