package com.teammatevoices.dto.request;

import java.util.Map;

public class SubmitSurveyRequest {
    private Map<String, String> answers;

    public SubmitSurveyRequest() {}

    public Map<String, String> getAnswers() { return answers; }
    public void setAnswers(Map<String, String> answers) { this.answers = answers; }
}
