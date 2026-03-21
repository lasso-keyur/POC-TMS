package com.teammatevoices.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ASSIGNMENT_RULES")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RULE_ID")
    private Long ruleId;

    @Column(name = "RULE_NAME", nullable = false, length = 255)
    private String ruleName;

    @Column(name = "PARTICIPANT_TYPE", nullable = false, length = 30)
    private String participantType;

    @Column(name = "SURVEY_STAGE", nullable = false, length = 30)
    private String surveyStage;

    @Column(name = "SURVEY_ID", nullable = false)
    private Long surveyId;

    @Column(name = "SEND_DAY_OFFSET")
    private Integer sendDayOffset;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
