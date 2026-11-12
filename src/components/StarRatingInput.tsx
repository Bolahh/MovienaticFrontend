import { useState, type KeyboardEvent } from 'react';

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
};

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.6l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.4l-5.8 3.06 1.11-6.46-4.7-4.58 6.49-.94L12 2.6z" />
    </svg>
  );
}

function ratingLabel(value: number): string {
  if (value === 0) return 'Cualquier rating';
  if (value === 0.5) return 'Media estrella';
  if (value % 1 === 0) {
    return `${value} ${value === 1 ? 'estrella' : 'estrellas'}`;
  }
  const whole = Math.floor(value);
  return `${whole} ${whole === 1 ? 'estrella' : 'estrellas'} y media`;
}

/**
 * Selector de rating mínimo de 0.5 en 0.5 sobre 5 estrellas.
 * La mitad izquierda de cada estrella vale media estrella.
 */
export function StarRatingInput({
  value,
  onChange,
  max = 5,
  className = '',
}: StarRatingInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  const commit = (next: number) => {
    // Volver a pulsar el mismo valor quita el filtro.
    onChange(next === value ? 0 : next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(Math.min(max, value + 0.5));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(Math.max(0, value - 0.5));
    } else if (event.key === 'Home') {
      event.preventDefault();
      onChange(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      onChange(max);
    }
  };

  return (
    <div
      className={`flex h-[50px] items-center justify-between gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 transition-colors focus-within:border-[#c4b5fd] focus-within:ring-2 focus-within:ring-[#8b5cf6]/40 ${className}`}
    >
      <div
        role="radiogroup"
        aria-label="Rating mínimo"
        className="flex items-center"
        onMouseLeave={() => setHover(null)}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: max }, (_, index) => {
          const fill = Math.max(0, Math.min(1, display - index));

          return (
            <span key={index} className="relative h-7 w-7">
              <StarIcon className="absolute inset-0 h-7 w-7 text-[#e2e8f0]" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <StarIcon className="h-7 w-7 text-[#8b5cf6]" />
              </span>

              <button
                type="button"
                onClick={() => commit(index + 0.5)}
                onMouseEnter={() => setHover(index + 0.5)}
                aria-label={ratingLabel(index + 0.5)}
                aria-pressed={value === index + 0.5}
                className="absolute inset-y-0 left-0 w-1/2 rounded-l focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
              />
              <button
                type="button"
                onClick={() => commit(index + 1)}
                onMouseEnter={() => setHover(index + 1)}
                aria-label={ratingLabel(index + 1)}
                aria-pressed={value === index + 1}
                className="absolute inset-y-0 right-0 w-1/2 rounded-r focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
              />
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-sm tabular-nums text-[#64748b]">
          {value.toFixed(1)}
        </span>
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            aria-label="Quitar rating mínimo"
            title="Quitar rating mínimo"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#94a3b8] transition-colors hover:bg-[#ede9fe] hover:text-[#7c3aed]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default StarRatingInput;
