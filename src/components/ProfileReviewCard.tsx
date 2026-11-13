import { Link } from '../router';
import type { Review } from '../api';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function Stars({ value }: { value: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-sm"
      aria-label={`${value.toFixed(1)} de 5 estrellas`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < Math.round(value) ? 'text-accent' : 'text-ink/15'}
        >
          ★
        </span>
      ))}
      <span className="ml-1.5 font-semibold text-accent">
        {value.toFixed(1)}
      </span>
    </span>
  );
}

/** Tarjeta de reseña usada en el perfil y en la lista completa de reseñas. */
export function ProfileReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex gap-4 rounded-2xl border border-line/10 bg-surface p-4 sm:p-5">
      <Link
        to={`/movies/${review.movieId}`}
        className="relative block h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-ink/5 ring-1 ring-line/10"
        aria-label={`Ver ${review.movieTitle ?? 'la película'}`}
      >
        <img
          src={
            review.moviePosterURL ||
            `https://picsum.photos/seed/movienatic-${review.movieId}/200/300`
          }
          alt={review.movieTitle ?? 'Película'}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.visibility = 'hidden';
          }}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link
            to={`/movies/${review.movieId}`}
            className="font-heading text-base font-semibold text-ink hover:text-accent"
          >
            {review.movieTitle ?? `Película #${review.movieId}`}
          </Link>
          <Stars value={review.rating} />
        </div>

        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted">
          {review.content}
        </p>

        <p className="mt-3 text-xs text-faint">
          {formatDate(review.timestamp)}
        </p>
      </div>
    </article>
  );
}

export default ProfileReviewCard;
