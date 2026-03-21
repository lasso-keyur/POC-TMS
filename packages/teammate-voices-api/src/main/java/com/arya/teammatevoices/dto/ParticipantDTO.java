package com.arya.teammatevoices.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ParticipantDTO {
    private String participantId;
    private String fullName;
    private String email;
    private String participantType;
    private String trainingProgram;
    private String cohort;
    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
