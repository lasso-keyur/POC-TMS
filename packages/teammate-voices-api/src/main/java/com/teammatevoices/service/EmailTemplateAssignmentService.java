package com.teammatevoices.service;

import com.teammatevoices.dto.EmailTemplateAssignmentDTO;
import com.teammatevoices.exception.ResourceNotFoundException;
import com.teammatevoices.model.EmailTemplate;
import com.teammatevoices.model.EmailTemplateAssignment;
import com.teammatevoices.repository.EmailTemplateAssignmentRepository;
import com.teammatevoices.repository.EmailTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmailTemplateAssignmentService {

    private static final Logger log = LoggerFactory.getLogger(EmailTemplateAssignmentService.class);

    private final EmailTemplateAssignmentRepository assignmentRepository;
    private final EmailTemplateRepository templateRepository;

    public EmailTemplateAssignmentService(EmailTemplateAssignmentRepository assignmentRepository,
                                          EmailTemplateRepository templateRepository) {
        this.assignmentRepository = assignmentRepository;
        this.templateRepository = templateRepository;
    }

    /** Get all assignments for a survey (used in Survey Settings tab) */
    @Transactional(readOnly = true)
    public List<EmailTemplateAssignmentDTO> getAssignmentsForSurvey(Long surveyId) {
        Map<Long, String> templateNames = getTemplateNameMap();
        return assignmentRepository.findBySurveyId(surveyId).stream()
                .map(a -> toDTO(a, templateNames))
                .collect(Collectors.toList());
    }

    /** Get all assignments for a template (used in Email Template Settings tab) */
    @Transactional(readOnly = true)
    public List<EmailTemplateAssignmentDTO> getAssignmentsForTemplate(Long templateId) {
        Map<Long, String> templateNames = getTemplateNameMap();
        return assignmentRepository.findByTemplateId(templateId).stream()
                .map(a -> toDTO(a, templateNames))
                .collect(Collectors.toList());
    }

    /** Create or update an assignment (upsert by surveyId + triggerType) */
    @Transactional
    public EmailTemplateAssignmentDTO saveAssignment(EmailTemplateAssignmentDTO dto) {
        log.info("Saving assignment: survey={}, trigger={}, template={}",
                dto.getSurveyId(), dto.getTriggerType(), dto.getTemplateId());

        // Check if assignment already exists for this survey + trigger
        List<EmailTemplateAssignment> existing = assignmentRepository.findBySurveyId(dto.getSurveyId());
        EmailTemplateAssignment assignment = existing.stream()
                .filter(a -> a.getTriggerType().equals(dto.getTriggerType()))
                .findFirst()
                .orElse(new EmailTemplateAssignment());

        assignment.setTemplateId(dto.getTemplateId());
        assignment.setSurveyId(dto.getSurveyId());
        assignment.setProgramId(dto.getProgramId());
        assignment.setTriggerType(dto.getTriggerType());
        assignment.setSendDelayDays(dto.getSendDelayDays() != null ? dto.getSendDelayDays() : 0);
        assignment.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        assignment = assignmentRepository.save(assignment);
        return toDTO(assignment, getTemplateNameMap());
    }

    /** Remove an assignment */
    @Transactional
    public void deleteAssignment(Long assignmentId) {
        log.info("Deleting assignment: {}", assignmentId);
        assignmentRepository.deleteById(assignmentId);
    }

    /** Remove assignment by survey + trigger (when user clears a dropdown) */
    @Transactional
    public void removeAssignment(Long surveyId, String triggerType) {
        log.info("Removing assignment: survey={}, trigger={}", surveyId, triggerType);
        List<EmailTemplateAssignment> existing = assignmentRepository.findBySurveyId(surveyId);
        existing.stream()
                .filter(a -> a.getTriggerType().equals(triggerType))
                .forEach(a -> assignmentRepository.deleteById(a.getAssignmentId()));
    }

    private Map<Long, String> getTemplateNameMap() {
        return templateRepository.findAll().stream()
                .collect(Collectors.toMap(EmailTemplate::getTemplateId, EmailTemplate::getName));
    }

    private EmailTemplateAssignmentDTO toDTO(EmailTemplateAssignment a, Map<Long, String> templateNames) {
        EmailTemplateAssignmentDTO dto = new EmailTemplateAssignmentDTO();
        dto.setAssignmentId(a.getAssignmentId());
        dto.setTemplateId(a.getTemplateId());
        dto.setTemplateName(templateNames.getOrDefault(a.getTemplateId(), "Unknown"));
        dto.setProgramId(a.getProgramId());
        dto.setSurveyId(a.getSurveyId());
        dto.setTriggerType(a.getTriggerType());
        dto.setSendDelayDays(a.getSendDelayDays());
        dto.setIsActive(a.getIsActive());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
