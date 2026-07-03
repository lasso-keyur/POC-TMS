-- V31: Alter existing tables for M360 support

-- Allow M360 as a survey template type
ALTER TABLE SURVEYS DROP CONSTRAINT chk_survey_template;
ALTER TABLE SURVEYS ADD CONSTRAINT chk_survey_template CHECK (template_type IN ('CUSTOM', 'TEAM_MATE_VOICES', 'ENGAGEMENT', 'NPS', 'M360'));

-- Program key shown on the Add Program form (e.g. '360')
ALTER TABLE PROGRAMS ADD (program_key VARCHAR2(50));

-- Link survey responses to the rater assignment that produced them (360 feedback)
ALTER TABLE SURVEY_RESPONSES ADD (rater_assignment_id NUMBER);
ALTER TABLE SURVEY_RESPONSES ADD CONSTRAINT fk_response_rater_assignment FOREIGN KEY (rater_assignment_id) REFERENCES M360_RATER_ASSIGNMENTS(rater_assignment_id);
CREATE INDEX idx_responses_rater_assignment ON SURVEY_RESPONSES(rater_assignment_id);

-- Close the loop: rater assignment can point at its completed response
ALTER TABLE M360_RATER_ASSIGNMENTS ADD CONSTRAINT fk_m360_rater_response FOREIGN KEY (response_id) REFERENCES SURVEY_RESPONSES(response_id);
