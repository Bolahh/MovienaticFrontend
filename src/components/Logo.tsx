import { useId } from 'react';
import { Link } from '../router';

type LogoMarkProps = {
  size?: number;
  className?: string;
};

/**
 * Marca de Movienatic: una celda de película (perforaciones laterales)
 * con un botón de reproducción. Se dibuja en SVG para que escale sin pérdida.
 */
export function LogoMark({ size = 40, className = '' }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '');
  const gradientId = `mv-logo-gradient-${uid}`;
  const shineId = `mv-logo-shine-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Movienatic"
      className={className}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="6"
          y1="3"
          x2="42"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#a78bfa" />
          <stop offset="0.5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient
          id={shineId}
          x1="8"
          y1="4"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Insignia */}
      <rect x="1" y="1" width="46" height="46" rx="14" fill={`url(#${gradientId})`} />
      <rect x="1" y="1" width="46" height="46" rx="14" fill={`url(#${shineId})`} />

      {/* Perforaciones de la tira de película */}
      <rect x="7.5" y="12.5" width="4" height="6" rx="2" fill="#ffffff" fillOpacity="0.82" />
      <rect x="7.5" y="21" width="4" height="6" rx="2" fill="#ffffff" fillOpacity="0.82" />
      <rect x="7.5" y="29.5" width="4" height="6" rx="2" fill="#ffffff" fillOpacity="0.82" />

      {/* Play */}
      <path
        d="M20 16.2c0-1.25 1.35-2.03 2.44-1.4l14.1 8.04c1.09.62 1.09 2.18 0 2.8l-14.1 8.04c-1.09.62-2.44-.15-2.44-1.4V16.2Z"
        fill="#ffffff"
      />
    </svg>
  );
}

type LogoProps = {
  size?: number;
  withWordmark?: boolean;
  to?: string | null;
  className?: string;
};

/** Logo completo: marca + wordmark «movienatic». */
export function Logo({
  size = 38,
  withWordmark = true,
  to = '/',
  className = '',
}: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span
          className="font-bold tracking-tight text-[#0f172a] leading-none"
          style={{ fontSize: Math.round(size * 0.56) }}
        >
          <span className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] bg-clip-text text-transparent">
            Movie
          </span>
          natic
        </span>
      )}
    </span>
  );

  if (!to) return content;

  return (
    <Link
      to={to}
      aria-label="Movienatic — Inicio"
      className="inline-flex items-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}

export default Logo;
