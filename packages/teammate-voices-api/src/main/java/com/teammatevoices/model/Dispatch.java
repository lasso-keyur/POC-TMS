package com.teammatevoices.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "DISPATCHES")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DISPATCH_ID")
    private Long dispatchId;

    @Column(name = "PARTICIPANT_ID", nullable = false, length = 100)
    private String participantId;

    @Column(name = "SURVEY_ID", nullable = false)
    private Long surveyId;

    @Column(name = "SURVEY_STAGE", nullable = false, length = 30)
    private String surveyStage;

    @Column(name = "DISPATCH_STATUS", length = 30)
    private String dispatchStatus = "PENDING";

    @Column(name = "SENT_AT")
    private LocalDateTime sentAt;

    @Column(name = "OPENED_AT")
    private LocalDateTime openedAt;

    @Column(name = "SUBMITTED_AT")
    private LocalDateTime submittedAt;

    @Column(name = "REMINDER_COUNT")
    private Integer reminderCount = 0;

    @Column(name = "DISPATCH_TOKEN", length = 255)
    private String dispatchToken;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
