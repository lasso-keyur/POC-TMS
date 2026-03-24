-- V20: Add program_id FK to PARTICIPANTS and backfill from TRAINING_PROGRAM name

-- 1. Add the column
ALTER TABLE PARTICIPANTS ADD program_id NUMBER;

-- 2. Backfill from program name
UPDATE PARTICIPANTS p
SET p.program_id = (
    SELECT pr.program_id
    FROM PROGRAMS pr
    WHERE UPPER(pr.name) = UPPER(p.training_program)
    AND ROWNUM = 1
)
WHERE p.training_program IS NOT NULL;

-- 3. Add FK constraint
ALTER TABLE PARTICIPANTS ADD CONSTRAINT FK_PARTICIPANT_PROGRAM
    FOREIGN KEY (program_id) REFERENCES PROGRAMS(program_id);

-- 4. Index for join performance
CREATE INDEX idx_participant_program ON PARTICIPANTS(program_id);
