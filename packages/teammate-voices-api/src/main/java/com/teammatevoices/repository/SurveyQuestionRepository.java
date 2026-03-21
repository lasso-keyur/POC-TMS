package com.teammatevoices.repository;

import com.teammatevoices.model.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, Long> {
    List<SurveyQuestion> findBySurvey_SurveyIdOrderBySortOrder(Long surveyId);
}
