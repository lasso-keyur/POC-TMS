package com.teammatevoices.controller;

import com.teammatevoices.dto.SurveyDTO;
import com.teammatevoices.exception.BusinessRuleException;
import com.teammatevoices.exception.GlobalExceptionHandler;
import com.teammatevoices.exception.ResourceNotFoundException;
import com.teammatevoices.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for SurveyController using standalone MockMvc
 * (no Spring context needed — faster, no security filter issues).
 */
@ExtendWith(MockitoExtension.class)
class SurveyControllerTest {

    private MockMvc mockMvc;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();

    @Mock private SurveyService surveyService;
    @Mock private LogicEvaluatorService logicEvaluatorService;
    @Mock private SurveyWorkflowService workflowService;

    @InjectMocks
    private SurveyController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ──────────────────────────────────────────────────────────
    //  CRUD
    // ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /surveys")
    class GetSurveys {

        @Test
        @DisplayName("Returns list of surveys")
        void listSurveys() throws Exception {
            SurveyDTO dto = new SurveyDTO();
            dto.setTitle("Test");
            when(surveyService.getAllSurveys()).thenReturn(List.of(dto));

            mockMvc.perform(get("/surveys"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].title").value("Test"));
        }

        @Test
        @DisplayName("Returns empty list when no surveys")
        void emptySurveys() throws Exception {
            when(surveyService.getAllSurveys()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/surveys"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$").isEmpty());
        }
    }

    @Nested
    @DisplayName("GET /surveys/{id}")
    class GetSurveyById {

        @Test
        @DisplayName("Returns survey by ID")
        void found() throws Exception {
            SurveyDTO dto = new SurveyDTO();
            dto.setTitle("Found");
            when(surveyService.getSurveyById(1L)).thenReturn(dto);

            mockMvc.perform(get("/surveys/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Found"));
        }

        @Test
        @DisplayName("Returns 404 for non-existent survey")
        void notFound() throws Exception {
            when(surveyService.getSurveyById(999L))
                    .thenThrow(new ResourceNotFoundException("Survey", 999L));

            mockMvc.perform(get("/surveys/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("NOT_FOUND"));
        }
    }

    // ──────────────────────────────────────────────────────────
    //  Workflow
    // ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /surveys/{id}/publish")
    class PublishEndpoint {

        @Test
        @DisplayName("Publishes and returns result with email readiness")
        void success() throws Exception {
            SurveyDTO dto = new SurveyDTO();
            dto.setTitle("Published");
            SurveyWorkflowService.PublishResult result = new SurveyWorkflowService.PublishResult(
                    dto,
                    new EmailDispatchValidator.ValidationResult(true, Collections.emptyList()),
                    true
            );
            when(workflowService.publish(eq(1L), anyString(), anyString())).thenReturn(result);

            mockMvc.perform(post("/surveys/1/publish"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.survey.title").value("Published"))
                    .andExpect(jsonPath("$.emailReadiness").value("PASSED"))
                    .andExpect(jsonPath("$.notificationSent").value(true));
        }

        @Test
        @DisplayName("Returns 422 when business rule fails")
        void businessRuleViolation() throws Exception {
            when(workflowService.publish(eq(1L), anyString(), anyString()))
                    .thenThrow(new BusinessRuleException("Survey is already published"));

            mockMvc.perform(post("/surveys/1/publish"))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.code").value("BUSINESS_RULE_VIOLATION"))
                    .andExpect(jsonPath("$.message").value("Survey is already published"));
        }
    }

    @Nested
    @DisplayName("POST /surveys/{id}/unpublish")
    class UnpublishEndpoint {

        @Test
        @DisplayName("Unpublishes to DRAFT")
        void success() throws Exception {
            SurveyDTO dto = new SurveyDTO();
            dto.setTitle("Unpublished");
            when(workflowService.unpublish(eq(1L), anyString(), anyString())).thenReturn(dto);

            mockMvc.perform(post("/surveys/1/unpublish"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Unpublished"));
        }

        @Test
        @DisplayName("Rejects unpublishing non-ACTIVE survey")
        void notActive() throws Exception {
            when(workflowService.unpublish(eq(1L), anyString(), anyString()))
                    .thenThrow(new BusinessRuleException("not ACTIVE"));

            mockMvc.perform(post("/surveys/1/unpublish"))
                    .andExpect(status().isUnprocessableEntity());
        }
    }

    @Nested
    @DisplayName("POST /surveys/{id}/close")
    class CloseEndpoint {

        @Test
        @DisplayName("Closes an active survey")
        void success() throws Exception {
            SurveyDTO dto = new SurveyDTO();
            dto.setTitle("Closed");
            when(workflowService.close(eq(1L), anyString(), anyString())).thenReturn(dto);

            mockMvc.perform(post("/surveys/1/close"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Closed"));
        }
    }

    @Nested
    @DisplayName("POST /surveys/{id}/reopen")
    class ReopenEndpoint {

        @Test
        @DisplayName("Reopens a closed survey")
        void success() throws Exception {
            SurveyDTO dto = new SurveyDTO();
            dto.setTitle("Reopened");
            when(workflowService.reopen(eq(1L), anyString(), anyString())).thenReturn(dto);

            mockMvc.perform(post("/surveys/1/reopen"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Reopened"));
        }
    }

    // ──────────────────────────────────────────────────────────
    //  Logic
    // ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("PUT /surveys/{id}/logic")
    class SaveLogicEndpoint {

        @Test
        @DisplayName("Returns 422 when logic validation fails")
        void validationFails() throws Exception {
            doThrow(new BusinessRuleException("Logic rule validation failed"))
                    .when(surveyService).updateLogicRules(eq(1L), any());

            mockMvc.perform(put("/surveys/1/logic")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"rules\":[{\"id\":\"r1\",\"type\":\"visible_if\"," +
                                    "\"conditions\":{\"operator\":\"AND\",\"items\":[" +
                                    "{\"questionId\":\"q1\",\"operator\":\"equals\",\"value\":\"x\"}]}," +
                                    "\"action\":{\"type\":\"show\",\"targetQuestionId\":\"q2\"}}]}"))
                    .andExpect(status().isUnprocessableEntity())
                    .andExpect(jsonPath("$.code").value("BUSINESS_RULE_VIOLATION"));
        }
    }
}
