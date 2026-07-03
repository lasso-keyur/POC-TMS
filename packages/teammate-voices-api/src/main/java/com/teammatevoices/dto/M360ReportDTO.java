package com.teammatevoices.dto;

import java.util.ArrayList;
import java.util.List;

public class M360ReportDTO {

    private Long cycleId;
    private String cycleName;
    private String participantId;
    private String participantName;
    private List<CategoryScore> categoryScores = new ArrayList<>();
    private List<QuestionRow> questionRows = new ArrayList<>();

    public static class CategoryScore {
        private String category;
        private Double avgScore;
        private Long responseCount;

        public CategoryScore() {
        }

        public CategoryScore(String category, Double avgScore, Long responseCount) {
            this.category = category;
            this.avgScore = avgScore;
            this.responseCount = responseCount;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Double getAvgScore() { return avgScore; }
        public void setAvgScore(Double avgScore) { this.avgScore = avgScore; }
        public Long getResponseCount() { return responseCount; }
        public void setResponseCount(Long responseCount) { this.responseCount = responseCount; }
    }

    public static class QuestionRow {
        private Long questionId;
        private String questionText;
        private String category;
        private Double avgScore;
        private Long responseCount;

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Double getAvgScore() { return avgScore; }
        public void setAvgScore(Double avgScore) { this.avgScore = avgScore; }
        public Long getResponseCount() { return responseCount; }
        public void setResponseCount(Long responseCount) { this.responseCount = responseCount; }
    }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }
    public String getCycleName() { return cycleName; }
    public void setCycleName(String cycleName) { this.cycleName = cycleName; }
    public String getParticipantId() { return participantId; }
    public void setParticipantId(String participantId) { this.participantId = participantId; }
    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }
    public List<CategoryScore> getCategoryScores() { return categoryScores; }
    public void setCategoryScores(List<CategoryScore> categoryScores) { this.categoryScores = categoryScores; }
    public List<QuestionRow> getQuestionRows() { return questionRows; }
    public void setQuestionRows(List<QuestionRow> questionRows) { this.questionRows = questionRows; }
}
