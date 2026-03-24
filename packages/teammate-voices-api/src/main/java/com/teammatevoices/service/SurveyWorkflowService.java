package com.teammatevoices.service;

import com.teammatevoices.dto.SurveyDTO;
import com.teammatevoices.exception.BusinessRuleException;
import com.teammatevoices.exception.ResourceNotFoundException;
import com.teammatevoices.model.Program;
import com.teammatevoices.model.Survey;
import com.teammatevoices.model.WorkflowAuditLog;
import com.teammatevoices.repository.ProgramRepository;
import com.teammatevoices.repository.SurveyRepository;
import com.teammatevoices.repository.WorkflowAuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Orchestrates survey lifecycle state changes.
 *
 * Instead of directly flipping survey.status, all state transitions go through
 * this workflow service which:
 *   1. Validates preconditions (business rules)
 *   2. Changes the state
 *   3. Sends notifications (email)
 *   4. Logs the audit event
 *
 * This keeps the SurveyController and SurveyService thin — they delegate
 * lifecycle orchestration here.
 */
@Service
public class SurveyWorkflowService {

    private static final Logger log = LoggerFactory.getLogger(SurveyWorkflowService.class);

    private final SurveyRepository surveyRepository;
    private final ProgramRepository programRepository;
    private final WorkflowAuditLogRepository auditLogRepository;
    private final EmailDispatchValidator emailDispatchValidator;
    private final EmailSendingService emailSendingService;
    private final SurveyService surveyService;
    private final ObjectMapper objectMapper;

    public SurveyWorkflowService(SurveyRepository surveyRepository,
                                  ProgramRepository programRepository,
                                  WorkflowAuditLogRepository auditLogRepository,
                                  EmailDispatchValidator emailDispatchValidator,
                                  EmailSendingService emailSendingService,
                                  SurveyService surveyService,
                                  ObjectMapper objectMapper) {
        this.surveyRepository = surveyRepository;
        this.programRepository = programRepository;
        this.auditLogRepository = auditLogRepository;
        this.emailDispatchValidator = emailDispatchValidator;
        this.emailSendingService = emailSendingService;
        this.surveyService = surveyService;
        this.objectMapper = objectMapper;
    }

    // ──────────────────────────────────────────────────────────
    //  PUBLISH:  DRAFT → ACTIVE
    // ──────────────────────────────────────────────────────────

    /**
     * Publish a survey: validate → state change → notify → audit.
     *
     * Validation checks:
     * - Survey must exist
     * - Survey must be in DRAFT status
     * - Survey must have at least one question (via pages JSON)
     * - Survey must have a title
     *
     * Warnings (non-blocking):
     * - Email templates not assigned (logged but doesn't block publish)
     * - Program not assigned
     */
    @Transactional
    public PublishResult publish(Long surveyId, String performedBy, String ipAddress) {
        log.info("Workflow: PUBLISH survey {} by {}", surveyId, performedBy);

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", surveyId));

        String previousStatus = survey.getStatus();

        // --- 1. VALIDATE ---
        if ("ACTIVE".equalsIgnoreCase(previousStatus)) {
            throw new BusinessRuleException("Survey is already published");
        }
        if ("CLOSED".equalsIgnoreCase(previousStatus)) {
            throw new BusinessRuleException(
                    "Cannot publish a closed survey. Clone it to create a new draft.");
        }
        if (survey.getTitle() == null || survey.getTitle().isBlank()) {
            throw new BusinessRuleException("Survey must have a title before publishing");
        }
        if (survey.getPages() == null || survey.getPages().isBlank()
                || "[]".equals(survey.getPages().trim())) {
            throw new BusinessRuleException(
                    "Survey must have at least one page with questions before publishing");
        }

        // Survey must be assigned to a program
        if (survey.getProgramId() == null) {
            throw new BusinessRuleException(
                    "Survey must be assigned to a Program before publishing. "
                    + "Go to the Details tab and select a Program.");
        }

        // Assigned program must be ACTIVE
        Program program = programRepository.findById(survey.getProgramId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Program #" + survey.getProgramId() + " not found. "
                        + "Assign a valid, active Program before publishing."));
        if (!"ACTIVE".equalsIgnoreCase(program.getStatus())) {
            throw new BusinessRuleException(
                    "Program '" + program.getName() + "' is " + program.getStatus()
                    + ". Surveys can only be published under an ACTIVE program. "
                    + "Activate the program first.");
        }

        // Check email readiness (warning, not blocking)
        EmailDispatchValidator.ValidationResult emailCheck =
                emailDispatchValidator.validateSurveyDispatch(surveyId);

        // --- 2. STATE CHANGE ---
        survey.setStatus("ACTIVE");
        survey.setBuildStatus("PUBLISHED");
        surveyRepository.save(survey);
        log.info("Survey {} status changed: {} → ACTIVE", surveyId, previousStatus);

        // --- 3. NOTIFY ---
        String notifyEmail = emailSendingService.getDefaultNotificationEmail();
        boolean emailSent = emailSendingService.sendHtmlEmail(
                notifyEmail,
                "Survey Published: " + survey.getTitle(),
                buildPublishNotificationHtml(survey, emailCheck),
                "Teammate Voices"
        );

        // --- 4. AUDIT ---
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("title", survey.getTitle());
        details.put("emailValidation", emailCheck.passed() ? "PASSED" : "WARNINGS");
        details.put("notificationSent", emailSent);
        details.put("notificationTo", notifyEmail);

        WorkflowAuditLog auditEntry = WorkflowAuditLog
                .create("SURVEY", surveyId, "PUBLISH")
                .withStateChange(previousStatus, "ACTIVE")
                .withPerformedBy(performedBy)
                .withIpAddress(ipAddress)
                .withDetails(toJson(details));
        auditLogRepository.save(auditEntry);

        SurveyDTO dto = surveyService.getSurveyById(surveyId);
        return new PublishResult(dto, emailCheck, emailSent);
    }

    // ──────────────────────────────────────────────────────────
    //  UNPUBLISH:  ACTIVE → DRAFT
    // ──────────────────────────────────────────────────────────

    /**
     * Unpublish a survey: revert to DRAFT so edits can be made.
     *
     * Validation:
     * - Survey must be ACTIVE
     */
    @Transactional
    public SurveyDTO unpublish(Long surveyId, String performedBy, String ipAddress) {
        log.info("Workflow: UNPUBLISH survey {} by {}", surveyId, performedBy);

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", surveyId));

        String previousStatus = survey.getStatus();

        if (!"ACTIVE".equalsIgnoreCase(previousStatus)) {
            throw new BusinessRuleException(
                    "Cannot unpublish: survey is '" + previousStatus + "', not ACTIVE");
        }

        // State change
        survey.setStatus("DRAFT");
        survey.setBuildStatus("DRAFT");
        surveyRepository.save(survey);

        // Notify
        emailSendingService.sendHtmlEmail(
                emailSendingService.getDefaultNotificationEmail(),
                "Survey Unpublished: " + survey.getTitle(),
                "<p>Survey <strong>" + survey.getTitle() + "</strong> (ID: " + surveyId
                        + ") was set back to DRAFT by " + performedBy + ".</p>",
                "Teammate Voices"
        );

        // Audit
        WorkflowAuditLog auditEntry = WorkflowAuditLog
                .create("SURVEY", surveyId, "UNPUBLISH")
                .withStateChange(previousStatus, "DRAFT")
                .withPerformedBy(performedBy)
                .withIpAddress(ipAddress);
        auditLogRepository.save(auditEntry);

        return surveyService.getSurveyById(surveyId);
    }

    // ──────────────────────────────────────────────────────────
    //  CLOSE:  ACTIVE → CLOSED
    // ──────────────────────────────────────────────────────────

    /**
     * Close a survey: no more responses accepted.
     *
     * Validation:
     * - Survey must be ACTIVE
     */
    @Transactional
    public SurveyDTO close(Long surveyId, String performedBy, String ipAddress) {
        log.info("Workflow: CLOSE survey {} by {}", surveyId, performedBy);

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", surveyId));

        String previousStatus = survey.getStatus();

        if (!"ACTIVE".equalsIgnoreCase(previousStatus)) {
            throw new BusinessRuleException(
                    "Cannot close: survey is '" + previousStatus + "', not ACTIVE. "
                            + "Only published surveys can be closed.");
        }

        // State change (buildStatus stays PUBLISHED — it tracks the build, not lifecycle)
        survey.setStatus("CLOSED");
        surveyRepository.save(survey);

        // Notify
        emailSendingService.sendHtmlEmail(
                emailSendingService.getDefaultNotificationEmail(),
                "Survey Closed: " + survey.getTitle(),
                "<p>Survey <strong>" + survey.getTitle() + "</strong> (ID: " + surveyId
                        + ") has been closed by " + performedBy
                        + ". No more responses will be accepted.</p>",
                "Teammate Voices"
        );

        // Audit
        WorkflowAuditLog auditEntry = WorkflowAuditLog
                .create("SURVEY", surveyId, "CLOSE")
                .withStateChange(previousStatus, "CLOSED")
                .withPerformedBy(performedBy)
                .withIpAddress(ipAddress);
        auditLogRepository.save(auditEntry);

        return surveyService.getSurveyById(surveyId);
    }

    // ──────────────────────────────────────────────────────────
    //  REOPEN:  CLOSED → ACTIVE
    // ──────────────────────────────────────────────────────────

    /**
     * Reopen a closed survey to accept more responses.
     */
    @Transactional
    public SurveyDTO reopen(Long surveyId, String performedBy, String ipAddress) {
        log.info("Workflow: REOPEN survey {} by {}", surveyId, performedBy);

        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey", surveyId));

        String previousStatus = survey.getStatus();

        if (!"CLOSED".equalsIgnoreCase(previousStatus)) {
            throw new BusinessRuleException(
                    "Cannot reopen: survey is '" + previousStatus + "', not CLOSED");
        }

        survey.setStatus("ACTIVE");
        survey.setBuildStatus("PUBLISHED");
        surveyRepository.save(survey);

        // Audit
        WorkflowAuditLog auditEntry = WorkflowAuditLog
                .create("SURVEY", surveyId, "REOPEN")
                .withStateChange(previousStatus, "ACTIVE")
                .withPerformedBy(performedBy)
                .withIpAddress(ipAddress);
        auditLogRepository.save(auditEntry);

        return surveyService.getSurveyById(surveyId);
    }

    // ──────────────────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────────────────

    private String buildPublishNotificationHtml(Survey survey,
                                                  EmailDispatchValidator.ValidationResult emailCheck) {
        StringBuilder html = new StringBuilder();
        html.append("<h2>Survey Published</h2>");
        html.append("<p><strong>").append(survey.getTitle()).append("</strong> is now live.</p>");
        html.append("<p>Survey ID: ").append(survey.getSurveyId()).append("</p>");

        // Email readiness checklist
        html.append("<h3>Email Dispatch Readiness</h3>");
        if (emailCheck.passed()) {
            html.append("<p style='color:green'>All checks passed — emails are ready to send.</p>");
        } else {
            html.append("<p style='color:orange'>Some checks need attention:</p>");
        }
        html.append("<ul>");
        for (EmailDispatchValidator.CheckItem check : emailCheck.checks()) {
            String icon = check.passed() ? "&#9989;" : "&#10060;";
            html.append("<li>").append(icon).append(" ").append(check.label())
                    .append(" — ").append(check.detail()).append("</li>");
        }
        html.append("</ul>");

        return html.toString();
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return obj.toString();
        }
    }

    // --- Result types ---

    public record PublishResult(SurveyDTO survey,
                                 EmailDispatchValidator.ValidationResult emailReadiness,
                                 boolean notificationSent) {}
}
