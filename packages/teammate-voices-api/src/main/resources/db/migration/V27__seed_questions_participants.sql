-- V27: Seed survey questions, options, participants, and survey_participants

-- ── Survey Questions ──────────────────────────────────────────────────────────
-- Week 1 Check-in Survey (7 questions)

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'My onboarding experience has been welcoming and well-organised', 'RATING_SCALE', 1, 1 FROM SURVEYS s WHERE s.title = 'Week 1 Check-in Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 1);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I have received adequate training and guidance for my role', 'RATING_SCALE', 2, 1 FROM SURVEYS s WHERE s.title = 'Week 1 Check-in Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 2);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'My manager has been supportive and accessible during my first week', 'RATING_SCALE', 3, 1 FROM SURVEYS s WHERE s.title = 'Week 1 Check-in Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 3);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I feel clear about my role, responsibilities, and immediate priorities', 'RATING_SCALE', 4, 1 FROM SURVEYS s WHERE s.title = 'Week 1 Check-in Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 4);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I have been introduced to my team and the key stakeholders I need to know', 'RATING_SCALE', 5, 1 FROM SURVEYS s WHERE s.title = 'Week 1 Check-in Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 5);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I feel confident using the tools and systems required for my role', 'RATING_SCALE', 6, 1 FROM SURVEYS s WHERE s.title = 'Week 1 Check-in Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 6);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'What has been the highlight of your first week, and what one thing would make week two even better?', 'TEXT', 7, 0 FROM SURVEYS s WHERE s.title = 'Week 1 Check-in Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 7);

-- 30-Day Milestone Survey (7 questions)

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I feel fully integrated into my team and the wider organisation', 'RATING_SCALE', 1, 1 FROM SURVEYS s WHERE s.title = '30-Day Milestone Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 1);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'My workload is manageable and has been clearly structured', 'RATING_SCALE', 2, 1 FROM SURVEYS s WHERE s.title = '30-Day Milestone Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 2);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I am receiving regular and constructive feedback on my performance', 'RATING_SCALE', 3, 1 FROM SURVEYS s WHERE s.title = '30-Day Milestone Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 3);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'This role meets the expectations set during the recruitment process', 'RATING_SCALE', 4, 1 FROM SURVEYS s WHERE s.title = '30-Day Milestone Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 4);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I feel comfortable asking questions and raising concerns with my manager', 'RATING_SCALE', 5, 1 FROM SURVEYS s WHERE s.title = '30-Day Milestone Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 5);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I can see a clear path for my growth and development in this organisation', 'RATING_SCALE', 6, 1 FROM SURVEYS s WHERE s.title = '30-Day Milestone Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 6);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'What one change would make the biggest improvement to your experience so far?', 'TEXT', 7, 0 FROM SURVEYS s WHERE s.title = '30-Day Milestone Survey'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 7);

-- Leadership Mid-Point Assessment (7 questions)

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'The program content is highly relevant to my current leadership role', 'RATING_SCALE', 1, 1 FROM SURVEYS s WHERE s.title = 'Leadership Mid-Point Assessment'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 1);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I am actively applying concepts from the program in my day-to-day work', 'RATING_SCALE', 2, 1 FROM SURVEYS s WHERE s.title = 'Leadership Mid-Point Assessment'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 2);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'The facilitators are knowledgeable, engaging, and create psychological safety', 'RATING_SCALE', 3, 1 FROM SURVEYS s WHERE s.title = 'Leadership Mid-Point Assessment'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 3);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I feel appropriately challenged and stretched by the program curriculum', 'RATING_SCALE', 4, 1 FROM SURVEYS s WHERE s.title = 'Leadership Mid-Point Assessment'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 4);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'My cohort peers are contributing positively to my learning experience', 'RATING_SCALE', 5, 1 FROM SURVEYS s WHERE s.title = 'Leadership Mid-Point Assessment'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 5);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'My direct manager actively supports my participation in this program', 'RATING_SCALE', 6, 1 FROM SURVEYS s WHERE s.title = 'Leadership Mid-Point Assessment'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 6);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'Which aspect of the program has had the greatest impact on your leadership so far, and why?', 'TEXT', 7, 0 FROM SURVEYS s WHERE s.title = 'Leadership Mid-Point Assessment'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 7);

-- Digital Skills Readiness Check (7 questions)

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'The training content is clear, well-structured, and easy to follow', 'RATING_SCALE', 1, 1 FROM SURVEYS s WHERE s.title = 'Digital Skills Readiness Check'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 1);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I feel equipped to apply what I am learning directly in my role', 'RATING_SCALE', 2, 1 FROM SURVEYS s WHERE s.title = 'Digital Skills Readiness Check'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 2);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'The pace of the program suits my learning needs and current workload', 'RATING_SCALE', 3, 1 FROM SURVEYS s WHERE s.title = 'Digital Skills Readiness Check'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 3);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I have access to all the tools and platforms covered in the training', 'RATING_SCALE', 4, 1 FROM SURVEYS s WHERE s.title = 'Digital Skills Readiness Check'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 4);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'The instructors explain technical concepts in an accessible and engaging way', 'RATING_SCALE', 5, 1 FROM SURVEYS s WHERE s.title = 'Digital Skills Readiness Check'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 5);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'I feel motivated and confident that I will complete this program successfully', 'RATING_SCALE', 6, 1 FROM SURVEYS s WHERE s.title = 'Digital Skills Readiness Check'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 6);

INSERT INTO SURVEY_QUESTIONS (survey_id, question_text, question_type, sort_order, is_required)
SELECT s.survey_id, 'What additional support or resources would most help you succeed in this program?', 'TEXT', 7, 0 FROM SURVEYS s WHERE s.title = 'Digital Skills Readiness Check'
AND NOT EXISTS (SELECT 1 FROM SURVEY_QUESTIONS q WHERE q.survey_id = s.survey_id AND q.sort_order = 7);

-- ── Survey Options (bulk insert 1–5 scale for all RATING_SCALE questions) ─────

INSERT INTO SURVEY_OPTIONS (question_id, option_text, option_value, sort_order)
SELECT q.question_id, v.option_text, v.option_value, v.option_value
FROM SURVEY_QUESTIONS q JOIN SURVEYS s ON q.survey_id = s.survey_id
CROSS JOIN (SELECT 'Strongly Disagree' AS option_text, 1 AS option_value FROM DUAL UNION ALL SELECT 'Disagree', 2 FROM DUAL UNION ALL SELECT 'Neutral', 3 FROM DUAL UNION ALL SELECT 'Agree', 4 FROM DUAL UNION ALL SELECT 'Strongly Agree', 5 FROM DUAL) v
WHERE s.title = 'Week 1 Check-in Survey' AND q.question_type = 'RATING_SCALE'
AND NOT EXISTS (SELECT 1 FROM SURVEY_OPTIONS o WHERE o.question_id = q.question_id AND o.option_value = v.option_value);

INSERT INTO SURVEY_OPTIONS (question_id, option_text, option_value, sort_order)
SELECT q.question_id, v.option_text, v.option_value, v.option_value
FROM SURVEY_QUESTIONS q JOIN SURVEYS s ON q.survey_id = s.survey_id
CROSS JOIN (SELECT 'Strongly Disagree' AS option_text, 1 AS option_value FROM DUAL UNION ALL SELECT 'Disagree', 2 FROM DUAL UNION ALL SELECT 'Neutral', 3 FROM DUAL UNION ALL SELECT 'Agree', 4 FROM DUAL UNION ALL SELECT 'Strongly Agree', 5 FROM DUAL) v
WHERE s.title = '30-Day Milestone Survey' AND q.question_type = 'RATING_SCALE'
AND NOT EXISTS (SELECT 1 FROM SURVEY_OPTIONS o WHERE o.question_id = q.question_id AND o.option_value = v.option_value);

INSERT INTO SURVEY_OPTIONS (question_id, option_text, option_value, sort_order)
SELECT q.question_id, v.option_text, v.option_value, v.option_value
FROM SURVEY_QUESTIONS q JOIN SURVEYS s ON q.survey_id = s.survey_id
CROSS JOIN (SELECT 'Strongly Disagree' AS option_text, 1 AS option_value FROM DUAL UNION ALL SELECT 'Disagree', 2 FROM DUAL UNION ALL SELECT 'Neutral', 3 FROM DUAL UNION ALL SELECT 'Agree', 4 FROM DUAL UNION ALL SELECT 'Strongly Agree', 5 FROM DUAL) v
WHERE s.title = 'Leadership Mid-Point Assessment' AND q.question_type = 'RATING_SCALE'
AND NOT EXISTS (SELECT 1 FROM SURVEY_OPTIONS o WHERE o.question_id = q.question_id AND o.option_value = v.option_value);

INSERT INTO SURVEY_OPTIONS (question_id, option_text, option_value, sort_order)
SELECT q.question_id, v.option_text, v.option_value, v.option_value
FROM SURVEY_QUESTIONS q JOIN SURVEYS s ON q.survey_id = s.survey_id
CROSS JOIN (SELECT 'Strongly Disagree' AS option_text, 1 AS option_value FROM DUAL UNION ALL SELECT 'Disagree', 2 FROM DUAL UNION ALL SELECT 'Neutral', 3 FROM DUAL UNION ALL SELECT 'Agree', 4 FROM DUAL UNION ALL SELECT 'Strongly Agree', 5 FROM DUAL) v
WHERE s.title = 'Digital Skills Readiness Check' AND q.question_type = 'RATING_SCALE'
AND NOT EXISTS (SELECT 1 FROM SURVEY_OPTIONS o WHERE o.question_id = q.question_id AND o.option_value = v.option_value);

-- ── Participants ──────────────────────────────────────────────────────────────
-- Program 1: New Hire Onboarding (30100001–30100010) — NEW_HIRE

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100001','Alex Morgan','alex.morgan@newco.example.com','NEW_HIRE','Software Engineering Bootcamp','2026-Q1',DATE '2026-01-06',DATE '2026-04-06',DATE '2026-02-20','AMRGNA','Lisa Chen','AABBC','North America','Retail Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='New Hire Onboarding 2026 Q1'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100001');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100002','Priya Sharma','priya.sharma@newco.example.com','NEW_HIRE','Software Engineering Bootcamp','2026-Q1',DATE '2026-01-06',DATE '2026-04-06',DATE '2026-02-20','PSHRPR','Mark Davis','AABBC','North America','Retail Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='New Hire Onboarding 2026 Q1'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100002');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100003','Jason Lee','jason.lee@newco.example.com','NEW_HIRE','Data Analytics Fundamentals','2026-Q1',DATE '2026-01-13',DATE '2026-04-13',DATE '2026-02-27','JLEEDA','Mark Davis','AABBC','North America','Retail Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='New Hire Onboarding 2026 Q1'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100003');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100004','Samira Khan','samira.khan@newco.example.com','NEW_HIRE','Cloud Platform Essentials','2026-Q1',DATE '2026-01-13',DATE '2026-04-13',DATE '2026-02-27','SKHNCP','Lisa Chen','AABBC','North America','Retail Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='New Hire Onboarding 2026 Q1'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100004');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100005','Wei Zhang','wei.zhang@newco.example.com','NEW_HIRE','Software Engineering Bootcamp','2026-Q1',DATE '2026-01-20',DATE '2026-04-20',DATE '2026-03-06','WZHGSE','Kenji Tanaka','AACCD','APAC','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='New Hire Onboarding 2026 Q1'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100005');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100006','Aiko Tanaka','aiko.tanaka@newco.example.com','NEW_HIRE','Data Analytics Fundamentals','2026-Q1',DATE '2026-01-20',DATE '2026-04-20',DATE '2026-03-06','ATNKDA','Kenji Tanaka','AACCD','APAC','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='New Hire Onboarding 2026 Q1'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100006');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100007','Raj Patel','raj.patel@newco.example.com','NEW_HIRE','Cloud Platform Essentials','2026-Q1',DATE '2026-01-27',DATE '2026-04-27',DATE '2026-03-13','RPATLC','Kenji Tanaka','AACCD','APAC','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='New Hire Onboarding 2026 Q1'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100007');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100008','Sofia Rossi','sofia.rossi@newco.example.com','NEW_HIRE','Software Engineering Bootcamp','2026-Q1',DATE '2026-01-27',DATE '2026-04-27',DATE '2026-03-13','SROSSM','Anna Muller','AADDE','EMEA','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='New Hire Onboarding 2026 Q1'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100008');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100009','Luca Ferrari','luca.ferrari@newco.example.com','NEW_HIRE','Data Analytics Fundamentals','2026-Q1',DATE '2026-02-03',DATE '2026-05-03',DATE '2026-03-20','LFRRDA','Anna Muller','AADDE','EMEA','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='New Hire Onboarding 2026 Q1'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100009');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100010','Emma Wilson','emma.wilson@newco.example.com','NEW_HIRE','Cloud Platform Essentials','2026-Q1',DATE '2026-02-03',DATE '2026-05-03',DATE '2026-03-20','EWLSCP','Anna Muller','AADDE','EMEA','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='New Hire Onboarding 2026 Q1'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100010');

-- Program 2: Leadership Acceleration (30100011–30100020) — EXISTING_RESOURCE

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100011','Marcus Thompson','marcus.thompson@newco.example.com','EXISTING_RESOURCE','Leadership Acceleration Program','2026-Q1',DATE '2026-01-10',DATE '2026-06-30',DATE '2026-04-05','MTHMPL','Patricia Gomez','BBCDA','North America','Retail Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Leadership Acceleration Program'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100011');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100012','Elena Vasquez','elena.vasquez@newco.example.com','EXISTING_RESOURCE','Leadership Acceleration Program','2026-Q1',DATE '2026-01-10',DATE '2026-06-30',DATE '2026-04-05','EVSZLP','Patricia Gomez','BBCDA','North America','Retail Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Leadership Acceleration Program'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100012');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100013','David Okafor','david.okafor@newco.example.com','EXISTING_RESOURCE','Leadership Acceleration Program','2026-Q1',DATE '2026-01-10',DATE '2026-06-30',DATE '2026-04-05','DOKAFLP','Patricia Gomez','BBCDA','North America','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Leadership Acceleration Program'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100013');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100014','Nadia Petrov','nadia.petrov@newco.example.com','EXISTING_RESOURCE','Leadership Acceleration Program','2026-Q1',DATE '2026-01-10',DATE '2026-06-30',DATE '2026-04-05','NPTVLP','James Park','BBCDB','North America','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Leadership Acceleration Program'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100014');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100015','Carlos Rivera','carlos.rivera@newco.example.com','EXISTING_RESOURCE','Leadership Acceleration Program','2026-Q1',DATE '2026-01-10',DATE '2026-06-30',DATE '2026-04-05','CRVRLP','James Park','BBCDB','APAC','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Leadership Acceleration Program'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100015');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100016','Fatima Al-Hassan','fatima.alhassan@newco.example.com','EXISTING_RESOURCE','Leadership Acceleration Program','2026-Q1',DATE '2026-01-10',DATE '2026-06-30',DATE '2026-04-05','FALHSN','James Park','BBCDB','APAC','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Leadership Acceleration Program'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100016');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100017','Thomas Muller','thomas.muller@newco.example.com','EXISTING_RESOURCE','Leadership Acceleration Program','2026-Q1',DATE '2026-01-10',DATE '2026-06-30',DATE '2026-04-05','TMULLP','Sophie Laurent','BBCDC','EMEA','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='Leadership Acceleration Program'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100017');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100018','Amara Diallo','amara.diallo@newco.example.com','EXISTING_RESOURCE','Leadership Acceleration Program','2026-Q1',DATE '2026-01-10',DATE '2026-06-30',DATE '2026-04-05','ADILALP','Sophie Laurent','BBCDC','EMEA','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='Leadership Acceleration Program'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100018');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100019','Yuki Nakamura','yuki.nakamura@newco.example.com','EXISTING_RESOURCE','Leadership Acceleration Program','2026-Q1',DATE '2026-01-10',DATE '2026-06-30',DATE '2026-04-05','YNKMLP','Sophie Laurent','BBCDC','EMEA','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='Leadership Acceleration Program'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100019');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100020','Isabel Santos','isabel.santos@newco.example.com','EXISTING_RESOURCE','Leadership Acceleration Program','2026-Q1',DATE '2026-01-10',DATE '2026-06-30',DATE '2026-04-05','ISNTSLP','Sophie Laurent','BBCDC','North America','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='Leadership Acceleration Program'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100020');

-- Program 3: Digital Skills Academy (30100021–30100030) — mixed

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100021','Ryan Cooper','ryan.cooper@newco.example.com','EXISTING_RESOURCE','Digital Skills Academy','2026-Q1',DATE '2026-01-20',DATE '2026-05-31',DATE '2026-03-27','RCPRDS','Helen Ford','CCABB','North America','Retail Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Digital Skills Academy'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100021');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100022','Nina Johansson','nina.johansson@newco.example.com','EXISTING_RESOURCE','Digital Skills Academy','2026-Q1',DATE '2026-01-20',DATE '2026-05-31',DATE '2026-03-27','NJHNDS','Helen Ford','CCABB','North America','Retail Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Digital Skills Academy'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100022');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100023','Kwame Asante','kwame.asante@newco.example.com','EXISTING_RESOURCE','Digital Skills Academy','2026-Q1',DATE '2026-01-20',DATE '2026-05-31',DATE '2026-03-27','KASNTD','Helen Ford','CCABB','North America','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Digital Skills Academy'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100023');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100024','Mei Liu','mei.liu@newco.example.com','NEW_HIRE','Digital Skills Academy','2026-Q1',DATE '2026-01-27',DATE '2026-05-31',DATE '2026-03-27','MLIUDS','Victor Chan','CCABC','APAC','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Digital Skills Academy'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100024');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100025','Omar Abdullah','omar.abdullah@newco.example.com','NEW_HIRE','Digital Skills Academy','2026-Q1',DATE '2026-01-27',DATE '2026-05-31',DATE '2026-03-27','OABDDS','Victor Chan','CCABC','APAC','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Digital Skills Academy'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100025');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100026','Hannah Schmidt','hannah.schmidt@newco.example.com','EXISTING_RESOURCE','Digital Skills Academy','2026-Q1',DATE '2026-01-27',DATE '2026-05-31',DATE '2026-03-27','HSCMDS','Victor Chan','CCABC','APAC','Corporate Banking',1,(SELECT program_id FROM PROGRAMS WHERE name='Digital Skills Academy'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100026');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100027','Antoine Dubois','antoine.dubois@newco.example.com','EXISTING_RESOURCE','Digital Skills Academy','2026-Q1',DATE '2026-02-03',DATE '2026-05-31',DATE '2026-04-03','ADUBDS','Marie Bernard','CCABD','EMEA','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='Digital Skills Academy'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100027');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100028','Chiara Romano','chiara.romano@newco.example.com','EXISTING_RESOURCE','Digital Skills Academy','2026-Q1',DATE '2026-02-03',DATE '2026-05-31',DATE '2026-04-03','CRMNDS','Marie Bernard','CCABD','EMEA','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='Digital Skills Academy'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100028');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100029','Andrei Popescu','andrei.popescu@newco.example.com','NEW_HIRE','Digital Skills Academy','2026-Q1',DATE '2026-02-03',DATE '2026-05-31',DATE '2026-04-03','APOPDS','Marie Bernard','CCABD','EMEA','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='Digital Skills Academy'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100029');

INSERT INTO PARTICIPANTS (participant_id, full_name, email, participant_type, training_program, cohort, start_date, expected_end_date, mid_point_date, standard_id, manager_name, hierarchy_code, region, line_of_business, is_active, program_id, created_at, updated_at)
SELECT '30100030','Zara Okonkwo','zara.okonkwo@newco.example.com','EXISTING_RESOURCE','Digital Skills Academy','2026-Q1',DATE '2026-02-10',DATE '2026-05-31',DATE '2026-04-10','ZOKNDS','Marie Bernard','CCABD','EMEA','Wealth Management',1,(SELECT program_id FROM PROGRAMS WHERE name='Digital Skills Academy'),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM PARTICIPANTS WHERE participant_id='30100030');

-- ── Survey Participants ───────────────────────────────────────────────────────
-- Link Program 1 participants to both their surveys

INSERT INTO SURVEY_PARTICIPANTS (survey_id, participant_id)
SELECT s.survey_id, p.participant_id
FROM SURVEYS s, (SELECT '30100001' AS participant_id FROM DUAL UNION ALL SELECT '30100002' FROM DUAL UNION ALL SELECT '30100003' FROM DUAL UNION ALL SELECT '30100004' FROM DUAL UNION ALL SELECT '30100005' FROM DUAL UNION ALL SELECT '30100006' FROM DUAL UNION ALL SELECT '30100007' FROM DUAL UNION ALL SELECT '30100008' FROM DUAL UNION ALL SELECT '30100009' FROM DUAL UNION ALL SELECT '30100010' FROM DUAL) p
WHERE s.title IN ('Week 1 Check-in Survey', '30-Day Milestone Survey')
AND NOT EXISTS (SELECT 1 FROM SURVEY_PARTICIPANTS sp WHERE sp.survey_id = s.survey_id AND sp.participant_id = p.participant_id);

-- Link Program 2 participants to both their surveys

INSERT INTO SURVEY_PARTICIPANTS (survey_id, participant_id)
SELECT s.survey_id, p.participant_id
FROM SURVEYS s, (SELECT '30100011' AS participant_id FROM DUAL UNION ALL SELECT '30100012' FROM DUAL UNION ALL SELECT '30100013' FROM DUAL UNION ALL SELECT '30100014' FROM DUAL UNION ALL SELECT '30100015' FROM DUAL UNION ALL SELECT '30100016' FROM DUAL UNION ALL SELECT '30100017' FROM DUAL UNION ALL SELECT '30100018' FROM DUAL UNION ALL SELECT '30100019' FROM DUAL UNION ALL SELECT '30100020' FROM DUAL) p
WHERE s.title IN ('Leadership Mid-Point Assessment', 'Post-Program Effectiveness Survey')
AND NOT EXISTS (SELECT 1 FROM SURVEY_PARTICIPANTS sp WHERE sp.survey_id = s.survey_id AND sp.participant_id = p.participant_id);

-- Link Program 3 participants to both their surveys

INSERT INTO SURVEY_PARTICIPANTS (survey_id, participant_id)
SELECT s.survey_id, p.participant_id
FROM SURVEYS s, (SELECT '30100021' AS participant_id FROM DUAL UNION ALL SELECT '30100022' FROM DUAL UNION ALL SELECT '30100023' FROM DUAL UNION ALL SELECT '30100024' FROM DUAL UNION ALL SELECT '30100025' FROM DUAL UNION ALL SELECT '30100026' FROM DUAL UNION ALL SELECT '30100027' FROM DUAL UNION ALL SELECT '30100028' FROM DUAL UNION ALL SELECT '30100029' FROM DUAL UNION ALL SELECT '30100030' FROM DUAL) p
WHERE s.title IN ('Digital Skills Readiness Check', 'Skills Mastery Survey')
AND NOT EXISTS (SELECT 1 FROM SURVEY_PARTICIPANTS sp WHERE sp.survey_id = s.survey_id AND sp.participant_id = p.participant_id);

COMMIT;
