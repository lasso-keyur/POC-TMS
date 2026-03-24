package com.teammatevoices.repository;

import com.teammatevoices.model.EmailTemplateAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailTemplateAssignmentRepository extends JpaRepository<EmailTemplateAssignment, Long> {
    List<EmailTemplateAssignment> findByTemplateId(Long templateId);
    List<EmailTemplateAssignment> findByProgramId(Long programId);
    List<EmailTemplateAssignment> findBySurveyId(Long surveyId);
    List<EmailTemplateAssignment> findByTriggerType(String triggerType);
}
