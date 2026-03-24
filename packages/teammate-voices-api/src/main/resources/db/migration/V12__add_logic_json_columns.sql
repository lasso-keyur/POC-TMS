-- V12: Add logic_json columns to support conditional logic rules
-- logic_json on SURVEYS stores the complete logic ruleset as JSON
-- logic_rules on SURVEY_QUESTIONS stores per-question visibility/skip rules

ALTER TABLE SURVEYS ADD (logic_json CLOB);
ALTER TABLE SURVEY_QUESTIONS ADD (logic_rules CLOB);
