package com.arya.teammatevoices.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentRuleDTO {
    private Long ruleId;
    private String ruleName;
    private String participantType;
    private String surveyStage;
    private Long surveyId;
    private Integer sendDayOffset;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
