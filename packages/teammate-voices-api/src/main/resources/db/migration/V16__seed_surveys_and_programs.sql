-- V16: Seed additional programs for development
-- NOTE: Surveys 62, 84, 85 were already inserted by a partial prior run.
-- This migration only adds the missing programs.

-- Use MERGE to avoid duplicates if programs already exist
MERGE INTO PROGRAMS p
USING (SELECT 'Teammate Voices' AS name FROM DUAL) src
ON (p.name = src.name)
WHEN NOT MATCHED THEN INSERT (name, description, template_type, status, survey_progress)
VALUES ('Teammate Voices', 'Teammate Voices Survey Program', 'TEAM_MATE_VOICES', 'ACTIVE', 'IN_PROGRESS');

MERGE INTO PROGRAMS p
USING (SELECT 'TMV 2' AS name FROM DUAL) src
ON (p.name = src.name)
WHEN NOT MATCHED THEN INSERT (name, description, template_type, status, survey_progress)
VALUES ('TMV 2', 'Teammate Voices 2', 'TEAM_MATE_VOICES', 'ACTIVE', 'NOT_STARTED');

MERGE INTO PROGRAMS p
USING (SELECT 'Test Program' AS name FROM DUAL) src
ON (p.name = src.name)
WHEN NOT MATCHED THEN INSERT (name, description, template_type, status, survey_progress)
VALUES ('Test Program', 'Test program for development', 'CUSTOM', 'ACTIVE', 'NOT_STARTED');
