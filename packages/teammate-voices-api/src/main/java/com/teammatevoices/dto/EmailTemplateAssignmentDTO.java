package com.teammatevoices.dto;

import java.time.LocalDateTime;

public class EmailTemplateAssignmentDTO {

    private Long assignmentId;
    private Long templateId;
    private String templateName;
    private Long programId;
    private Long surveyId;
    private String triggerType;
    private Integer sendDelayDays;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public EmailTemplateAssignmentDTO() {}

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public Long getTemplateId() { return templateId; }
    public void setTemplateId(Long templateId) { this.templateId = templateId; }
    public String getTemplateName() { return templateName; }
    public void setTemplateName(String templateName) { this.templateName = templateName; }
    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }
    public Long getSurveyId() { return surveyId; }
    public void setSurveyId(Long surveyId) { this.surveyId = surveyId; }
    public String getTriggerType() { return triggerType; }
    public void setTriggerType(String triggerType) { this.triggerType = triggerType; }
    public Integer getSendDelayDays() { return sendDelayDays; }
    public void setSendDelayDays(Integer sendDelayDays) { this.sendDelayDays = sendDelayDays; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
