import { useCallback, useEffect, useState } from 'react';
import { useParams } from '../router';
import {
  getMovieDetail,
  getMovieReviews,
  type MovieDetail,
  type Review,
} from '../api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';

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

function RatingStars({
  value,
  size = 'md',
}: {
  value: number;
  size?: 'sm' | 'md';
}) {
  const dimension = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${value.toFixed(1)} de 5 estrellas`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, value - index));

        return (
          <span key={index} className={`relative inline-block ${dimension}`}>
            <StarIcon
              className={`absolute inset-0 ${dimension} text-[#e2e8f0]`}
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <StarIcon className={`${dimension} text-[#8b5cf6]`} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ThumbIcon({
  type,
  className = '',
}: {
  type: 'like' | 'dislike';
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {type === 'like' ? (
        <>
          <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Z" />
          <path d="M7 10l4.2-7.2a1.8 1.8 0 0 1 3.2 1.1V9h4.4a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.6 20H7" />
        </>
      ) : (
        <>
          <path d="M7 14V3H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3Z" />
          <path d="M7 14l4.2 7.2a1.8 1.8 0 0 0 3.2-1.1V15h4.4a2 2 0 0 0 2-2.3l-1.2-7A2 2 0 0 0 17.6 4H7" />
        </>
      )}
    </svg>
  );
}

export function MovieDetailPage() {
  const { movieId } = useParams();
  const auth = useAuthFlow();
  const id = Number(movieId);

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setError('Película no encontrada.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [detail, movieReviews] = await Promise.all([
        getMovieDetail(id),
        getMovieReviews(id).catch(() => [] as Review[]),
      ]);
      setMovie(detail);
      setReviews(movieReviews);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'No se pudo cargar la película.';
      setMovie(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const poster =
    movie?.posterURL ||
    'https://picsum.photos/seed/movienatic-fallback/400/600';
  const genres = (movie?.genres ?? []).filter((genre) => genre?.name);
  const casting = movie?.casting ?? [];
  const averageRating = movie?.averageRating;

  return (
    <div className="min-h-screen bg-white">
      <Navbar onLogin={auth.openLogin} onRegister={auth.openRegister} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <BackLink to="/movies" className="mb-6">
          Volver a películas
        </BackLink>

        {loading ? (
          <Loading message="Cargando película..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : movie ? (
          <>
            {/* Ficha principal */}
            <section className="relative overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#f5f3ff] to-transparent"
              />

              <div className="relative flex flex-col gap-8 md:flex-row">
                <div className="mx-auto w-48 shrink-0 overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-lg sm:w-56 md:mx-0 md:w-64">
                  <div className="aspect-[2/3]">
                    <img
                      src={poster}
                      alt={`Póster de ${movie.title}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                    {movie.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#64748b]">
                    {movie.releaseYear != null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 font-medium text-[#475569]">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M8 3v4M16 3v4M3 10h18" />
                        </svg>
                        {movie.releaseYear}
                      </span>
                    )}

                    {averageRating != null && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f3ff] px-3 py-1 font-semibold text-[#7c3aed]">
                        <StarIcon className="h-4 w-4" />
                        {averageRating.toFixed(1)}
                        {movie.numberOfRatings != null &&
                          movie.numberOfRatings > 0 && (
                            <span className="font-normal text-[#8b5cf6]">
                              ({movie.numberOfRatings}{' '}
                              {movie.numberOfRatings === 1
                                ? 'valoración'
                                : 'valoraciones'}
                              )
                            </span>
                          )}
                      </span>
                    )}

                    <RatingStars value={averageRating ?? 0} />
                  </div>

                  {genres.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <span
                          key={genre.id ?? genre.name}
                          className="rounded-full border border-[#ede9fe] bg-[#f5f3ff] px-3 py-1 text-xs font-medium text-[#7c3aed]"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Sinopsis
                    </h2>
                    <p className="max-w-3xl leading-relaxed text-[#475569]">
                      {movie.description?.trim() ||
                        'Todavía no hay una sinopsis disponible para esta película.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Reparto */}
            <section className="mt-10">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-6 w-1 rounded-full bg-[#8b5cf6]" />
                <h2 className="text-2xl font-bold text-[#0f172a]">Reparto</h2>
                {casting.length > 0 && (
                  <span className="text-sm text-[#94a3b8]">
                    {casting.length}{' '}
                    {casting.length === 1 ? 'persona' : 'personas'}
                  </span>
                )}
              </div>

              {casting.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-4 py-6 text-sm text-[#64748b]">
                  No hay información del reparto para esta película.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {casting.map((member, index) => (
                    <div
                      key={`${member.name}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] text-sm font-bold text-white">
                        {initials(member.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#0f172a]">
                          {member.name}
                        </p>
                        {member.character && (
                          <p className="truncate text-xs text-[#64748b]">
                            {member.character}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Reseñas */}
            <section className="mt-10">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-6 w-1 rounded-full bg-[#8b5cf6]" />
                <h2 className="text-2xl font-bold text-[#0f172a]">Reseñas</h2>
                {reviews.length > 0 && (
                  <span className="text-sm text-[#94a3b8]">
                    {reviews.length}
                  </span>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-4 py-6 text-sm text-[#64748b]">
                  Todavía no hay reseñas para esta película.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {reviews.map((review, index) => (
                    <article
                      key={review.id ?? `${review.timestamp}-${index}`}
                      className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ede9fe] text-xs font-bold text-[#7c3aed]">
                            {initials(review.user?.username || 'Usuario')}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#0f172a]">
                              {review.user?.username || 'Usuario'}
                            </p>
                            <p className="text-xs text-[#94a3b8]">
                              {formatDate(review.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <RatingStars value={review.rating} size="sm" />
                          <span className="text-sm font-semibold text-[#7c3aed]">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 leading-relaxed text-[#475569]">
                        {review.content}
                      </p>

                      <div className="mt-4 flex items-center gap-4 text-xs text-[#94a3b8]">
                        <span className="inline-flex items-center gap-1.5">
                          <ThumbIcon type="like" className="h-4 w-4" />
                          {review.likes}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ThumbIcon type="dislike" className="h-4 w-4" />
                          {review.dislikes}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>

      <Footer />
      {auth.modals}
    </div>
  );
}

export default MovieDetailPage;
