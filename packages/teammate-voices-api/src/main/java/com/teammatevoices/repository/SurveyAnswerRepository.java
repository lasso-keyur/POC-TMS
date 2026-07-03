package com.teammatevoices.repository;

import com.teammatevoices.model.SurveyAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyAnswerRepository extends JpaRepository<SurveyAnswer, Long> {
    List<SurveyAnswer> findByResponse_ResponseId(Long responseId);

    /** Load all answers for a survey in one query (joins through Response → Survey) */
    List<SurveyAnswer> findByResponse_Survey_SurveyId(Long surveyId);

    /** M360: average score per rater relationship per question for one enrollment (subject). */
    @Query("SELECT ra.relationship, a.questionId, AVG(a.answerValue), COUNT(a) " +
           "FROM SurveyAnswer a JOIN a.response r, M360RaterAssignment ra " +
           "WHERE r.raterAssignmentId = ra.raterAssignmentId " +
           "AND ra.enrollmentId = :enrollmentId " +
           "AND r.isComplete = true AND a.answerValue IS NOT NULL " +
           "GROUP BY ra.relationship, a.questionId")
    List<Object[]> aggregateM360ByEnrollment(@Param("enrollmentId") Long enrollmentId);
}
