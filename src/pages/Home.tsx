import { useCallback, useEffect, useState } from 'react';
import { Link } from '../router';
import {
  addPending,
  getGenres,
  getMovieDetail,
  getMovies,
  getPending,
  getPublicLists,
  getUserIdByUsername,
  type Genre,
  type MovieList,
  type MovieSummary,
} from '../api';
import { Navbar } from '../components/Navbar';
import { HeroCarousel } from '../components/HeroCarousel';
import { MovieCard } from '../components/MovieCard';
import { PublicListCard } from '../components/PublicListCard';
import { Footer } from '../components/Footer';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';

type HeroMovie = {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster?: string;
  genre?: string;
  description?: string;
};

type GenreSection = {
  id: number;
  name: string;
  movies: MovieSummary[];
};

type HomeData = {
  heroMovies: HeroMovie[];
  topRated: MovieSummary[];
  lists: MovieList[];
  genreSections: GenreSection[];
};

// Géneros que se muestran como filas temáticas en la portada.
const PREFERRED_GENRES = ['Acción', 'Ciencia ficción', 'Terror', 'Comedia'];

const MOVIE_GRID =
  'grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function pickGenres(genres: Genre[]): Genre[] {
  const chosen: Genre[] = [];

  for (const name of PREFERRED_GENRES) {
    const match = genres.find((genre) => normalize(genre.name) === normalize(name));
    if (match && !chosen.some((genre) => genre.id === match.id)) {
      chosen.push(match);
    }
  }

  for (const genre of genres) {
    if (chosen.length >= PREFERRED_GENRES.length) break;
    if (!chosen.some((item) => item.id === genre.id)) chosen.push(genre);
  }

  return chosen.slice(0, PREFERRED_GENRES.length);
}

async function loadHomeData(): Promise<HomeData> {
  const [featuredPage, topPage, lists, genres] = await Promise.all([
    getMovies(
      { size: 6, sort: ['releaseYear,desc', 'averageRating,desc'] },
      { minRating: 0.1 },
    ),
    getMovies({ size: 6, sort: ['averageRating,desc'] }, { minRating: 0.1 }),
    getPublicLists(6),
    getGenres(),
  ]);

  const featured =
    featuredPage.content.length > 0 ? featuredPage.content : topPage.content;

  // La vista resumen no trae descripción ni géneros: pedimos el detalle de las
  // películas del carrusel para poder mostrar la ficha completa en el hero.
  const details = await Promise.all(
    featured.slice(0, 6).map((movie) =>
      getMovieDetail(movie.id).catch(() => null),
    ),
  );

  const heroMovies: HeroMovie[] = featured.slice(0, 6).map((movie, index) => {
    const detail = details[index];
    return {
      id: movie.id,
      title: movie.title,
      year: movie.releaseYear ?? new Date().getFullYear(),
      rating: movie.averageRating ?? 0,
      poster: movie.posterURL ?? undefined,
      genre: detail?.genres?.[0]?.name,
      description: detail?.description ?? undefined,
    };
  });

  const genreSections = await Promise.all(
    pickGenres(genres).map(async (genre) => {
      const page = await getMovies(
        { size: 6, sort: ['averageRating,desc'] },
        { genreIds: [genre.id], minRating: 0.1 },
      );
      return { id: genre.id, name: genre.name, movies: page.content };
    }),
  );

  return {
    heroMovies,
    topRated: topPage.content,
    lists,
    genreSections: genreSections.filter((section) => section.movies.length > 0),
  };
}

export function Home() {
  const auth = useAuthFlow();

  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [pendingBusyId, setPendingBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await loadHomeData());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo cargar la portada.',
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Películas que el usuario ya tiene en pendientes (para el botón del hero).
  useEffect(() => {
    let cancelled = false;

    if (!auth.isAuthenticated || !auth.username) {
      setPendingIds(new Set());
      return;
    }

    getUserIdByUsername(auth.username)
      .then((userId) => getPending(userId))
      .then((movies) => {
        if (!cancelled) setPendingIds(new Set(movies.map((movie) => movie.id)));
      })
      .catch(() => {
        if (!cancelled) setPendingIds(new Set());
      });

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.username]);

  const handleAddPending = async (movieId: number) => {
    if (!auth.isAuthenticated || !auth.username) {
      auth.openLogin();
      return;
    }
    if (pendingBusyId != null || pendingIds.has(movieId)) return;

    setPendingBusyId(movieId);
    try {
      const userId = await getUserIdByUsername(auth.username);
      await addPending(userId, movieId);
      setPendingIds((prev) => new Set(prev).add(movieId));
    } catch {
      // Si falla, dejamos el botón como estaba.
    } finally {
      setPendingBusyId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLogin={auth.openLogin} onRegister={auth.openRegister} />

      <main className="page-container flex-1 pb-8 pt-10 sm:pt-14">
        {/* Apertura editorial */}
        <section className="mb-16 animate-fade-up sm:mb-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow">La comunidad del cine</span>
              <h1 className="display-title mt-5">
                Descubre historias que se quedan contigo.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted text-pretty">
                Una selección cuidada de películas, valoraciones y listas de la
                comunidad. Encuentra tu próxima obsesión cinematográfica.
              </p>
            </div>

            <Link
              to="/movies"
              className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line/10 bg-surface px-5 py-2.5 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(16,12,30,0.04)] transition-all hover:-translate-y-px hover:border-line/20 hover:shadow-[0_12px_30px_-16px_rgba(16,12,30,0.45)] lg:self-auto"
            >
              Explorar catálogo
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent transition-transform group-hover:translate-x-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m18 5 7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </section>

        {loading ? (
          <Loading message="Cargando la cartelera..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : data ? (
          <>
            {/* Hero principal */}
            <HeroCarousel
              title="Películas destacadas"
              movies={data.heroMovies}
              pendingIds={pendingIds}
              pendingBusyId={pendingBusyId}
              onAddPending={handleAddPending}
            />

            {/* Mejor valoradas */}
            <section className="mb-16">
              <div className="mb-7">
                <span className="eyebrow mb-3">Aclamadas</span>
                <h2 className="section-title">
                  Las mejor valoradas de Movienatic
                </h2>
              </div>
              <div className={MOVIE_GRID}>
                {data.topRated.map((movie) => (
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
            </section>

            <div className="hairline mb-16" />

            {/* Listas con más likes */}
            <section className="mb-16">
              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="eyebrow mb-3">Comunidad</span>
                  <h2 className="section-title">
                    Listas con más likes del momento
                  </h2>
                </div>
                <Link
                  to="/social"
                  className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                >
                  Ver todas las listas
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m18 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {data.lists.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line/10 bg-surface/60 px-5 py-8 text-sm text-faint">
                  Todavía no hay listas públicas con likes.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {data.lists.map((list) => (
                    <PublicListCard key={list.id} list={list} />
                  ))}
                </div>
              )}
            </section>

            <div className="hairline mb-16" />

            {/* Mejor valoradas por género */}
            {data.genreSections.map((section) => (
              <section key={section.id} className="mb-16">
                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="eyebrow mb-3">Mejor valoradas</span>
                    <h2 className="section-title">{section.name}</h2>
                  </div>
                  <Link
                    to={`/movies?genreIds=${section.id}`}
                    className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                  >
                    Ver todas
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m18 5 7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className={MOVIE_GRID}>
                  {section.movies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      id={movie.id}
                      title={movie.title}
                      releaseYear={movie.releaseYear}
                      averageRating={movie.averageRating}
                      posterURL={movie.posterURL}
                      genre={section.name}
                      to={`/movies/${movie.id}`}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Cierre: explorar catálogo */}
            <section className="surface relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#38bdf8]/10 blur-3xl" />
              <div className="relative">
                <span className="eyebrow mb-4 justify-center">Sin límites</span>
                <h2 className="section-title mx-auto max-w-2xl text-balance">
                  Hay una película esperando por ti.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                  Filtra por género, año o valoración y encuentra exactamente lo
                  que te apetece ver hoy.
                </p>
                <Link
                  to="/movies"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_-18px_rgba(16,12,30,0.8)] transition-all hover:-translate-y-px hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Explora todas las películas
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m18 5 7 7-7 7" />
                  </svg>
                </Link>
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

export default Home;
