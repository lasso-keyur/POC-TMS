# Components Reference

Complete React component specifications for the Teammate Voices design system. Each component includes its props API, CSS Module patterns, and usage examples.

## Table of Contents
1. Button
2. Input
3. Textarea
4. Select
5. Card
6. Modal
7. Badge / StatusBadge
8. Toggle
9. Avatar
10. Tooltip
11. ProgressBar
12. Spinner
13. DataTable
14. MetricCard
15. EmptyState
16. AppShell / Layout
17. QuestionCard
18. RatingScale
19. SurveyProgress

---

## 1. Button

```jsx
import styles from './Button.module.css';
import { Spinner } from '../Spinner';

export function Button({
  children,
  variant = 'primary',    // primary | secondary | ghost | danger
  size = 'md',            // sm | md | lg
  loading = false,
  disabled = false,
  icon = null,            // React node for left icon
  iconRight = null,       // React node for right icon
  fullWidth = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.full : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <>
          {icon && <span className={styles.iconLeft}>{icon}</span>}
          {children}
          {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
        </>
      )}
    </button>
  );
}
```

**Button.module.css patterns:**
```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
  white-space: nowrap;
}

.button:active:not(:disabled) {
  transform: scale(0.98);
}

.button:disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Variants */
.primary {
  background: var(--color-accent-600);
  color: white;
  border: none;
}
.primary:hover { background: var(--color-accent-700); }

.secondary {
  background: var(--color-neutral-0);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-300);
}
.secondary:hover { background: var(--color-neutral-50); }

.ghost {
  background: transparent;
  color: var(--color-neutral-600);
  border: none;
}
.ghost:hover { background: var(--color-neutral-100); }

.danger {
  background: var(--color-danger-600);
  color: white;
  border: none;
}
.danger:hover { background: var(--color-danger-700); }

/* Sizes */
.sm { height: 32px; padding: 0 var(--space-3); font-size: var(--text-sm); }
.md { height: 40px; padding: 0 var(--space-4); font-size: var(--text-sm); }
.lg { height: 48px; padding: 0 var(--space-6); font-size: var(--text-base); }

.full { width: 100%; }
```

---

## 2. Input

```jsx
export function Input({
  label,
  helperText,
  error,
  id,
  required = false,
  disabled = false,
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.error : ''}`}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className={styles.errorText} role="alert">{error}</p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className={styles.helperText}>{helperText}</p>
      )}
    </div>
  );
}
```

**Input.module.css patterns:**
```css
.field { display: flex; flex-direction: column; gap: var(--space-1); }

.label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
}

.required { color: var(--color-danger-500); margin-left: 2px; }

.input {
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-sans);
  color: var(--color-neutral-900);
  background: var(--color-neutral-0);
  transition: border-color var(--duration-fast) var(--ease-default),
              box-shadow var(--duration-fast) var(--ease-default);
}

.input:hover:not(:disabled) { border-color: var(--color-neutral-400); }
.input:focus {
  outline: none;
  border-color: var(--color-accent-500);
  box-shadow: 0 0 0 3px var(--color-accent-100);
}

.input.error {
  border-color: var(--color-danger-500);
  box-shadow: 0 0 0 3px var(--color-danger-50);
}

.input:disabled {
  background: var(--color-neutral-100);
  opacity: 0.6;
}

.input::placeholder { color: var(--color-neutral-400); }

.helperText { font-size: var(--text-xs); color: var(--color-neutral-500); }
.errorText  { font-size: var(--text-xs); color: var(--color-danger-600); }
```

---

## 3. Card

```jsx
export function Card({
  children,
  interactive = false,
  selected = false,
  padding = 'md',    // sm | md | lg | none
  onClick,
  className = '',
  ...props
}) {
  const Tag = interactive ? 'button' : 'div';
  return (
    <Tag
      className={`${styles.card} ${styles[`pad-${padding}`]} ${interactive ? styles.interactive : ''} ${selected ? styles.selected : ''} ${className}`}
      onClick={interactive ? onClick : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`${styles.body} ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
};
```

---

## 4. Modal

```jsx
import { useEffect, useRef } from 'react';

export function Modal({ open, onClose, size = 'md', children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const handleCancel = (e) => { e.preventDefault(); onClose(); };
    dialog?.addEventListener('cancel', handleCancel);
    return () => dialog?.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className={`${styles.modal} ${styles[size]}`}>
      {children}
    </dialog>
  );
}

Modal.Header = function ModalHeader({ children, onClose }) {
  return (
    <div className={styles.modalHeader}>
      <h2 className={styles.modalTitle}>{children}</h2>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
};

Modal.Body = function ModalBody({ children }) {
  return <div className={styles.modalBody}>{children}</div>;
};

Modal.Footer = function ModalFooter({ children }) {
  return <div className={styles.modalFooter}>{children}</div>;
};
```

---

## 5. StatusBadge

```jsx
const STATUS_MAP = {
  draft:     { label: 'Draft',     color: 'neutral' },
  active:    { label: 'Active',    color: 'success' },
  published: { label: 'Published', color: 'success' },
  scheduled: { label: 'Scheduled', color: 'info' },
  closed:    { label: 'Closed',    color: 'neutral-dark' },
  paused:    { label: 'Paused',    color: 'warning' },
  error:     { label: 'Error',     color: 'danger' },
};

export function StatusBadge({ status, label }) {
  const config = STATUS_MAP[status] || STATUS_MAP.draft;
  return (
    <span className={`${styles.badge} ${styles[config.color]}`}>
      {label || config.label}
    </span>
  );
}
```

---

## 6. Toggle

```jsx
export function Toggle({ checked, onChange, label, disabled = false, id }) {
  const toggleId = id || `toggle-${label?.toLowerCase().replace(/\s/g, '-')}`;
  return (
    <label htmlFor={toggleId} className={styles.toggleWrap}>
      <input
        type="checkbox"
        id={toggleId}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={styles.toggleInput}
      />
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
      {label && <span className={styles.toggleLabel}>{label}</span>}
    </label>
  );
}
```

Toggle track: 44px × 24px, `--radius-full`. Off: bg `--color-neutral-300`. On: bg `--color-accent-600`. Thumb: 20px circle, white, `translateX(0)` off → `translateX(20px)` on. Transition: 150ms.

---

## 7. Avatar

```jsx
export function Avatar({ name, src, size = 'md' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const sizes = { sm: 32, md: 40, lg: 56 };
  const px = sizes[size] || sizes.md;

  return (
    <div className={`${styles.avatar} ${styles[size]}`} style={{ width: px, height: px }}>
      {src ? (
        <img src={src} alt={name} className={styles.avatarImg} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
}
```

Avatar circle: bg `--color-accent-100`, text `--color-accent-700`, font-weight 500. With image: `object-fit: cover`, `border-radius: 50%`.

---

## 8. MetricCard

```jsx
export function MetricCard({ label, value, trend, trendDirection }) {
  return (
    <div className={styles.metricCard}>
      <span className={styles.metricLabel}>{label}</span>
      <div className={styles.metricRow}>
        <span className={styles.metricValue}>{value}</span>
        {trend && (
          <span className={`${styles.trend} ${styles[trendDirection]}`}>
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## 9. RatingScale (Survey-specific)

```jsx
import { useState } from 'react';

export function RatingScale({
  value,
  onChange,
  min = 1,
  max = 5,
  labels = {},    // { 1: 'Strongly disagree', 5: 'Strongly agree' }
  disabled = false,
}) {
  const [hovered, setHovered] = useState(null);
  const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className={styles.ratingScale} role="radiogroup">
      <div className={styles.ratingRow}>
        {points.map((point) => (
          <button
            key={point}
            role="radio"
            aria-checked={value === point}
            aria-label={labels[point] || `Rating ${point}`}
            className={`${styles.ratingCircle} ${value === point ? styles.selected : ''} ${hovered === point ? styles.hovered : ''}`}
            onClick={() => !disabled && onChange(point)}
            onMouseEnter={() => setHovered(point)}
            onMouseLeave={() => setHovered(null)}
            disabled={disabled}
          >
            {point}
          </button>
        ))}
      </div>
      {(labels[min] || labels[max]) && (
        <div className={styles.ratingLabels}>
          <span>{labels[min]}</span>
          <span>{labels[max]}</span>
        </div>
      )}
    </div>
  );
}
```

Rating circle CSS: 44px × 44px, `border-radius: 50%`, border 2px `--color-neutral-300`. Selected: bg `--color-accent-600`, text white, `transform: scale(1.05)`. Hover: border `--color-accent-400`, bg `--color-accent-50`.

---

## 10. SurveyProgress

```jsx
export function SurveyProgress({ current, total }) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className={styles.progressWrap}>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className={styles.progressLabel}>
        {current} of {total} · {percent}%
      </span>
    </div>
  );
}
```

Track: 4px height, `--radius-full`, bg `--color-neutral-200`. Fill: bg `--color-accent-500`, `transition: width 300ms ease`.

---

## Component Composition Example

A complete survey card as it appears on the dashboard:

```jsx
<Card interactive onClick={() => navigate(`/surveys/${survey.id}`)}>
  <Card.Header>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)' }}>
        {survey.title}
      </h3>
      <StatusBadge status={survey.status} />
    </div>
  </Card.Header>
  <Card.Body>
    <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>
      {survey.questionCount} questions · {survey.responseRate}% completion
    </p>
  </Card.Body>
  <Card.Footer>
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      <Avatar name={survey.createdBy} size="sm" />
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
        Created {survey.createdDate}
      </span>
    </div>
  </Card.Footer>
</Card>
```
