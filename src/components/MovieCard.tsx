import { Link } from '../router';

type MovieCardProps = {
  id: number;
  title: string;
  // Formato API (mock)
  releaseYear?: number;
  averageRating?: number | null;
  posterURL?: string | null;
  genres?: { id: number; name: string }[];
  // Formato simplificado usado en algunas secciones
  year?: number;
  rating?: number;
  poster?: string;
  genre?: string;
  /** Si se indica, toda la tarjeta enlaza a la ficha de la película. */
  to?: string;
  className?: string;
};

export function MovieCard({
  id,
  title,
  releaseYear,
  averageRating,
  posterURL,
  genres,
  year,
  rating,
  poster,
  genre,
  to,
  className,
}: MovieCardProps) {
  const displayYear = year ?? releaseYear;
  const displayRating = rating ?? averageRating ?? undefined;
  const displayPoster =
    posterURL ||
    poster ||
    'https://picsum.photos/seed/movienatic-fallback/400/600';
  const displayGenre = genre || genres?.[0]?.name;

  const content = (
    <>
      <div className="relative aspect-[2/3] overflow-hidden bg-ink/5">
        {/* Fondo de reserva mientras carga el póster */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#241d38] via-[#191524] to-[#12212e]"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-accent/30"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M7.5 3v18M16.5 3v18M3 7.5h4.5M3 12h18M3 16.5h4.5M16.5 7.5H21M16.5 16.5H21" />
        </svg>
        <img
          src={displayPoster}
          alt={title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.visibility = 'hidden';
          }}
          className="relative h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
        />

        {/* Velo inferior para legibilidad de los chips */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80" />

        {displayRating != null && displayRating > 0 && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md ring-1 ring-white/15">
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-[#c4b5fd]" aria-hidden="true">
              <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z" />
            </svg>
            {displayRating.toFixed(1)}
          </div>
        )}

        {displayYear != null && (
          <div className="absolute bottom-2.5 left-2.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md ring-1 ring-white/20">
            {displayYear}
          </div>
        )}

        {/* Indicador de "ver ficha" al hover */}
        {to && (
          <div className="pointer-events-none absolute bottom-2.5 right-2.5 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-surface text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </div>
        )}
      </div>

      <div className="px-3.5 pb-4 pt-3.5">
        <h3 className="line-clamp-2 font-heading text-[15px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
          {title}
        </h3>
        {displayGenre && (
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
            {displayGenre}
          </p>
        )}
      </div>
    </>
  );

  const classNameDefault =
    'group relative block overflow-hidden rounded-2xl border border-line/10 bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-line/15 hover:shadow-[0_26px_50px_-26px_rgba(16,12,30,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';
  const resolvedClassName = `${classNameDefault} ${className ?? ''}`.trim();

  if (to) {
    return (
      <Link
        to={to}
        className={resolvedClassName}
        aria-label={`Ver detalles de ${title}`}
        data-movie-id={id}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={resolvedClassName} data-movie-id={id}>
      {content}
    </article>
  );
}

export default MovieCard;
