package com.arya.teammatevoices.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SurveyDTO {
    private Long surveyId;
    private String title;
    private String description;
    private String templateType;
    private String status;
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
}
