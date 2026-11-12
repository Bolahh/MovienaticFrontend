import Button from './Button';

export function Spinner({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7c3aed"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6a6 6 0 1 0 0 12a6 6 0 0 0 0-12Z" />
    </svg>
  );
}

export function Loading({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-faint">
      <Spinner size={30} />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="surface flex flex-col items-center justify-center gap-4 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </span>
      <p className="text-sm font-medium text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export default Spinner;
