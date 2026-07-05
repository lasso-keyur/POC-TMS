package com.teammatevoices.dto;

import java.util.ArrayList;
import java.util.List;

public class M360ReportDTO {

    private Long cycleId;
    private String cycleName;
    private String participantId;
    private String participantName;
    private int anonymityMinimum;
    private List<CategoryScore> categoryScores = new ArrayList<>();
    private List<QuestionRow> questionRows = new ArrayList<>();
    private List<SuppressedCategory> suppressedCategories = new ArrayList<>();
    private List<GapRow> gapRows = new ArrayList<>();

    /** A rater category hidden from the report because it has too few responses. */
    public static class SuppressedCategory {
        private String category;
        private Long responseCount;
        private int minimumRequired;

        public SuppressedCategory() {
        }

        public SuppressedCategory(String category, Long responseCount, int minimumRequired) {
            this.category = category;
            this.responseCount = responseCount;
            this.minimumRequired = minimumRequired;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Long getResponseCount() { return responseCount; }
        public void setResponseCount(Long responseCount) { this.responseCount = responseCount; }
        public int getMinimumRequired() { return minimumRequired; }
        public void setMinimumRequired(int minimumRequired) { this.minimumRequired = minimumRequired; }
    }

    /** Self vs. everyone-else per question — the blind spots / hidden strengths view. */
    public static class GapRow {
        private Long questionId;
        private String questionText;
        private Double selfScore;
        private Double othersAvg;
        private Double delta;
        private String classification; // BLIND_SPOT | HIDDEN_STRENGTH | ALIGNED

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public Double getSelfScore() { return selfScore; }
        public void setSelfScore(Double selfScore) { this.selfScore = selfScore; }
        public Double getOthersAvg() { return othersAvg; }
        public void setOthersAvg(Double othersAvg) { this.othersAvg = othersAvg; }
        public Double getDelta() { return delta; }
        public void setDelta(Double delta) { this.delta = delta; }
        public String getClassification() { return classification; }
        public void setClassification(String classification) { this.classification = classification; }
    }

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

    public int getAnonymityMinimum() { return anonymityMinimum; }
    public void setAnonymityMinimum(int anonymityMinimum) { this.anonymityMinimum = anonymityMinimum; }

    public List<SuppressedCategory> getSuppressedCategories() { return suppressedCategories; }
    public void setSuppressedCategories(List<SuppressedCategory> suppressedCategories) { this.suppressedCategories = suppressedCategories; }

    public List<GapRow> getGapRows() { return gapRows; }
    public void setGapRows(List<GapRow> gapRows) { this.gapRows = gapRows; }
}
