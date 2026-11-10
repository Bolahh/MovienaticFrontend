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
}: MovieCardProps) {
  const displayYear = year ?? releaseYear ?? '—';
  const displayRating = rating ?? averageRating ?? 0;
  const displayPoster =
    posterURL ||
    poster ||
    'https://picsum.photos/seed/movienatic-fallback/400/600';
  const displayGenre = genre || genres?.[0]?.name;

  return (
    <article className="rounded-xl overflow-hidden shadow-sm border border-[#e2e8f0] bg-white hover:shadow-md transition-shadow group">
      <div className="relative h-64 overflow-hidden">
        <img
          src={displayPoster}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-[#8b5cf6] text-white text-xs font-bold px-2 py-1 rounded-lg">
          {displayRating.toFixed(1)}★
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
          {displayYear}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-[#0f172a] line-clamp-2">{title}</h3>
        {displayGenre && (
          <p className="text-xs text-[#64748b] mt-1">{displayGenre}</p>
        )}
      </div>
    </article>
  );
}

export default MovieCard;
