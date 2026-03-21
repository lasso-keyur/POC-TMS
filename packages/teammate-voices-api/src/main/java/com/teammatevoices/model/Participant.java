package com.teammatevoices.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PARTICIPANTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Participant {

    @Id
    @Column(name = "PARTICIPANT_ID", length = 100)
    private String participantId;

    @Column(name = "FULL_NAME", nullable = false, length = 255)
    private String fullName;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "PARTICIPANT_TYPE", nullable = false, length = 30)
    private String participantType;

    @Column(name = "TRAINING_PROGRAM", length = 255)
    private String trainingProgram;

    @Column(name = "COHORT", length = 100)
    private String cohort;

    @Column(name = "START_DATE", nullable = false)
    private LocalDate startDate;

    @Column(name = "EXPECTED_END_DATE")
    private LocalDate expectedEndDate;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
