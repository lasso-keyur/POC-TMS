package com.teammatevoices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentRuleDTO {
    private Long ruleId;

    @NotBlank(message = "Rule name is required")
    private String ruleName;

    @NotBlank(message = "Participant type is required")
    private String participantType;

    @NotBlank(message = "Survey stage is required")
    private String surveyStage;

    @NotNull(message = "Survey ID is required")
    private Long surveyId;

    private Integer sendDayOffset;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
