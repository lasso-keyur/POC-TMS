---
name: tv-master
description: "Master architecture skill for the Teammate Voices survey application. Ties together all tier-specific skills and covers cross-cutting concerns: authentication flow, authorization matrix, error handling strategy, logging, deployment pipeline, environment configuration, testing strategy, API versioning, CORS, monitoring, and the end-to-end workflow for building a new feature across all three tiers. Use this skill whenever the user asks about the overall system, cross-cutting concerns like auth or deployment, how the tiers connect, end-to-end feature implementation, testing strategy, CI/CD pipeline, environment setup, or any question that spans multiple tiers. Also trigger when the user mentions 'how does auth work', 'deployment', 'testing', 'CI/CD', 'environments', 'monitoring', 'logging', 'end to end', 'full stack', or asks how to add a new feature to Teammate Voices."
---

# Teammate Voices — Master Architecture

## Overview

This skill is the connective tissue between the tier-specific skills. It covers everything that spans multiple layers — authentication flowing from frontend to backend to database, error propagation from Oracle through Spring Boot to React, the deployment pipeline that builds and ships all three tiers, and the step-by-step workflow for implementing a new feature end-to-end.

### Related Skills

- `teammate-voices-design-system` — UI tokens, components, Apple-inspired guidelines
- `tv-frontend` — React architecture, routing, state management
- `tv-backend` — Spring Boot controllers, services, repositories
- `tv-database` — Oracle schema, JSON columns, stored procedures
- `tv-components` — Survey renderer, analytics dashboard, admin panel

---

## Authentication Flow (End-to-End)

### Login sequence

```
React LoginPage          Spring Boot AuthController       Oracle TV_USERS
     │                            │                            │
     │  POST /api/auth/login      │                            │
     │  { email, password }       │                            │
     │ ──────────────────────────>│                            │
     │                            │  SELECT by email           │
     │                            │ ──────────────────────────>│
     │                            │  user row                  │
     │                            │ <──────────────────────────│
     │                            │                            │
     │                            │  Verify BCrypt hash        │
     │                            │  Generate JWT (access 15m) │
     │                            │  Generate refresh (7d)     │
     │                            │  Update last_login_at      │
     │                            │ ──────────────────────────>│
     │                            │                            │
     │  { accessToken,            │                            │
     │    refreshToken,           │                            │
     │    user: { id, name,       │                            │
     │            email, role } } │                            │
     │ <──────────────────────────│                            │
     │                            │                            │
     │  Store tokens in Zustand   │                            │
     │  Redirect to /dashboard    │                            │
```

### JWT token structure

```json
{
  "sub": "42",
  "email": "jane@company.com",
  "role": "MANAGER",
  "iat": 1711000000,
  "exp": 1711000900
}
```

### Token refresh

The Axios interceptor detects 401 responses, calls the refresh endpoint, retries the original request. If refresh also fails, redirect to login.

```js
// In api/client.js — simplified refresh logic
api.interceptors.response.use(null, async (error) => {
  const originalRequest = error.config;
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const { refreshToken } = useAuthStore.getState();
    const { data } = await axios.post('/api/auth/refresh', { refreshToken });
    useAuthStore.getState().setToken(data.accessToken);
    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
    return api(originalRequest);
  }
  return Promise.reject(error);
});
```

---

## Authorization Matrix

| Resource            | ADMIN | MANAGER | RESPONDENT |
|---------------------|-------|---------|------------|
| Create survey       | Yes   | Yes     | No         |
| Edit own survey     | Yes   | Yes     | No         |
| Edit any survey     | Yes   | No      | No         |
| Publish survey      | Yes   | Yes     | No         |
| Delete survey       | Yes   | Own only| No         |
| View analytics      | Yes   | Own surveys | No     |
| Take survey         | Yes   | Yes     | Yes        |
| Manage users        | Yes   | No      | No         |
| View admin panel    | Yes   | No      | No         |
| Export data         | Yes   | Own surveys | No     |

Enforced at the Spring Boot service layer, not just the frontend. The frontend hides unauthorized UI elements for UX, but the backend rejects unauthorized API calls regardless.

---

## Error Propagation

Errors flow upward with translation at each boundary:

```
Oracle                    Spring Boot                  React
─────                    ───────────                  ─────
ORA-00001               → DuplicateResponseException  → "You've already
(unique constraint)       → 409 Conflict                 responded to
                           { code: "DUPLICATE_RESP",     this survey"
                             message: "..." }

ORA-02291               → ResourceNotFoundException   → "Survey not found"
(FK violation)            → 404 Not Found               + redirect to
                           { code: "NOT_FOUND" }         dashboard

Validation failure      → MethodArgumentNotValid      → Field-level
(Bean Validation)         → 400 Bad Request              error messages
                           { code: "VALIDATION_ERROR",   under each input
                             fieldErrors: {...} }

Unhandled exception     → GlobalExceptionHandler      → Generic error
                          → 500 Internal Error           page with
                           { code: "INTERNAL_ERROR" }    retry button
```

The frontend error handler maps API error codes to user-friendly messages:

```js
const ERROR_MESSAGES = {
  DUPLICATE_RESP:      "You've already responded to this survey.",
  SURVEY_CLOSED:       "This survey is no longer accepting responses.",
  NOT_FOUND:           "The requested resource was not found.",
  VALIDATION_ERROR:    "Please fix the highlighted fields.",
  INTERNAL_ERROR:      "Something went wrong. Please try again.",
};
```

---

## End-to-End Feature Workflow

When adding a new feature (e.g., "add NPS question type"), follow this sequence:

### Step 1: Database
- Add `'NPS'` to the `chk_q_type` CHECK constraint on `tv_questions`
- Define the NPS question JSON structure in `questions_json`
- Add any new stored procedure analytics for NPS (promoter/detractor calculation)
- Create a Flyway migration: `V{next}__add_nps_question_type.sql`

### Step 2: Backend
- Add NPS to the `QuestionType` enum
- Create `NPSValidator` for NPS-specific validation rules (0-10 range, required follow-up text for detractors)
- Update `QuestionService` to handle NPS creation and response processing
- Add NPS analytics to `pkg_analytics.get_question_breakdown`
- Write unit tests for the validator and service

### Step 3: Frontend
- Create `NPSQuestion` component in `components/survey/`
- Register it in the `QUESTION_COMPONENTS` map in `QuestionRenderer`
- Add NPS option to the question type picker in `SurveyBuilder`
- Create `NPSGauge` visualization for the analytics dashboard
- Add NPS to the builder's question config panel (0-10 labels, follow-up threshold)

### Step 4: Integration test
- End-to-end test: create survey with NPS question → publish → submit response → verify analytics

---

## Testing Strategy

### Backend (JUnit 5 + Mockito + Testcontainers)

```
tests/
├── unit/
│   ├── service/           # Mock repositories, test business logic
│   ├── validator/         # Test validation rules
│   └── mapper/            # Test DTO mapping
├── integration/
│   ├── controller/        # @WebMvcTest with MockMvc
│   ├── repository/        # @DataJpaTest with Testcontainers Oracle
│   └── security/          # Auth flow tests
└── e2e/
    └── SurveyFlowTest.java  # Full create→publish→respond→analytics
```

### Frontend (Vitest + Testing Library + MSW)

```
tests/
├── components/            # Render tests for UI components
├── hooks/                 # Hook tests with renderHook
├── pages/                 # Page integration tests with MSW mocking
└── e2e/                   # Playwright end-to-end browser tests
```

### Database (utPLSQL)

```
tests/
├── test_pkg_analytics.sql     # Stored procedure output tests
├── test_triggers.sql          # Audit trigger verification
└── test_constraints.sql       # Constraint enforcement tests
```

---

## Deployment Pipeline

### Environment tiers

| Environment | Purpose | Database | URL |
|------------|---------|----------|-----|
| Local      | Development | Oracle XE Docker | localhost:3000 / :8080 |
| Dev        | Integration testing | Oracle Dev instance | dev.tv.internal |
| Staging    | Pre-production QA | Oracle Staging (prod clone) | staging.tv.internal |
| Production | Live | Oracle Production (RAC) | teammatevoices.company.com |

### CI/CD Flow (GitHub Actions or Jenkins)

```
Push to main
  │
  ├─ Frontend pipeline
  │   ├─ npm install
  │   ├─ npm run lint
  │   ├─ npm run test
  │   ├─ npm run build (Vite → dist/)
  │   └─ Deploy to CDN / Nginx
  │
  ├─ Backend pipeline
  │   ├─ mvn clean verify (compile + unit tests)
  │   ├─ Integration tests (Testcontainers)
  │   ├─ mvn package (JAR)
  │   ├─ Docker build
  │   └─ Deploy to container orchestrator
  │
  └─ Database pipeline
      ├─ Flyway validate (check pending migrations)
      ├─ Flyway migrate (apply to target env)
      └─ utPLSQL run (stored procedure tests)
```

### Docker Compose (local development)

```yaml
services:
  oracle:
    image: gvenzl/oracle-xe:21-slim
    ports: ["1521:1521"]
    environment:
      ORACLE_PASSWORD: dev_password
      APP_USER: tv_app
      APP_USER_PASSWORD: tv_password
    volumes:
      - oracle-data:/opt/oracle/oradata

  backend:
    build: ./backend
    ports: ["8080:8080"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:oracle:thin:@oracle:1521/XEPDB1
      JWT_SECRET: dev-secret-key-change-in-prod
    depends_on: [oracle]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      VITE_API_BASE_URL: http://localhost:8080/api
    depends_on: [backend]

volumes:
  oracle-data:
```

---

## Environment Configuration

### Backend (application.yml)

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:oracle:thin:@localhost:1521/XEPDB1}
    username: ${DB_USER:tv_app}
    password: ${DB_PASSWORD:tv_password}
    driver-class-name: oracle.jdbc.OracleDriver
  jpa:
    hibernate:
      ddl-auto: validate    # Never auto-create — Flyway handles schema
    properties:
      hibernate.dialect: org.hibernate.dialect.OracleDialect
  flyway:
    enabled: true
    locations: classpath:db/migration

jwt:
  secret: ${JWT_SECRET}
  access-expiry: 900          # 15 minutes
  refresh-expiry: 604800      # 7 days

cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:3000}

logging:
  level:
    com.teammatevoices: INFO
    org.springframework.security: WARN
```

---

## Monitoring and Logging

### Logging Convention

- **Controllers**: log request received (DEBUG), response status (INFO for errors)
- **Services**: log operation start/end (INFO), business rule violations (WARN), exceptions (ERROR)
- **Repositories**: rely on Hibernate SQL logging at DEBUG level

Format: `timestamp | level | traceId | class | message`

### Health Check

Spring Boot Actuator endpoint at `/api/actuator/health` checks database connectivity and disk space.

### Metrics (Micrometer + Prometheus)

- `tv_surveys_created_total` — counter
- `tv_responses_submitted_total` — counter
- `tv_api_request_duration_seconds` — histogram by endpoint
- `tv_active_surveys_gauge` — gauge of published surveys

---

## Key Conventions (Cross-Cutting)

1. **Never trust the frontend** — all validation, auth, and business rules enforced server-side
2. **Fail fast, fail clearly** — specific error codes, not generic 500s
3. **Stateless backend** — no server-side sessions. JWT carries all auth context.
4. **Database migrations are append-only** — never modify released Flyway scripts
5. **Environment parity** — Docker Compose local setup mirrors production topology
6. **Feature flags over feature branches** — long-running features behind VITE_FEATURE_* flags
7. **API-first** — define the API contract before building either frontend or backend
8. **One source of truth per data point** — design tokens in tokens.css, routes in routes.js, status enums in constants
