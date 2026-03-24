package com.teammatevoices.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SurveyResponseDTO {
    private Long responseId;
    private Long surveyId;
    private String participantId;
    private Boolean isComplete;
    private LocalDateTime submittedAt;
    private LocalDateTime startedAt;
    private LocalDateTime createdAt;
    private List<SurveyAnswerDTO> answers;

    public SurveyResponseDTO() {}

    public Long getResponseId() { return responseId; }
    public void setResponseId(Long responseId) { this.responseId = responseId; }
    public Long getSurveyId() { return surveyId; }
    public void setSurveyId(Long surveyId) { this.surveyId = surveyId; }
    public String getParticipantId() { return participantId; }
    public void setParticipantId(String participantId) { this.participantId = participantId; }
    public Boolean getIsComplete() { return isComplete; }
    public void setIsComplete(Boolean isComplete) { this.isComplete = isComplete; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<SurveyAnswerDTO> getAnswers() { return answers; }
    public void setAnswers(List<SurveyAnswerDTO> answers) { this.answers = answers; }

    public static class SurveyAnswerDTO {
        private Long answerId;
        private Long questionId;
        private String pageId;
        private String answerText;
        private Integer answerValue;
        private String answerJson;

        public SurveyAnswerDTO() {}

        public Long getAnswerId() { return answerId; }
        public void setAnswerId(Long answerId) { this.answerId = answerId; }
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getPageId() { return pageId; }
        public void setPageId(String pageId) { this.pageId = pageId; }
        public String getAnswerText() { return answerText; }
        public void setAnswerText(String answerText) { this.answerText = answerText; }
        public Integer getAnswerValue() { return answerValue; }
        public void setAnswerValue(Integer answerValue) { this.answerValue = answerValue; }
        public String getAnswerJson() { return answerJson; }
        public void setAnswerJson(String answerJson) { this.answerJson = answerJson; }
    }
}
