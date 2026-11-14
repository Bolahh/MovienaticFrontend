import { Link } from '../router';
import type { MovieList } from '../api';

type PublicListCardProps = {
  list: MovieList;
  liked?: boolean;
  likeBusy?: boolean;
  onToggleLike?: () => void;
};

/**
 * Tarjeta de lista pública con sus pósters, autor y número de likes.
 * Se usa en la portada y en la página Social.
 */
export function PublicListCard({
  list,
  liked = false,
  likeBusy = false,
  onToggleLike,
}: PublicListCardProps) {
  const posters = (list.previewPosters ?? []).slice(0, 4);
  const placeholders = Math.max(0, 4 - posters.length);
  const listUrl = `/users/${list.userId}/lists/${list.id}`;
  const authorName = list.username || list.user?.username || 'Usuario';
  const authorId = list.userId ?? list.user?.id;
  const movieCount = list.movieCount ?? list.movies?.length ?? 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-line/10 bg-surface shadow-[0_1px_2px_rgba(16,12,30,0.03)] transition-all hover:-translate-y-0.5 hover:border-line/15 hover:shadow-[0_30px_60px_-40px_rgba(16,12,30,0.5)]">
      <Link
        to={listUrl}
        aria-label={`Ver la lista ${list.name}`}
        className="grid grid-cols-4 gap-px bg-line/10"
      >
        {posters.map((poster, index) => (
          <div
            key={`${poster}-${index}`}
            className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-[#241d38] via-[#191524] to-[#12212e]"
          >
            <img
              src={poster}
              alt=""
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.visibility = 'hidden';
              }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>
        ))}
        {Array.from({ length: placeholders }, (_, index) => (
          <div
            key={`placeholder-${index}`}
            aria-hidden="true"
            className="aspect-[2/3] bg-gradient-to-br from-[#241d38] via-[#191524] to-[#12212e]"
          />
        ))}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          {authorId != null ? (
            <Link
              to={`/users/${authorId}`}
              className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-ink transition-colors hover:text-accent"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold uppercase text-white">
                {authorName.charAt(0)}
              </span>
              <span className="truncate">{authorName}</span>
            </Link>
          ) : (
            <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-ink">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold uppercase text-white">
                {authorName.charAt(0)}
              </span>
              <span className="truncate">{authorName}</span>
            </span>
          )}

          {onToggleLike ? (
            <button
              type="button"
              onClick={onToggleLike}
              disabled={likeBusy}
              aria-pressed={liked}
              aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-60 ${
                liked
                  ? 'bg-accent text-white'
                  : 'bg-accent-soft text-accent hover:bg-accent/15'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M12 21s-7.5-4.6-9.6-9.1C.8 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.4.4.6.6 1.2.6 1.2h2.8s.2-.6.6-1.2C14.8 6.1 16.2 5 18.2 5c3.4 0 5 3.6 3.4 6.9C19.5 16.4 12 21 12 21Z" />
              </svg>
              {list.likeCount ?? 0}
            </button>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M12 21s-7.5-4.6-9.6-9.1C.8 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.4.4.6.6 1.2.6 1.2h2.8s.2-.6.6-1.2C14.8 6.1 16.2 5 18.2 5c3.4 0 5 3.6 3.4 6.9C19.5 16.4 12 21 12 21Z" />
              </svg>
              {list.likeCount ?? 0}
            </span>
          )}
        </div>

        <Link
          to={listUrl}
          className="font-heading text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-accent"
        >
          {list.name}
        </Link>

        {list.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {list.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs">
          <span className="text-faint">
            {movieCount} {movieCount === 1 ? 'película' : 'películas'}
          </span>
          <Link
            to={listUrl}
            className="inline-flex items-center gap-1 font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            Ver lista
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m18 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PublicListCard;
