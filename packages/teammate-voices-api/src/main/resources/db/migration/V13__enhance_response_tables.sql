-- V13: Enhance response tables for full response capture
ALTER TABLE SURVEY_RESPONSES ADD dispatch_id NUMBER;
ALTER TABLE SURVEY_RESPONSES ADD is_complete NUMBER(1) DEFAULT 0;
ALTER TABLE SURVEY_RESPONSES ADD participant_id VARCHAR2(100);

ALTER TABLE SURVEY_ANSWERS ADD page_id VARCHAR2(100);
ALTER TABLE SURVEY_ANSWERS ADD answer_json CLOB;

CREATE INDEX idx_responses_participant ON SURVEY_RESPONSES(participant_id);
CREATE INDEX idx_responses_dispatch ON SURVEY_RESPONSES(dispatch_id);
CREATE INDEX idx_answers_page ON SURVEY_ANSWERS(page_id);
