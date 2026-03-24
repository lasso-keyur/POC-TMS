package com.teammatevoices.controller;

import com.teammatevoices.dto.EmailTemplateAssignmentDTO;
import com.teammatevoices.dto.EmailTemplateDTO;
import com.teammatevoices.service.EmailDispatchValidator;
import com.teammatevoices.service.EmailDispatchValidator.ValidationResult;
import com.teammatevoices.service.EmailSendingService;
import com.teammatevoices.service.EmailTemplateAssignmentService;
import com.teammatevoices.service.EmailTemplateService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/email-templates")
public class EmailTemplateController {

    private static final Logger log = LoggerFactory.getLogger(EmailTemplateController.class);

    private final EmailTemplateService templateService;
    private final EmailTemplateAssignmentService assignmentService;
    private final EmailSendingService emailSendingService;
    private final EmailDispatchValidator dispatchValidator;

    public EmailTemplateController(EmailTemplateService templateService,
                                   EmailTemplateAssignmentService assignmentService,
                                   EmailSendingService emailSendingService,
                                   EmailDispatchValidator dispatchValidator) {
        this.templateService = templateService;
        this.assignmentService = assignmentService;
        this.emailSendingService = emailSendingService;
        this.dispatchValidator = dispatchValidator;
    }

    @GetMapping
    public ResponseEntity<List<EmailTemplateDTO>> getAllTemplates(
            @RequestParam(required = false) String category) {
        log.info("GET /email-templates category={}", category);
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(templateService.getTemplatesByCategory(category));
        }
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplateDTO> getTemplate(@PathVariable Long id) {
        log.info("GET /email-templates/{}", id);
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    @PostMapping
    public ResponseEntity<EmailTemplateDTO> createTemplate(@Valid @RequestBody EmailTemplateDTO dto) {
        log.info("POST /email-templates - {}", dto.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(templateService.createTemplate(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplateDTO> updateTemplate(
            @PathVariable Long id, @Valid @RequestBody EmailTemplateDTO dto) {
        log.info("PUT /email-templates/{}", id);
        return ResponseEntity.ok(templateService.updateTemplate(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        log.info("DELETE /email-templates/{}", id);
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<EmailTemplateDTO> duplicateTemplate(@PathVariable Long id) {
        log.info("POST /email-templates/{}/duplicate", id);
        return ResponseEntity.status(HttpStatus.CREATED).body(templateService.duplicateTemplate(id));
    }

    @GetMapping("/merge-fields")
    public ResponseEntity<Map<String, List<Map<String, String>>>> getMergeFields() {
        log.info("GET /email-templates/merge-fields");
        return ResponseEntity.ok(Map.of(
            "participant", List.of(
                Map.of("field", "{{participant_name}}", "label", "Participant Name"),
                Map.of("field", "{{email}}", "label", "Email Address"),
                Map.of("field", "{{person_number}}", "label", "Person Number"),
                Map.of("field", "{{standard_id}}", "label", "Standard ID"),
                Map.of("field", "{{manager_name}}", "label", "Manager Name"),
                Map.of("field", "{{cohort}}", "label", "Cohort"),
                Map.of("field", "{{participant_type}}", "label", "Participant Type")
            ),
            "survey", List.of(
                Map.of("field", "{{survey_title}}", "label", "Survey Title"),
                Map.of("field", "{{survey_link}}", "label", "Survey Link"),
                Map.of("field", "{{survey_due_date}}", "label", "Due Date"),
                Map.of("field", "{{survey_description}}", "label", "Survey Description")
            ),
            "program", List.of(
                Map.of("field", "{{program_name}}", "label", "Program Name"),
                Map.of("field", "{{program_description}}", "label", "Program Description"),
                Map.of("field", "{{company_name}}", "label", "Company Name")
            ),
            "sender", List.of(
                Map.of("field", "{{sender_name}}", "label", "Sender Name"),
                Map.of("field", "{{sender_title}}", "label", "Sender Title"),
                Map.of("field", "{{sender_email}}", "label", "Sender Email")
            )
        ));
    }

    // ===== ASSIGNMENT ENDPOINTS =====

    /** Get all assignments for a specific template */
    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<EmailTemplateAssignmentDTO>> getAssignments(@PathVariable Long id) {
        log.info("GET /email-templates/{}/assignments", id);
        return ResponseEntity.ok(assignmentService.getAssignmentsForTemplate(id));
    }

    /** Create or update an assignment for a template */
    @PostMapping("/{id}/assignments")
    public ResponseEntity<EmailTemplateAssignmentDTO> saveAssignment(
            @PathVariable Long id,
            @RequestBody EmailTemplateAssignmentDTO dto) {
        log.info("POST /email-templates/{}/assignments trigger={}", id, dto.getTriggerType());
        dto.setTemplateId(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.saveAssignment(dto));
    }

    /** Delete an assignment by ID */
    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long assignmentId) {
        log.info("DELETE /email-templates/assignments/{}", assignmentId);
        assignmentService.deleteAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }

    /** Get all assignments for a survey (used by Survey Settings tab) */
    @GetMapping("/by-survey/{surveyId}")
    public ResponseEntity<List<EmailTemplateAssignmentDTO>> getAssignmentsBySurvey(@PathVariable Long surveyId) {
        log.info("GET /email-templates/by-survey/{}", surveyId);
        return ResponseEntity.ok(assignmentService.getAssignmentsForSurvey(surveyId));
    }

    // ===== EMAIL SENDING ENDPOINTS =====

    /** Send a test email with sample merge data */
    @PostMapping("/{id}/send-test")
    public ResponseEntity<Map<String, Object>> sendTestEmail(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String toEmail = (body != null && body.containsKey("email"))
                ? body.get("email")
                : emailSendingService.getDefaultNotificationEmail();
        log.info("POST /email-templates/{}/send-test to={}", id, toEmail);
        boolean sent = emailSendingService.sendTestEmail(id, toEmail);
        return ResponseEntity.ok(Map.of(
                "sent", sent,
                "to", toEmail,
                "message", sent ? "Test email sent to " + toEmail : "Failed to send test email"
        ));
    }

    /** Get notification config — uses /config/ prefix to avoid /{id} path conflict */
    @GetMapping("/config/notification")
    public ResponseEntity<Map<String, String>> getNotificationConfig() {
        return ResponseEntity.ok(Map.of(
                "notificationEmail", emailSendingService.getDefaultNotificationEmail()
        ));
    }

    // ===== DISPATCH VALIDATION =====

    /**
     * Pre-flight checklist for email dispatch.
     * Returns all checks with pass/fail status so the admin knows exactly what to fix.
     */
    @GetMapping("/validate-dispatch/{surveyId}")
    public ResponseEntity<Map<String, Object>> validateDispatch(@PathVariable Long surveyId) {
        log.info("GET /email-templates/validate-dispatch/{}", surveyId);
        ValidationResult result = dispatchValidator.validateSurveyDispatch(surveyId);
        return ResponseEntity.ok(Map.of(
                "passed", result.passed(),
                "checks", result.checks().stream().map(c -> Map.of(
                        "key", c.key(),
                        "label", c.label(),
                        "passed", c.passed(),
                        "detail", c.detail()
                )).collect(Collectors.toList())
        ));
    }

    /**
     * Validate a specific trigger for a survey before sending.
     */
    @GetMapping("/validate-dispatch/{surveyId}/{triggerType}")
    public ResponseEntity<Map<String, Object>> validateTrigger(
            @PathVariable Long surveyId, @PathVariable String triggerType) {
        log.info("GET /email-templates/validate-dispatch/{}/{}", surveyId, triggerType);
        ValidationResult result = dispatchValidator.validateTrigger(surveyId, triggerType);
        return ResponseEntity.ok(Map.of(
                "passed", result.passed(),
                "checks", result.checks().stream().map(c -> Map.of(
                        "key", c.key(),
                        "label", c.label(),
                        "passed", c.passed(),
                        "detail", c.detail()
                )).collect(Collectors.toList())
        ));
    }
}
