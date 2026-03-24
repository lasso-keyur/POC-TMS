package com.teammatevoices.repository;

import com.teammatevoices.model.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {
    List<SurveyResponse> findBySurvey_SurveyId(Long surveyId);
    Optional<SurveyResponse> findBySurvey_SurveyIdAndParticipantIdAndIsComplete(
            Long surveyId, String participantId, Boolean isComplete);
    long countBySurvey_SurveyId(Long surveyId);
}
