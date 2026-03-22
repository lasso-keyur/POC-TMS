---
name: tv-frontend
description: "React frontend architecture for the Teammate Voices survey application. Covers project structure, component hierarchy, routing with React Router, state management with Zustand, API integration patterns, form handling, error boundaries, and how components consume the design system. Use this skill whenever building React pages or components for Teammate Voices, setting up routing, managing frontend state, integrating with the Spring Boot API, handling forms and validation, or structuring the frontend codebase. Also trigger when the user mentions React architecture, component patterns, frontend folder structure, survey UI, client-side routing, API hooks, or asks how to build any page or feature in the Teammate Voices frontend."
---

# Teammate Voices — React Frontend Architecture

## Overview

The Teammate Voices frontend is a React 18 single-page application using Vite as the build tool, React Router v6 for routing, Zustand for global state, React Query (TanStack Query) for server state, and CSS Modules scoped to each component. It consumes the design system defined in the `teammate-voices-design-system` skill.

The frontend never contains business logic. It renders what the API tells it, collects user input, and sends it back. All validation, authorization, and workflow rules live in the Spring Boot backend.

---

## Project Structure

```
src/
├── main.jsx                     # Entry point, providers
├── App.jsx                      # Router setup
├── routes/                      # Page-level components (one per route)
│   ├── Dashboard/
│   │   ├── DashboardPage.jsx
│   │   └── DashboardPage.module.css
│   ├── SurveyBuilder/
│   │   ├── BuilderPage.jsx
│   │   └── BuilderPage.module.css
│   ├── SurveyRenderer/
│   │   ├── RendererPage.jsx
│   │   └── RendererPage.module.css
│   ├── Analytics/
│   │   ├── AnalyticsPage.jsx
│   │   └── AnalyticsPage.module.css
│   ├── Admin/
│   │   ├── AdminPage.jsx
│   │   └── AdminPage.module.css
│   └── Auth/
│       ├── LoginPage.jsx
│       └── LoginPage.module.css
├── components/
│   ├── ui/                      # Design system primitives
│   ├── layout/                  # AppShell, Sidebar, TopBar
│   ├── data/                    # DataTable, MetricCard, EmptyState
│   └── survey/                  # QuestionCard, RatingScale, SurveyProgress
├── hooks/                       # Custom hooks
│   ├── useAuth.js
│   ├── useBreakpoint.js
│   ├── useSurvey.js
│   └── useDebouncedCallback.js
├── api/                         # API client layer
│   ├── client.js                # Axios instance with interceptors
│   ├── surveys.js               # Survey CRUD endpoints
│   ├── responses.js             # Response submission endpoints
│   ├── users.js                 # User/admin endpoints
│   └── analytics.js             # Analytics data endpoints
├── stores/                      # Zustand stores
│   ├── authStore.js
│   ├── builderStore.js
│   └── uiStore.js
├── utils/                       # Pure utility functions
│   ├── formatDate.js
│   ├── validators.js
│   └── questionTypes.js
├── styles/
│   ├── tokens.css               # Design tokens
│   └── main.css                 # Global styles, resets, utilities
└── constants/
    ├── routes.js                # Route path constants
    ├── surveyStatus.js          # Status enums
    └── questionTypes.js         # Question type definitions
```

The rule: pages in `routes/`, reusable pieces in `components/`, data-fetching in `api/`, global state in `stores/`. No component should ever import from `routes/` — dependency flows downward only.

---

## Routing

React Router v6 with a layout-based nesting pattern. The `AppShell` layout wraps all authenticated routes, providing the sidebar and topbar. Public routes (login, survey renderer for respondents) use a minimal layout.

```jsx
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/layout/AuthLayout';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/survey/:token" element={<RendererPage />} />
        </Route>

        {/* Protected routes — wrapped in AppShell */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/surveys/new" element={<BuilderPage />} />
          <Route path="/surveys/:id/edit" element={<BuilderPage />} />
          <Route path="/surveys/:id/analytics" element={<AnalyticsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

Route constants live in `constants/routes.js` so paths are never hardcoded:

```js
export const ROUTES = {
  LOGIN:            '/login',
  DASHBOARD:        '/dashboard',
  SURVEY_NEW:       '/surveys/new',
  SURVEY_EDIT:      (id) => `/surveys/${id}/edit`,
  SURVEY_ANALYTICS: (id) => `/surveys/${id}/analytics`,
  SURVEY_RESPOND:   (token) => `/survey/${token}`,
  ADMIN:            '/admin',
  ADMIN_USERS:      '/admin/users',
};
```

---

## State Management

Two layers of state, each with a clear tool:

**Server state** — data from the API: surveys, responses, users, analytics. Managed by React Query (TanStack Query). This handles caching, background refetching, optimistic updates, and loading/error states.

**Client state** — UI-only state: sidebar open/closed, current builder step, selected question, modal visibility. Managed by Zustand stores. Small, focused stores — not one giant store.

### React Query patterns

```jsx
// api/surveys.js
import { api } from './client';

export const surveyApi = {
  list:    (params)    => api.get('/surveys', { params }).then(r => r.data),
  get:     (id)        => api.get(`/surveys/${id}`).then(r => r.data),
  create:  (data)      => api.post('/surveys', data).then(r => r.data),
  update:  (id, data)  => api.put(`/surveys/${id}`, data).then(r => r.data),
  publish: (id)        => api.post(`/surveys/${id}/publish`).then(r => r.data),
  delete:  (id)        => api.delete(`/surveys/${id}`).then(r => r.data),
};

// hooks/useSurvey.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyApi } from '../api/surveys';

export function useSurveys(params) {
  return useQuery({
    queryKey: ['surveys', params],
    queryFn: () => surveyApi.list(params),
  });
}

export function useSurvey(id) {
  return useQuery({
    queryKey: ['surveys', id],
    queryFn: () => surveyApi.get(id),
    enabled: !!id,
  });
}

export function useCreateSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: surveyApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }),
  });
}

export function usePublishSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => surveyApi.publish(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['surveys', id] });
      qc.invalidateQueries({ queryKey: ['surveys'] });
    },
  });
}
```

### Zustand store patterns

```js
// stores/builderStore.js
import { create } from 'zustand';

export const useBuilderStore = create((set, get) => ({
  questions: [],
  selectedQuestionId: null,
  isDirty: false,

  addQuestion: (question) => set((s) => ({
    questions: [...s.questions, question],
    isDirty: true,
  })),

  removeQuestion: (id) => set((s) => ({
    questions: s.questions.filter(q => q.id !== id),
    isDirty: true,
  })),

  reorderQuestions: (fromIndex, toIndex) => set((s) => {
    const updated = [...s.questions];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    return { questions: updated, isDirty: true };
  }),

  selectQuestion: (id) => set({ selectedQuestionId: id }),

  resetBuilder: () => set({ questions: [], selectedQuestionId: null, isDirty: false }),
}));
```

---

## API Client

Axios instance with JWT interceptor and centralized error handling. The auth token comes from the Zustand auth store.

```js
// api/client.js
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Component Patterns

### Page component pattern

Every page follows the same shape: fetch data at the top, handle loading/error/empty states, render content.

```jsx
export function DashboardPage() {
  const { data: surveys, isLoading, error } = useSurveys({ status: 'all' });

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message="Failed to load surveys" retry={refetch} />;
  if (!surveys?.length) return <EmptyState icon="survey" message="No surveys yet" action={{ label: 'Create survey', to: ROUTES.SURVEY_NEW }} />;

  return (
    <>
      <PageHeader title="Dashboard" action={{ label: 'New survey', to: ROUTES.SURVEY_NEW }} />
      <div className="grid-3 gap-4">
        {surveys.map(s => <SurveyCard key={s.id} survey={s} />)}
      </div>
    </>
  );
}
```

### Form pattern

Forms use React Hook Form for field management + the design system Input/Select/Textarea components. Validation messages come from the backend — the frontend only does basic presence checks.

```jsx
import { useForm } from 'react-hook-form';

export function SurveyConfigForm({ survey, onSave }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: survey?.title || '',
      description: survey?.description || '',
      category: survey?.category || 'engagement',
      isAnonymous: survey?.isAnonymous ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="flex-col gap-4">
      <Input
        label="Survey title"
        error={errors.title?.message}
        {...register('title', { required: 'Title is required' })}
      />
      <Textarea
        label="Description"
        {...register('description')}
      />
      <Select
        label="Category"
        options={[
          { value: 'engagement', label: 'Engagement' },
          { value: 'pulse', label: 'Pulse check' },
          { value: '360', label: '360 review' },
          { value: 'custom', label: 'Custom' },
        ]}
        {...register('category')}
      />
      <Toggle label="Anonymous responses" {...register('isAnonymous')} />
      <Button type="submit" variant="primary" loading={isSubmitting}>
        Save
      </Button>
    </form>
  );
}
```

### Error boundary pattern

Wrap each route in an error boundary so one broken page doesn't crash the whole app.

```jsx
import { ErrorBoundary } from 'react-error-boundary';

function PageErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <h2>Something went wrong</h2>
        <p className="text-secondary mt-2">{error.message}</p>
        <Button variant="secondary" onClick={resetErrorBoundary} className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  );
}

// In App.jsx, wrap each route:
<ErrorBoundary FallbackComponent={PageErrorFallback}>
  <DashboardPage />
</ErrorBoundary>
```

---

## Key Conventions

1. **One component per file** — no multi-component files
2. **CSS Modules for all styling** — never inline styles except for dynamic values (e.g., width percentages)
3. **Named exports only** — no default exports (easier refactoring, better IDE support)
4. **Props destructured in function signature** — always
5. **No prop drilling beyond 2 levels** — use Zustand or context
6. **Loading skeletons, not spinners** — for page-level loading, show content-shaped placeholders
7. **All API calls go through `api/` layer** — components never call axios directly
8. **Feature flags via environment variables** — `VITE_FEATURE_*` prefix
9. **Absolute imports via Vite alias** — `@/components/ui/Button` not `../../../components/ui/Button`

---

## Environment Configuration

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Teammate Voices
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_360_REVIEWS=false
```

Read `references/page-specs.md` for detailed specifications on each page's layout, data requirements, and component composition.
