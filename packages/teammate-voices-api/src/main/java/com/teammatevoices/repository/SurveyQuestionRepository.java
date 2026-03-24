package com.teammatevoices.repository;

import com.teammatevoices.model.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

@Repository
public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, Long> {
    List<SurveyQuestion> findBySurvey_SurveyIdOrderBySortOrder(Long surveyId);

    /** Returns just the question IDs for a survey — used by LogicRuleValidator for referential checks */
    @Query("SELECT q.questionId FROM SurveyQuestion q WHERE q.survey.surveyId = :surveyId")
    Set<Long> findQuestionIdsBySurveyId(@Param("surveyId") Long surveyId);
}
