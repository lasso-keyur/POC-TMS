package com.teammatevoices.repository;

import com.teammatevoices.model.AssignmentRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRuleRepository extends JpaRepository<AssignmentRule, Long> {
    List<AssignmentRule> findByIsActive(Boolean isActive);
    List<AssignmentRule> findByParticipantTypeAndSurveyStage(String participantType, String surveyStage);
}
