---
name: tv-database
description: "Oracle database architecture for the Teammate Voices survey application. Covers schema design, table definitions, JSON column patterns, relationships, stored procedures, PL/SQL packages, indexes, constraints, audit triggers, migration strategy, and performance optimization. Use this skill whenever designing or modifying the database schema, writing Oracle SQL or PL/SQL, creating stored procedures or packages, defining indexes, writing migration scripts, troubleshooting query performance, or working with JSON columns in Oracle. Also trigger when the user mentions Oracle schema, database tables, stored procedures, PL/SQL, JSON in Oracle, survey data model, database migration, indexes, constraints, or asks about how data is stored or queried in Teammate Voices."
---

# Teammate Voices — Oracle Database Architecture

## Overview

The Teammate Voices database runs on Oracle 21c+ (to leverage the native JSON data type). It uses a hybrid relational-JSON model: core identifiers, foreign keys, status fields, and dates are relational columns with proper indexes and constraints. Flexible, nested, or schema-variable data (question definitions, logic rules, answer payloads, UI settings) is stored in JSON columns.

The database's job is to guarantee data integrity, enforce structural constraints, provide durable storage, and run heavy analytics via stored procedures. It does not contain business logic — that lives in the Spring Boot middleware.

---

## Schema Overview

Six core tables plus supporting tables for audit and configuration.

```
TV_USERS
  └──< TV_SURVEYS (created_by)
         ├──< TV_QUESTIONS (survey_id)
         ├──< TV_SURVEY_RESPONSES (survey_id)
         │      └──< TV_ANSWERS (response_id, question_id)
         └──< TV_SURVEY_DISTRIBUTIONS (survey_id)
```

---

## Table Definitions

### TV_USERS

```sql
CREATE TABLE tv_users (
    user_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email          VARCHAR2(255)  NOT NULL UNIQUE,
    display_name   VARCHAR2(200)  NOT NULL,
    password_hash  VARCHAR2(500)  NOT NULL,
    role           VARCHAR2(50)   DEFAULT 'RESPONDENT'
                   CONSTRAINT chk_user_role CHECK (role IN ('ADMIN','MANAGER','RESPONDENT')),
    department     VARCHAR2(200),
    is_active      NUMBER(1)      DEFAULT 1 NOT NULL,
    last_login_at  TIMESTAMP,
    created_at     TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at     TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON tv_users (email);
CREATE INDEX idx_users_role  ON tv_users (role);
```

### TV_SURVEYS

The central table. Relational columns for everything queryable; JSON columns for flexible nested data.

```sql
CREATE TABLE tv_surveys (
    survey_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title           VARCHAR2(500)  NOT NULL,
    description     CLOB,
    category        VARCHAR2(100)  DEFAULT 'engagement'
                    CONSTRAINT chk_survey_cat CHECK (category IN (
                        'engagement','pulse','360_review','onboarding','exit','custom'
                    )),
    status          VARCHAR2(50)   DEFAULT 'DRAFT'
                    CONSTRAINT chk_survey_status CHECK (status IN (
                        'DRAFT','PUBLISHED','SCHEDULED','PAUSED','CLOSED','ARCHIVED'
                    )),
    is_anonymous    NUMBER(1)      DEFAULT 1 NOT NULL,
    created_by      NUMBER         NOT NULL REFERENCES tv_users(user_id),
    access_token    VARCHAR2(100)  UNIQUE,
    publish_date    TIMESTAMP,
    deadline        TIMESTAMP,
    scheduled_date  TIMESTAMP,

    -- JSON columns for flexible data
    questions_json  JSON,          -- Array of question definitions
    logic_json      JSON,          -- Branching/skip logic rules
    settings_json   JSON,          -- Theme, reminders, notification config

    created_at      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_surveys_status     ON tv_surveys (status);
CREATE INDEX idx_surveys_created_by ON tv_surveys (created_by);
CREATE INDEX idx_surveys_token      ON tv_surveys (access_token);
CREATE INDEX idx_surveys_category   ON tv_surveys (category);
```

### TV_QUESTIONS

Denormalized from JSON for queries that need to filter/aggregate by question. The JSON column holds the full question definition; the relational columns are extracted for indexing.

```sql
CREATE TABLE tv_questions (
    question_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    survey_id       NUMBER         NOT NULL REFERENCES tv_surveys(survey_id) ON DELETE CASCADE,
    question_type   VARCHAR2(50)   NOT NULL
                    CONSTRAINT chk_q_type CHECK (question_type IN (
                        'RATING','TEXT','SINGLE_CHOICE','MULTI_CHOICE',
                        'LIKERT','NPS','RANKING','DATE','MATRIX'
                    )),
    question_text   VARCHAR2(2000) NOT NULL,
    display_order   NUMBER         NOT NULL,
    is_required     NUMBER(1)      DEFAULT 0 NOT NULL,
    section_id      VARCHAR2(100),

    -- Full definition including options, validation rules
    definition_json JSON,

    created_at      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT uq_question_order UNIQUE (survey_id, display_order)
);

CREATE INDEX idx_questions_survey ON tv_questions (survey_id);
CREATE INDEX idx_questions_type   ON tv_questions (question_type);
```

### TV_SURVEY_RESPONSES

One row per respondent per survey submission.

```sql
CREATE TABLE tv_survey_responses (
    response_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    survey_id       NUMBER         NOT NULL REFERENCES tv_surveys(survey_id),
    respondent_id   NUMBER         REFERENCES tv_users(user_id),  -- NULL if anonymous
    status          VARCHAR2(50)   DEFAULT 'IN_PROGRESS'
                    CONSTRAINT chk_resp_status CHECK (status IN (
                        'IN_PROGRESS','COMPLETED','ABANDONED'
                    )),
    started_at      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
    completed_at    TIMESTAMP,
    ip_address      VARCHAR2(50),

    -- Full answers payload as JSON (for fast reads)
    answers_json    JSON,

    created_at      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT uq_one_response UNIQUE (survey_id, respondent_id)
);

CREATE INDEX idx_responses_survey ON tv_survey_responses (survey_id);
CREATE INDEX idx_responses_status ON tv_survey_responses (status);
```

### TV_ANSWERS

Individual answers denormalized for per-question analytics. The JSON column holds the raw answer value regardless of type.

```sql
CREATE TABLE tv_answers (
    answer_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    response_id     NUMBER         NOT NULL REFERENCES tv_survey_responses(response_id) ON DELETE CASCADE,
    question_id     NUMBER         NOT NULL REFERENCES tv_questions(question_id),
    answer_value    JSON,          -- Holds any type: number, string, array
    created_at      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_answers_response ON tv_answers (response_id);
CREATE INDEX idx_answers_question ON tv_answers (question_id);
```

### TV_SURVEY_DISTRIBUTIONS

Tracks who was invited to a survey and reminder status.

```sql
CREATE TABLE tv_survey_distributions (
    distribution_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    survey_id       NUMBER         NOT NULL REFERENCES tv_surveys(survey_id) ON DELETE CASCADE,
    user_id         NUMBER         NOT NULL REFERENCES tv_users(user_id),
    invited_at      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
    reminder_count  NUMBER         DEFAULT 0,
    last_reminded   TIMESTAMP,
    has_responded   NUMBER(1)      DEFAULT 0 NOT NULL,

    CONSTRAINT uq_distribution UNIQUE (survey_id, user_id)
);

CREATE INDEX idx_dist_survey ON tv_survey_distributions (survey_id);
```

---

## JSON Column Patterns

### Questions JSON structure

```json
{
  "questions": [
    {
      "id": "Q001",
      "type": "RATING",
      "text": "How satisfied are you with your role?",
      "required": true,
      "order": 1,
      "section": "SEC_ENGAGEMENT",
      "config": {
        "min": 1,
        "max": 5,
        "labels": { "1": "Very dissatisfied", "5": "Very satisfied" }
      }
    },
    {
      "id": "Q002",
      "type": "SINGLE_CHOICE",
      "text": "What is your department?",
      "required": true,
      "order": 2,
      "config": {
        "options": [
          { "value": "engineering", "label": "Engineering" },
          { "value": "product", "label": "Product" },
          { "value": "design", "label": "Design" },
          { "value": "other", "label": "Other", "allowFreeText": true }
        ],
        "randomizeOrder": false
      }
    }
  ]
}
```

### Logic JSON structure

```json
{
  "rules": [
    {
      "ruleId": "R001",
      "triggerQuestionId": "Q001",
      "conditions": {
        "operator": "AND",
        "items": [
          { "field": "Q001.value", "op": "lte", "value": 3 }
        ]
      },
      "actions": [
        { "type": "BRANCH", "targetSection": "SEC_IMPROVE" },
        { "type": "REQUIRE", "targetQuestionId": "Q005" }
      ]
    }
  ]
}
```

### Querying JSON with Oracle

```sql
-- Extract question texts from JSON
SELECT s.title,
       jt.question_id,
       jt.question_text,
       jt.question_type
FROM   tv_surveys s,
       JSON_TABLE(s.questions_json, '$.questions[*]'
         COLUMNS (
           question_id   VARCHAR2(50)   PATH '$.id',
           question_text VARCHAR2(2000) PATH '$.text',
           question_type VARCHAR2(50)   PATH '$.type'
         )
       ) jt
WHERE  s.status = 'PUBLISHED';

-- Find surveys with NPS questions
SELECT survey_id, title
FROM   tv_surveys
WHERE  JSON_EXISTS(questions_json, '$.questions[*]?(@.type == "NPS")');

-- Create a functional index on JSON path
CREATE INDEX idx_survey_has_nps ON tv_surveys (
    JSON_VALUE(questions_json, '$.questions[0].type' RETURNING VARCHAR2(50))
);
```

---

## Stored Procedures

Heavy analytics run as PL/SQL packages. The middleware calls them and receives JSON results.

```sql
CREATE OR REPLACE PACKAGE pkg_analytics AS

    PROCEDURE get_survey_stats(
        p_survey_id IN  NUMBER,
        p_result    OUT CLOB
    );

    PROCEDURE get_response_trend(
        p_survey_id IN  NUMBER,
        p_interval  IN  VARCHAR2,  -- 'DAILY', 'WEEKLY', 'MONTHLY'
        p_result    OUT CLOB
    );

    PROCEDURE get_question_breakdown(
        p_survey_id   IN  NUMBER,
        p_question_id IN  VARCHAR2,
        p_result      OUT CLOB
    );

END pkg_analytics;
/

CREATE OR REPLACE PACKAGE BODY pkg_analytics AS

    PROCEDURE get_survey_stats(
        p_survey_id IN  NUMBER,
        p_result    OUT CLOB
    ) IS
        v_total       NUMBER;
        v_completed   NUMBER;
        v_avg_time    NUMBER;
    BEGIN
        SELECT COUNT(*),
               SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END),
               AVG(EXTRACT(EPOCH FROM (completed_at - started_at)))
        INTO   v_total, v_completed, v_avg_time
        FROM   tv_survey_responses
        WHERE  survey_id = p_survey_id;

        SELECT JSON_OBJECT(
            'totalResponses'  VALUE v_total,
            'completedCount'  VALUE v_completed,
            'completionRate'  VALUE ROUND(v_completed / NULLIF(v_total, 0) * 100, 1),
            'avgTimeSeconds'  VALUE ROUND(v_avg_time, 0)
        ) INTO p_result FROM DUAL;
    END get_survey_stats;

END pkg_analytics;
/
```

---

## Audit Trail

Trigger-based audit for critical tables.

```sql
CREATE TABLE tv_audit_log (
    audit_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_name  VARCHAR2(100)  NOT NULL,
    record_id   NUMBER         NOT NULL,
    action      VARCHAR2(20)   NOT NULL,  -- INSERT, UPDATE, DELETE
    changed_by  VARCHAR2(255),
    old_values  JSON,
    new_values  JSON,
    changed_at  TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE OR REPLACE TRIGGER trg_surveys_audit
AFTER INSERT OR UPDATE OR DELETE ON tv_surveys
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO tv_audit_log (table_name, record_id, action, new_values, changed_at)
        VALUES ('TV_SURVEYS', :NEW.survey_id, 'INSERT',
                JSON_OBJECT('title' VALUE :NEW.title, 'status' VALUE :NEW.status),
                SYSTIMESTAMP);
    ELSIF UPDATING THEN
        INSERT INTO tv_audit_log (table_name, record_id, action, old_values, new_values, changed_at)
        VALUES ('TV_SURVEYS', :NEW.survey_id, 'UPDATE',
                JSON_OBJECT('title' VALUE :OLD.title, 'status' VALUE :OLD.status),
                JSON_OBJECT('title' VALUE :NEW.title, 'status' VALUE :NEW.status),
                SYSTIMESTAMP);
    ELSIF DELETING THEN
        INSERT INTO tv_audit_log (table_name, record_id, action, old_values, changed_at)
        VALUES ('TV_SURVEYS', :OLD.survey_id, 'DELETE',
                JSON_OBJECT('title' VALUE :OLD.title, 'status' VALUE :OLD.status),
                SYSTIMESTAMP);
    END IF;
END;
/
```

---

## Migration Strategy

Use Flyway for version-controlled migrations. Scripts live in `src/main/resources/db/migration/`:

```
V1__create_users_table.sql
V2__create_surveys_table.sql
V3__create_questions_table.sql
V4__create_responses_answers.sql
V5__create_distributions.sql
V6__create_audit_log.sql
V7__create_analytics_package.sql
V8__add_json_indexes.sql
```

Naming convention: `V{number}__{description}.sql`. Never modify a released migration — create a new one.

---

## Key Conventions

1. **Table prefix `TV_`** — all Teammate Voices tables prefixed for namespace isolation
2. **Identity columns for PKs** — `GENERATED ALWAYS AS IDENTITY`, never sequences manually
3. **JSON for flexible data, relational for queryable data** — if you need to WHERE/JOIN on it, it's relational
4. **CHECK constraints for enums** — enforce valid values at the database level
5. **Unique constraints for business rules** — one response per user per survey, unique question order
6. **ON DELETE CASCADE only on owned children** — questions cascade with survey, answers cascade with response
7. **Timestamps on every table** — `created_at` and `updated_at` with `SYSTIMESTAMP` defaults
8. **Indexes on all foreign keys** — Oracle does not auto-index FKs like some databases
9. **Stored procedures return JSON** — middleware parses JSON results, no cursor mapping needed
