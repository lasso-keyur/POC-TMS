package com.teammatevoices.service;

import com.teammatevoices.dto.LogicRuleDTO;
import com.teammatevoices.dto.LogicRuleDTO.ConditionGroup;
import com.teammatevoices.dto.LogicRuleDTO.LogicAction;
import com.teammatevoices.dto.LogicRuleDTO.LogicCondition;
import com.teammatevoices.exception.BusinessRuleException;
import com.teammatevoices.model.Survey;
import com.teammatevoices.model.SurveyQuestion;
import com.teammatevoices.repository.SurveyQuestionRepository;
import com.teammatevoices.repository.SurveyRepository;
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

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogicRuleValidatorTest {

    @Mock private SurveyRepository surveyRepository;
    @Mock private SurveyQuestionRepository questionRepository;
    @Spy  private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private LogicRuleValidator validator;

    private Survey survey;

    @BeforeEach
    void setUp() {
        survey = new Survey();
        survey.setSurveyId(1L);
        survey.setStatus("DRAFT");
        survey.setPages("[{\"pageId\":\"PG-MAIN\",\"questions\":[" +
                "{\"questionText\":\"Q1\"},{\"questionText\":\"Q2\"},{\"questionText\":\"Q3\"}]}]");

        SurveyQuestion q1 = new SurveyQuestion();
        q1.setQuestionId(1L);
        q1.setIsRequired(true);
        SurveyQuestion q2 = new SurveyQuestion();
        q2.setQuestionId(2L);
        q2.setIsRequired(false);

        lenient().when(surveyRepository.findById(1L)).thenReturn(Optional.of(survey));
        lenient().when(questionRepository.findBySurvey_SurveyIdOrderBySortOrder(1L))
                .thenReturn(List.of(q1, q2));
    }

    // ──────────────────────────────────────────────────────────
    //  Happy path
    // ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("Valid rule passes all checks")
    void validRule_passes() {
        LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "show", "PG-MAIN-q1");
        assertThatCode(() -> validator.validate(1L, List.of(rule))).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Empty rules list is always valid")
    void emptyRules_valid() {
        assertThatCode(() -> validator.validate(1L, Collections.emptyList())).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Null rules list is valid (treated as empty)")
    void nullRules_valid() {
        assertThatCode(() -> validator.validate(1L, null)).doesNotThrowAnyException();
    }

    // ──────────────────────────────────────────────────────────
    //  Structural validation
    // ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Structural validation")
    class StructuralTests {

        @Test
        @DisplayName("Rejects rule with missing type")
        void missingType() {
            LogicRuleDTO rule = buildRule("r1", null, "equals", "PG-MAIN-q0", "show", "PG-MAIN-q1");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("rule type is required");
        }

        @Test
        @DisplayName("Rejects rule with invalid type")
        void invalidType() {
            LogicRuleDTO rule = buildRule("r1", "jump_to", "equals", "PG-MAIN-q0", "show", "PG-MAIN-q1");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("invalid rule type");
        }

        @Test
        @DisplayName("Rejects rule with null conditions")
        void nullConditions() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "show", "PG-MAIN-q1");
            rule.setConditions(null);
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("conditions are required");
        }

        @Test
        @DisplayName("Rejects rule with empty condition items")
        void emptyConditionItems() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "show", "PG-MAIN-q1");
            rule.getConditions().setItems(Collections.emptyList());
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("at least one condition");
        }

        @Test
        @DisplayName("Rejects condition with invalid operator")
        void invalidOperator() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "like", "PG-MAIN-q0", "show", "PG-MAIN-q1");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("invalid operator");
        }

        @Test
        @DisplayName("Rejects condition with missing questionId")
        void missingQuestionId() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", null, "show", "PG-MAIN-q1");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("questionId is required");
        }

        @Test
        @DisplayName("Rejects null action")
        void nullAction() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "show", "PG-MAIN-q1");
            rule.setAction(null);
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("action is required");
        }

        @Test
        @DisplayName("Rejects invalid action type")
        void invalidActionType() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "goto", "PG-MAIN-q1");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("invalid action type");
        }

        @Test
        @DisplayName("Allows is_empty operator without value")
        void isEmpty_noValue() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "is_empty", "PG-MAIN-q0", "show", "PG-MAIN-q1");
            rule.getConditions().getItems().get(0).setValue(null);
            assertThatCode(() -> validator.validate(1L, List.of(rule))).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Rejects equals operator without value")
        void equals_noValue() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "show", "PG-MAIN-q1");
            rule.getConditions().getItems().get(0).setValue(null);
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("value is required");
        }
    }

    // ──────────────────────────────────────────────────────────
    //  Referential validation
    // ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Referential validation")
    class ReferentialTests {

        @Test
        @DisplayName("Accepts DB question IDs (numeric)")
        void dbQuestionIds() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "1", "show", "2");
            assertThatCode(() -> validator.validate(1L, List.of(rule))).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Accepts composite page question IDs")
        void compositeQuestionIds() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "show", "PG-MAIN-q2");
            assertThatCode(() -> validator.validate(1L, List.of(rule))).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Rejects condition referencing non-existent question")
        void nonExistentConditionQuestion() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "999", "show", "1");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("does not exist in this survey");
        }

        @Test
        @DisplayName("Rejects action targeting non-existent question")
        void nonExistentTargetQuestion() {
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "1", "show", "999");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("target question '999' does not exist");
        }

        @Test
        @DisplayName("skip_to requires a target")
        void skipTo_noTarget() {
            LogicRuleDTO rule = buildRule("r1", "skip_to", "equals", "PG-MAIN-q0", "skip_to", null);
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("requires a target");
        }

        @Test
        @DisplayName("pipe action requires pipeField")
        void pipe_noPipeField() {
            LogicRuleDTO rule = buildRule("r1", "pipe_text", "equals", "PG-MAIN-q0", "pipe", "PG-MAIN-q1");
            rule.getAction().setPipeField(null);
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("pipeField");
        }
    }

    // ──────────────────────────────────────────────────────────
    //  Business rule validation
    // ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Business rules")
    class BusinessRuleTests {

        @Test
        @DisplayName("Rejects rule type / action type mismatch")
        void ruleActionMismatch() {
            // visible_if should only have show/hide actions, not skip_to
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "skip_to", "PG-MAIN-q1");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("not compatible");
        }

        @Test
        @DisplayName("Rejects hiding a required question")
        void hideRequired() {
            // Question 1 is required, trying to hide it
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "hide", "1");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("cannot hide required question");
        }

        @Test
        @DisplayName("Allows hiding a non-required question")
        void hideOptional() {
            // Question 2 is not required, hide is OK
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "hide", "2");
            assertThatCode(() -> validator.validate(1L, List.of(rule))).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Rejects duplicate rule IDs")
        void duplicateRuleIds() {
            LogicRuleDTO r1 = buildRule("same-id", "visible_if", "equals", "PG-MAIN-q0", "show", "PG-MAIN-q1");
            LogicRuleDTO r2 = buildRule("same-id", "visible_if", "equals", "PG-MAIN-q1", "show", "PG-MAIN-q0");
            assertThatThrownBy(() -> validator.validate(1L, List.of(r1, r2)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Duplicate rule ID");
        }

        @Test
        @DisplayName("Rejects self-skip")
        void selfSkip() {
            LogicRuleDTO rule = buildRule("r1", "skip_to", "equals", "PG-MAIN-q0", "skip_to", "PG-MAIN-q0");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("infinite loop");
        }

        @Test
        @DisplayName("Detects circular skip chain")
        void circularSkip() {
            // Q0 skips to Q1, Q1 skips to Q0
            LogicRuleDTO r1 = buildRule("r1", "skip_to", "equals", "PG-MAIN-q0", "skip_to", "PG-MAIN-q1");
            LogicRuleDTO r2 = buildRule("r2", "skip_to", "equals", "PG-MAIN-q1", "skip_to", "PG-MAIN-q0");
            assertThatThrownBy(() -> validator.validate(1L, List.of(r1, r2)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Circular skip");
        }

        @Test
        @DisplayName("Rejects editing rules on ACTIVE survey")
        void activeSurvey() {
            survey.setStatus("ACTIVE");
            LogicRuleDTO rule = buildRule("r1", "visible_if", "equals", "PG-MAIN-q0", "show", "PG-MAIN-q1");
            assertThatThrownBy(() -> validator.validate(1L, List.of(rule)))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("ACTIVE")
                    .hasMessageContaining("Only DRAFT");
        }

        @Test
        @DisplayName("Rejects too many rules")
        void tooManyRules() {
            List<LogicRuleDTO> rules = new ArrayList<>();
            for (int i = 0; i < 201; i++) {
                rules.add(buildRule("r" + i, "visible_if", "equals", "PG-MAIN-q0", "show", "PG-MAIN-q1"));
            }
            assertThatThrownBy(() -> validator.validate(1L, rules))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Too many rules");
        }
    }

    // ──────────────────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────────────────

    private LogicRuleDTO buildRule(String id, String type, String condOperator,
                                    String condQuestionId, String actionType,
                                    String targetQuestionId) {
        LogicRuleDTO rule = new LogicRuleDTO();
        rule.setId(id);
        rule.setType(type);

        ConditionGroup cg = new ConditionGroup();
        cg.setOperator("AND");
        LogicCondition cond = new LogicCondition();
        cond.setQuestionId(condQuestionId);
        cond.setOperator(condOperator);
        cond.setValue("test");
        cg.setItems(List.of(cond));
        rule.setConditions(cg);

        LogicAction action = new LogicAction();
        action.setType(actionType);
        action.setTargetQuestionId(targetQuestionId);
        if ("pipe".equals(actionType)) {
            action.setPipeField("testField");
        }
        rule.setAction(action);

        return rule;
    }
}
