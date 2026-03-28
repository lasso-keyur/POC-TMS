-- V26: Seed 3 programs, 6 surveys, and email template assignments

-- ── Programs ──────────────────────────────────────────────────────────────────

MERGE INTO PROGRAMS p USING (SELECT 'New Hire Onboarding 2026 Q1' AS name FROM DUAL) src ON (p.name = src.name)
WHEN NOT MATCHED THEN INSERT (name, description, template_type, status, survey_progress)
VALUES ('New Hire Onboarding 2026 Q1', 'Structured onboarding program for new hires joining in Q1 2026. Covers role clarity, team integration, tool proficiency, and early performance check-ins.', 'TEAM_MATE_VOICES', 'ACTIVE', 'IN_PROGRESS');

MERGE INTO PROGRAMS p USING (SELECT 'Leadership Acceleration Program' AS name FROM DUAL) src ON (p.name = src.name)
WHEN NOT MATCHED THEN INSERT (name, description, template_type, status, survey_progress)
VALUES ('Leadership Acceleration Program', '6-month leadership development program for high-potential managers. Focuses on strategic thinking, people leadership, and executive presence.', 'TEAM_MATE_VOICES', 'ACTIVE', 'IN_PROGRESS');

MERGE INTO PROGRAMS p USING (SELECT 'Digital Skills Academy' AS name FROM DUAL) src ON (p.name = src.name)
WHEN NOT MATCHED THEN INSERT (name, description, template_type, status, survey_progress)
VALUES ('Digital Skills Academy', 'Upskilling program for employees transitioning to digital and cloud-based workflows. Covers data literacy, automation tools, and agile delivery.', 'CUSTOM', 'ACTIVE', 'IN_PROGRESS');

-- ── Surveys: New Hire Onboarding ──────────────────────────────────────────────

MERGE INTO SURVEYS s USING (SELECT 'Week 1 Check-in Survey' AS title FROM DUAL) src ON (s.title = src.title)
WHEN NOT MATCHED THEN INSERT (title, description, template_type, status, build_status, program_id, cycle, participant_type, survey_stage, audience_source, auto_send, is_anonymous, start_date, end_date)
VALUES (
  'Week 1 Check-in Survey',
  'A brief pulse check to capture first impressions and surface any early support needs before they become blockers.',
  'TEAM_MATE_VOICES', 'ACTIVE', 'PUBLISHED',
  (SELECT program_id FROM PROGRAMS WHERE name = 'New Hire Onboarding 2026 Q1'),
  '2026 Q1', 'NEW_HIRE', 'ONBOARDING', 'CSV_UPLOAD', 0, 1,
  DATE '2026-01-06', DATE '2026-04-30'
);

MERGE INTO SURVEYS s USING (SELECT '30-Day Milestone Survey' AS title FROM DUAL) src ON (s.title = src.title)
WHEN NOT MATCHED THEN INSERT (title, description, template_type, status, build_status, program_id, cycle, participant_type, survey_stage, audience_source, auto_send, is_anonymous, start_date, end_date)
VALUES (
  '30-Day Milestone Survey',
  'Evaluate integration, workload manageability, and feedback quality at the 30-day mark to guide manager coaching conversations.',
  'TEAM_MATE_VOICES', 'ACTIVE', 'PUBLISHED',
  (SELECT program_id FROM PROGRAMS WHERE name = 'New Hire Onboarding 2026 Q1'),
  '2026 Q1', 'NEW_HIRE', 'MID_TRAINING', 'CSV_UPLOAD', 0, 1,
  DATE '2026-02-05', DATE '2026-04-30'
);

-- ── Surveys: Leadership Acceleration ─────────────────────────────────────────

MERGE INTO SURVEYS s USING (SELECT 'Leadership Mid-Point Assessment' AS title FROM DUAL) src ON (s.title = src.title)
WHEN NOT MATCHED THEN INSERT (title, description, template_type, status, build_status, program_id, cycle, participant_type, survey_stage, audience_source, auto_send, is_anonymous, start_date, end_date)
VALUES (
  'Leadership Mid-Point Assessment',
  'Mid-program check on content relevance, facilitation quality, and early skill application. Results inform curriculum adjustments for the second half.',
  'TEAM_MATE_VOICES', 'ACTIVE', 'PUBLISHED',
  (SELECT program_id FROM PROGRAMS WHERE name = 'Leadership Acceleration Program'),
  '2026 Q1', 'EXISTING_RESOURCE', 'MID_TRAINING', 'CSV_UPLOAD', 0, 1,
  DATE '2026-01-15', DATE '2026-06-30'
);

MERGE INTO SURVEYS s USING (SELECT 'Post-Program Effectiveness Survey' AS title FROM DUAL) src ON (s.title = src.title)
WHEN NOT MATCHED THEN INSERT (title, description, template_type, status, build_status, program_id, cycle, participant_type, survey_stage, audience_source, auto_send, is_anonymous, start_date, end_date)
VALUES (
  'Post-Program Effectiveness Survey',
  'Measures long-term leadership behaviour change and program ROI three months post-completion. Sent to participants and their direct managers.',
  'TEAM_MATE_VOICES', 'DRAFT', 'DRAFT',
  (SELECT program_id FROM PROGRAMS WHERE name = 'Leadership Acceleration Program'),
  '2026 Q1', 'EXISTING_RESOURCE', 'END_TRAINING', 'CSV_UPLOAD', 0, 1,
  DATE '2026-06-01', DATE '2026-08-31'
);

-- ── Surveys: Digital Skills Academy ──────────────────────────────────────────

MERGE INTO SURVEYS s USING (SELECT 'Digital Skills Readiness Check' AS title FROM DUAL) src ON (s.title = src.title)
WHEN NOT MATCHED THEN INSERT (title, description, template_type, status, build_status, program_id, cycle, participant_type, survey_stage, audience_source, auto_send, is_anonymous, start_date, end_date)
VALUES (
  'Digital Skills Readiness Check',
  'Gauges learner confidence, content clarity, and tool access in the first weeks of the Academy. Identifies participants who need extra support early.',
  'CUSTOM', 'ACTIVE', 'PUBLISHED',
  (SELECT program_id FROM PROGRAMS WHERE name = 'Digital Skills Academy'),
  '2026 Q1', 'ALL', 'ONBOARDING', 'CSV_UPLOAD', 0, 1,
  DATE '2026-01-20', DATE '2026-05-31'
);

MERGE INTO SURVEYS s USING (SELECT 'Skills Mastery Survey' AS title FROM DUAL) src ON (s.title = src.title)
WHEN NOT MATCHED THEN INSERT (title, description, template_type, status, build_status, program_id, cycle, participant_type, survey_stage, audience_source, auto_send, is_anonymous, start_date, end_date)
VALUES (
  'Skills Mastery Survey',
  'End-of-program assessment measuring skill mastery, workplace application readiness, and net promoter score for the Academy.',
  'CUSTOM', 'DRAFT', 'DRAFT',
  (SELECT program_id FROM PROGRAMS WHERE name = 'Digital Skills Academy'),
  '2026 Q1', 'ALL', 'END_TRAINING', 'CSV_UPLOAD', 0, 1,
  DATE '2026-05-01', DATE '2026-07-31'
);

-- ── Email Template Assignments ────────────────────────────────────────────────
-- New Hire Onboarding → Intern Program templates

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'INVITATION', 0, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Intern Program - Initial Invitation' AND s.title = 'Week 1 Check-in Survey'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'INVITATION');

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'REMINDER', 3, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Intern Program - Reminder' AND s.title = 'Week 1 Check-in Survey'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'REMINDER');

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'THANK_YOU', 0, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Intern Program - Thank You' AND s.title = 'Week 1 Check-in Survey'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'THANK_YOU');

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'INVITATION', 0, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Intern Program - Initial Invitation' AND s.title = '30-Day Milestone Survey'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'INVITATION');

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'REMINDER', 3, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Intern Program - Reminder' AND s.title = '30-Day Milestone Survey'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'REMINDER');

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'THANK_YOU', 0, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Intern Program - Thank You' AND s.title = '30-Day Milestone Survey'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'THANK_YOU');

-- Leadership Acceleration → Employee Voice templates

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'INVITATION', 0, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Employee Voice - Annual Survey Launch' AND s.title = 'Leadership Mid-Point Assessment'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'INVITATION');

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'REMINDER', 5, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Employee Voice - Final Reminder' AND s.title = 'Leadership Mid-Point Assessment'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'REMINDER');

-- Digital Skills Academy → Academy templates

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'INVITATION', 0, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Academy - Post-Training Feedback' AND s.title = 'Digital Skills Readiness Check'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'INVITATION');

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'THANK_YOU', 0, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Academy - Completion Certificate' AND s.title = 'Digital Skills Readiness Check'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'THANK_YOU');

INSERT INTO EMAIL_TEMPLATE_ASSIGNMENTS (template_id, survey_id, program_id, trigger_type, send_delay_days, is_active)
SELECT t.template_id, s.survey_id, s.program_id, 'INVITATION', 0, 1 FROM EMAIL_TEMPLATES t, SURVEYS s
WHERE t.name = 'Academy - Post-Training Feedback' AND s.title = 'Skills Mastery Survey'
AND NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATE_ASSIGNMENTS x WHERE x.template_id = t.template_id AND x.survey_id = s.survey_id AND x.trigger_type = 'INVITATION');

COMMIT;
