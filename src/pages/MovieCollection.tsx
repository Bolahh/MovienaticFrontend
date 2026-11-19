import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from '../router';
import {
  getFavourites,
  getPending,
  getUserDetail,
  type MovieSummary,
  type UserDetail,
} from '../api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';
import { MovieCard } from '../components/MovieCard';
import Button from '../components/Button';

export function MovieCollectionPage() {
  const { userId } = useParams();
  const location = useLocation();
  const auth = useAuthFlow();

  const profileId = userId ? Number(userId) : null;
  const pathname = location.split('?')[0];
  const mode = pathname.endsWith('/pending') ? 'pending' : 'favourites';

  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 20;

  const isPending = mode === 'pending';
  const title = isPending ? 'Películas pendientes' : 'Películas favoritas';
  const eyebrow = isPending ? 'Para más adelante' : 'Siempre a mano';
  const emptyMessage = isPending
    ? 'Este usuario no tiene películas pendientes.'
    : 'Este usuario no tiene películas favoritas.';

  const load = async () => {
    if (profileId == null || !Number.isFinite(profileId) || profileId <= 0) {
      setError('El usuario indicado no existe.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [userDetail, collection] = await Promise.all([
        getUserDetail(profileId),
        isPending
          ? getPending(profileId, { page, size })
          : getFavourites(profileId, { page, size }),
      ]);

      setDetail(userDetail);
      setMovies(collection.content ?? []);
      setTotalPages(collection.totalPages || 1);
      setTotalElements(collection.totalElements || 0);
    } catch (e) {
      const status = (e as { status?: number }).status;
      setError(
        status === 401
          ? 'No se pudo cargar esta lista.'
          : e instanceof Error
            ? e.message
            : 'No se pudo cargar la lista.',
      );
      setDetail(null);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [profileId, mode]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, mode, page]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLogin={auth.openLogin} onRegister={auth.openRegister} />

      <main className="page-container flex-1 py-10 sm:py-14">
        <BackLink
          to={profileId ? `/users/${profileId}` : '/profile'}
          back
          className="mb-7"
        >
          Volver al perfil
        </BackLink>

        {loading ? (
          <Loading message="Cargando lista..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : detail ? (
          <>
            <header className="surface p-6 sm:p-8">
              <span className="eyebrow mb-2.5">{eyebrow}</span>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink">
                {title}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <span>
                  {totalElements}{' '}
                  {totalElements === 1 ? 'película' : 'películas'} de{' '}
                  <Link
                    to={`/users/${detail.id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {detail.username}
                  </Link>
                </span>
              </p>
            </header>

            <section className="mt-10">
              {totalElements === 0 ? (
                <p className="rounded-2xl border border-dashed border-line/10 bg-surface/60 px-5 py-10 text-sm text-faint">
                  {emptyMessage}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {movies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      id={movie.id}
                      title={movie.title}
                      releaseYear={movie.releaseYear}
                      averageRating={movie.averageRating}
                      posterURL={movie.posterURL}
                      to={`/movies/${movie.id}`}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                    disabled={page === 0}
                  >
                    Anterior
                  </Button>
                  <span className="rounded-full border border-line/10 bg-surface px-4 py-1.5 text-xs font-medium text-muted">
                    Página {page + 1} de {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages - 1, current + 1))
                    }
                    disabled={page >= totalPages - 1}
                  >
                    Siguiente
                  </Button>
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

export default MovieCollectionPage;
