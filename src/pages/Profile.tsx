import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from '../router';
import {
  followUser,
  getFavourites,
  getFollowing,
  getLists,
  getPending,
  getUserDetail,
  getUserReviews,
  getUserIdByUsername,
  unfollowUser,
  type MovieSummary,
  type Review,
  type UserDetail,
  type UserMovieList,
} from '../api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';
import { MovieCard } from '../components/MovieCard';
import { ProfileReviewCard } from '../components/ProfileReviewCard';
import Button from '../components/Button';

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function EmptyState({ children }: { children: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-line/10 bg-surface/60 px-5 py-8 text-sm text-faint">
      {children}
    </p>
  );
}

function SectionHeader({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <span className="eyebrow mb-2.5">{eyebrow}</span>
        <h2 className="section-title">{title}</h2>
      </div>
      {count != null && count > 0 && (
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
          {count}
        </span>
      )}
    </div>
  );
}

/**
 * Fila de previsualización: máximo 5 películas en una sola fila horizontal.
 * En pantallas pequeñas se puede desplazar lateralmente.
 */
function MovieRow({ movies }: { movies: MovieSummary[] }) {
  return (
    <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
      {movies.slice(0, 6).map((movie) => (
        <div
          key={movie.id}
          className="w-[130px] shrink-0 snap-start sm:w-[150px] lg:w-[160px]"
        >
          <MovieCard
            id={movie.id}
            title={movie.title}
            releaseYear={movie.releaseYear}
            averageRating={movie.averageRating}
            posterURL={movie.posterURL}
            to={`/movies/${movie.id}`}
          />
        </div>
      ))}
    </div>
  );
}

function FullListButton({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-line/10 bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-all hover:-translate-y-px hover:bg-surface-2"
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

/**
 * Tarjeta resumen de una lista: muestra una rejilla con los primeros pósters
 * y enlaza a la vista completa de la lista.
 */
function ListPreviewCard({
  list,
  userId,
}: {
  list: UserMovieList;
  userId: number;
}) {
  const posters = (list.previewPosters ?? []).slice(0, 6);
  const placeholders = Math.max(0, 6 - posters.length);

  return (
    <Link
      to={`/users/${userId}/lists/${list.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line/10 bg-surface transition-all hover:-translate-y-0.5 hover:border-line/20 hover:shadow-lg"
    >
      <div className="grid grid-cols-6 gap-px bg-line/10">
        {posters.map((poster, index) => (
          <div
            key={`${poster}-${index}`}
            className="relative aspect-[2/3] overflow-hidden bg-ink/5"
          >
            <img
              src={poster}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(event) => {
                event.currentTarget.style.visibility = 'hidden';
              }}
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
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold text-ink group-hover:text-accent">
          {list.name}
        </h3>
        {list.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {list.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-faint">
            {list.movieCount} {list.movieCount === 1 ? 'película' : 'películas'}
          </span>
          <span className="text-xs font-semibold text-accent">
            Ver lista completa →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProfilePage() {
  const { userId: routeUserId } = useParams();
  const auth = useAuthFlow();
  const routeId = routeUserId ? Number(routeUserId) : null;

  const [viewerId, setViewerId] = useState<number | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [favourites, setFavourites] = useState<MovieSummary[]>([]);
  const [pending, setPending] = useState<MovieSummary[]>([]);
  const [lists, setLists] = useState<UserMovieList[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  // Resolvemos qué perfil hay que mostrar: el de la URL o el del usuario logueado.
  useEffect(() => {
    if (routeId != null && Number.isFinite(routeId) && routeId > 0) {
      setProfileId(routeId);
      return;
    }

    if (!auth.isAuthenticated || !auth.username) {
      setProfileId(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    getUserIdByUsername(auth.username)
      .then((id) => {
        if (!cancelled) setProfileId(id);
      })
      .catch(() => {
        if (cancelled) return;
        setError('No se pudo cargar tu perfil.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [routeId, auth.isAuthenticated, auth.username]);

  // Id del usuario que está mirando (para saber si sigue al perfil).
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.username) {
      setViewerId(null);
      return;
    }

    let cancelled = false;
    getUserIdByUsername(auth.username)
      .then((id) => {
        if (!cancelled) setViewerId(id);
      })
      .catch(() => {
        if (!cancelled) setViewerId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.username]);

  const load = useCallback(async () => {
    if (profileId == null) return;

    setLoading(true);
    setError('');

    try {
      const [userDetail, favs, pend, userLists, userReviews] = await Promise.all([
        getUserDetail(profileId),
        getFavourites(profileId),
        getPending(profileId),
        getLists(profileId),
        getUserReviews(profileId),
      ]);

      setDetail(userDetail);
      setFavourites(favs ?? []);
      setPending(pend ?? []);
      setLists(userLists ?? []);
      setReviews(userReviews ?? []);
    } catch (e) {
      const status = (e as { status?: number }).status;
      setError(
        status === 401
          ? 'Inicia sesión para ver los perfiles.'
          : e instanceof Error
            ? e.message
            : 'No se pudo cargar el perfil.',
      );
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  // Saber si el usuario actual sigue al perfil visitado.
  useEffect(() => {
    if (viewerId == null || profileId == null || viewerId === profileId) {
      setIsFollowing(false);
      return;
    }

    let cancelled = false;
    getFollowing(viewerId)
      .then((users) => {
        if (!cancelled) {
          setIsFollowing(users.some((user) => user.id === profileId));
        }
      })
      .catch(() => {
        if (!cancelled) setIsFollowing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewerId, profileId]);

  const isOwnProfile =
    profileId != null &&
    (routeId == null || (viewerId != null && viewerId === profileId));

  const handleFollow = async () => {
    if (!auth.isAuthenticated) {
      auth.openLogin();
      return;
    }
    if (viewerId == null || profileId == null || viewerId === profileId) return;

    setFollowBusy(true);
    try {
      if (isFollowing) await unfollowUser(viewerId, profileId);
      else await followUser(viewerId, profileId);

      setIsFollowing(!isFollowing);

      const userDetail = await getUserDetail(profileId);
      setDetail(userDetail);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo actualizar el seguimiento.',
      );
    } finally {
      setFollowBusy(false);
    }
  };

  const stats = detail
    ? [
        { label: 'Reseñas', value: detail.reviewCount },
        { label: 'Favoritas', value: detail.favouriteCount },
        { label: 'Pendientes', value: detail.pendingCount },
        { label: 'Listas', value: detail.listCount },
      ]
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLogin={auth.openLogin} onRegister={auth.openRegister} />

      <main className="page-container flex-1 py-10 sm:py-14">
        <BackLink to="/" back className="mb-7">
          Volver
        </BackLink>

        {!auth.isAuthenticated && routeId == null ? (
          <div className="surface flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-ink">
                Inicia sesión para ver tu perfil
              </h1>
              <p className="mt-1 text-sm text-muted">
                Consulta tus listas, favoritas, pendientes y reseñas.
              </p>
            </div>
            <Button onClick={auth.openLogin}>Iniciar sesión</Button>
          </div>
        ) : loading ? (
          <Loading message="Cargando perfil..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : detail ? (
          <>
            {/* Cabecera con información y estadísticas */}
            <section className="surface overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-2xl font-bold text-white">
                    {detail.photoURL ? (
                      <img
                        src={detail.photoURL}
                        alt={detail.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(detail.username)
                    )}
                  </span>
                  <div>
                    <span className="eyebrow mb-2">
                      {isOwnProfile ? 'Tu perfil' : 'Perfil público'}
                    </span>
                    <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink">
                      {detail.username}
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                      {isOwnProfile
                        ? 'Este es tu espacio: listas, favoritas, pendientes y reseñas.'
                        : 'Descubre las listas y reseñas de este usuario.'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to={`/users/${detail.id}/followers`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line/10 bg-ink/[0.03] px-3 py-1 text-sm text-muted transition-colors hover:border-accent/30 hover:bg-accent-soft hover:text-accent"
                      >
                        <strong className="font-heading text-base font-bold text-ink">
                          {detail.followersCount}
                        </strong>
                        Seguidores
                      </Link>
                      <Link
                        to={`/users/${detail.id}/following`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line/10 bg-ink/[0.03] px-3 py-1 text-sm text-muted transition-colors hover:border-accent/30 hover:bg-accent-soft hover:text-accent"
                      >
                        <strong className="font-heading text-base font-bold text-ink">
                          {detail.followingCount}
                        </strong>
                        Siguiendo
                      </Link>
                    </div>
                  </div>
                </div>

                {!isOwnProfile && (
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? 'secondary' : 'primary'}
                    disabled={followBusy}
                    className="shrink-0"
                  >
                    {followBusy
                      ? 'Guardando…'
                      : isFollowing
                        ? 'Dejar de seguir'
                        : 'Seguir'}
                  </Button>
                )}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-line/10 bg-ink/[0.03] px-4 py-3"
                  >
                    <p className="font-heading text-2xl font-bold text-ink">
                      {stat.value}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Favoritas */}
            <section className="mt-14">
              <SectionHeader
                eyebrow="Siempre a mano"
                title="Películas favoritas"
                count={favourites.length}
              />
              {favourites.length === 0 ? (
                <EmptyState>Este usuario no tiene películas favoritas.</EmptyState>
              ) : (
                <>
                  <MovieRow movies={favourites} />
                  <FullListButton to={`/users/${detail.id}/favourites`}>
                    Ver lista de favoritas completa
                  </FullListButton>
                </>
              )}
            </section>

            {/* Pendientes */}
            <section className="mt-14">
              <SectionHeader
                eyebrow="Para más adelante"
                title="Películas pendientes"
                count={pending.length}
              />
              {pending.length === 0 ? (
                <EmptyState>No hay películas pendientes.</EmptyState>
              ) : (
                <>
                  <MovieRow movies={pending} />
                  <FullListButton to={`/users/${detail.id}/pending`}>
                    Ver lista de pendientes completa
                  </FullListButton>
                </>
              )}
            </section>

            {/* Listas creadas */}
            <section className="mt-14">
              <SectionHeader
                eyebrow="Colecciones"
                title="Listas creadas"
                count={lists.length}
              />
              {lists.length === 0 ? (
                <EmptyState>Este usuario todavía no ha creado listas.</EmptyState>
              ) : (
                <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
                  {lists.map((list) => (
                    <div
                      key={list.id}
                      className="w-[260px] shrink-0 snap-start sm:w-[300px]"
                    >
                      <ListPreviewCard list={list} userId={detail.id} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Reseñas */}
            <section className="mt-14">
              <SectionHeader
                eyebrow="Su opinión"
                title="Reseñas"
                count={reviews.length}
              />
              {reviews.length === 0 ? (
                <EmptyState>Este usuario todavía no ha escrito reseñas.</EmptyState>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {reviews.slice(0, 6).map((review, index) => (
                      <ProfileReviewCard
                        key={review.id ?? `${review.timestamp}-${index}`}
                        review={review}
                      />
                    ))}
                  </div>
                  <FullListButton to={`/users/${detail.id}/reviews`}>
                    Ver todas las reseñas
                  </FullListButton>
                </>
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

export default ProfilePage;
