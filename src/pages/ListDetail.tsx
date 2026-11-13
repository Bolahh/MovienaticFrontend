import { useEffect, useState } from 'react';
import { Link, useParams } from '../router';
import {
  getListMovies,
  getLists,
  getUserDetail,
  type MovieSummary,
  type UserDetail,
  type UserMovieList,
} from '../api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';
import { MovieCard } from '../components/MovieCard';

export function ListDetailPage() {
  const { userId, listId } = useParams();
  const auth = useAuthFlow();

  const profileId = userId ? Number(userId) : null;
  const numericListId = listId ? Number(listId) : null;

  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [list, setList] = useState<UserMovieList | null>(null);
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (
      profileId == null ||
      numericListId == null ||
      !Number.isFinite(profileId) ||
      !Number.isFinite(numericListId)
    ) {
      setError('La lista indicada no existe.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [userDetail, userLists, listMovies] = await Promise.all([
        getUserDetail(profileId),
        getLists(profileId),
        getListMovies(profileId, numericListId),
      ]);

      const match = (userLists ?? []).find(
        (item) => item.id === numericListId
      );

      if (!match) {
        setError('La lista indicada no existe o ya no está disponible.');
        setDetail(null);
        setList(null);
        setMovies([]);
        return;
      }

      setDetail(userDetail);
      setList(match);
      setMovies(listMovies ?? []);
    } catch (e) {
      const status = (e as { status?: number }).status;
      setError(
        status === 401
          ? 'Inicia sesión para ver las listas.'
          : e instanceof Error
            ? e.message
            : 'No se pudo cargar la lista.',
      );
      setDetail(null);
      setList(null);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, numericListId]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLogin={auth.openLogin} onRegister={auth.openRegister} />

      <main className="page-container flex-1 py-10 sm:py-14">
        <BackLink to={profileId ? `/users/${profileId}` : '/profile'} className="mb-7">
          Volver al perfil
        </BackLink>

        {loading ? (
          <Loading message="Cargando lista..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : list ? (
          <>
            <header className="surface p-6 sm:p-8">
              <span className="eyebrow mb-2.5">Lista de películas</span>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink">
                {list.name}
              </h1>
              {list.description && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                  {list.description}
                </p>
              )}
              <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-faint">
                <span>
                  {list.movieCount}{' '}
                  {list.movieCount === 1 ? 'película' : 'películas'}
                </span>
                {detail && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      Creada por{' '}
                      <Link
                        to={`/users/${detail.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {detail.username}
                      </Link>
                    </span>
                  </>
                )}
              </p>
            </header>

            <section className="mt-10">
              {movies.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line/10 bg-surface/60 px-5 py-10 text-sm text-faint">
                  Esta lista todavía está vacía.
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
            </section>
          </>
        ) : null}
      </main>

      <Footer />
      {auth.modals}
    </div>
  );
}

export default ListDetailPage;
