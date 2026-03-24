package com.teammatevoices.service;

import com.teammatevoices.model.EmailTemplate;
import com.teammatevoices.model.EmailTemplateAssignment;
import com.teammatevoices.model.Program;
import com.teammatevoices.model.Survey;
import com.teammatevoices.repository.EmailTemplateAssignmentRepository;
import com.teammatevoices.repository.EmailTemplateRepository;
import com.teammatevoices.repository.ProgramRepository;
import com.teammatevoices.repository.SurveyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Pre-flight validation for email dispatch.
 *
 * Enforces the business rule chain:
 * 1. Survey must exist
 * 2. Survey must be ACTIVE (published)
 * 3. Survey must be aligned to a Program (programId not null)
 * 4. Aligned Program must be ACTIVE
 * 5. Email template assignment must exist for the trigger type
 * 6. Assigned email template must be ACTIVE (not DRAFT/ARCHIVED)
 *
 * Returns a ValidationResult with pass/fail status and a checklist
 * of all checks so the admin can see exactly what needs fixing.
 */
@Service
public class EmailDispatchValidator {

    private static final Logger log = LoggerFactory.getLogger(EmailDispatchValidator.class);

    private final SurveyRepository surveyRepository;
    private final ProgramRepository programRepository;
    private final EmailTemplateAssignmentRepository assignmentRepository;
    private final EmailTemplateRepository templateRepository;

    public EmailDispatchValidator(SurveyRepository surveyRepository,
                                  ProgramRepository programRepository,
                                  EmailTemplateAssignmentRepository assignmentRepository,
                                  EmailTemplateRepository templateRepository) {
        this.surveyRepository = surveyRepository;
        this.programRepository = programRepository;
        this.assignmentRepository = assignmentRepository;
        this.templateRepository = templateRepository;
    }

    /**
     * Validate all preconditions for sending emails for a survey.
     * Returns a complete checklist — does NOT throw exceptions.
     */
    public ValidationResult validateSurveyDispatch(Long surveyId) {
        log.info("Validating email dispatch for survey {}", surveyId);
        List<CheckItem> checks = new ArrayList<>();

        // 1. Survey exists
        Optional<Survey> surveyOpt = surveyRepository.findById(surveyId);
        if (surveyOpt.isEmpty()) {
            checks.add(new CheckItem("survey_exists", "Survey exists", false, "Survey not found"));
            return new ValidationResult(false, checks);
        }
        Survey survey = surveyOpt.get();
        checks.add(new CheckItem("survey_exists", "Survey exists", true,
                survey.getTitle()));

        // 2. Survey is ACTIVE (published)
        boolean surveyActive = "ACTIVE".equalsIgnoreCase(survey.getStatus());
        checks.add(new CheckItem("survey_active", "Survey is published (ACTIVE)", surveyActive,
                surveyActive ? "Status: ACTIVE"
                        : "Status: " + survey.getStatus() + " — publish the survey first"));

        // 3. Survey has a Program
        boolean hasProgram = survey.getProgramId() != null;
        checks.add(new CheckItem("survey_has_program", "Survey is aligned to a Program", hasProgram,
                hasProgram ? "Program ID: " + survey.getProgramId()
                        : "No program assigned — go to Survey Details and select a Program"));

        // 4. Program is ACTIVE
        if (hasProgram) {
            Optional<Program> programOpt = programRepository.findById(survey.getProgramId());
            if (programOpt.isEmpty()) {
                checks.add(new CheckItem("program_active", "Program is ACTIVE", false,
                        "Program #" + survey.getProgramId() + " not found"));
            } else {
                Program program = programOpt.get();
                boolean programActive = "ACTIVE".equalsIgnoreCase(program.getStatus());
                checks.add(new CheckItem("program_active", "Program is ACTIVE", programActive,
                        programActive ? program.getName() + " — ACTIVE"
                                : program.getName() + " — " + program.getStatus()
                                + ". Activate the program first."));
            }
        } else {
            checks.add(new CheckItem("program_active", "Program is ACTIVE", false,
                    "Skipped — no program assigned"));
        }

        // 5. Email template assignments exist
        List<EmailTemplateAssignment> assignments = assignmentRepository.findBySurveyId(surveyId);
        boolean hasAssignments = !assignments.isEmpty();
        checks.add(new CheckItem("has_email_assignments", "Email templates are assigned", hasAssignments,
                hasAssignments ? assignments.size() + " assignment(s) configured"
                        : "No email templates assigned — go to Survey Settings tab"));

        // 6. All assigned templates are ACTIVE
        if (hasAssignments) {
            List<String> templateIssues = new ArrayList<>();
            boolean allTemplatesActive = true;

            for (EmailTemplateAssignment assignment : assignments) {
                Optional<EmailTemplate> tmplOpt = templateRepository.findById(assignment.getTemplateId());
                if (tmplOpt.isEmpty()) {
                    templateIssues.add(assignment.getTriggerType() + ": template #"
                            + assignment.getTemplateId() + " not found");
                    allTemplatesActive = false;
                } else {
                    EmailTemplate tmpl = tmplOpt.get();
                    if (!"ACTIVE".equalsIgnoreCase(tmpl.getStatus())) {
                        templateIssues.add(assignment.getTriggerType() + ": '"
                                + tmpl.getName() + "' is " + tmpl.getStatus());
                        allTemplatesActive = false;
                    }
                }
            }

            if (allTemplatesActive) {
                checks.add(new CheckItem("templates_active", "All assigned templates are ACTIVE", true,
                        "All " + assignments.size() + " template(s) are active"));
            } else {
                checks.add(new CheckItem("templates_active", "All assigned templates are ACTIVE", false,
                        String.join("; ", templateIssues)));
            }
        } else {
            checks.add(new CheckItem("templates_active", "All assigned templates are ACTIVE", false,
                    "Skipped — no assignments"));
        }

        boolean allPassed = checks.stream().allMatch(c -> c.passed);
        log.info("Dispatch validation for survey {}: {}", surveyId, allPassed ? "PASSED" : "FAILED");
        return new ValidationResult(allPassed, checks);
    }

    /**
     * Validate a specific trigger type for a survey.
     * Used before actually sending an email.
     */
    public ValidationResult validateTrigger(Long surveyId, String triggerType) {
        ValidationResult surveyResult = validateSurveyDispatch(surveyId);
        if (!surveyResult.passed) return surveyResult;

        // Additional check: specific trigger has an assignment
        List<EmailTemplateAssignment> assignments = assignmentRepository.findBySurveyId(surveyId);
        Optional<EmailTemplateAssignment> match = assignments.stream()
                .filter(a -> triggerType.equals(a.getTriggerType()))
                .findFirst();

        List<CheckItem> checks = new ArrayList<>(surveyResult.checks);

        if (match.isEmpty()) {
            checks.add(new CheckItem("trigger_assigned", "Template assigned for '" + triggerType + "'",
                    false, "No template assigned for this trigger type"));
            return new ValidationResult(false, checks);
        }

        // Check the specific template is active
        EmailTemplateAssignment assignment = match.get();
        Optional<EmailTemplate> tmpl = templateRepository.findById(assignment.getTemplateId());
        if (tmpl.isEmpty() || !"ACTIVE".equalsIgnoreCase(tmpl.get().getStatus())) {
            checks.add(new CheckItem("trigger_template_active",
                    "Template for '" + triggerType + "' is ACTIVE", false,
                    tmpl.map(t -> "'" + t.getName() + "' is " + t.getStatus())
                            .orElse("Template not found")));
            return new ValidationResult(false, checks);
        }

        checks.add(new CheckItem("trigger_assigned", "Template assigned for '" + triggerType + "'",
                true, "Using '" + tmpl.get().getName() + "'"));

        return new ValidationResult(true, checks);
    }

    // --- Result types ---

    public record ValidationResult(boolean passed, List<CheckItem> checks) {}

    public record CheckItem(String key, String label, boolean passed, String detail) {}
}
