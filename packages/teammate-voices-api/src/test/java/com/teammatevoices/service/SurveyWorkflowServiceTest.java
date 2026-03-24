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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SurveyWorkflowServiceTest {

    @Mock private SurveyRepository surveyRepository;
    @Mock private ProgramRepository programRepository;
    @Mock private WorkflowAuditLogRepository auditLogRepository;
    @Mock private EmailDispatchValidator emailDispatchValidator;
    @Mock private EmailSendingService emailSendingService;
    @Mock private SurveyService surveyService;
    @Spy  private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private SurveyWorkflowService workflowService;

    private Survey draftSurvey;
    private Survey activeSurvey;
    private Survey closedSurvey;
    private Program activeProgram;

    @BeforeEach
    void setUp() {
        draftSurvey = buildSurvey(1L, "Test Survey", "DRAFT", 10L,
                "[{\"pageId\":\"p1\",\"title\":\"Page 1\",\"questions\":[{\"questionText\":\"Q1\"}]}]");

        activeSurvey = buildSurvey(2L, "Active Survey", "ACTIVE", 10L,
                "[{\"pageId\":\"p1\",\"title\":\"Page 1\",\"questions\":[{\"questionText\":\"Q1\"}]}]");

        closedSurvey = buildSurvey(3L, "Closed Survey", "CLOSED", 10L,
                "[{\"pageId\":\"p1\",\"title\":\"Page 1\",\"questions\":[{\"questionText\":\"Q1\"}]}]");

        activeProgram = new Program();
        activeProgram.setProgramId(10L);
        activeProgram.setName("Test Program");
        activeProgram.setStatus("ACTIVE");
    }

    // ──────────────────────────────────────────────────────────
    //  PUBLISH
    // ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Publish workflow")
    class PublishTests {

        @Test
        @DisplayName("Successfully publishes a DRAFT survey with active program")
        void publish_success() {
            when(surveyRepository.findById(1L)).thenReturn(Optional.of(draftSurvey));
            when(programRepository.findById(10L)).thenReturn(Optional.of(activeProgram));
            when(emailDispatchValidator.validateSurveyDispatch(1L))
                    .thenReturn(new EmailDispatchValidator.ValidationResult(true, Collections.emptyList()));
            when(emailSendingService.getDefaultNotificationEmail()).thenReturn("admin@test.com");
            when(emailSendingService.sendHtmlEmail(anyString(), anyString(), anyString(), anyString()))
                    .thenReturn(true);
            when(surveyService.getSurveyById(1L)).thenReturn(new SurveyDTO());
            when(auditLogRepository.save(any())).thenReturn(new WorkflowAuditLog());

            SurveyWorkflowService.PublishResult result =
                    workflowService.publish(1L, "admin", "127.0.0.1");

            assertThat(result).isNotNull();
            assertThat(result.notificationSent()).isTrue();

            // Verify state was changed
            assertThat(draftSurvey.getStatus()).isEqualTo("ACTIVE");
            assertThat(draftSurvey.getBuildStatus()).isEqualTo("PUBLISHED");

            // Verify audit log was written
            ArgumentCaptor<WorkflowAuditLog> auditCaptor = ArgumentCaptor.forClass(WorkflowAuditLog.class);
            verify(auditLogRepository).save(auditCaptor.capture());
            WorkflowAuditLog audit = auditCaptor.getValue();
            assertThat(audit.getEntityType()).isEqualTo("SURVEY");
            assertThat(audit.getAction()).isEqualTo("PUBLISH");
            assertThat(audit.getPreviousState()).isEqualTo("DRAFT");
            assertThat(audit.getNewState()).isEqualTo("ACTIVE");
            assertThat(audit.getPerformedBy()).isEqualTo("admin");
        }

        @Test
        @DisplayName("Rejects publishing an already ACTIVE survey")
        void publish_alreadyActive() {
            when(surveyRepository.findById(2L)).thenReturn(Optional.of(activeSurvey));

            assertThatThrownBy(() -> workflowService.publish(2L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("already published");

            verify(surveyRepository, never()).save(any());
            verify(auditLogRepository, never()).save(any());
        }

        @Test
        @DisplayName("Rejects publishing a CLOSED survey")
        void publish_closed() {
            when(surveyRepository.findById(3L)).thenReturn(Optional.of(closedSurvey));

            assertThatThrownBy(() -> workflowService.publish(3L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("closed survey")
                    .hasMessageContaining("Clone");
        }

        @Test
        @DisplayName("Rejects publishing without a title")
        void publish_noTitle() {
            draftSurvey.setTitle(null);
            when(surveyRepository.findById(1L)).thenReturn(Optional.of(draftSurvey));

            assertThatThrownBy(() -> workflowService.publish(1L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("title");
        }

        @Test
        @DisplayName("Rejects publishing without pages/questions")
        void publish_noPages() {
            draftSurvey.setPages("[]");
            when(surveyRepository.findById(1L)).thenReturn(Optional.of(draftSurvey));

            assertThatThrownBy(() -> workflowService.publish(1L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("page with questions");
        }

        @Test
        @DisplayName("Rejects publishing without a program assigned")
        void publish_noProgram() {
            draftSurvey.setProgramId(null);
            when(surveyRepository.findById(1L)).thenReturn(Optional.of(draftSurvey));

            assertThatThrownBy(() -> workflowService.publish(1L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("assigned to a Program");
        }

        @Test
        @DisplayName("Rejects publishing when program is not ACTIVE")
        void publish_inactiveProgram() {
            Program inactiveProgram = new Program();
            inactiveProgram.setProgramId(10L);
            inactiveProgram.setName("Inactive Prog");
            inactiveProgram.setStatus("CLOSED");

            when(surveyRepository.findById(1L)).thenReturn(Optional.of(draftSurvey));
            when(programRepository.findById(10L)).thenReturn(Optional.of(inactiveProgram));

            assertThatThrownBy(() -> workflowService.publish(1L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Inactive Prog")
                    .hasMessageContaining("CLOSED")
                    .hasMessageContaining("Activate the program");
        }

        @Test
        @DisplayName("Rejects publishing when program does not exist")
        void publish_programNotFound() {
            when(surveyRepository.findById(1L)).thenReturn(Optional.of(draftSurvey));
            when(programRepository.findById(10L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> workflowService.publish(1L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("Throws ResourceNotFoundException for non-existent survey")
        void publish_surveyNotFound() {
            when(surveyRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> workflowService.publish(999L, "admin", "127.0.0.1"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ──────────────────────────────────────────────────────────
    //  UNPUBLISH
    // ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Unpublish workflow")
    class UnpublishTests {

        @Test
        @DisplayName("Successfully unpublishes an ACTIVE survey to DRAFT")
        void unpublish_success() {
            when(surveyRepository.findById(2L)).thenReturn(Optional.of(activeSurvey));
            when(emailSendingService.getDefaultNotificationEmail()).thenReturn("admin@test.com");
            when(emailSendingService.sendHtmlEmail(anyString(), anyString(), anyString(), anyString()))
                    .thenReturn(true);
            when(surveyService.getSurveyById(2L)).thenReturn(new SurveyDTO());
            when(auditLogRepository.save(any())).thenReturn(new WorkflowAuditLog());

            workflowService.unpublish(2L, "admin", "127.0.0.1");

            assertThat(activeSurvey.getStatus()).isEqualTo("DRAFT");
            verify(auditLogRepository).save(any());
        }

        @Test
        @DisplayName("Rejects unpublishing a DRAFT survey")
        void unpublish_draft() {
            when(surveyRepository.findById(1L)).thenReturn(Optional.of(draftSurvey));

            assertThatThrownBy(() -> workflowService.unpublish(1L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("DRAFT")
                    .hasMessageContaining("not ACTIVE");
        }

        @Test
        @DisplayName("Rejects unpublishing a CLOSED survey")
        void unpublish_closed() {
            when(surveyRepository.findById(3L)).thenReturn(Optional.of(closedSurvey));

            assertThatThrownBy(() -> workflowService.unpublish(3L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("CLOSED");
        }
    }

    // ──────────────────────────────────────────────────────────
    //  CLOSE
    // ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Close workflow")
    class CloseTests {

        @Test
        @DisplayName("Successfully closes an ACTIVE survey")
        void close_success() {
            when(surveyRepository.findById(2L)).thenReturn(Optional.of(activeSurvey));
            when(emailSendingService.getDefaultNotificationEmail()).thenReturn("admin@test.com");
            when(emailSendingService.sendHtmlEmail(anyString(), anyString(), anyString(), anyString()))
                    .thenReturn(true);
            when(surveyService.getSurveyById(2L)).thenReturn(new SurveyDTO());
            when(auditLogRepository.save(any())).thenReturn(new WorkflowAuditLog());

            workflowService.close(2L, "admin", "127.0.0.1");

            assertThat(activeSurvey.getStatus()).isEqualTo("CLOSED");
            verify(auditLogRepository).save(any());
        }

        @Test
        @DisplayName("Rejects closing a DRAFT survey")
        void close_draft() {
            when(surveyRepository.findById(1L)).thenReturn(Optional.of(draftSurvey));

            assertThatThrownBy(() -> workflowService.close(1L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("DRAFT")
                    .hasMessageContaining("not ACTIVE");
        }
    }

    // ──────────────────────────────────────────────────────────
    //  REOPEN
    // ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Reopen workflow")
    class ReopenTests {

        @Test
        @DisplayName("Successfully reopens a CLOSED survey")
        void reopen_success() {
            when(surveyRepository.findById(3L)).thenReturn(Optional.of(closedSurvey));
            when(surveyService.getSurveyById(3L)).thenReturn(new SurveyDTO());
            when(auditLogRepository.save(any())).thenReturn(new WorkflowAuditLog());

            workflowService.reopen(3L, "admin", "127.0.0.1");

            assertThat(closedSurvey.getStatus()).isEqualTo("ACTIVE");
        }

        @Test
        @DisplayName("Rejects reopening a DRAFT survey")
        void reopen_draft() {
            when(surveyRepository.findById(1L)).thenReturn(Optional.of(draftSurvey));

            assertThatThrownBy(() -> workflowService.reopen(1L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("not CLOSED");
        }

        @Test
        @DisplayName("Rejects reopening an ACTIVE survey")
        void reopen_active() {
            when(surveyRepository.findById(2L)).thenReturn(Optional.of(activeSurvey));

            assertThatThrownBy(() -> workflowService.reopen(2L, "admin", "127.0.0.1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("not CLOSED");
        }
    }

    // ──────────────────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────────────────

    private Survey buildSurvey(Long id, String title, String status, Long programId, String pages) {
        Survey s = new Survey();
        s.setSurveyId(id);
        s.setTitle(title);
        s.setStatus(status);
        s.setBuildStatus("DRAFT".equals(status) ? "DRAFT" : "PUBLISHED");
        s.setProgramId(programId);
        s.setPages(pages);
        return s;
    }
}
