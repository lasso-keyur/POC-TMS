package com.teammatevoices.dto.request;

import java.util.Map;

public class EvaluateLogicRequest {

    private Map<String, Object> answers;

    public EvaluateLogicRequest() {}

    public Map<String, Object> getAnswers() { return answers; }
    public void setAnswers(Map<String, Object> answers) { this.answers = answers; }
}
