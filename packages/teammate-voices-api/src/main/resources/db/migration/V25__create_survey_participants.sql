-- ─────────────────────────────────────────────────────────────────
-- V25: Survey-specific participant roster
--
-- Each survey can have its own set of participants, uploaded via
-- the Excel import on the survey Settings tab. This is a junction
-- table between SURVEYS and PARTICIPANTS.
--
-- A participant can appear in multiple surveys independently.
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE SURVEY_PARTICIPANTS (
    SURVEY_ID      NUMBER(19)    NOT NULL,
    PARTICIPANT_ID VARCHAR2(50)  NOT NULL,
    ADDED_AT       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_SURVEY_PARTICIPANTS PRIMARY KEY (SURVEY_ID, PARTICIPANT_ID),
    CONSTRAINT FK_SP_SURVEY      FOREIGN KEY (SURVEY_ID)      REFERENCES SURVEYS(SURVEY_ID)      ON DELETE CASCADE,
    CONSTRAINT FK_SP_PARTICIPANT FOREIGN KEY (PARTICIPANT_ID) REFERENCES PARTICIPANTS(PARTICIPANT_ID) ON DELETE CASCADE
);

CREATE INDEX IDX_SP_SURVEY_ID      ON SURVEY_PARTICIPANTS(SURVEY_ID);
CREATE INDEX IDX_SP_PARTICIPANT_ID ON SURVEY_PARTICIPANTS(PARTICIPANT_ID);
