package com.teammatevoices.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProgramDTO {
    private Long programId;
    private String name;
    private String description;
    private String templateType;
    private String status;
    private String surveyProgress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
