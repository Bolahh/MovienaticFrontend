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
      <div className="relative h-64 overflow-hidden">
        <img
          src={displayPoster}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {displayRating != null && (
          <div className="absolute right-2 top-2 rounded-lg bg-[#8b5cf6] px-2 py-1 text-xs font-bold text-white">
            {displayRating.toFixed(1)}★
          </div>
        )}
        {displayYear != null && (
          <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">
            {displayYear}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 font-semibold text-[#0f172a]">{title}</h3>
        {displayGenre && (
          <p className="mt-1 text-xs text-[#64748b]">{displayGenre}</p>
        )}
      </div>
    </>
  );

  const classNameDefault =
    'group block rounded-xl overflow-hidden shadow-sm border border-[#e2e8f0] bg-white hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2';
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
