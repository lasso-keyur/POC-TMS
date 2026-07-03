-- V32: Seed M360 demo data — survey, comms templates, cycle, phases, activities, criteria, enrollments, raters

-- ── M360 survey template ──────────────────────────────────────────────────────

MERGE INTO SURVEYS s USING (SELECT 'Enterprise 360 Feedback Survey' AS title FROM DUAL) src ON (s.title = src.title)
WHEN NOT MATCHED THEN INSERT (title, description, template_type, status, build_status, cycle, participant_type, survey_stage, audience_source, auto_send, is_anonymous, start_date, end_date)
VALUES (
  'Enterprise 360 Feedback Survey',
  'Multi-rater feedback survey covering leadership, collaboration, communication, and growth. Completed by self, manager, peers, direct reports, and business partners.',
  'M360', 'ACTIVE', 'PUBLISHED',
  '2025', 'EXISTING_RESOURCE', 'MID_TRAINING', 'CSV_UPLOAD', 0, 0,
  DATE '2025-06-09', DATE '2025-09-30'
);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'This person communicates clearly and keeps others informed', 'RATING_SCALE', 1, 1 FROM SURVEYS s WHERE s.title = 'Enterprise 360 Feedback Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 1);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'This person collaborates effectively across teams', 'RATING_SCALE', 2, 1 FROM SURVEYS s WHERE s.title = 'Enterprise 360 Feedback Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 2);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'This person demonstrates strong leadership and sets a clear direction', 'RATING_SCALE', 3, 1 FROM SURVEYS s WHERE s.title = 'Enterprise 360 Feedback Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 3);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'This person delivers on commitments and holds themselves accountable', 'RATING_SCALE', 4, 1 FROM SURVEYS s WHERE s.title = 'Enterprise 360 Feedback Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 4);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'This person supports the growth and development of others', 'RATING_SCALE', 5, 1 FROM SURVEYS s WHERE s.title = 'Enterprise 360 Feedback Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 5);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'This person adapts well to change and remains effective under pressure', 'RATING_SCALE', 6, 1 FROM SURVEYS s WHERE s.title = 'Enterprise 360 Feedback Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 6);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'What should this person continue doing?', 'TEXT', 7, 0 FROM SURVEYS s WHERE s.title = 'Enterprise 360 Feedback Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 7);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'What is one thing this person could do differently to be more effective?', 'TEXT', 8, 0 FROM SURVEYS s WHERE s.title = 'Enterprise 360 Feedback Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 8);

-- ── M360 comms templates (Comms template dropdown values in the Schedule step) ─

INSERT INTO EMAIL_TEMPLATES (name, description, category, subject, from_name, body_html, status)
SELECT '360-T1', 'Manager pre-launch communication', 'M360_PRELAUNCH',
'Your team is participating in {{cycle_name}}', 'Employee Survey',
'<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px"><h1 style="font-size:22px">Hello {{manager_name}},</h1><p style="font-size:15px;line-height:1.7;color:#424245">Your team will participate in the <strong>{{cycle_name}}</strong> 360 feedback cycle. Rater selection opens on {{rater_selection_start}}.</p></div>', 'ACTIVE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATES WHERE name = '360-T1');

INSERT INTO EMAIL_TEMPLATES (name, description, category, subject, from_name, body_html, status)
SELECT '360-T2', 'Participant pre-launch communication', 'M360_PRELAUNCH',
'Get ready: {{cycle_name}} starts soon', 'Employee Survey',
'<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px"><h1 style="font-size:22px">Hello {{participant_name}},</h1><p style="font-size:15px;line-height:1.7;color:#424245">You are enrolled in the <strong>{{cycle_name}}</strong> 360 feedback cycle. You will be asked to select your raters starting {{rater_selection_start}}.</p></div>', 'ACTIVE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATES WHERE name = '360-T2');

INSERT INTO EMAIL_TEMPLATES (name, description, category, subject, from_name, body_html, status)
SELECT '360-T21', 'Pre-launch communication for previous report-ineligible participants', 'M360_PRELAUNCH',
'{{cycle_name}}: your participation status', 'Employee Survey',
'<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px"><h1 style="font-size:22px">Hello {{participant_name}},</h1><p style="font-size:15px;line-height:1.7;color:#424245">You are enrolled in <strong>{{cycle_name}}</strong>. Note: a report was not generated for you in the previous cycle; this cycle gives you a fresh start.</p></div>', 'ACTIVE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATES WHERE name = '360-T21');

INSERT INTO EMAIL_TEMPLATES (name, description, category, subject, from_name, body_html, status)
SELECT '360-T3', 'Rater selection initial communication', 'M360_RATER_SELECTION',
'Action required: select your raters for {{cycle_name}}', 'Employee Survey',
'<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px"><h1 style="font-size:22px">Hello {{participant_name}},</h1><p style="font-size:15px;line-height:1.7;color:#424245">Rater selection is now open for <strong>{{cycle_name}}</strong>. Please select your raters by {{rater_selection_end}}.</p><div style="text-align:center;margin:24px 0"><a href="{{selection_link}}" style="display:inline-block;padding:12px 32px;background:#012169;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Select Raters</a></div></div>', 'ACTIVE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATES WHERE name = '360-T3');

INSERT INTO EMAIL_TEMPLATES (name, description, category, subject, from_name, body_html, status)
SELECT '360-T4', 'Rater selection reminder', 'M360_RATER_SELECTION',
'Reminder: select your raters for {{cycle_name}}', 'Employee Survey',
'<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px"><h1 style="font-size:22px">Hello {{participant_name}},</h1><p style="font-size:15px;line-height:1.7;color:#424245">This is a reminder to select your raters for <strong>{{cycle_name}}</strong> before {{rater_selection_end}}.</p></div>', 'ACTIVE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATES WHERE name = '360-T4');

INSERT INTO EMAIL_TEMPLATES (name, description, category, subject, from_name, body_html, status)
SELECT '360-T5', 'Rater approval initial communication', 'M360_RATER_APPROVAL',
'Action required: approve raters for {{participant_name}}', 'Employee Survey',
'<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px"><h1 style="font-size:22px">Hello {{manager_name}},</h1><p style="font-size:15px;line-height:1.7;color:#424245"><strong>{{participant_name}}</strong> has submitted their rater selection for <strong>{{cycle_name}}</strong> and needs your approval.</p><div style="text-align:center;margin:24px 0"><a href="{{approval_link}}" style="display:inline-block;padding:12px 32px;background:#012169;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Review Raters</a></div></div>', 'ACTIVE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATES WHERE name = '360-T5');

INSERT INTO EMAIL_TEMPLATES (name, description, category, subject, from_name, body_html, status)
SELECT '360-T6', 'Rater approval reminder', 'M360_RATER_APPROVAL',
'Reminder: rater approval pending for {{participant_name}}', 'Employee Survey',
'<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px"><h1 style="font-size:22px">Hello {{manager_name}},</h1><p style="font-size:15px;line-height:1.7;color:#424245">Rater approval for <strong>{{participant_name}}</strong> is still pending. Please review before {{rater_approval_end}}.</p></div>', 'ACTIVE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATES WHERE name = '360-T6');

INSERT INTO EMAIL_TEMPLATES (name, description, category, subject, from_name, body_html, status)
SELECT '360-T7', 'Changes required notification', 'M360_RATER_APPROVAL',
'Changes required: update your rater selection for {{cycle_name}}', 'Employee Survey',
'<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px"><h1 style="font-size:22px">Hello {{participant_name}},</h1><p style="font-size:15px;line-height:1.7;color:#424245">Your manager reviewed your rater selection for <strong>{{cycle_name}}</strong> and requested changes: {{rejection_reason}}</p><div style="text-align:center;margin:24px 0"><a href="{{selection_link}}" style="display:inline-block;padding:12px 32px;background:#012169;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Update Raters</a></div></div>', 'ACTIVE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATES WHERE name = '360-T7');

INSERT INTO EMAIL_TEMPLATES (name, description, category, subject, from_name, body_html, status)
SELECT '360-T8', 'Rater feedback invitation', 'M360_INVITATION',
'You have been selected to provide feedback for {{participant_name}}', 'Employee Survey',
'<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px"><h1 style="font-size:22px">Hello {{rater_name}},</h1><p style="font-size:15px;line-height:1.7;color:#424245">You have been selected to provide 360 feedback for <strong>{{participant_name}}</strong> as their <strong>{{relationship}}</strong> in the <strong>{{cycle_name}}</strong> cycle. The survey takes about 10 minutes.</p><div style="text-align:center;margin:24px 0"><a href="{{feedback_link}}" style="display:inline-block;padding:12px 32px;background:#012169;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Provide Feedback</a></div><p style="font-size:13px;color:#86868b;text-align:center">Please complete by {{due_date}}.</p></div>', 'ACTIVE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM EMAIL_TEMPLATES WHERE name = '360-T8');

-- ── Tag Enterprise 360 programs with the 360 program key ─────────────────────

UPDATE PROGRAMS SET program_key = '360' WHERE name LIKE 'Enterprise 360%' AND program_key IS NULL;

-- ── Demo cycle "2025 Cycle 1" under "Enterprise 360 2025 - A" ─────────────────

INSERT INTO M360_CYCLES (program_id, survey_id, name, description, version, start_date, status, allow_self_selection, allow_manager_selection, allow_hr_selection, overall_min_raters, overall_max_raters)
SELECT
  (SELECT program_id FROM PROGRAMS WHERE name = 'Enterprise 360 2025 - A'),
  (SELECT survey_id FROM SURVEYS WHERE title = 'Enterprise 360 Feedback Survey'),
  '2025 Cycle 1', 'First cycle of 2025 for Enterprise 360.', 1,
  DATE '2025-06-09', 'ACTIVE', 1, 0, 1, 6, 99
FROM DUAL
WHERE EXISTS (SELECT 1 FROM PROGRAMS WHERE name = 'Enterprise 360 2025 - A')
AND NOT EXISTS (SELECT 1 FROM M360_CYCLES WHERE name = '2025 Cycle 1');

-- All 7 phases scheduled
INSERT INTO M360_CYCLE_PHASES (cycle_id, phase_type, is_enabled, start_at, end_at)
SELECT c.cycle_id, p.phase_type, 1, p.start_at, p.end_at
FROM M360_CYCLES c
CROSS JOIN (
  SELECT 'ENROLLMENT'      AS phase_type, TIMESTAMP '2025-06-09 09:00:00' AS start_at, TIMESTAMP '2025-06-20 17:00:00' AS end_at FROM DUAL UNION ALL
  SELECT 'PRE_LAUNCH',      TIMESTAMP '2025-07-01 09:00:00', TIMESTAMP '2025-07-15 17:00:00' FROM DUAL UNION ALL
  SELECT 'RATER_SELECTION', TIMESTAMP '2025-08-01 09:00:00', TIMESTAMP '2025-08-22 17:00:00' FROM DUAL UNION ALL
  SELECT 'RATER_APPROVAL',  TIMESTAMP '2025-08-23 09:00:00', TIMESTAMP '2025-08-31 17:00:00' FROM DUAL UNION ALL
  SELECT 'RATER_FEEDBACK',  TIMESTAMP '2025-09-01 09:00:00', TIMESTAMP '2025-09-19 17:00:00' FROM DUAL UNION ALL
  SELECT 'REPORT_DELIVERY', TIMESTAMP '2025-09-22 09:00:00', TIMESTAMP '2025-09-26 17:00:00' FROM DUAL UNION ALL
  SELECT 'POST_SURVEY',     TIMESTAMP '2025-09-29 09:00:00', TIMESTAMP '2025-10-10 17:00:00' FROM DUAL
) p
WHERE c.name = '2025 Cycle 1'
AND NOT EXISTS (SELECT 1 FROM M360_CYCLE_PHASES ph WHERE ph.cycle_id = c.cycle_id AND ph.phase_type = p.phase_type);

-- Default comm activities per phase (mirrors mockup rows)
INSERT INTO M360_PHASE_ACTIVITIES (phase_id, activity_name, email_template_id, activity_date, activity_time, sort_order)
SELECT ph.phase_id, a.activity_name, (SELECT template_id FROM EMAIL_TEMPLATES WHERE name = a.template_name), a.activity_date, a.activity_time, a.sort_order
FROM M360_CYCLE_PHASES ph
JOIN M360_CYCLES c ON c.cycle_id = ph.cycle_id AND c.name = '2025 Cycle 1'
JOIN (
  SELECT 'PRE_LAUNCH' AS phase_type, 'Manager Pre-launch communication' AS activity_name, '360-T1' AS template_name, DATE '2025-07-01' AS activity_date, '09:00 AM' AS activity_time, 1 AS sort_order FROM DUAL UNION ALL
  SELECT 'PRE_LAUNCH', 'Participant Pre-launch communication', '360-T2', DATE '2025-07-02', '09:00 AM', 2 FROM DUAL UNION ALL
  SELECT 'PRE_LAUNCH', 'Pre-launch communication for previous report-ineligible participants', '360-T21', DATE '2025-07-03', '09:00 AM', 3 FROM DUAL UNION ALL
  SELECT 'RATER_SELECTION', 'Initial communication', '360-T3', DATE '2025-08-01', '09:00 AM', 1 FROM DUAL UNION ALL
  SELECT 'RATER_SELECTION', 'Reminder communication 1', '360-T4', DATE '2025-08-08', '09:00 AM', 2 FROM DUAL UNION ALL
  SELECT 'RATER_SELECTION', 'Reminder communication 2', '360-T4', DATE '2025-08-15', '09:00 AM', 3 FROM DUAL UNION ALL
  SELECT 'RATER_SELECTION', 'Reminder communication 3', '360-T4', DATE '2025-08-20', '09:00 AM', 4 FROM DUAL UNION ALL
  SELECT 'RATER_APPROVAL', 'Initial communication', '360-T5', DATE '2025-08-23', '09:00 AM', 1 FROM DUAL UNION ALL
  SELECT 'RATER_APPROVAL', 'Reminder communication 1', '360-T6', DATE '2025-08-26', '09:00 AM', 2 FROM DUAL UNION ALL
  SELECT 'RATER_APPROVAL', 'Reminder communication 2', '360-T6', DATE '2025-08-28', '09:00 AM', 3 FROM DUAL UNION ALL
  SELECT 'RATER_APPROVAL', 'Changes Required Notification', '360-T7', DATE '2025-08-29', '09:00 AM', 4 FROM DUAL UNION ALL
  SELECT 'RATER_FEEDBACK', 'Rater feedback invitation', '360-T8', DATE '2025-09-01', '09:00 AM', 1 FROM DUAL
) a ON a.phase_type = ph.phase_type
WHERE NOT EXISTS (
  SELECT 1 FROM M360_PHASE_ACTIVITIES x WHERE x.phase_id = ph.phase_id AND x.activity_name = a.activity_name
);

-- Rater criteria (mockup: Overall min 6; Direct reports 3-25; Peers <25; Business partner <25; Indirect manager <3)
INSERT INTO M360_RATER_CRITERIA (cycle_id, category, min_count, max_count, auto_load, is_enabled)
SELECT c.cycle_id, cr.category, cr.min_count, cr.max_count, cr.auto_load, 1
FROM M360_CYCLES c
CROSS JOIN (
  SELECT 'SELF' AS category, 1 AS min_count, 1 AS max_count, 1 AS auto_load FROM DUAL UNION ALL
  SELECT 'MANAGER', 1, 1, 1 FROM DUAL UNION ALL
  SELECT 'INDIRECT_MANAGER', NULL, 3, 0 FROM DUAL UNION ALL
  SELECT 'PEERS', NULL, 25, 0 FROM DUAL UNION ALL
  SELECT 'DIRECT_REPORTS', 3, 25, 0 FROM DUAL UNION ALL
  SELECT 'BUSINESS_PARTNERS', NULL, 25, 0 FROM DUAL
) cr
WHERE c.name = '2025 Cycle 1'
AND NOT EXISTS (SELECT 1 FROM M360_RATER_CRITERIA rc WHERE rc.cycle_id = c.cycle_id AND rc.category = cr.category);

-- ── Enrollments (3 subjects with fixed demo tokens) ───────────────────────────

INSERT INTO M360_ENROLLMENTS (cycle_id, participant_id, manager_name, manager_email, status, participant_token, manager_token)
SELECT c.cycle_id, '30100001', 'Lisa Chen', 'lisa.chen@newco.example.com', 'RATERS_SUBMITTED', 'm360-sel-demo-1', 'm360-appr-demo-1'
FROM M360_CYCLES c WHERE c.name = '2025 Cycle 1'
AND EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id = '30100001')
AND NOT EXISTS (SELECT 1 FROM M360_ENROLLMENTS e WHERE e.cycle_id = c.cycle_id AND e.participant_id = '30100001');

INSERT INTO M360_ENROLLMENTS (cycle_id, participant_id, manager_name, manager_email, status, participant_token, manager_token)
SELECT c.cycle_id, '30100002', 'Mark Davis', 'mark.davis@newco.example.com', 'ENROLLED', 'm360-sel-demo-2', 'm360-appr-demo-2'
FROM M360_CYCLES c WHERE c.name = '2025 Cycle 1'
AND EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id = '30100002')
AND NOT EXISTS (SELECT 1 FROM M360_ENROLLMENTS e WHERE e.cycle_id = c.cycle_id AND e.participant_id = '30100002');

INSERT INTO M360_ENROLLMENTS (cycle_id, participant_id, manager_name, manager_email, status, participant_token, manager_token)
SELECT c.cycle_id, '30100003', 'Mark Davis', 'mark.davis@newco.example.com', 'ENROLLED', 'm360-sel-demo-3', 'm360-appr-demo-3'
FROM M360_CYCLES c WHERE c.name = '2025 Cycle 1'
AND EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id = '30100003')
AND NOT EXISTS (SELECT 1 FROM M360_ENROLLMENTS e WHERE e.cycle_id = c.cycle_id AND e.participant_id = '30100003');

-- ── Rater assignments for enrollment 1 (mixed statuses so every screen has data)

INSERT INTO M360_RATER_ASSIGNMENTS (enrollment_id, rater_participant_id, rater_name, rater_email, relationship, added_by, status)
SELECT e.enrollment_id, '30100001', 'Alex Morgan', 'alex.morgan@newco.example.com', 'SELF', 'SYSTEM', 'APPROVED'
FROM M360_ENROLLMENTS e WHERE e.participant_token = 'm360-sel-demo-1'
AND NOT EXISTS (SELECT 1 FROM M360_RATER_ASSIGNMENTS r WHERE r.enrollment_id = e.enrollment_id AND r.rater_email = 'alex.morgan@newco.example.com');

INSERT INTO M360_RATER_ASSIGNMENTS (enrollment_id, rater_name, rater_email, relationship, added_by, status)
SELECT e.enrollment_id, 'Lisa Chen', 'lisa.chen@newco.example.com', 'MANAGER', 'SYSTEM', 'APPROVED'
FROM M360_ENROLLMENTS e WHERE e.participant_token = 'm360-sel-demo-1'
AND NOT EXISTS (SELECT 1 FROM M360_RATER_ASSIGNMENTS r WHERE r.enrollment_id = e.enrollment_id AND r.rater_email = 'lisa.chen@newco.example.com');

INSERT INTO M360_RATER_ASSIGNMENTS (enrollment_id, rater_participant_id, rater_name, rater_email, relationship, added_by, status)
SELECT e.enrollment_id, '30100002', 'Priya Sharma', 'priya.sharma@newco.example.com', 'PEERS', 'SELF', 'PENDING_APPROVAL'
FROM M360_ENROLLMENTS e WHERE e.participant_token = 'm360-sel-demo-1'
AND NOT EXISTS (SELECT 1 FROM M360_RATER_ASSIGNMENTS r WHERE r.enrollment_id = e.enrollment_id AND r.rater_email = 'priya.sharma@newco.example.com');

INSERT INTO M360_RATER_ASSIGNMENTS (enrollment_id, rater_participant_id, rater_name, rater_email, relationship, added_by, status)
SELECT e.enrollment_id, '30100003', 'Jason Lee', 'jason.lee@newco.example.com', 'DIRECT_REPORTS', 'SELF', 'PENDING_APPROVAL'
FROM M360_ENROLLMENTS e WHERE e.participant_token = 'm360-sel-demo-1'
AND NOT EXISTS (SELECT 1 FROM M360_RATER_ASSIGNMENTS r WHERE r.enrollment_id = e.enrollment_id AND r.rater_email = 'jason.lee@newco.example.com');

INSERT INTO M360_RATER_ASSIGNMENTS (enrollment_id, rater_participant_id, rater_name, rater_email, relationship, added_by, status, feedback_token, invited_at, email_status)
SELECT e.enrollment_id, '30100004', 'Samira Khan', 'samira.khan@newco.example.com', 'PEERS', 'MANAGER', 'INVITED', 'm360-fb-demo-1', CURRENT_TIMESTAMP, 'SENT'
FROM M360_ENROLLMENTS e WHERE e.participant_token = 'm360-sel-demo-1'
AND NOT EXISTS (SELECT 1 FROM M360_RATER_ASSIGNMENTS r WHERE r.enrollment_id = e.enrollment_id AND r.rater_email = 'samira.khan@newco.example.com');

INSERT INTO M360_RATER_ASSIGNMENTS (enrollment_id, rater_participant_id, rater_name, rater_email, relationship, added_by, status)
SELECT e.enrollment_id, '30100005', 'Wei Zhang', 'wei.zhang@newco.example.com', 'DIRECT_REPORTS', 'SELF', 'PENDING_APPROVAL'
FROM M360_ENROLLMENTS e WHERE e.participant_token = 'm360-sel-demo-1'
AND NOT EXISTS (SELECT 1 FROM M360_RATER_ASSIGNMENTS r WHERE r.enrollment_id = e.enrollment_id AND r.rater_email = 'wei.zhang@newco.example.com');
