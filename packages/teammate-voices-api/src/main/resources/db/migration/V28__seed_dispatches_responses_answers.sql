-- V28: Seed dispatches, survey responses, and answers (~70% completion rate)
-- 4 active surveys × 10 participants each = 40 dispatches
-- 7 SUBMITTED + 3 SENT per survey = 28 completed responses
-- Rating pattern per respondent offset (Q1-Q6): 5,4,5,4,5,4 / 4,5,4,5,4,5 / 4,4,4,4,4,4 / 5,5,5,5,5,5 / 3,4,4,3,5,4 / 4,3,5,4,4,3 / 5,4,3,5,4,4

-- ── Dispatches: Week 1 Check-in Survey ───────────────────────────────────────

INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100001',(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'),'ONBOARDING','SUBMITTED','TK26-S1-P01',SYSTIMESTAMP-14,SYSTIMESTAMP-10,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100001' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100002',(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'),'ONBOARDING','SUBMITTED','TK26-S1-P02',SYSTIMESTAMP-14,SYSTIMESTAMP-11,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100002' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100003',(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'),'ONBOARDING','SUBMITTED','TK26-S1-P03',SYSTIMESTAMP-14,SYSTIMESTAMP-12,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100003' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100004',(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'),'ONBOARDING','SUBMITTED','TK26-S1-P04',SYSTIMESTAMP-13,SYSTIMESTAMP-10,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100004' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100005',(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'),'ONBOARDING','SUBMITTED','TK26-S1-P05',SYSTIMESTAMP-13,SYSTIMESTAMP-9,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100005' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100006',(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'),'ONBOARDING','SUBMITTED','TK26-S1-P06',SYSTIMESTAMP-13,SYSTIMESTAMP-9,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100006' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100007',(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'),'ONBOARDING','SUBMITTED','TK26-S1-P07',SYSTIMESTAMP-12,SYSTIMESTAMP-8,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100007' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100008',(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'),'ONBOARDING','SENT','TK26-S1-P08',SYSTIMESTAMP-7,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100008' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100009',(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'),'ONBOARDING','SENT','TK26-S1-P09',SYSTIMESTAMP-7,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100009' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100010',(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'),'ONBOARDING','SENT','TK26-S1-P10',SYSTIMESTAMP-5,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100010' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Week 1 Check-in Survey'));

-- ── Dispatches: 30-Day Milestone Survey ──────────────────────────────────────

INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100001',(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'),'MID_TRAINING','SUBMITTED','TK26-S2-P01',SYSTIMESTAMP-20,SYSTIMESTAMP-17,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100001' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100002',(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'),'MID_TRAINING','SUBMITTED','TK26-S2-P02',SYSTIMESTAMP-20,SYSTIMESTAMP-18,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100002' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100003',(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'),'MID_TRAINING','SUBMITTED','TK26-S2-P03',SYSTIMESTAMP-20,SYSTIMESTAMP-16,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100003' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100004',(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'),'MID_TRAINING','SUBMITTED','TK26-S2-P04',SYSTIMESTAMP-19,SYSTIMESTAMP-16,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100004' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100005',(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'),'MID_TRAINING','SUBMITTED','TK26-S2-P05',SYSTIMESTAMP-19,SYSTIMESTAMP-15,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100005' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100006',(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'),'MID_TRAINING','SUBMITTED','TK26-S2-P06',SYSTIMESTAMP-18,SYSTIMESTAMP-14,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100006' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100007',(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'),'MID_TRAINING','SUBMITTED','TK26-S2-P07',SYSTIMESTAMP-18,SYSTIMESTAMP-13,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100007' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100008',(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'),'MID_TRAINING','SENT','TK26-S2-P08',SYSTIMESTAMP-10,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100008' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100009',(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'),'MID_TRAINING','SENT','TK26-S2-P09',SYSTIMESTAMP-10,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100009' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100010',(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'),'MID_TRAINING','SENT','TK26-S2-P10',SYSTIMESTAMP-8,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100010' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='30-Day Milestone Survey'));

-- ── Dispatches: Leadership Mid-Point Assessment ───────────────────────────────

INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100011',(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'),'MID_TRAINING','SUBMITTED','TK26-S3-P11',SYSTIMESTAMP-16,SYSTIMESTAMP-13,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100011' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100012',(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'),'MID_TRAINING','SUBMITTED','TK26-S3-P12',SYSTIMESTAMP-16,SYSTIMESTAMP-14,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100012' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100013',(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'),'MID_TRAINING','SUBMITTED','TK26-S3-P13',SYSTIMESTAMP-15,SYSTIMESTAMP-12,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100013' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100014',(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'),'MID_TRAINING','SUBMITTED','TK26-S3-P14',SYSTIMESTAMP-15,SYSTIMESTAMP-11,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100014' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100015',(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'),'MID_TRAINING','SUBMITTED','TK26-S3-P15',SYSTIMESTAMP-14,SYSTIMESTAMP-10,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100015' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100016',(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'),'MID_TRAINING','SUBMITTED','TK26-S3-P16',SYSTIMESTAMP-14,SYSTIMESTAMP-9,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100016' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100017',(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'),'MID_TRAINING','SUBMITTED','TK26-S3-P17',SYSTIMESTAMP-13,SYSTIMESTAMP-8,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100017' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100018',(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'),'MID_TRAINING','SENT','TK26-S3-P18',SYSTIMESTAMP-6,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100018' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100019',(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'),'MID_TRAINING','SENT','TK26-S3-P19',SYSTIMESTAMP-6,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100019' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100020',(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'),'MID_TRAINING','SENT','TK26-S3-P20',SYSTIMESTAMP-4,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100020' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Leadership Mid-Point Assessment'));

-- ── Dispatches: Digital Skills Readiness Check ───────────────────────────────

INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100021',(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'),'ONBOARDING','SUBMITTED','TK26-S5-P21',SYSTIMESTAMP-18,SYSTIMESTAMP-15,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100021' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100022',(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'),'ONBOARDING','SUBMITTED','TK26-S5-P22',SYSTIMESTAMP-18,SYSTIMESTAMP-16,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100022' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100023',(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'),'ONBOARDING','SUBMITTED','TK26-S5-P23',SYSTIMESTAMP-17,SYSTIMESTAMP-14,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100023' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100024',(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'),'ONBOARDING','SUBMITTED','TK26-S5-P24',SYSTIMESTAMP-17,SYSTIMESTAMP-13,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100024' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100025',(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'),'ONBOARDING','SUBMITTED','TK26-S5-P25',SYSTIMESTAMP-16,SYSTIMESTAMP-12,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100025' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100026',(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'),'ONBOARDING','SUBMITTED','TK26-S5-P26',SYSTIMESTAMP-16,SYSTIMESTAMP-11,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100026' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, submitted_at, reminder_count)
SELECT '30100027',(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'),'ONBOARDING','SUBMITTED','TK26-S5-P27',SYSTIMESTAMP-15,SYSTIMESTAMP-10,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100027' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100028',(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'),'ONBOARDING','SENT','TK26-S5-P28',SYSTIMESTAMP-8,1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100028' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100029',(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'),'ONBOARDING','SENT','TK26-S5-P29',SYSTIMESTAMP-6,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100029' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'));
INSERT INTO DISPATCHES (participant_id, survey_id, survey_stage, dispatch_status, dispatch_token, sent_at, reminder_count)
SELECT '30100030',(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'),'ONBOARDING','SENT','TK26-S5-P30',SYSTIMESTAMP-4,0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM DISPATCHES WHERE participant_id='30100030' AND survey_id=(SELECT survey_id FROM SURVEYS WHERE title='Digital Skills Readiness Check'));

-- ── Survey Responses (SUBMITTED dispatches only) ──────────────────────────────

INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100001',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Week 1 Check-in Survey' AND d.participant_id='30100001' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100001');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100002',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Week 1 Check-in Survey' AND d.participant_id='30100002' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100002');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100003',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Week 1 Check-in Survey' AND d.participant_id='30100003' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100003');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100004',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Week 1 Check-in Survey' AND d.participant_id='30100004' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100004');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100005',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Week 1 Check-in Survey' AND d.participant_id='30100005' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100005');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100006',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Week 1 Check-in Survey' AND d.participant_id='30100006' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100006');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100007',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Week 1 Check-in Survey' AND d.participant_id='30100007' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100007');

INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100001',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='30-Day Milestone Survey' AND d.participant_id='30100001' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100001');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100002',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='30-Day Milestone Survey' AND d.participant_id='30100002' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100002');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100003',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='30-Day Milestone Survey' AND d.participant_id='30100003' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100003');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100004',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='30-Day Milestone Survey' AND d.participant_id='30100004' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100004');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100005',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='30-Day Milestone Survey' AND d.participant_id='30100005' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100005');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100006',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='30-Day Milestone Survey' AND d.participant_id='30100006' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100006');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100007',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='30-Day Milestone Survey' AND d.participant_id='30100007' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100007');

INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100011',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Leadership Mid-Point Assessment' AND d.participant_id='30100011' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100011');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100012',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Leadership Mid-Point Assessment' AND d.participant_id='30100012' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100012');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100013',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Leadership Mid-Point Assessment' AND d.participant_id='30100013' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100013');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100014',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Leadership Mid-Point Assessment' AND d.participant_id='30100014' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100014');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100015',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Leadership Mid-Point Assessment' AND d.participant_id='30100015' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100015');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100016',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Leadership Mid-Point Assessment' AND d.participant_id='30100016' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100016');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100017',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Leadership Mid-Point Assessment' AND d.participant_id='30100017' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100017');

INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100021',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Digital Skills Readiness Check' AND d.participant_id='30100021' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100021');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100022',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Digital Skills Readiness Check' AND d.participant_id='30100022' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100022');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100023',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Digital Skills Readiness Check' AND d.participant_id='30100023' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100023');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100024',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Digital Skills Readiness Check' AND d.participant_id='30100024' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100024');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100025',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Digital Skills Readiness Check' AND d.participant_id='30100025' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100025');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100026',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Digital Skills Readiness Check' AND d.participant_id='30100026' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100026');
INSERT INTO SURVEY_RESPONSES (survey_id, participant_id, dispatch_id, is_complete, started_at, submitted_at)
SELECT s.survey_id,'30100027',d.dispatch_id,1,d.submitted_at-1/24,d.submitted_at FROM SURVEYS s JOIN DISPATCHES d ON d.survey_id=s.survey_id WHERE s.title='Digital Skills Readiness Check' AND d.participant_id='30100027' AND NOT EXISTS (SELECT 1 FROM SURVEY_RESPONSES r WHERE r.survey_id=s.survey_id AND r.participant_id='30100027');

-- ── Survey Answers ────────────────────────────────────────────────────────────
-- One INSERT per participant-survey pair. CASE on sort_order maps rating values.
-- Rating pattern per offset: 1→5,4,5,4,5,4 | 2→4,5,4,5,4,5 | 3→4,4,4,4,4,4 | 4→5,5,5,5,5,5 | 5→3,4,4,3,5,4 | 6→4,3,5,4,4,3 | 7→5,4,3,5,4,4

-- Week 1 Check-in Survey answers
INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 4 WHEN 3 THEN 5 WHEN 4 THEN 4 WHEN 5 THEN 5 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'The team was immediately welcoming and my manager set clear expectations from the very first day.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100001' AND s.title='Week 1 Check-in Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 5 WHEN 3 THEN 4 WHEN 4 THEN 5 WHEN 5 THEN 4 WHEN 6 THEN 5 END,CASE WHEN q.question_type='TEXT' THEN 'The structured onboarding schedule gave me confidence early on and I felt prepared going into my first meetings.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100002' AND s.title='Week 1 Check-in Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 4 WHEN 3 THEN 4 WHEN 4 THEN 4 WHEN 5 THEN 4 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'More hands-on practice with the internal systems in the first week would help new starters build confidence faster.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100003' AND s.title='Week 1 Check-in Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 5 WHEN 3 THEN 5 WHEN 4 THEN 5 WHEN 5 THEN 5 WHEN 6 THEN 5 END,CASE WHEN q.question_type='TEXT' THEN 'Working alongside experienced colleagues from day one has been the most valuable aspect of onboarding for me.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100004' AND s.title='Week 1 Check-in Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 3 WHEN 2 THEN 4 WHEN 3 THEN 4 WHEN 4 THEN 3 WHEN 5 THEN 5 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'A dedicated buddy for the first month would help bridge knowledge gaps more effectively than the current setup.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100005' AND s.title='Week 1 Check-in Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 3 WHEN 3 THEN 5 WHEN 4 THEN 4 WHEN 5 THEN 4 WHEN 6 THEN 3 END,CASE WHEN q.question_type='TEXT' THEN 'The onboarding materials are comprehensive and well-organised — I always knew what was expected of me.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100006' AND s.title='Week 1 Check-in Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 4 WHEN 3 THEN 3 WHEN 4 THEN 5 WHEN 5 THEN 4 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'More regular one-on-one time with my manager in the first two weeks to align on priorities would be very beneficial.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100007' AND s.title='Week 1 Check-in Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

-- 30-Day Milestone Survey answers
INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 4 WHEN 3 THEN 5 WHEN 4 THEN 4 WHEN 5 THEN 5 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'Regular check-ins with my manager have been incredibly helpful and I feel genuinely part of the team now.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100001' AND s.title='30-Day Milestone Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 5 WHEN 3 THEN 4 WHEN 4 THEN 5 WHEN 5 THEN 4 WHEN 6 THEN 5 END,CASE WHEN q.question_type='TEXT' THEN 'Clearer documentation on internal processes would reduce the time spent finding answers from multiple people.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100002' AND s.title='30-Day Milestone Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 4 WHEN 3 THEN 4 WHEN 4 THEN 4 WHEN 5 THEN 4 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'A structured 30-day project with clear deliverables would accelerate learning and build confidence earlier.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100003' AND s.title='30-Day Milestone Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 5 WHEN 3 THEN 5 WHEN 4 THEN 5 WHEN 5 THEN 5 WHEN 6 THEN 5 END,CASE WHEN q.question_type='TEXT' THEN 'The mentorship and access to senior colleagues has exceeded my expectations. I feel fully supported in my growth.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100004' AND s.title='30-Day Milestone Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 3 WHEN 2 THEN 4 WHEN 3 THEN 4 WHEN 4 THEN 3 WHEN 5 THEN 5 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'More cross-team collaboration opportunities would help newer employees build their network within the organisation.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100005' AND s.title='30-Day Milestone Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 3 WHEN 3 THEN 5 WHEN 4 THEN 4 WHEN 5 THEN 4 WHEN 6 THEN 3 END,CASE WHEN q.question_type='TEXT' THEN 'The role aligns well with what was discussed in interviews. Better tooling would improve day-to-day productivity.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100006' AND s.title='30-Day Milestone Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 4 WHEN 3 THEN 3 WHEN 4 THEN 5 WHEN 5 THEN 4 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'More formal feedback sessions rather than ad hoc comments would help me understand exactly where I stand.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100007' AND s.title='30-Day Milestone Survey' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

-- Leadership Mid-Point Assessment answers
INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 4 WHEN 3 THEN 5 WHEN 4 THEN 4 WHEN 5 THEN 5 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'The module on influencing without authority has had the most immediate impact on how I handle cross-functional stakeholder conversations.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100011' AND s.title='Leadership Mid-Point Assessment' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 5 WHEN 3 THEN 4 WHEN 4 THEN 5 WHEN 5 THEN 4 WHEN 6 THEN 5 END,CASE WHEN q.question_type='TEXT' THEN 'Peer learning has been phenomenal. The cohort brings diverse experiences that make the case studies feel real and applicable.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100012' AND s.title='Leadership Mid-Point Assessment' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 4 WHEN 3 THEN 4 WHEN 4 THEN 4 WHEN 5 THEN 4 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'More time for reflection between sessions would allow deeper integration of the concepts into day-to-day practice.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100013' AND s.title='Leadership Mid-Point Assessment' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 5 WHEN 3 THEN 5 WHEN 4 THEN 5 WHEN 5 THEN 5 WHEN 6 THEN 5 END,CASE WHEN q.question_type='TEXT' THEN 'The coaching conversations with our facilitator have fundamentally changed how I approach difficult feedback conversations with my team.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100014' AND s.title='Leadership Mid-Point Assessment' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 3 WHEN 2 THEN 4 WHEN 3 THEN 4 WHEN 4 THEN 3 WHEN 5 THEN 5 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'The strategic planning framework is valuable but needs more context specific to our industry to be directly applicable.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100015' AND s.title='Leadership Mid-Point Assessment' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 3 WHEN 3 THEN 5 WHEN 4 THEN 4 WHEN 5 THEN 4 WHEN 6 THEN 3 END,CASE WHEN q.question_type='TEXT' THEN 'The facilitators create an environment where I feel safe to share genuine challenges. That psychological safety is rare and valuable.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100016' AND s.title='Leadership Mid-Point Assessment' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 4 WHEN 3 THEN 3 WHEN 4 THEN 5 WHEN 5 THEN 4 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'The resilience and change management module has helped me reframe how I communicate difficult decisions to my team.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100017' AND s.title='Leadership Mid-Point Assessment' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

-- Digital Skills Readiness Check answers
INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 4 WHEN 3 THEN 5 WHEN 4 THEN 4 WHEN 5 THEN 5 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'Access to sandbox environments for practice outside of training hours would significantly accelerate skill development.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100021' AND s.title='Digital Skills Readiness Check' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 5 WHEN 3 THEN 4 WHEN 4 THEN 5 WHEN 5 THEN 4 WHEN 6 THEN 5 END,CASE WHEN q.question_type='TEXT' THEN 'The instructors are excellent at demystifying complex concepts. I feel far more confident with cloud tooling than I expected at this stage.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100022' AND s.title='Digital Skills Readiness Check' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 4 WHEN 3 THEN 4 WHEN 4 THEN 4 WHEN 5 THEN 4 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'Short video recap summaries after each session would help consolidate learning for those with demanding schedules.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100023' AND s.title='Digital Skills Readiness Check' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 5 WHEN 3 THEN 5 WHEN 4 THEN 5 WHEN 5 THEN 5 WHEN 6 THEN 5 END,CASE WHEN q.question_type='TEXT' THEN 'The program is exactly what I needed. The practical exercises are directly applicable and I am already using the skills in my current projects.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100024' AND s.title='Digital Skills Readiness Check' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 3 WHEN 2 THEN 4 WHEN 3 THEN 4 WHEN 4 THEN 3 WHEN 5 THEN 5 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'The pace is slightly fast for those without a technical background. An optional foundation track at the start would be very helpful.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100025' AND s.title='Digital Skills Readiness Check' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 4 WHEN 2 THEN 3 WHEN 3 THEN 5 WHEN 4 THEN 4 WHEN 5 THEN 4 WHEN 6 THEN 3 END,CASE WHEN q.question_type='TEXT' THEN 'Peer study groups organised by the program coordinators would create accountability and make self-directed learning more effective.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100026' AND s.title='Digital Skills Readiness Check' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

INSERT INTO SURVEY_ANSWERS (response_id, question_id, answer_value, answer_text, page_id)
SELECT r.response_id,q.question_id,CASE q.sort_order WHEN 1 THEN 5 WHEN 2 THEN 4 WHEN 3 THEN 3 WHEN 4 THEN 5 WHEN 5 THEN 4 WHEN 6 THEN 4 END,CASE WHEN q.question_type='TEXT' THEN 'More real-world case studies from our own industry would make the learning feel immediately relevant and easier to apply at work.' END,'p1'
FROM SURVEY_RESPONSES r JOIN SURVEYS s ON r.survey_id=s.survey_id JOIN SURVEY_QUESTIONS q ON q.survey_id=s.survey_id WHERE r.participant_id='30100027' AND s.title='Digital Skills Readiness Check' AND NOT EXISTS (SELECT 1 FROM SURVEY_ANSWERS a WHERE a.response_id=r.response_id AND a.question_id=q.question_id);

COMMIT;
