import type { ReactNode } from 'react';
import { Link } from '../router';

type BackLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
};

/**
 * Enlace de vuelta con icono en cápsula, coherente con el resto de la UI.
 */
export function BackLink({ to, children, className = '' }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={`group inline-flex self-start items-center gap-2 rounded-full border border-line/10 bg-surface py-1.5 pl-1.5 pr-4 text-[13px] font-medium text-muted shadow-[0_1px_2px_rgba(16,12,30,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-line/20 hover:text-ink hover:shadow-[0_12px_28px_-16px_rgba(16,12,30,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${className}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/5 text-muted transition-colors duration-200 group-hover:bg-accent-strong group-hover:text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          aria-hidden="true"
        >
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      </span>
      {children}
    </Link>
  );
}

export default BackLink;
