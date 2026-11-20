import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { Link, useParams } from '../router';
import {
  getListMovies,
  getLists,
  getMovies,
  getUserIdByUsername,
  updateList,
  type MovieSummary,
  type UserMovieList,
} from '../api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';
import Button from '../components/Button';

const PAGE_SIZE = 100;

export function EditListPage() {
  const { listId } = useParams();
  const auth = useAuthFlow();
  const numericListId = listId ? Number(listId) : null;

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [list, setList] = useState<UserMovieList | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [movies, setMovies] = useState<MovieSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MovieSummary[]>([]);
  const [searchingMovies, setSearchingMovies] = useState(false);
  const [searchError, setSearchError] = useState('');

  // 1. Resolver el ID del usuario autenticado
  useEffect(() => {
    let cancelled = false;

    if (!auth.isAuthenticated || !auth.username) {
      setCurrentUserId(null);
      setLoading(false);
      return;
    }

    getUserIdByUsername(auth.username)
      .then((userId) => {
        if (!cancelled) setCurrentUserId(userId);
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudo identificar tu cuenta.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.username]);

  // 2. Cargar la lista y sus películas
  const loadList = useCallback(
    async (userId: number) => {
      if (numericListId == null || !Number.isFinite(numericListId)) {
        setError('La lista indicada no existe.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [userLists, page] = await Promise.all([
          getLists(userId),
          getListMovies(userId, numericListId, { page: 0, size: PAGE_SIZE }),
        ]);

        const match = userLists.find((item) => item.id === numericListId);
        if (!match) {
          setError('La lista no existe o no es tuya.');
          setList(null);
          setMovies([]);
          return;
        }

        setList(match);
        setName(match.name);
        setDescription(match.description ?? '');
        setMovies(page.content ?? []);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'No se pudo cargar la lista.',
        );
      } finally {
        setLoading(false);
      }
    },
    [numericListId],
  );

  useEffect(() => {
    if (currentUserId != null) {
      loadList(currentUserId);
    }
  }, [currentUserId, loadList]);

  // 3. Buscar películas en el catálogo con debounce
  useEffect(() => {
    let cancelled = false;
    const trimmed = searchQuery.trim();

    setSearchingMovies(true);
    setSearchError('');

    const timer = setTimeout(() => {
      getMovies({ page: 0, size: 10 }, trimmed ? { title: trimmed } : {})
        .then((res) => {
          if (!cancelled) setSearchResults(res.content ?? []);
        })
        .catch((e) => {
          if (!cancelled) {
            setSearchError(
              e instanceof Error
                ? e.message
                : 'No se pudieron buscar las películas.',
            );
          }
        })
        .finally(() => {
          if (!cancelled) setSearchingMovies(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const movieIdsInList = useMemo(
    () => new Set(movies.map((movie) => movie.id)),
    [movies],
  );

  // Añadir y quitar películas solo modifica el borrador local. Los cambios se
  // persisten de una vez con "Guardar cambios" (PUT con movieIds).
  const handleAddMovie = (movie: MovieSummary) => {
    setSaveError('');
    setSaveSuccess('');
    setMovies((prev) =>
      prev.some((item) => item.id === movie.id) ? prev : [...prev, movie],
    );
  };

  const handleRemoveMovie = (movieId: number) => {
    setSaveError('');
    setSaveSuccess('');
    setMovies((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentUserId == null || numericListId == null) return;

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setSaveError('Escribe un nombre para la lista.');
      setSaveSuccess('');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      // Una sola petición: metadatos + todas las películas del borrador.
      await updateList(
        currentUserId,
        numericListId,
        trimmedName,
        trimmedDescription,
        movies.map((movie) => movie.id),
      );
      setList((prev) =>
        prev
          ? {
              ...prev,
              name: trimmedName,
              description: trimmedDescription,
              movieCount: movies.length,
            }
          : prev,
      );
      setSaveSuccess('Cambios guardados correctamente.');
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : 'No se pudieron guardar los cambios.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLogin={auth.openLogin} onRegister={auth.openRegister} />

      <main className="page-container flex-1 py-10 sm:py-14">
        <BackLink to="/myLists" back className="mb-7">
          Volver a mis listas
        </BackLink>

        {!auth.isAuthenticated ? (
          <div className="surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-ink">
                Inicia sesión para editar tus listas
              </h1>
              <p className="mt-1 text-sm text-muted">
                Necesitas una cuenta para modificar tus listas de películas.
              </p>
            </div>
            <Button onClick={auth.openLogin} className="shrink-0">
              Iniciar sesión
            </Button>
          </div>
        ) : loading ? (
          <Loading message="Cargando lista..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => currentUserId != null && loadList(currentUserId)}
          />
        ) : list ? (
          <>
            <section className="relative isolate overflow-hidden rounded-[2rem] border border-line/10 bg-surface p-6 shadow-[0_40px_90px_-60px_rgba(16,12,30,0.55)] sm:p-9 lg:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-surface/85 via-surface/92 to-surface-2/95"
              />
              <span className="eyebrow mb-3">Editar colección</span>
              <h1 className="font-heading text-3xl font-extrabold leading-[1.06] tracking-[-0.03em] text-ink sm:text-4xl">
                {list.name}
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
                Cambia el nombre y la descripción, y añade o quita películas.
                Todo se guarda de una vez al pulsar «Guardar cambios».
              </p>
            </section>

            <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Columna 1: datos de la lista */}
              <div className="surface flex flex-col p-5 sm:p-6 lg:col-span-4">
                <div>
                  <span className="eyebrow mb-2">Datos de la lista</span>
                  <h2 className="font-heading text-xl font-semibold text-ink">
                    Nombre y descripción
                  </h2>
                </div>

                <form onSubmit={handleSave} className="mt-5">
                  <label
                    htmlFor="edit-list-name"
                    className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint"
                  >
                    Nombre de la lista
                  </label>
                  <input
                    id="edit-list-name"
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setSaveError('');
                      setSaveSuccess('');
                    }}
                    maxLength={80}
                    placeholder="Ej. Joyas ocultas de los 90"
                    className="w-full rounded-xl border border-transparent bg-ink/5 px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
                  />

                  <label
                    htmlFor="edit-list-description"
                    className="mb-2 mt-4 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint"
                  >
                    Descripción (opcional)
                  </label>
                  <textarea
                    id="edit-list-description"
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      setSaveError('');
                      setSaveSuccess('');
                    }}
                    rows={4}
                    maxLength={300}
                    placeholder="¿Qué tienen en común estas películas?"
                    className="w-full resize-y rounded-xl border border-transparent bg-ink/5 px-3.5 py-3 text-sm leading-relaxed text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
                  />
                  <div className="mt-2 text-right text-xs text-faint">
                    {description.length}/300 caracteres
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <Button
                      type="submit"
                      disabled={saving || !name.trim()}
                      className="w-full"
                    >
                      {saving ? 'Guardando…' : 'Guardar cambios'}
                    </Button>
                    <Link
                      to={`/users/${currentUserId}/lists/${list.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line/10 bg-surface px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-line/20 hover:text-ink"
                    >
                      Ver la lista
                    </Link>
                  </div>

                  {saveError && (
                    <p
                      role="alert"
                      className="mt-3 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
                    >
                      {saveError}
                    </p>
                  )}
                  {saveSuccess && (
                    <p
                      role="status"
                      className="mt-3 rounded-xl border border-accent/20 bg-accent-soft px-3.5 py-2.5 text-sm text-accent"
                    >
                      {saveSuccess}
                    </p>
                  )}
                </form>
              </div>

              {/* Columna 2: películas dentro de la lista */}
              <div className="surface flex flex-col p-5 sm:p-6 lg:col-span-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <span className="eyebrow mb-2">En la lista</span>
                    <h2 className="font-heading text-xl font-semibold text-ink">
                      Películas añadidas
                    </h2>
                  </div>
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                    {movies.length}
                  </span>
                </div>

                {movies.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line/10 bg-surface/60 px-4 py-10 text-center text-sm text-faint">
                    Esta lista todavía está vacía. Añade películas desde el
                    buscador.
                  </div>
                ) : (
                  <div className="max-h-[30rem] space-y-2.5 overflow-y-auto pr-1">
                    {movies.map((movie) => {
                      const poster =
                        movie.posterURL ||
                        'https://picsum.photos/seed/movienatic-fallback/400/600';

                      return (
                        <article
                          key={movie.id}
                          className="flex items-center gap-3 rounded-2xl border border-line/10 bg-ink/[0.02] p-2.5 transition-colors hover:border-line/20"
                        >
                          <Link
                            to={`/movies/${movie.id}`}
                            className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-ink/5 ring-1 ring-line/10"
                          >
                            <img
                              src={poster}
                              alt={`Póster de ${movie.title}`}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.visibility = 'hidden';
                              }}
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/movies/${movie.id}`}
                              className="block truncate text-sm font-semibold text-ink transition-colors hover:text-accent"
                            >
                              {movie.title}
                            </Link>
                            {movie.releaseYear != null && (
                              <p className="text-xs text-faint">
                                {movie.releaseYear}
                              </p>
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveMovie(movie.id)}
                          >
                            Quitar
                          </Button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Columna 3: buscador para añadir */}
              <div className="surface flex flex-col p-5 sm:p-6 lg:col-span-4">
                <div className="mb-4">
                  <span className="eyebrow mb-2">Catálogo</span>
                  <h2 className="font-heading text-xl font-semibold text-ink">
                    Añadir películas
                  </h2>
                </div>

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar película por título..."
                  className="mb-4 w-full rounded-xl border border-transparent bg-ink/5 px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
                />

                {searchingMovies ? (
                  <Loading message="Buscando películas..." />
                ) : searchError ? (
                  <ErrorState
                    message={searchError}
                    onRetry={() => setSearchQuery((query) => query)}
                  />
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line/10 bg-surface/60 px-4 py-10 text-center text-sm text-faint">
                    No se encontraron películas con ese título.
                  </div>
                ) : (
                  <div className="max-h-[26rem] space-y-2.5 overflow-y-auto pr-1">
                    {searchResults.map((movie) => {
                      const poster =
                        movie.posterURL ||
                        'https://picsum.photos/seed/movienatic-fallback/400/600';
                      const alreadyAdded = movieIdsInList.has(movie.id);

                      return (
                        <article
                          key={movie.id}
                          className="flex items-center gap-3 rounded-2xl border border-line/10 bg-ink/[0.02] p-2.5 transition-colors hover:border-line/20"
                        >
                          <Link
                            to={`/movies/${movie.id}`}
                            className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-ink/5 ring-1 ring-line/10"
                          >
                            <img
                              src={poster}
                              alt={`Póster de ${movie.title}`}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.visibility = 'hidden';
                              }}
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/movies/${movie.id}`}
                              className="block truncate text-sm font-semibold text-ink transition-colors hover:text-accent"
                            >
                              {movie.title}
                            </Link>
                            {movie.releaseYear != null && (
                              <p className="text-xs text-faint">
                                {movie.releaseYear}
                              </p>
                            )}
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={alreadyAdded ? 'primary' : 'secondary'}
                            disabled={alreadyAdded}
                            onClick={() => handleAddMovie(movie)}
                          >
                            {alreadyAdded ? 'Añadida' : 'Añadir'}
                          </Button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>

      <Footer />
      {auth.modals}
    </div>
  );
}

export default EditListPage;
