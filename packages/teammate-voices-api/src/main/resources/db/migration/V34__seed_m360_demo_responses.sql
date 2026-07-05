-- V34: Seed submitted feedback for the demo enrollment so the 360 report demonstrates
-- anonymity thresholds (>=3 per category) and blind spots / hidden strengths.
--
-- Raters for Alex Morgan (enrollment token m360-sel-demo-1):
--   SELF    Alex Morgan      5,5,5,4,2,4   (rates himself high on Q1-Q3 → blind spots; low on Q5 → hidden strength)
--   MANAGER Lisa Chen        3,4,3,4,4,4
--   PEERS   Priya Sharma     3,4,3,4,5,4
--   PEERS   Jason Lee        4,3,3,4,4,3
--   PEERS   Samira Khan      4,4,4,4,5,4
--   BUSINESS_PARTNERS Jordan Blake 4,4,4,4,4,4  (n=1 → suppressed in the report)

-- ── Normalize demo rater rows ─────────────────────────────────────────────────

UPDATE M360_RATER_ASSIGNMENTS SET relationship = 'PEERS'
WHERE rater_email IN ('priya.sharma@newco.example.com', 'jason.lee@newco.example.com', 'samira.khan@newco.example.com')
AND enrollment_id = (SELECT enrollment_id FROM M360_ENROLLMENTS WHERE participant_token = 'm360-sel-demo-1');

-- Ad-hoc business partner rater (n=1 demonstrates category suppression)
INSERT INTO M360_RATER_ASSIGNMENTS (enrollment_id, rater_name, rater_email, relationship, added_by, status, feedback_token)
SELECT e.enrollment_id, 'Jordan Blake', 'jordan.blake@partner.example.com', 'BUSINESS_PARTNERS', 'MANAGER', 'INVITED', 'm360-fb-demo-bp1'
FROM M360_ENROLLMENTS e WHERE e.participant_token = 'm360-sel-demo-1'
AND NOT EXISTS (SELECT 1 FROM M360_RATER_ASSIGNMENTS r WHERE r.enrollment_id = e.enrollment_id AND r.rater_email = 'jordan.blake@partner.example.com');

-- ── Create one response per rater (idempotent: skips raters that already have one)

INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, rater_assignment_id, is_complete, started_at, submitted_at)
SELECT (SELECT survey_id FROM SURVEYS WHERE title = 'Enterprise 360 Feedback Survey'),
       e.participant_id, ra.rater_assignment_id, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM M360_ENROLLMENTS e
JOIN M360_RATER_ASSIGNMENTS ra ON ra.enrollment_id = e.enrollment_id
WHERE e.participant_token = 'm360-sel-demo-1'
AND ra.rater_email IN (
    'alex.morgan@newco.example.com', 'lisa.chen@newco.example.com',
    'priya.sharma@newco.example.com', 'jason.lee@newco.example.com',
    'samira.khan@newco.example.com', 'jordan.blake@partner.example.com')
AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.rater_assignment_id = ra.rater_assignment_id);

-- ── Answers: one row per rater per rating question (sort_order 1..6) ──────────

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text)
SELECT r.response_id, q.question_id, sc.score, TO_CLOB(
         CASE sc.score WHEN 5 THEN 'Strongly Agree' WHEN 4 THEN 'Agree'
                       WHEN 3 THEN 'Neutral' WHEN 2 THEN 'Disagree' ELSE 'Strongly Disagree' END)
FROM (
  SELECT 'alex.morgan@newco.example.com'  AS email, 1 AS so, 5 AS score FROM DUAL UNION ALL
  SELECT 'alex.morgan@newco.example.com', 2, 5 FROM DUAL UNION ALL
  SELECT 'alex.morgan@newco.example.com', 3, 5 FROM DUAL UNION ALL
  SELECT 'alex.morgan@newco.example.com', 4, 4 FROM DUAL UNION ALL
  SELECT 'alex.morgan@newco.example.com', 5, 2 FROM DUAL UNION ALL
  SELECT 'alex.morgan@newco.example.com', 6, 4 FROM DUAL UNION ALL
  SELECT 'lisa.chen@newco.example.com', 1, 3 FROM DUAL UNION ALL
  SELECT 'lisa.chen@newco.example.com', 2, 4 FROM DUAL UNION ALL
  SELECT 'lisa.chen@newco.example.com', 3, 3 FROM DUAL UNION ALL
  SELECT 'lisa.chen@newco.example.com', 4, 4 FROM DUAL UNION ALL
  SELECT 'lisa.chen@newco.example.com', 5, 4 FROM DUAL UNION ALL
  SELECT 'lisa.chen@newco.example.com', 6, 4 FROM DUAL UNION ALL
  SELECT 'priya.sharma@newco.example.com', 1, 3 FROM DUAL UNION ALL
  SELECT 'priya.sharma@newco.example.com', 2, 4 FROM DUAL UNION ALL
  SELECT 'priya.sharma@newco.example.com', 3, 3 FROM DUAL UNION ALL
  SELECT 'priya.sharma@newco.example.com', 4, 4 FROM DUAL UNION ALL
  SELECT 'priya.sharma@newco.example.com', 5, 5 FROM DUAL UNION ALL
  SELECT 'priya.sharma@newco.example.com', 6, 4 FROM DUAL UNION ALL
  SELECT 'jason.lee@newco.example.com', 1, 4 FROM DUAL UNION ALL
  SELECT 'jason.lee@newco.example.com', 2, 3 FROM DUAL UNION ALL
  SELECT 'jason.lee@newco.example.com', 3, 3 FROM DUAL UNION ALL
  SELECT 'jason.lee@newco.example.com', 4, 4 FROM DUAL UNION ALL
  SELECT 'jason.lee@newco.example.com', 5, 4 FROM DUAL UNION ALL
  SELECT 'jason.lee@newco.example.com', 6, 3 FROM DUAL UNION ALL
  SELECT 'samira.khan@newco.example.com', 1, 4 FROM DUAL UNION ALL
  SELECT 'samira.khan@newco.example.com', 2, 4 FROM DUAL UNION ALL
  SELECT 'samira.khan@newco.example.com', 3, 4 FROM DUAL UNION ALL
  SELECT 'samira.khan@newco.example.com', 4, 4 FROM DUAL UNION ALL
  SELECT 'samira.khan@newco.example.com', 5, 5 FROM DUAL UNION ALL
  SELECT 'samira.khan@newco.example.com', 6, 4 FROM DUAL UNION ALL
  SELECT 'jordan.blake@partner.example.com', 1, 4 FROM DUAL UNION ALL
  SELECT 'jordan.blake@partner.example.com', 2, 4 FROM DUAL UNION ALL
  SELECT 'jordan.blake@partner.example.com', 3, 4 FROM DUAL UNION ALL
  SELECT 'jordan.blake@partner.example.com', 4, 4 FROM DUAL UNION ALL
  SELECT 'jordan.blake@partner.example.com', 5, 4 FROM DUAL UNION ALL
  SELECT 'jordan.blake@partner.example.com', 6, 4 FROM DUAL
) sc
JOIN M360_RATER_ASSIGNMENTS ra
  ON ra.rater_email = sc.email
 AND ra.enrollment_id = (SELECT enrollment_id FROM M360_ENROLLMENTS WHERE participant_token = 'm360-sel-demo-1')
JOIN SURVEY_RESPONSES r ON r.rater_assignment_id = ra.rater_assignment_id
JOIN SURVEY_QUESTIONS q
  ON q.survey_id = (SELECT survey_id FROM SURVEYS WHERE title = 'Enterprise 360 Feedback Survey')
 AND q.sort_order = sc.so
WHERE NOT EXISTS (
  SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id = r.response_id AND a.question_id = q.question_id
);

-- ── Mark raters submitted + link responses; complete the enrollment ───────────

UPDATE M360_RATER_ASSIGNMENTS ra SET
    ra.status = 'SUBMITTED',
    ra.feedback_submitted_at = CURRENT_TIMESTAMP,
    ra.response_id = (SELECT r.response_id FROM SURVEY_RESPONSES r WHERE r.rater_assignment_id = ra.rater_assignment_id)
WHERE ra.enrollment_id = (SELECT enrollment_id FROM M360_ENROLLMENTS WHERE participant_token = 'm360-sel-demo-1')
AND ra.rater_email IN (
    'alex.morgan@newco.example.com', 'lisa.chen@newco.example.com',
    'priya.sharma@newco.example.com', 'jason.lee@newco.example.com',
    'samira.khan@newco.example.com', 'jordan.blake@partner.example.com')
AND EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.rater_assignment_id = ra.rater_assignment_id);

UPDATE M360_ENROLLMENTS SET status = 'COMPLETED'
WHERE participant_token = 'm360-sel-demo-1';
