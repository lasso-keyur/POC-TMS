package com.arya.teammatevoices.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DispatchDTO {
    private Long dispatchId;
    private String participantId;
    private Long surveyId;
    private String surveyStage;
    private String dispatchStatus;
    private LocalDateTime sentAt;
    private LocalDateTime openedAt;
    private LocalDateTime submittedAt;
    private Integer reminderCount;
    private String dispatchToken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
