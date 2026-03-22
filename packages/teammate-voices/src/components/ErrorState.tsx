
interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          fontSize: '1.25rem',
          color: '#DC2626',
        }}
      >
        !
      </div>
      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
      <p style={{ margin: '0.5rem 0 0', color: '#6B7280', fontSize: '0.875rem' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1.5rem',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Retry
        </button>
      )}
    </div>
  )
}
