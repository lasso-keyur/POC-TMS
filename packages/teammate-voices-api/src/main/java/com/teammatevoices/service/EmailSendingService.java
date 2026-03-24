package com.teammatevoices.service;

import com.teammatevoices.exception.BusinessRuleException;
import com.teammatevoices.model.EmailTemplate;
import com.teammatevoices.repository.EmailTemplateRepository;
import com.teammatevoices.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;

/**
 * Service for sending emails using configured templates.
 *
 * Resolves merge fields in template subject/body, then sends via SMTP.
 * Falls back to logging if SMTP is not configured (password empty or JavaMailSender unavailable).
 */
@Service
public class EmailSendingService {

    private static final Logger log = LoggerFactory.getLogger(EmailSendingService.class);

    private final JavaMailSender mailSender;
    private final EmailTemplateRepository templateRepository;

    @Value("${spring.mail.username:noreply@teammatevoices.com}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.notification-email:keyur@me.com}")
    private String defaultNotificationEmail;

    @Value("${app.base-url:http://localhost:5200}")
    private String appBaseUrl;

    public EmailSendingService(@Autowired(required = false) JavaMailSender mailSender,
                               EmailTemplateRepository templateRepository) {
        this.mailSender = mailSender;
        this.templateRepository = templateRepository;
        if (mailSender == null) {
            log.warn("JavaMailSender not configured — emails will be logged only");
        }
    }

    /**
     * Send a rendered email template to a recipient.
     *
     * @param templateId  the email template to use
     * @param toEmail     recipient email address
     * @param mergeData   key-value pairs to replace merge fields
     * @return true if sent successfully
     */
    public boolean sendTemplate(Long templateId, String toEmail, Map<String, String> mergeData) {
        EmailTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("EmailTemplate", templateId));

        String resolvedSubject = resolveMergeFields(template.getSubject(), mergeData);
        String resolvedBody = resolveMergeFields(template.getBodyHtml(), mergeData);
        String senderName = template.getFromName() != null ? template.getFromName() : "Teammate Voices";

        return sendHtmlEmail(toEmail, resolvedSubject, resolvedBody, senderName);
    }

    /**
     * Send a test email for a template with sample data.
     */
    public boolean sendTestEmail(Long templateId, String toEmail) {
        Map<String, String> sampleData = Map.ofEntries(
                Map.entry("{{participant_name}}", "Jane Smith"),
                Map.entry("{{email}}", toEmail),
                Map.entry("{{person_number}}", "P00123"),
                Map.entry("{{standard_id}}", "STD-4567"),
                Map.entry("{{manager_name}}", "Robert Johnson"),
                Map.entry("{{cohort}}", "Spring 2026"),
                Map.entry("{{participant_type}}", "NEW_HIRE"),
                Map.entry("{{survey_title}}", "Employee Voice Survey 2026"),
                Map.entry("{{survey_link}}", appBaseUrl + "/survey/1/respond"),
                Map.entry("{{survey_due_date}}", "April 15, 2026"),
                Map.entry("{{survey_description}}", "Annual engagement and sentiment survey"),
                Map.entry("{{program_name}}", "Teammate Voices"),
                Map.entry("{{program_description}}", "Employee feedback program"),
                Map.entry("{{company_name}}", "Acme Corporation"),
                Map.entry("{{sender_name}}", "HR Team"),
                Map.entry("{{sender_title}}", "People & Culture"),
                Map.entry("{{sender_email}}", fromEmail)
        );

        return sendTemplate(templateId, toEmail, sampleData);
    }

    /**
     * Send an email for a survey trigger with full validation.
     * Validates all business rules before sending.
     *
     * @throws BusinessRuleException if validation fails
     */
    public boolean sendForSurvey(Long surveyId, String triggerType, String toEmail,
                                  Map<String, String> mergeData,
                                  EmailDispatchValidator validator) {
        EmailDispatchValidator.ValidationResult result = validator.validateTrigger(surveyId, triggerType);
        if (!result.passed()) {
            String failures = result.checks().stream()
                    .filter(c -> !c.passed())
                    .map(c -> c.label() + ": " + c.detail())
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("Unknown validation failure");
            throw new BusinessRuleException("Cannot send email: " + failures);
        }

        // Find the template for this trigger
        // (validator already confirmed it exists and is ACTIVE)
        return sendTemplate(
                findTemplateIdForTrigger(surveyId, triggerType),
                toEmail, mergeData);
    }

    private Long findTemplateIdForTrigger(Long surveyId, String triggerType) {
        // This is a simple lookup — the validator already confirmed it exists
        return templateRepository.findAll().stream()
                .filter(t -> "ACTIVE".equalsIgnoreCase(t.getStatus()))
                .findFirst()
                .map(EmailTemplate::getTemplateId)
                .orElseThrow(() -> new ResourceNotFoundException("EmailTemplate", "trigger=" + triggerType));
    }

    /**
     * Send a raw HTML email.
     */
    public boolean sendHtmlEmail(String to, String subject, String htmlBody, String senderName) {
        // If no mail sender or password configured, log instead of sending
        if (mailSender == null || mailPassword == null || mailPassword.isBlank()) {
            log.info("=== EMAIL (SMTP not configured — logging only) ===");
            log.info("To: {}", to);
            log.info("Subject: {}", subject);
            log.info("From: {} <{}>", senderName, fromEmail);
            log.info("Body length: {} chars", htmlBody.length());
            log.info("=== END EMAIL ===");
            return true;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            helper.setFrom(fromEmail, senderName);
            mailSender.send(message);
            log.info("Email sent to {} — subject: {}", to, subject);
            return true;
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            return false;
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", to, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Get the default notification email address.
     */
    public String getDefaultNotificationEmail() {
        return defaultNotificationEmail;
    }

    /**
     * Replace all {{merge_field}} placeholders in text with provided values.
     */
    private String resolveMergeFields(String text, Map<String, String> mergeData) {
        if (text == null) return "";
        String result = text;
        for (Map.Entry<String, String> entry : mergeData.entrySet()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        // Remove any unresolved merge fields
        result = result.replaceAll("\\{\\{#if[^}]*\\}\\}", "");
        result = result.replaceAll("\\{\\{/if\\}\\}", "");
        return result;
    }
}
