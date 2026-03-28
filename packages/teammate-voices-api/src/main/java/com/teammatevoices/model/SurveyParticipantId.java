package com.teammatevoices.model;

import java.io.Serializable;
import java.util.Objects;

/** Composite primary key for SurveyParticipant */
public class SurveyParticipantId implements Serializable {

    private Long surveyId;
    private String participantId;

    public SurveyParticipantId() {}

    public SurveyParticipantId(Long surveyId, String participantId) {
        this.surveyId = surveyId;
        this.participantId = participantId;
    }

    public Long getSurveyId() { return surveyId; }
    public void setSurveyId(Long surveyId) { this.surveyId = surveyId; }

    public String getParticipantId() { return participantId; }
    public void setParticipantId(String participantId) { this.participantId = participantId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SurveyParticipantId)) return false;
        SurveyParticipantId that = (SurveyParticipantId) o;
        return Objects.equals(surveyId, that.surveyId) && Objects.equals(participantId, that.participantId);
    }

    @Override
    public int hashCode() { return Objects.hash(surveyId, participantId); }
}
