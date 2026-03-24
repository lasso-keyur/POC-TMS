package com.teammatevoices.dto.request;

import com.teammatevoices.dto.LogicRuleDTO;
import jakarta.validation.Valid;
import java.util.List;

/**
 * Request body for PUT /surveys/{id}/logic.
 * Contains the full set of logic rules to save for a survey.
 */
public class SaveLogicRequest {

    @Valid
    private List<LogicRuleDTO> rules;

    public SaveLogicRequest() {}

    public List<LogicRuleDTO> getRules() { return rules; }
    public void setRules(List<LogicRuleDTO> rules) { this.rules = rules; }
}
