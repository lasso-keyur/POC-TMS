package com.teammatevoices.dto;

import java.util.Map;

public class LogicEvaluationResultDTO {

    private Map<String, Boolean> visibilityMap;
    private Map<String, Boolean> requiredMap;
    private String skipTarget;
    private Map<String, String> pipedValues;

    public LogicEvaluationResultDTO() {}

    public Map<String, Boolean> getVisibilityMap() { return visibilityMap; }
    public void setVisibilityMap(Map<String, Boolean> visibilityMap) { this.visibilityMap = visibilityMap; }

    public Map<String, Boolean> getRequiredMap() { return requiredMap; }
    public void setRequiredMap(Map<String, Boolean> requiredMap) { this.requiredMap = requiredMap; }

    public String getSkipTarget() { return skipTarget; }
    public void setSkipTarget(String skipTarget) { this.skipTarget = skipTarget; }

    public Map<String, String> getPipedValues() { return pipedValues; }
    public void setPipedValues(Map<String, String> pipedValues) { this.pipedValues = pipedValues; }
}
