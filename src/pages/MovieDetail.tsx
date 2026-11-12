import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams } from '../router';
import {
  addReview,
  getMovieDetail,
  getMovieReviews,
  getUserIdByUsername,
  type MovieDetail,
  type Review,
} from '../api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';
import Button from '../components/Button';

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
              className={`absolute inset-0 ${dimension} text-ink/10`}
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <StarIcon className={`${dimension} text-accent`} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function RatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div
      role="radiogroup"
      aria-label="Tu valoración"
      className="flex items-center gap-1"
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, display - index));

        return (
          <span key={index} className="relative h-9 w-9">
            <StarIcon className="absolute inset-0 h-9 w-9 text-ink/10" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <StarIcon className="h-9 w-9 text-accent" />
            </span>

            <button
              type="button"
              onClick={() => onChange(index + 0.5)}
              onMouseEnter={() => setHover(index + 0.5)}
              aria-label={`${index + 0.5} estrellas`}
              aria-pressed={value === index + 0.5}
              className="absolute inset-y-0 left-0 w-1/2 rounded-l focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <button
              type="button"
              onClick={() => onChange(index + 1)}
              onMouseEnter={() => setHover(index + 1)}
              aria-label={`${index + 1} estrellas`}
              aria-pressed={value === index + 1}
              className="absolute inset-y-0 right-0 w-1/2 rounded-r focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </span>
        );
      })}
      <span className="ml-2 text-sm font-semibold tabular-nums text-accent">
        {value.toFixed(1)}
      </span>
    </div>
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

  // Formulario de nueva reseña
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

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

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth.isAuthenticated || !auth.username) {
      auth.openLogin();
      return;
    }

    const content = reviewContent.trim();
    if (reviewRating < 0.5) {
      setReviewError('Selecciona una valoración de al menos media estrella.');
      return;
    }
    if (!content) {
      setReviewError('Escribe el texto de tu reseña.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const userId = await getUserIdByUsername(auth.username);
      await addReview(userId, { movieId: id, content, rating: reviewRating });

      setReviewContent('');
      setReviewRating(0);
      setReviewSuccess('Reseña publicada correctamente.');

      // Actualización optimista: la media y el número de valoraciones cambian
      // al instante, sin esperar al refresco de la ficha.
      setMovie((prev) => {
        if (!prev) return prev;
        const baseCount = prev.numberOfRatings ?? reviews.length;
        const baseAverage =
          prev.averageRating ??
          (reviews.length
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0);
        const nextCount = baseCount + 1;
        const nextAverage =
          baseCount > 0
            ? (baseAverage * baseCount + reviewRating) / nextCount
            : reviewRating;
        return {
          ...prev,
          averageRating: nextAverage,
          numberOfRatings: nextCount,
        };
      });

      // Refrescamos la ficha y la lista para reflejar la nueva media y reseña.
      const [detail, movieReviews] = await Promise.all([
        getMovieDetail(id),
        getMovieReviews(id),
      ]);
      setMovie(detail);
      setReviews(movieReviews);
    } catch (e) {
      const status = (e as { status?: number }).status;
      setReviewError(
        status === 409
          ? 'Ya has escrito una reseña para esta película.'
          : e instanceof Error
            ? e.message
            : 'No se pudo publicar la reseña.',
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const poster =
    movie?.posterURL ||
    'https://picsum.photos/seed/movienatic-fallback/400/600';
  const genres = (movie?.genres ?? []).filter((genre) => genre?.name);
  const casting = movie?.casting ?? [];
  const averageRating = movie?.averageRating;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLogin={auth.openLogin} onRegister={auth.openRegister} />

      <main className="page-container flex-1 py-10 sm:py-14">
        <BackLink to="/movies" className="mb-7">
          Volver a películas
        </BackLink>

        {loading ? (
          <Loading message="Cargando película..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : movie ? (
          <>
            {/* Ficha principal */}
            <section className="relative isolate overflow-hidden rounded-[2rem] border border-line/10 bg-surface shadow-[0_40px_90px_-60px_rgba(16,12,30,0.55)]">
              {/* Póster desenfocado como atmósfera */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <img
                  src={poster}
                  alt=""
                  className="h-full w-full scale-110 object-cover opacity-30 blur-3xl"
                />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-surface/85 via-surface/92 to-surface-2/95"
              />

              <div className="relative flex flex-col gap-8 p-6 sm:p-9 md:flex-row md:gap-10 lg:p-10">
                <div className="mx-auto w-44 shrink-0 overflow-hidden rounded-2xl bg-ink/5 shadow-[0_30px_60px_-30px_rgba(16,12,30,0.7)] ring-1 ring-line/10 sm:w-52 md:mx-0 md:w-60 lg:w-64">
                  <div className="relative aspect-[2/3] bg-gradient-to-br from-[#241d38] via-[#191524] to-[#12212e]">
                    <img
                      src={poster}
                      alt={`Póster de ${movie.title}`}
                      onError={(event) => {
                        event.currentTarget.style.visibility = 'hidden';
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="eyebrow mb-4">Ficha de película</span>
                  <h1 className="font-heading text-3xl font-extrabold leading-[1.06] tracking-[-0.03em] text-ink sm:text-4xl lg:text-5xl">
                    {movie.title}
                  </h1>

                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2.5 text-sm text-muted">
                    {movie.releaseYear != null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-line/10 bg-surface/80 px-3 py-1 font-medium text-muted backdrop-blur-sm">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M8 3v4M16 3v4M3 10h18" />
                        </svg>
                        {movie.releaseYear}
                      </span>
                    )}

                    {averageRating != null && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 font-semibold text-white">
                        <StarIcon className="h-3.5 w-3.5 text-[#c4b5fd]" />
                        {averageRating.toFixed(1)}
                        {movie.numberOfRatings != null &&
                          movie.numberOfRatings > 0 && (
                            <span className="font-normal text-white/60">
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
                          className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-7 border-t border-line/10 pt-6">
                    <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                      Sinopsis
                    </h2>
                    <p className="max-w-3xl text-[15px] leading-relaxed text-muted text-pretty">
                      {movie.description?.trim() ||
                        'Todavía no hay una sinopsis disponible para esta película.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Reparto */}
            <section className="mt-14">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <span className="eyebrow mb-3">Quién aparece</span>
                  <h2 className="section-title">Reparto</h2>
                </div>
                {casting.length > 0 && (
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                    {casting.length} {casting.length === 1 ? 'persona' : 'personas'}
                  </span>
                )}
              </div>

              {casting.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line/10 bg-surface/60 px-5 py-8 text-sm text-faint">
                  No hay información del reparto para esta película.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {casting.map((member, index) => (
                    <div
                      key={`${member.name}-${index}`}
                      className="group flex items-center gap-3 rounded-2xl border border-line/10 bg-surface p-3.5 transition-all hover:-translate-y-0.5 hover:border-line/15 hover:shadow-[0_18px_36px_-24px_rgba(16,12,30,0.4)]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold tracking-wide text-white">
                        {initials(member.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {member.name}
                        </p>
                        {member.character && (
                          <p className="truncate text-xs text-faint">
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
            <section className="mt-14">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <span className="eyebrow mb-3">La comunidad opina</span>
                  <h2 className="section-title">Reseñas</h2>
                </div>
                {reviews.length > 0 && (
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                    {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                  </span>
                )}
              </div>

              {auth.isAuthenticated ? (
                <div className="surface mb-6 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-ink">
                        Escribe tu reseña
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        Puntúa la película y comparte tu opinión con la comunidad.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-line/10 bg-ink/5 px-3 py-1 text-xs text-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Publicando como{' '}
                      <strong className="font-semibold text-ink">{auth.username}</strong>
                    </span>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="mt-5">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                      Tu valoración
                    </span>
                    <RatingPicker
                      value={reviewRating}
                      onChange={(value) => {
                        setReviewRating(value);
                        setReviewError('');
                        setReviewSuccess('');
                      }}
                    />

                    <label
                      htmlFor="review-content"
                      className="mb-2 mt-5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint"
                    >
                      Tu reseña
                    </label>
                    <textarea
                      id="review-content"
                      value={reviewContent}
                      onChange={(event) => {
                        setReviewContent(event.target.value);
                        setReviewError('');
                        setReviewSuccess('');
                      }}
                      rows={4}
                      maxLength={1000}
                      placeholder="¿Qué te ha parecido la película?"
                      className="w-full resize-y rounded-xl border border-transparent bg-ink/5 px-3.5 py-3 text-sm leading-relaxed text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-faint">
                        {reviewContent.length}/1000 caracteres
                      </span>
                      <Button
                        type="submit"
                        disabled={
                          reviewSubmitting ||
                          reviewRating < 0.5 ||
                          !reviewContent.trim()
                        }
                        className="w-full sm:w-auto"
                      >
                        {reviewSubmitting ? 'Publicando…' : 'Publicar reseña'}
                      </Button>
                    </div>

                    {reviewError && (
                      <p
                        role="alert"
                        className="mt-3 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
                      >
                        {reviewError}
                      </p>
                    )}
                    {reviewSuccess && (
                      <p
                        role="status"
                        className="mt-3 rounded-xl border border-accent/20 bg-accent-soft px-3.5 py-2.5 text-sm text-accent"
                      >
                        {reviewSuccess}
                      </p>
                    )}
                  </form>
                </div>
              ) : (
                <div className="surface mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-ink">
                      ¿Quieres dejar tu reseña?
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      Inicia sesión para puntuar y compartir tu opinión.
                    </p>
                  </div>
                  <Button onClick={auth.openLogin} className="shrink-0">
                    Iniciar sesión para reseñar
                  </Button>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line/10 bg-surface/60 px-5 py-8 text-sm text-faint">
                  Todavía no hay reseñas para esta película.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {reviews.map((review, index) => (
                    <article
                      key={review.id ?? `${review.timestamp}-${index}`}
                      className="rounded-2xl border border-line/10 bg-surface p-5 shadow-[0_1px_2px_rgba(16,12,30,0.03)] transition-all hover:border-line/15 hover:shadow-[0_22px_44px_-30px_rgba(16,12,30,0.4)] sm:p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                            {initials(review.user?.username || 'Usuario')}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {review.user?.username || 'Usuario'}
                            </p>
                            <p className="text-xs text-faint">
                              {formatDate(review.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <RatingStars value={review.rating} size="sm" />
                          <span className="text-sm font-semibold text-accent">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 text-[15px] leading-relaxed text-muted text-pretty">
                        {review.content}
                      </p>

                      <div className="mt-5 flex items-center gap-4 border-t border-line/10 pt-4 text-xs text-faint">
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
