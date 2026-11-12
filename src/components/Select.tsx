import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

/**
 * Desplegable con el mismo lenguaje visual que el resto de la página.
 * Mantiene navegación por teclado y cierre al hacer clic fuera.
 */
export function Select({
  value,
  onChange,
  options,
  className = '',
  disabled = false,
  ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex] ?? options[0];

  // Cierra al pulsar fuera.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  // Al abrir, sitúa la opción activa sobre la seleccionada.
  useEffect(() => {
    if (open) {
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, selectedIndex]);

  // Mantiene visible la opción activa dentro del listado.
  useEffect(() => {
    if (!open) return;

    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    );
    item?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const commit = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(options.length - 1, index + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(activeIndex);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent bg-ink/5 px-3.5 py-2.5 text-left text-sm text-ink transition-colors hover:bg-ink/10 focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <ChevronIcon
          className={`h-4 w-4 shrink-0 text-faint transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border border-line/10 bg-surface p-1.5 shadow-[0_24px_60px_-20px_rgba(16,12,30,0.35)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <li
                key={option.value || `option-${index}`}
                role="option"
                aria-selected={isSelected}
                data-index={index}
              >
                <button
                  type="button"
                  onClick={() => commit(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-muted'
                  } ${isSelected ? 'font-medium' : ''}`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <CheckIcon className="h-4 w-4 shrink-0 text-accent" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Select;
