-- V33: M360 workflow automation — send-once tracking for phase activities,
-- and shift the demo cycle windows to the present so enforcement/scheduler are demonstrable.

ALTER TABLE M360_PHASE_ACTIVITIES ADD (sent_at TIMESTAMP);

-- ── Demo cycle: move phase windows around "now" ───────────────────────────────

UPDATE M360_CYCLE_PHASES ph SET
    start_at = CASE ph.phase_type
        WHEN 'ENROLLMENT'      THEN TIMESTAMP '2026-06-01 09:00:00'
        WHEN 'PRE_LAUNCH'      THEN TIMESTAMP '2026-06-15 09:00:00'
        WHEN 'RATER_SELECTION' THEN TIMESTAMP '2026-07-01 09:00:00'
        WHEN 'RATER_APPROVAL'  THEN TIMESTAMP '2026-07-01 09:00:00'
        WHEN 'RATER_FEEDBACK'  THEN TIMESTAMP '2026-07-01 09:00:00'
        WHEN 'REPORT_DELIVERY' THEN TIMESTAMP '2026-10-01 09:00:00'
        WHEN 'POST_SURVEY'     THEN TIMESTAMP '2026-10-16 09:00:00'
    END,
    end_at = CASE ph.phase_type
        WHEN 'ENROLLMENT'      THEN TIMESTAMP '2026-06-30 17:00:00'
        WHEN 'PRE_LAUNCH'      THEN TIMESTAMP '2026-06-30 17:00:00'
        WHEN 'RATER_SELECTION' THEN TIMESTAMP '2026-07-31 17:00:00'
        WHEN 'RATER_APPROVAL'  THEN TIMESTAMP '2026-08-14 17:00:00'
        WHEN 'RATER_FEEDBACK'  THEN TIMESTAMP '2026-09-30 17:00:00'
        WHEN 'REPORT_DELIVERY' THEN TIMESTAMP '2026-10-15 17:00:00'
        WHEN 'POST_SURVEY'     THEN TIMESTAMP '2026-10-31 17:00:00'
    END
WHERE ph.cycle_id = (SELECT cycle_id FROM M360_CYCLES WHERE name = '2025 Cycle 1');

UPDATE M360_CYCLES SET start_date = DATE '2026-06-09'
WHERE name = '2025 Cycle 1';

-- Pre-launch comms are in the past — mark them sent so the scheduler doesn't resend
UPDATE M360_PHASE_ACTIVITIES a SET
    a.activity_date = DATE '2026-06-16',
    a.sent_at = CURRENT_TIMESTAMP
WHERE a.phase_id IN (
    SELECT ph.phase_id FROM M360_CYCLE_PHASES ph
    JOIN M360_CYCLES c ON c.cycle_id = ph.cycle_id
    WHERE c.name = '2025 Cycle 1' AND ph.phase_type = 'PRE_LAUNCH'
);

-- Selection/approval/feedback comms: initial already due (sends on next scheduler run), reminders staggered ahead
UPDATE M360_PHASE_ACTIVITIES a SET
    a.activity_date = CASE
        WHEN a.activity_name LIKE 'Initial%' OR a.activity_name LIKE 'Rater feedback%' THEN DATE '2026-07-02'
        WHEN a.activity_name LIKE '%1' THEN DATE '2026-07-10'
        WHEN a.activity_name LIKE '%2' THEN DATE '2026-07-20'
        WHEN a.activity_name LIKE '%3' THEN DATE '2026-07-28'
        ELSE DATE '2026-08-05'
    END
WHERE a.phase_id IN (
    SELECT ph.phase_id FROM M360_CYCLE_PHASES ph
    JOIN M360_CYCLES c ON c.cycle_id = ph.cycle_id
    WHERE c.name = '2025 Cycle 1' AND ph.phase_type IN ('RATER_SELECTION', 'RATER_APPROVAL', 'RATER_FEEDBACK')
);
