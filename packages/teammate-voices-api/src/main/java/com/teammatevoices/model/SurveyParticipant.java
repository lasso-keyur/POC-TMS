package com.teammatevoices.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Junction entity linking a specific survey to its participant roster.
 *
 * This allows each survey to have its own set of participants, imported
 * via the Excel upload on the survey Settings tab. A participant can
 * appear in multiple surveys independently.
 */
@Entity
@Table(name = "SURVEY_PARTICIPANTS")
@IdClass(SurveyParticipantId.class)
public class SurveyParticipant {

    @Id
    @Column(name = "SURVEY_ID", nullable = false)
    private Long surveyId;

    @Id
    @Column(name = "PARTICIPANT_ID", nullable = false, length = 50)
    private String participantId;

    @Column(name = "ADDED_AT", nullable = false)
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        if (addedAt == null) addedAt = LocalDateTime.now();
    }

    public Long getSurveyId() { return surveyId; }
    public void setSurveyId(Long surveyId) { this.surveyId = surveyId; }

    public String getParticipantId() { return participantId; }
    public void setParticipantId(String participantId) { this.participantId = participantId; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
