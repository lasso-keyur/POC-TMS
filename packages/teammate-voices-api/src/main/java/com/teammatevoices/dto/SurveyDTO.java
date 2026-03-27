package com.teammatevoices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class SurveyDTO {
    private Long surveyId;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private String templateType;
    private String status;
    private String buildStatus;
    private Long programId;
    private String cycle;
    private String pages;
    private String logicJson;
    private String participantType;
    private String surveyStage;
    private String audienceSource;
    private Boolean autoSend;
    private Long createdBy;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isAnonymous;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QuestionDTO> questions;

    /**
     * Participant attributes injected at survey load time for token-based (tracked) responses.
     * Null for anonymous/public surveys. Used by the frontend rule evaluator to apply
     * audience-based logic rules (region, lineOfBusiness, cohort, participantType, hierarchyCode).
     */
    private Map<String, String> participantContext;

    public Long getSurveyId() {
        return surveyId;
    }

    public void setSurveyId(Long surveyId) {
        this.surveyId = surveyId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBuildStatus() {
        return buildStatus;
    }

    public void setBuildStatus(String buildStatus) {
        this.buildStatus = buildStatus;
    }

    public Long getProgramId() {
        return programId;
    }

    public void setProgramId(Long programId) {
        this.programId = programId;
    }

    public String getCycle() {
        return cycle;
    }

    public void setCycle(String cycle) {
        this.cycle = cycle;
    }

    public String getPages() {
        return pages;
    }

    public void setPages(String pages) {
        this.pages = pages;
    }

    public String getLogicJson() {
        return logicJson;
    }

    public void setLogicJson(String logicJson) {
        this.logicJson = logicJson;
    }

    public String getParticipantType() {
        return participantType;
    }

    public void setParticipantType(String participantType) {
        this.participantType = participantType;
    }

    public String getSurveyStage() {
        return surveyStage;
    }

    public void setSurveyStage(String surveyStage) {
        this.surveyStage = surveyStage;
    }

    public String getAudienceSource() {
        return audienceSource;
    }

    public void setAudienceSource(String audienceSource) {
        this.audienceSource = audienceSource;
    }

    public Boolean getAutoSend() {
        return autoSend;
    }

    public void setAutoSend(Boolean autoSend) {
        this.autoSend = autoSend;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Boolean getIsAnonymous() {
        return isAnonymous;
    }

    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<QuestionDTO> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionDTO> questions) {
        this.questions = questions;
    }

    public Map<String, String> getParticipantContext() {
        return participantContext;
    }

    public void setParticipantContext(Map<String, String> participantContext) {
        this.participantContext = participantContext;
    }
}
