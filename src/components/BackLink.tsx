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
      className={`group inline-flex self-start items-center gap-2 rounded-full border border-[#e2e8f0] bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-[#475569] shadow-sm transition-all duration-200 hover:border-[#c4b5fd] hover:text-[#7c3aed] hover:shadow-[0_6px_18px_-8px_rgba(124,58,237,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2 ${className}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f3ff] text-[#7c3aed] transition-colors duration-200 group-hover:bg-[#ede9fe]">
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
