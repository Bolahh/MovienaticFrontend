import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { Link } from "../router";
import {
  addList,
  addMovieToList,
  getLists,
  getMovies,
  getUserIdByUsername,
  type MovieList,
  type MovieSummary,
  type UserMovieList,
} from "../api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BackLink } from "../components/BackLink";
import { useAuthFlow } from "../components/AuthFlow";
import { Loading, ErrorState } from "../components/Spinner";
import { PublicListCard } from "../components/PublicListCard";
import Button from "../components/Button";

export function CreateListPage() {
  const auth = useAuthFlow();

  // Usuario y listas existentes
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [lists, setLists] = useState<UserMovieList[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [listsError, setListsError] = useState("");

  // Formulario de creación + películas seleccionadas para esta nueva lista
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [selectedMovies, setSelectedMovies] = useState<MovieSummary[]>([]);
  const [creatingList, setCreatingList] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Buscador de películas (columna derecha)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieSummary[]>([]);
  const [searchingMovies, setSearchingMovies] = useState(false);
  const [searchError, setSearchError] = useState("");

  // 1. Resolver el ID del usuario autenticado
  useEffect(() => {
    let cancelled = false;

    if (!auth.isAuthenticated || !auth.username) {
      setCurrentUserId(null);
      setLists([]);
      return;
    }

    getUserIdByUsername(auth.username)
      .then((userId) => {
        if (!cancelled) setCurrentUserId(userId);
      })
      .catch(() => {
        if (!cancelled) setCurrentUserId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.username]);

  // 2. Cargar las listas del usuario para mostrarlas abajo con PublicListCard
  const loadLists = useCallback(async (userId: number) => {
    setLoadingLists(true);
    setListsError("");

    try {
      const userLists = await getLists(userId);
      setLists(userLists);
    } catch (e) {
      setListsError(
        e instanceof Error ? e.message : "No se pudieron cargar tus listas.",
      );
    } finally {
      setLoadingLists(false);
    }
  }, []);

  useEffect(() => {
    if (currentUserId != null) {
      loadLists(currentUserId);
    }
  }, [currentUserId, loadLists]);

  // 3. Buscar películas en el catálogo con debounce (getMovies)
  useEffect(() => {
    let cancelled = false;
    const trimmed = searchQuery.trim();

    setSearchingMovies(true);
    setSearchError("");

    const timer = setTimeout(() => {
      getMovies({ page: 0, size: 10 }, trimmed ? { title: trimmed } : {})
        .then((res) => {
          if (cancelled) return;
          setSearchResults(res.content ?? []);
        })
        .catch((e) => {
          if (cancelled) return;
          setSearchError(
            e instanceof Error
              ? e.message
              : "No se pudieron buscar las películas.",
          );
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

  // Conjunto de IDs de películas que ya están en la columna "Dentro de la lista"
  const selectedMovieIds = useMemo(
    () => new Set(selectedMovies.map((m) => m.id)),
    [selectedMovies],
  );

  const handleAddMovieToDraft = (movie: MovieSummary) => {
    setCreateError("");
    setCreateSuccess("");
    setSelectedMovies((prev) =>
      prev.some((m) => m.id === movie.id) ? prev : [...prev, movie],
    );
  };

  const handleRemoveMovieFromDraft = (movieId: number) => {
    setCreateError("");
    setCreateSuccess("");
    setSelectedMovies((prev) => prev.filter((m) => m.id !== movieId));
  };

  // Crear la lista y añadirle todas las películas de la columna central
  const handleCreateList = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auth.isAuthenticated || !auth.username) {
      auth.openLogin();
      return;
    }

    const name = listName.trim();
    const description = listDescription.trim();

    if (!name) {
      setCreateError("Escribe un nombre para la lista.");
      return;
    }

    setCreatingList(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const userId =
        currentUserId ?? (await getUserIdByUsername(auth.username));
      const previousIds = new Set(lists.map((l) => l.id));

      // 1. Creamos la lista en el backend
      await addList(userId, name, description);

      // 2. Obtenemos las listas actualizadas para localizar el ID de la recién creada
      let updatedLists = await getLists(userId);
      const newlyCreated =
        updatedLists.find((l) => !previousIds.has(l.id)) ??
        [...updatedLists].reverse().find((l) => l.name === name);

      // 3. Si el usuario seleccionó películas en la columna central, las añadimos a la lista
      if (newlyCreated && selectedMovies.length > 0) {
        await Promise.all(
          selectedMovies.map((movie) =>
            addMovieToList(userId, newlyCreated.id, movie.id),
          ),
        );
        // Volvemos a pedir las listas para que PublicListCard tenga movieCount y previewPosters actualizados
        updatedLists = await getLists(userId);
      }

      setLists(updatedLists);
      setListName("");
      setListDescription("");
      setSelectedMovies([]);
      setCreateSuccess(`Lista "${name}" creada correctamente.`);
    } catch (e) {
      setCreateError(
        e instanceof Error ? e.message : "No se pudo crear la lista.",
      );
    } finally {
      setCreatingList(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLogin={auth.openLogin} onRegister={auth.openRegister} />

      <main className="page-container flex-1 py-10 sm:py-14">
        <BackLink to="/home" back className="mb-7">
          Volver al inicio
        </BackLink>

        {/* Cabecera */}
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-line/10 bg-surface p-6 shadow-[0_40px_90px_-60px_rgba(16,12,30,0.55)] sm:p-9 lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-surface/85 via-surface/92 to-surface-2/95"
          />
          <span className="eyebrow mb-3">Colecciones personales</span>
          <h1 className="font-heading text-3xl font-extrabold leading-[1.06] tracking-[-0.03em] text-ink sm:text-4xl lg:text-5xl">
            Crear lista de películas
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Dale un nombre a tu colección, busca películas en la columna derecha
            para incluirlas en la lista y guárdala.
          </p>
        </section>

        {!auth.isAuthenticated ? (
          <div className="surface mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="font-heading text-lg font-semibold text-ink">
                Inicia sesión para crear tus listas
              </h2>
              <p className="mt-1 text-sm text-muted">
                Necesitas una cuenta para crear listas personalizadas y guardar
                películas.
              </p>
            </div>
            <Button onClick={auth.openLogin} className="shrink-0">
              Iniciar sesión
            </Button>
          </div>
        ) : (
          <>
            {/* PRIMERA SECCIÓN: Formulario a la izquierda + 2 columnas a su derecha */}
            <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Columna 1: Formulario para crear la lista */}
              <div className="surface flex flex-col justify-between p-5 sm:p-6 lg:col-span-4">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="eyebrow mb-2">Paso 1</span>
                      <h2 className="font-heading text-xl font-semibold text-ink">
                        Datos de la lista
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-line/10 bg-ink/5 px-3 py-1 text-xs text-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <strong className="font-semibold text-ink">
                        {auth.username}
                      </strong>
                    </span>
                  </div>

                  <form
                    id="create-list-form"
                    onSubmit={handleCreateList}
                    className="mt-5"
                  >
                    <label
                      htmlFor="list-name"
                      className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint"
                    >
                      Nombre de la lista
                    </label>
                    <input
                      id="list-name"
                      type="text"
                      value={listName}
                      onChange={(event) => {
                        setListName(event.target.value);
                        setCreateError("");
                        setCreateSuccess("");
                      }}
                      maxLength={80}
                      placeholder="Ej. Joyas ocultas de los 90"
                      className="w-full rounded-xl border border-transparent bg-ink/5 px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />

                    <label
                      htmlFor="list-description"
                      className="mb-2 mt-4 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint"
                    >
                      Descripción (opcional)
                    </label>
                    <textarea
                      id="list-description"
                      value={listDescription}
                      onChange={(event) => {
                        setListDescription(event.target.value);
                        setCreateError("");
                        setCreateSuccess("");
                      }}
                      rows={4}
                      maxLength={300}
                      placeholder="¿Qué tienen en común estas películas?"
                      className="w-full resize-y rounded-xl border border-transparent bg-ink/5 px-3.5 py-3 text-sm leading-relaxed text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />

                    <div className="mt-2 flex items-center justify-between text-xs text-faint">
                      <span>{listDescription.length}/300 caracteres</span>
                      <span>
                        {selectedMovies.length}{" "}
                        {selectedMovies.length === 1
                          ? "película seleccionada"
                          : "películas seleccionadas"}
                      </span>
                    </div>

                    <div className="mt-5">
                      <Button
                        type="submit"
                        disabled={creatingList || !listName.trim()}
                        className="w-full"
                      >
                        {creatingList ? "Guardando lista…" : "Crear lista"}
                      </Button>
                    </div>

                    {createError && (
                      <p
                        role="alert"
                        className="mt-3 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
                      >
                        {createError}
                      </p>
                    )}
                    {createSuccess && (
                      <p
                        role="status"
                        className="mt-3 rounded-xl border border-accent/20 bg-accent-soft px-3.5 py-2.5 text-sm text-accent"
                      >
                        {createSuccess}
                      </p>
                    )}
                  </form>
                </div>
              </div>

              {/* Columna 2 (Derecha 1): Películas que están dentro de la lista */}
              <div className="surface flex flex-col p-5 sm:p-6 lg:col-span-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <span className="eyebrow mb-2">En la lista</span>
                    <h2 className="font-heading text-xl font-semibold text-ink">
                      Películas añadidas
                    </h2>
                  </div>
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                    {selectedMovies.length}
                  </span>
                </div>

                {selectedMovies.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line/10 bg-surface/60 px-4 py-10 text-center text-sm text-faint">
                    Aún no has añadido películas. Usa el buscador de la derecha
                    para ir agregándolas.
                  </div>
                ) : (
                  <div className="max-h-[26rem] space-y-2.5 overflow-y-auto pr-1">
                    {selectedMovies.map((movie) => {
                      const poster =
                        movie.posterURL ||
                        "https://picsum.photos/seed/movienatic-fallback/400/600";

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
                                event.currentTarget.style.visibility = "hidden";
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
                            onClick={() => handleRemoveMovieFromDraft(movie.id)}
                            disabled={creatingList}
                          >
                            Quitar
                          </Button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Columna 3 (Derecha 2): Películas que se pueden añadir con el buscador */}
              <div className="surface flex flex-col p-5 sm:p-6 lg:col-span-4">
                <div className="mb-4">
                  <span className="eyebrow mb-2">Catálogo</span>
                  <h2 className="font-heading text-xl font-semibold text-ink">
                    Buscar para añadir
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
                    onRetry={() => setSearchQuery((q) => q)}
                  />
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line/10 bg-surface/60 px-4 py-10 text-center text-sm text-faint">
                    No se encontraron películas con ese título.
                  </div>
                ) : (
                  <div className="max-h-[22.5rem] space-y-2.5 overflow-y-auto pr-1">
                    {searchResults.map((movie) => {
                      const poster =
                        movie.posterURL ||
                        "https://picsum.photos/seed/movienatic-fallback/400/600";
                      const alreadyAdded = selectedMovieIds.has(movie.id);

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
                                event.currentTarget.style.visibility = "hidden";
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
                            variant={alreadyAdded ? "primary" : "secondary"}
                            disabled={alreadyAdded || creatingList}
                            onClick={() => handleAddMovieToDraft(movie)}
                          >
                            {alreadyAdded ? "Añadida" : "Añadir"}
                          </Button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* SEGUNDA SECCIÓN: Listas del usuario renderizadas con PublicListCard */}
            <section className="mt-14">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <span className="eyebrow mb-3">Tu biblioteca</span>
                  <h2 className="section-title">Tus listas de películas</h2>
                </div>
                {lists.length > 0 && (
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                    {lists.length} {lists.length === 1 ? "lista" : "listas"}
                  </span>
                )}
              </div>

              {loadingLists ? (
                <Loading message="Cargando tus listas..." />
              ) : listsError ? (
                <ErrorState
                  message={listsError}
                  onRetry={() =>
                    currentUserId != null && loadLists(currentUserId)
                  }
                />
              ) : lists.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line/10 bg-surface/60 px-5 py-8 text-sm text-faint">
                  Todavía no tienes ninguna lista creada. ¡Crea la primera con
                  el formulario de arriba!
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {lists.map((list) => {
                    // Aseguramos que userId y username estén presentes para que PublicListCard construya bien los enlaces y el autor
                    const userId = list.userId ?? currentUserId;
                    if (userId == null) return null;

                    const enrichedList: MovieList = {
                      ...list,
                      userId,
                      username: list.username ?? auth.username,
                    };

                    return <PublicListCard key={list.id} list={enrichedList} />;
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
      {auth.modals}
    </div>
  );
}

export default CreateListPage;
