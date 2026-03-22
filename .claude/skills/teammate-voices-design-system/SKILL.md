---
name: teammate-voices-design-system
description: "Design system and component library for the Teammate Voices survey application. Defines the Apple-inspired visual language, main.css tokens, reusable React components, typography, spacing, color palette, and layout patterns. Use this skill whenever building or styling any UI for Teammate Voices — including pages, components, forms, cards, modals, navigation, buttons, inputs, or any visual element. Also trigger when the user mentions 'design system', 'main.css', 'component library', 'styling', 'UI components', 'theme', 'look and feel', 'Apple-like design', or asks how something should look in the Teammate Voices app. This skill is the foundation — every React component in the app must follow these patterns."
---

# Teammate Voices Design System

## Philosophy

The Teammate Voices design system is inspired by Apple's design language: clean surfaces, generous whitespace, subtle depth through borders rather than shadows, refined typography, and a sense of quiet confidence. Every component should feel effortless — nothing competes for attention, the content speaks, and the UI gets out of the way.

Three guiding principles:

1. **Clarity** — Content is the priority. Typography is legible, layouts are uncluttered, icons are precise. Every pixel serves a purpose.
2. **Deference** — The UI recedes so the survey content and data take center stage. No ornamental gradients, no heavy borders, no visual noise.
3. **Depth** — Subtle layering through background tones and thin borders creates hierarchy without heavy shadows or 3D effects.

---

## Project Structure

```
src/
├── styles/
│   ├── main.css              # Design tokens, resets, global styles
│   ├── tokens.css             # CSS custom properties only
│   └── utilities.css          # Utility classes
├── components/
│   ├── ui/                    # Primitive components (Button, Input, Card, etc.)
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.module.css
│   │   │   └── index.js
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Badge/
│   │   ├── Toggle/
│   │   ├── Select/
│   │   ├── Textarea/
│   │   ├── Avatar/
│   │   ├── Tooltip/
│   │   ├── ProgressBar/
│   │   └── Spinner/
│   ├── layout/                # Structural components
│   │   ├── AppShell/
│   │   ├── Sidebar/
│   │   ├── TopBar/
│   │   ├── PageHeader/
│   │   └── ContentArea/
│   ├── data/                  # Data display components
│   │   ├── DataTable/
│   │   ├── MetricCard/
│   │   ├── EmptyState/
│   │   └── StatusBadge/
│   └── survey/                # Domain-specific components
│       ├── QuestionCard/
│       ├── RatingScale/
│       ├── SurveyProgress/
│       └── ResponseSummary/
└── hooks/
    ├── useTheme.js
    └── useBreakpoint.js
```

---

## Design Tokens (tokens.css)

Read the full token definitions in `references/tokens-reference.md`. Below is the summary.

### Color System

The palette uses a neutral foundation with a single accent color for interactive elements. Colors are defined as HSL values for easy manipulation.

**Neutrals** — 11 stops from white to near-black:
- `--color-neutral-0` (#FFFFFF) through `--color-neutral-950` (#1A1A1A)
- Used for: backgrounds, text, borders, surfaces

**Accent (Indigo)** — Primary brand and interactive color:
- `--color-accent-50` (#EEF2FF) through `--color-accent-900` (#312E81)
- Used for: buttons, links, active states, focus rings, selected items

**Semantic colors** — Each has 50 (bg), 500 (icon/border), 700 (text) stops:
- Success (green): survey published, response submitted
- Warning (amber): deadline approaching, draft unsaved
- Danger (red): errors, destructive actions, validation failures
- Info (blue): tips, informational banners

### Typography

Font stack: `"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif`

Mono stack: `"SF Mono", "Fira Code", "Cascadia Code", monospace`

**Type scale** (using rem with 16px base):
- `--text-xs`: 0.75rem / 1rem (12px — captions, badges)
- `--text-sm`: 0.875rem / 1.25rem (14px — secondary text, labels)
- `--text-base`: 1rem / 1.5rem (16px — body text)
- `--text-lg`: 1.125rem / 1.75rem (18px — subheadings)
- `--text-xl`: 1.25rem / 1.75rem (20px — section titles)
- `--text-2xl`: 1.5rem / 2rem (24px — page titles)
- `--text-3xl`: 1.875rem / 2.25rem (30px — hero headings)

**Font weights**: 400 (regular), 500 (medium), 600 (semibold). Never use 700/bold — the Apple aesthetic favors medium-weight headings over heavy ones.

### Spacing

8px base grid. All spacing uses multiples of 8:
- `--space-1`: 0.25rem (4px) — tight internal gaps
- `--space-2`: 0.5rem (8px) — default element gap
- `--space-3`: 0.75rem (12px) — compact section padding
- `--space-4`: 1rem (16px) — standard padding
- `--space-5`: 1.25rem (20px) — comfortable padding
- `--space-6`: 1.5rem (24px) — section gaps
- `--space-8`: 2rem (32px) — large section spacing
- `--space-10`: 2.5rem (40px) — page-level spacing
- `--space-12`: 3rem (48px) — major section dividers

### Border Radius

- `--radius-sm`: 6px — badges, small pills
- `--radius-md`: 8px — buttons, inputs
- `--radius-lg`: 12px — cards, modals
- `--radius-xl`: 16px — large panels, sheets
- `--radius-full`: 9999px — avatar circles, pill buttons

### Elevation (no heavy shadows)

Instead of box-shadows, use background color shifts and thin borders:
- **Level 0**: Page background (`--color-neutral-50`)
- **Level 1**: Card/surface (`--color-neutral-0` white, 1px border `--color-neutral-200`)
- **Level 2**: Raised (dropdown, popover) — same as Level 1 plus a single subtle shadow: `0 4px 12px rgba(0,0,0,0.08)`
- **Level 3**: Modal overlay — Level 2 shadow plus backdrop `rgba(0,0,0,0.4)`

---

## Component Specifications

Read the full component API in `references/components-reference.md`. Below are the core patterns.

### Button

Four variants, three sizes. All have `border-radius: var(--radius-md)`, `font-weight: 500`, `transition: all 150ms ease`.

| Variant | Background | Text | Border | Use case |
|---------|-----------|------|--------|----------|
| Primary | `--color-accent-600` | white | none | Main CTA: "Publish survey" |
| Secondary | `--color-neutral-0` | `--color-neutral-700` | 1px `--color-neutral-300` | Secondary action: "Save draft" |
| Ghost | transparent | `--color-neutral-600` | none | Tertiary: "Cancel", toolbar actions |
| Danger | `--color-danger-600` | white | none | Destructive: "Delete survey" |

Sizes: `sm` (32px height, text-sm), `md` (40px, text-sm), `lg` (48px, text-base).

Hover: primary darkens 10%, secondary gets `--color-neutral-50` bg, ghost gets `--color-neutral-100` bg.
Active: scale(0.98) transform for tactile feedback.
Disabled: opacity 0.5, pointer-events none.
Loading: spinner replaces text, width preserved.

```jsx
<Button variant="primary" size="md" loading={saving}>
  Publish survey
</Button>
```

### Input

Height 40px. Border: 1px `--color-neutral-300`. Border-radius: `--radius-md`. Padding: 0 12px. Font-size: `--text-base`.

States:
- Default: neutral border
- Hover: border `--color-neutral-400`
- Focus: border `--color-accent-500`, ring `0 0 0 3px var(--color-accent-100)`
- Error: border `--color-danger-500`, ring `0 0 0 3px var(--color-danger-50)`
- Disabled: bg `--color-neutral-100`, opacity 0.6

Always pair with a `<label>` above. Helper text below in `--text-sm`, `--color-neutral-500`. Error text replaces helper text in `--color-danger-600`.

```jsx
<Input
  label="Survey title"
  placeholder="e.g., Q1 Engagement Pulse"
  error={errors.title}
  helperText="This appears at the top of the survey"
/>
```

### Card

Background: white. Border: 1px `--color-neutral-200`. Border-radius: `--radius-lg`. Padding: `--space-5` (20px).

Three patterns:
- **Basic card**: static container for content grouping
- **Interactive card**: adds `cursor: pointer`, hover border `--color-neutral-300`, subtle `translateY(-1px)` on hover
- **Selected card**: border `2px solid var(--color-accent-500)`, bg `--color-accent-50`

```jsx
<Card interactive selected={isSelected} onClick={selectSurvey}>
  <Card.Header>
    <h3>Q1 Pulse Check</h3>
    <StatusBadge status="published" />
  </Card.Header>
  <Card.Body>12 questions · 89% completion</Card.Body>
</Card>
```

### Modal

Centered overlay. Max-width 520px (sm), 640px (md), 800px (lg). Border-radius: `--radius-xl`. Backdrop: `rgba(0,0,0,0.4)` with `backdrop-filter: blur(4px)`. Enters with `opacity 0→1` and `translateY(8px)→0` over 200ms.

Structure: header (title + close button), body (scrollable), footer (action buttons, right-aligned).

```jsx
<Modal open={showPublish} onClose={close} size="md">
  <Modal.Header>Publish survey</Modal.Header>
  <Modal.Body>Are you sure you want to publish?</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={close}>Cancel</Button>
    <Button variant="primary" onClick={publish}>Publish</Button>
  </Modal.Footer>
</Modal>
```

### Badge / StatusBadge

Pill-shaped (`border-radius: var(--radius-full)`). Padding: 2px 10px. Font-size: `--text-xs`. Font-weight: 500.

Survey status mapping:
- Draft → neutral (gray bg, dark text)
- Active → success (green bg, green text)
- Scheduled → info (blue bg, blue text)
- Closed → neutral-dark (dark gray bg, white text)
- Paused → warning (amber bg, amber text)

```jsx
<StatusBadge status="active" />
```

### DataTable

Clean, borderless rows separated by 1px `--color-neutral-100` dividers. Header row: `--text-xs`, `--color-neutral-500`, uppercase, `letter-spacing: 0.05em`. Body rows: `--text-sm`, `--color-neutral-900`. Row hover: bg `--color-neutral-50`. Padding: 12px 16px per cell.

Sortable columns show a subtle chevron. Selected rows get `--color-accent-50` background.

### MetricCard

For dashboard stats. Background: `--color-neutral-50`. Border-radius: `--radius-lg`. Padding: `--space-5`. Label: `--text-xs`, `--color-neutral-500`, uppercase. Value: `--text-2xl`, `--color-neutral-900`, font-weight 600. Optional trend indicator (up/down arrow with green/red).

---

## Layout System

### AppShell

The main application wrapper. Fixed sidebar on the left (240px width), top bar, and scrollable content area.

```
┌─────────────────────────────────────────┐
│ TopBar (56px)                           │
├──────────┬──────────────────────────────┤
│ Sidebar  │ ContentArea                  │
│ (240px)  │  ┌────────────────────────┐  │
│          │  │ PageHeader             │  │
│ Logo     │  ├────────────────────────┤  │
│ Nav      │  │ Page content           │  │
│ Items    │  │                        │  │
│          │  │                        │  │
│ User     │  │                        │  │
└──────────┴──┴────────────────────────┴──┘
```

Sidebar: bg white, right border 1px `--color-neutral-200`. Nav items: 40px height, `--radius-md`, hover bg `--color-neutral-100`. Active item: bg `--color-accent-50`, text `--color-accent-700`.

TopBar: bg white, bottom border 1px `--color-neutral-200`, height 56px. Contains breadcrumbs left, actions right.

ContentArea: bg `--color-neutral-50`, padding `--space-8` (32px).

PageHeader: title (`--text-2xl`, font-weight 600), optional description (`--text-base`, `--color-neutral-500`), action buttons right-aligned. Bottom margin `--space-6`.

### Responsive Breakpoints

- `--bp-sm`: 640px (mobile)
- `--bp-md`: 768px (tablet)
- `--bp-lg`: 1024px (desktop)
- `--bp-xl`: 1280px (wide desktop)

Below 1024px: sidebar collapses to hamburger menu overlay. Below 768px: single-column layout, cards stack vertically. Below 640px: reduced padding, compact typography.

---

## Survey-Specific Patterns

### Question Card (in builder)

White card with left color accent bar (4px wide, `--color-accent-500`). Contains: drag handle (6 dots icon, left edge), question type icon, question text, options preview, action menu (duplicate, delete, logic). Hover shows drag handle. Selected state: accent border all around.

### Question Card (in renderer — respondent view)

Cleaner than builder card. No drag handle, no action menu. Question text in `--text-lg`. Options spaced generously. Rating scales use large tappable circles (44px diameter minimum). Progress bar at top of page.

### Rating Scale Component

Five circles in a horizontal row, 44px each, spaced 12px apart. Unselected: border 2px `--color-neutral-300`, white fill. Hover: border `--color-accent-400`, bg `--color-accent-50`. Selected: bg `--color-accent-600`, white text, scale(1.05). Labels below: "Strongly disagree" to "Strongly agree" in `--text-xs`.

### Survey Progress Bar

Full-width, 4px tall, `--radius-full`. Track: `--color-neutral-200`. Fill: `--color-accent-500` with `transition: width 300ms ease`. Percentage label right-aligned, `--text-xs`.

---

## Animation and Motion

All transitions use `ease` or `cubic-bezier(0.4, 0, 0.2, 1)`. Durations:
- Micro-interactions (hover, focus): 150ms
- Element transitions (expand, collapse): 200ms
- Page transitions: 300ms
- Modal entrance: 200ms

Prefer `transform` and `opacity` for animations — they are GPU-accelerated. Avoid animating `width`, `height`, `margin`, or `padding`.

Respect `prefers-reduced-motion`: wrap all animations in `@media (prefers-reduced-motion: no-preference)`.

---

## Accessibility

- All interactive elements must be keyboard navigable
- Focus rings: `0 0 0 3px var(--color-accent-100)` outline on focus-visible
- Color contrast: minimum 4.5:1 for text, 3:1 for large text and UI components
- Form inputs always have associated labels (visible or `aria-label`)
- Modals trap focus and close on Escape
- Loading states announced via `aria-live="polite"`
- Icons are decorative (`aria-hidden="true"`) unless they're the only clickable element (then need `aria-label`)

---

## Do's and Don'ts

**Do:**
- Use the token system — never hardcode colors, spacing, or font sizes
- Keep components composable (Card.Header, Card.Body, Card.Footer)
- Use CSS Modules for component-scoped styles
- Test every component at all three breakpoints
- Maintain a single source of truth in `tokens.css`

**Don't:**
- Use `box-shadow` for depth — use borders and background shifts
- Use font-weight 700 (bold) — max is 600 (semibold), prefer 500 (medium)
- Use more than 2 accent colors on a single screen
- Add decorative elements that don't serve information hierarchy
- Override token values inline — create a new token if needed
- Use gradients, textures, or decorative patterns anywhere
