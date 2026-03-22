package com.teammatevoices.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SurveyCreateRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        String templateType,

        String participantType,

        String surveyStage,

        String audienceSource,

        Boolean autoSend,

        LocalDate startDate,

        LocalDate endDate,

        Boolean isAnonymous
) {}
