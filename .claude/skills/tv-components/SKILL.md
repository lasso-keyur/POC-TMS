---
name: tv-components
description: "Detailed component specifications for the Teammate Voices survey application's three remaining major modules: Survey Renderer (respondent-facing survey taking experience), Analytics Dashboard (charts, metrics, response data), and Admin Panel (user management, roles, system settings). Use this skill whenever building or modifying the survey taking experience, the analytics/reporting dashboard, or the admin/user management panel. Also trigger when the user mentions survey renderer, respondent view, taking a survey, survey progress, analytics, dashboard charts, response metrics, completion rates, admin panel, user management, role assignment, or asks about how respondents interact with surveys, how managers view results, or how admins manage the system."
---

# Teammate Voices — Component Deep Dives

## 1. Survey Renderer

The survey renderer is the respondent-facing experience — what people see when they click a survey link. It must be clean, fast, distraction-free, and work flawlessly on mobile. No sidebar, no topbar — just the survey.

### Layout

Centered single-column layout, max-width 640px. White background, generous vertical spacing. Progress bar fixed at the top. Navigation (Back/Next) fixed at the bottom on mobile, inline on desktop.

```
┌─────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░  45%          │  ← Progress bar
├─────────────────────────────────────┤
│                                     │
│   Survey Title                      │
│   Section heading (if applicable)   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Question 5 of 12            │   │
│   │                             │   │
│   │ How satisfied are you       │   │
│   │ with your team's            │   │
│   │ communication?              │   │
│   │                             │   │
│   │  ①  ②  ③  ④  ⑤            │   │
│   │                             │   │
│   │ Strongly        Strongly    │   │
│   │ disagree         agree      │   │
│   └─────────────────────────────┘   │
│                                     │
│          [ Back ]  [ Next → ]       │
│                                     │
└─────────────────────────────────────┘
```

### Component Tree

```
RendererPage
├── SurveyProgress          # Top progress bar
├── SurveyHeader            # Title, description, section label
├── QuestionRenderer        # Renders correct input for question type
│   ├── RatingQuestion      # 1-5 or 1-10 circle selector
│   ├── TextQuestion        # Single-line or multi-line text
│   ├── SingleChoiceQuestion  # Radio buttons
│   ├── MultiChoiceQuestion   # Checkboxes
│   ├── LikertQuestion      # Matrix grid
│   ├── NPSQuestion         # 0-10 scale with detractor/passive/promoter
│   ├── RankingQuestion     # Drag-to-rank list
│   └── DateQuestion        # Date picker
├── NavigationControls      # Back / Next / Submit
└── CompletionScreen        # Thank you message after submit
```

### Question Type Rendering

Each question type gets its own component. The `QuestionRenderer` dispatches based on `question.type`:

```jsx
export function QuestionRenderer({ question, value, onChange }) {
  const Component = QUESTION_COMPONENTS[question.type];
  if (!Component) return <UnsupportedQuestion type={question.type} />;

  return (
    <div className={styles.questionWrap}>
      <div className={styles.questionMeta}>
        <span className="text-xs text-secondary uppercase">
          Question {question.order} of {question.totalCount}
        </span>
        {question.required && <span className={styles.required}>Required</span>}
      </div>
      <h2 className={styles.questionText}>{question.text}</h2>
      <Component question={question} value={value} onChange={onChange} />
    </div>
  );
}

const QUESTION_COMPONENTS = {
  RATING:        RatingQuestion,
  TEXT:          TextQuestion,
  SINGLE_CHOICE: SingleChoiceQuestion,
  MULTI_CHOICE:  MultiChoiceQuestion,
  LIKERT:        LikertQuestion,
  NPS:           NPSQuestion,
  RANKING:       RankingQuestion,
  DATE:          DateQuestion,
};
```

### State Flow

The renderer manages its own local state for answers in progress, only sending to the API on page transitions or final submit:

```jsx
// Simplified state flow
const [answers, setAnswers] = useState({});      // { questionId: value }
const [currentPage, setCurrentPage] = useState(0);
const [visibilityMap, setVisibilityMap] = useState({});  // from logic engine

const handleAnswer = (questionId, value) => {
  setAnswers(prev => ({ ...prev, [questionId]: value }));
};

const handleNext = async () => {
  // Save current page answers to API
  await savePageAnswers(surveyId, responseId, currentPageAnswers);

  // Evaluate logic rules server-side
  const { nextPage, visibility } = await evaluateLogic(surveyId, answers);
  setVisibilityMap(visibility);
  setCurrentPage(nextPage);
};
```

### Mobile Considerations

- All tap targets minimum 44px × 44px
- Rating circles: 48px on mobile (larger than desktop 44px)
- Bottom navigation is sticky with safe-area-inset-bottom padding
- Swipe gestures disabled to prevent accidental navigation
- Auto-focus on next question after answering previous
- Keyboard dismiss on scroll for text inputs

---

## 2. Analytics Dashboard

The analytics dashboard is where managers and admins review survey results. It shows aggregate data, trends, individual question breakdowns, and exportable reports.

### Layout

Uses the standard AppShell layout (sidebar + topbar). Content area splits into a summary strip at top (metric cards) and a flexible grid below for charts and tables.

```
┌─────────────────────────────────────────────┐
│ TopBar: Survey Title · [Export] [Share]      │
├──────┬──────────────────────────────────────┤
│ Side │  ┌──────┐ ┌──────┐ ┌──────┐ ┌─────┐ │
│ bar  │  │ 156  │ │ 89%  │ │ 4.2  │ │ 3m  │ │
│      │  │Resp. │ │Compl.│ │ Avg  │ │ Avg │ │
│      │  └──────┘ └──────┘ └──────┘ └─────┘ │
│      │                                      │
│      │  ┌──────────────────────────────────┐│
│      │  │ Response Trend (line chart)      ││
│      │  │                                  ││
│      │  └──────────────────────────────────┘│
│      │                                      │
│      │  ┌──────────────┐ ┌────────────────┐│
│      │  │ Q1 Breakdown │ │ Q2 Breakdown   ││
│      │  │ (bar chart)  │ │ (pie chart)    ││
│      │  └──────────────┘ └────────────────┘│
│      │                                      │
│      │  ┌──────────────────────────────────┐│
│      │  │ Individual Responses (table)     ││
│      │  └──────────────────────────────────┘│
└──────┴──────────────────────────────────────┘
```

### Component Tree

```
AnalyticsPage
├── PageHeader               # Survey title + actions (export, share, filter)
├── MetricStrip              # Row of 4 MetricCards
│   ├── MetricCard (Total responses)
│   ├── MetricCard (Completion rate)
│   ├── MetricCard (Average score)
│   └── MetricCard (Average time)
├── DateRangeFilter          # Filter analytics by date range
├── ResponseTrendChart       # Line chart: responses over time
├── QuestionBreakdownGrid    # Grid of per-question charts
│   ├── RatingBreakdown      # Horizontal bar chart for ratings
│   ├── ChoiceBreakdown      # Donut/pie for single/multi choice
│   ├── NPSGauge             # NPS score gauge (-100 to 100)
│   └── TextWordCloud        # Word cloud for free-text responses
├── ResponsesTable           # DataTable of individual responses
│   ├── ResponseRow          # Expandable row showing all answers
│   └── Pagination
└── ExportPanel              # Export to CSV, PDF, or share link
```

### Chart Library

Use Recharts (already in the React ecosystem, composable, responsive). Chart patterns:

```jsx
// Response trend — area chart
<ResponsiveContainer width="100%" height={280}>
  <AreaChart data={trendData}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
    <YAxis tick={{ fontSize: 12 }} />
    <Tooltip />
    <Area
      type="monotone"
      dataKey="responses"
      stroke="var(--color-accent-600)"
      fill="var(--color-accent-100)"
    />
  </AreaChart>
</ResponsiveContainer>
```

### Data Flow

Analytics data comes from the stored procedures in Oracle via the Spring Boot analytics endpoints. React Query handles caching with a 30-second stale time (analytics don't need real-time updates).

```jsx
export function useAnalytics(surveyId, dateRange) {
  return useQuery({
    queryKey: ['analytics', surveyId, dateRange],
    queryFn: () => analyticsApi.getSurveyStats(surveyId, dateRange),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}
```

---

## 3. Admin Panel

The admin panel is for system administrators. It handles user management, role assignment, system configuration, and survey oversight.

### Layout

Standard AppShell layout. Tab-based navigation within the admin area: Users, Surveys (oversight), Settings.

```
┌──────────────────────────────────────────────┐
│ TopBar: Admin Panel                          │
├──────┬───────────────────────────────────────┤
│ Side │  [Users]  [Surveys]  [Settings]       │
│ bar  │  ─────────────────────────────────    │
│      │                                       │
│      │  ┌─────┬────────────────┬──────────┐  │
│      │  │Search: ____________  │ [+ User] │  │
│      │  ├─────┴────────────────┴──────────┤  │
│      │  │ Name   │ Email  │ Role │ Active │  │
│      │  ├────────┼────────┼──────┼────────┤  │
│      │  │ Jane D │ j@...  │Admin │  ✓     │  │
│      │  │ Bob S  │ b@...  │Mgr   │  ✓     │  │
│      │  │ Eva T  │ e@...  │Resp  │  ✗     │  │
│      │  └────────┴────────┴──────┴────────┘  │
└──────┴───────────────────────────────────────┘
```

### Component Tree

```
AdminPage
├── AdminTabs                # Users | Surveys | Settings
├── UsersTab
│   ├── UserSearchBar        # Search + filter by role
│   ├── UserTable            # DataTable of all users
│   │   ├── UserRow          # Name, email, role badge, active toggle
│   │   └── Pagination
│   └── UserModal            # Create/edit user modal
│       ├── Input (name)
│       ├── Input (email)
│       ├── Select (role)
│       └── Toggle (active)
├── SurveysTab
│   ├── SurveyOversightTable # All surveys across all creators
│   │   ├── StatusBadge
│   │   ├── CreatorAvatar
│   │   └── ActionMenu       # Close, archive, reassign
│   └── BulkActions          # Close/archive multiple surveys
└── SettingsTab
    ├── GeneralSettings      # App name, default anonymity
    ├── EmailSettings        # SMTP config, notification templates
    └── SecuritySettings     # Password policy, session timeout
```

### Role-Based Access

The admin panel is only accessible to users with the `ADMIN` role. The `ProtectedRoute` component checks this:

```jsx
export function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />;

  return children;
}

// In routes:
<Route
  path="/admin/*"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### User Management Actions

All user CRUD flows through the backend — the admin panel never modifies users directly. The backend enforces rules like "cannot deactivate the last admin" and "cannot change your own role."

```jsx
export function useUsers(params) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.list(params),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => userApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
```

---

## Cross-Component Patterns

### Loading States

Every page uses skeleton loaders matching the content shape, not generic spinners:

```jsx
export function MetricStripSkeleton() {
  return (
    <div className="grid-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.metricSkeleton}>
          <div className={styles.skeletonLabel} />
          <div className={styles.skeletonValue} />
        </div>
      ))}
    </div>
  );
}
```

### Empty States

Each module has a contextual empty state:

- Dashboard with no surveys: illustration + "Create your first survey" CTA
- Analytics with no responses: illustration + "Share your survey to start collecting responses"
- Admin with no users matching search: "No users found. Try adjusting your search."

### Error States

Consistent error state component with retry action:

```jsx
<ErrorState
  title="Failed to load analytics"
  message="We couldn't fetch the survey data. Please try again."
  onRetry={refetch}
/>
```
