---
name: tv-backend
description: "Spring Boot backend architecture for the Teammate Voices survey application. Covers project structure, REST controller patterns, service layer conventions, JPA/repository setup, DTO mapping, stored procedure integration with Oracle, JWT authentication, exception handling, validation, and transaction management. Use this skill whenever building Java backend code for Teammate Voices, designing REST APIs, writing service classes, creating JPA entities, calling Oracle stored procedures, handling authentication/authorization, or structuring the Spring Boot codebase. Also trigger when the user mentions Spring Boot patterns, REST controllers, service layer, repository layer, DTO mapping, Java middleware, API design, backend validation, or asks how to implement any backend feature for Teammate Voices."
---

# Teammate Voices — Spring Boot Backend Architecture

## Overview

The Teammate Voices backend is a Spring Boot 3.x application running on Java 17+. It serves as the middleware tier — receiving requests from the React frontend via REST/JSON, applying business rules, orchestrating data operations, and returning structured responses. It connects to Oracle Database via Spring Data JPA with Hibernate, supplemented by direct stored procedure calls for complex analytics.

The backend owns all business logic. The frontend is a dumb client; the database is a dumb store. The backend decides what's valid, what's allowed, and what happens next.

---

## Project Structure

```
src/main/java/com/teammatevoices/
├── TeammateVoicesApplication.java
├── config/
│   ├── SecurityConfig.java          # Spring Security + JWT
│   ├── CorsConfig.java              # CORS for React dev server
│   ├── JpaConfig.java               # Auditing, custom converters
│   └── OpenApiConfig.java           # Swagger/OpenAPI docs
├── controller/
│   ├── SurveyController.java
│   ├── QuestionController.java
│   ├── ResponseController.java
│   ├── AnalyticsController.java
│   ├── UserController.java
│   └── AuthController.java
├── service/
│   ├── SurveyService.java
│   ├── QuestionService.java
│   ├── ResponseService.java
│   ├── AnalyticsService.java
│   ├── LogicEvaluatorService.java
│   ├── UserService.java
│   ├── AuthService.java
│   └── NotificationService.java
├── repository/
│   ├── SurveyRepository.java
│   ├── QuestionRepository.java
│   ├── ResponseRepository.java
│   ├── UserRepository.java
│   └── custom/
│       ├── AnalyticsRepositoryCustom.java
│       └── AnalyticsRepositoryCustomImpl.java
├── entity/
│   ├── Survey.java
│   ├── Question.java
│   ├── SurveyResponse.java
│   ├── Answer.java
│   ├── User.java
│   └── AuditableEntity.java         # Base class with created/updated
├── dto/
│   ├── request/
│   │   ├── SurveyCreateRequest.java
│   │   ├── SurveyUpdateRequest.java
│   │   ├── ResponseSubmitRequest.java
│   │   └── LoginRequest.java
│   ├── response/
│   │   ├── SurveyDTO.java
│   │   ├── SurveyListDTO.java
│   │   ├── QuestionDTO.java
│   │   ├── ResponseDTO.java
│   │   ├── AnalyticsDTO.java
│   │   ├── UserDTO.java
│   │   └── AuthTokenDTO.java
│   └── mapper/
│       ├── SurveyMapper.java
│       ├── QuestionMapper.java
│       └── UserMapper.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── UserPrincipal.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── BusinessRuleException.java
│   ├── DuplicateResponseException.java
│   └── SurveyClosedException.java
├── validation/
│   ├── SurveyValidator.java
│   └── ResponseValidator.java
└── util/
    ├── JsonColumnConverter.java     # JPA converter for Oracle JSON
    └── SlugGenerator.java
```

---

## Layer Patterns

### Controller Layer

Controllers are thin — they accept requests, delegate to services, and return responses. No business logic, no direct repository calls, no entity references.

```java
@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @GetMapping
    public ResponseEntity<List<SurveyListDTO>> listSurveys(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(surveyService.listSurveys(status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SurveyDTO> getSurvey(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.getSurvey(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SurveyDTO createSurvey(
            @Valid @RequestBody SurveyCreateRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        return surveyService.createSurvey(request, user.getId());
    }

    @PutMapping("/{id}")
    public SurveyDTO updateSurvey(
            @PathVariable Long id,
            @Valid @RequestBody SurveyUpdateRequest request) {
        return surveyService.updateSurvey(id, request);
    }

    @PostMapping("/{id}/publish")
    public SurveyDTO publishSurvey(@PathVariable Long id) {
        return surveyService.publishSurvey(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSurvey(@PathVariable Long id) {
        surveyService.deleteSurvey(id);
    }
}
```

### Service Layer

Services contain all business logic. They validate rules, orchestrate operations, and return DTOs. Services call repositories, never controllers. Services can call other services.

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurveyService {

    private final SurveyRepository surveyRepo;
    private final SurveyMapper mapper;
    private final SurveyValidator validator;

    public SurveyDTO getSurvey(Long id) {
        Survey survey = surveyRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Survey", id));
        return mapper.toDTO(survey);
    }

    @Transactional
    public SurveyDTO createSurvey(SurveyCreateRequest req, Long userId) {
        Survey survey = mapper.toEntity(req);
        survey.setCreatedBy(userId);
        survey.setStatus("DRAFT");
        survey = surveyRepo.save(survey);
        return mapper.toDTO(survey);
    }

    @Transactional
    public SurveyDTO publishSurvey(Long id) {
        Survey survey = surveyRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Survey", id));

        validator.validateForPublish(survey);  // throws BusinessRuleException

        survey.setStatus("PUBLISHED");
        survey.setPublishDate(Instant.now());
        survey.setAccessToken(SlugGenerator.generate());
        survey = surveyRepo.save(survey);
        return mapper.toDTO(survey);
    }
}
```

### Repository Layer

Spring Data JPA repositories with custom query methods. Complex queries use `@Query` with JPQL or native SQL. Stored procedure calls use the custom repository pattern.

```java
public interface SurveyRepository extends JpaRepository<Survey, Long> {

    List<Survey> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT s FROM Survey s WHERE s.createdBy = :userId ORDER BY s.updatedAt DESC")
    List<Survey> findByCreator(@Param("userId") Long userId);

    @Query("SELECT s FROM Survey s WHERE s.accessToken = :token AND s.status = 'PUBLISHED'")
    Optional<Survey> findPublishedByToken(@Param("token") String token);

    @Query(value = "SELECT COUNT(*) FROM tv_responses WHERE survey_id = :surveyId", nativeQuery = true)
    long countResponses(@Param("surveyId") Long surveyId);
}
```

### Stored Procedure Integration

For complex analytics that are better handled in Oracle (aggregation across millions of rows, pivot operations). Use the custom repository pattern:

```java
// AnalyticsRepositoryCustom.java (interface)
public interface AnalyticsRepositoryCustom {
    AnalyticsDTO getSurveyAnalytics(Long surveyId);
    List<TrendDataPoint> getResponseTrend(Long surveyId, String interval);
}

// AnalyticsRepositoryCustomImpl.java (implementation)
@Repository
@RequiredArgsConstructor
public class AnalyticsRepositoryCustomImpl implements AnalyticsRepositoryCustom {

    private final EntityManager em;

    @Override
    public AnalyticsDTO getSurveyAnalytics(Long surveyId) {
        StoredProcedureQuery query = em.createStoredProcedureQuery("PKG_ANALYTICS.GET_SURVEY_STATS");
        query.registerStoredProcedureParameter("p_survey_id", Long.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_result", String.class, ParameterMode.OUT);
        query.setParameter("p_survey_id", surveyId);
        query.execute();

        String jsonResult = (String) query.getOutputParameterValue("p_result");
        return objectMapper.readValue(jsonResult, AnalyticsDTO.class);
    }
}
```

---

## DTO and Mapper Pattern

Never expose JPA entities through REST. Always map to/from DTOs.

```java
// dto/request/SurveyCreateRequest.java
public record SurveyCreateRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be under 200 characters")
    String title,

    String description,
    String category,
    Boolean isAnonymous,
    String questionsJson,    // JSON string of questions array
    String logicJson,        // JSON string of logic rules
    String settingsJson      // JSON string of UI/notification settings
) {}

// dto/mapper/SurveyMapper.java
@Component
public class SurveyMapper {

    public SurveyDTO toDTO(Survey entity) {
        return new SurveyDTO(
            entity.getId(),
            entity.getTitle(),
            entity.getDescription(),
            entity.getCategory(),
            entity.getStatus(),
            entity.getIsAnonymous(),
            entity.getQuestionsJson(),
            entity.getLogicJson(),
            entity.getSettingsJson(),
            entity.getPublishDate(),
            entity.getDeadline(),
            entity.getAccessToken(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    public Survey toEntity(SurveyCreateRequest req) {
        Survey s = new Survey();
        s.setTitle(req.title());
        s.setDescription(req.description());
        s.setCategory(req.category() != null ? req.category() : "engagement");
        s.setIsAnonymous(req.isAnonymous() != null ? req.isAnonymous() : true);
        s.setQuestionsJson(req.questionsJson());
        s.setLogicJson(req.logicJson());
        s.setSettingsJson(req.settingsJson());
        return s;
    }
}
```

---

## Exception Handling

Global handler translates exceptions into consistent API error responses.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(BusinessRuleException e) {
        return ResponseEntity.status(422)
            .body(new ErrorResponse("BUSINESS_RULE_VIOLATION", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(
            fe -> errors.put(fe.getField(), fe.getDefaultMessage()));
        return ResponseEntity.status(400)
            .body(new ErrorResponse("VALIDATION_ERROR", "Invalid input", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
        log.error("Unexpected error", e);
        return ResponseEntity.status(500)
            .body(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}

public record ErrorResponse(String code, String message, Map<String, String> fieldErrors) {
    public ErrorResponse(String code, String message) { this(code, message, null); }
}
```

---

## JSON Column Handling

JPA converter for Oracle JSON columns. Stores and retrieves JSON strings transparently.

```java
@Converter(autoApply = false)
public class JsonColumnConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute;  // Already JSON string
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return dbData;
    }
}

// In entity:
@Column(name = "questions_json", columnDefinition = "JSON")
@Convert(converter = JsonColumnConverter.class)
private String questionsJson;
```

---

## Security

JWT-based authentication. Login endpoint returns access + refresh tokens. All `/api/**` endpoints require valid JWT except `/api/auth/**` and `/api/public/**`.

Read `references/security-patterns.md` for full JWT implementation, role-based access control, and survey-level permissions.

---

## Key Conventions

1. **Records for DTOs** — immutable, concise, no boilerplate
2. **`@Transactional(readOnly = true)` at class level** — override with `@Transactional` on write methods
3. **No business logic in controllers** — controllers are max 5-10 lines per method
4. **Validate in validators, not in services** — separate validation classes keep services clean
5. **Log at service boundaries** — info for operations, warn for business rule violations, error for exceptions
6. **Return DTOs from services** — never entities. Controllers never see entities.
7. **Use `Optional` from repositories** — never return null
8. **Pagination on all list endpoints** — use `Pageable` or manual page/size params
9. **API versioning via URL** — `/api/v1/surveys` when breaking changes arrive
