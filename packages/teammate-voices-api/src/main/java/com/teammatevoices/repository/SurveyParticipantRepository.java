package com.teammatevoices.repository;

import com.teammatevoices.model.SurveyParticipant;
import com.teammatevoices.model.SurveyParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface SurveyParticipantRepository extends JpaRepository<SurveyParticipant, SurveyParticipantId> {

    /** All junction records for a given survey */
    List<SurveyParticipant> findBySurveyId(Long surveyId);

    /** All participant IDs enrolled in a survey */
    @Query("SELECT sp.participantId FROM SurveyParticipant sp WHERE sp.surveyId = :surveyId")
    Set<String> findParticipantIdsBySurveyId(@Param("surveyId") Long surveyId);

    /** Check if a participant is already enrolled in a survey */
    boolean existsBySurveyIdAndParticipantId(Long surveyId, String participantId);

    /** Remove all participants from a survey (used for re-import) */
    void deleteBySurveyId(Long surveyId);
}
