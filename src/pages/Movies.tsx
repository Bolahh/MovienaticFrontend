import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from '../router';
import {
  getMovies,
  getGenres,
  type MovieSummary,
  type Genre,
  type MovieFilter,
} from '../api';
import { MovieCard } from '../components/MovieCard';
import { Select } from '../components/Select';
import { StarRatingInput } from '../components/StarRatingInput';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';
import Button from '../components/Button';
import { matchesSearch } from '../lib/search';

export function Movies() {
  const navigate = useNavigate();
  const auth = useAuthFlow();
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  // Filtros - estado de input (inmediato, no interrumpe escritura)
  const [titleInput, setTitleInput] = useState('');
  // Estado de filtro (se actualiza con debounce)
  const [title, setTitle] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(undefined);
  const [releaseYear, setReleaseYear] = useState<string>('');
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState('');

  const location = useLocation();

  const genreOptions = useMemo(
    () => [
      { value: '', label: 'Todos los géneros' },
      ...genres.map((genre) => ({ value: String(genre.id), label: genre.name })),
    ],
    [genres]
  );

  const yearOptions = useMemo(
    () => [
      { value: '', label: 'Cualquier año' },
      ...[...Array(127)].map((_, index) => {
        const year = 2026 - index;
        return { value: String(year), label: String(year) };
      }),
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: '', label: 'Orden por defecto' },
      { value: 'title,asc', label: 'Título (A-Z)' },
      { value: 'title,desc', label: 'Título (Z-A)' },
      { value: 'releaseYear,desc', label: 'Año (más reciente)' },
      { value: 'releaseYear,asc', label: 'Año (más antiguo)' },
      { value: 'averageRating,desc', label: 'Mejor valoradas' },
    ],
    []
  );

  // Leer título de la URL (viene del buscador del navbar)
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const titleFromUrl = params.get('title') || '';
    setTitle(titleFromUrl);
    setTitleInput(titleFromUrl);
    setPage(0);
  }, [location]);

  // Búsqueda en vivo: actualiza los resultados mientras se escribe,
  // con un pequeño debounce para no lanzar una petición por cada tecla.
  useEffect(() => {
    const value = titleInput.trim();
    if (value === title) return;

    const timeoutId = window.setTimeout(() => {
      setTitle(value);
      setPage(0);
      navigate(
        value ? `/movies?title=${encodeURIComponent(value)}` : '/movies',
        { replace: true },
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [titleInput, title, navigate]);

  const fetchGenres = useCallback(async () => {
    try {
      const g = await getGenres();
      setGenres(g);
    } catch {
      // Géneros reales de la BBDD (visto en DBeaver)
      setGenres([
        { id: 1, name: 'Acción' },
        { id: 2, name: 'Aventura' },
        { id: 3, name: 'Animación' },
        { id: 4, name: 'Comedia' },
        { id: 5, name: 'Crimen' },
        { id: 6, name: 'Documental' },
        { id: 7, name: 'Drama' },
        { id: 8, name: 'Familia' },
        { id: 9, name: 'Fantasía' },
        { id: 10, name: 'Historia' },
        { id: 11, name: 'Terror' },
        { id: 12, name: 'Música' },
        { id: 13, name: 'Misterio' },
        { id: 14, name: 'Romance' },
        { id: 15, name: 'Ciencia ficción' },
        { id: 16, name: 'Película de TV' },
        { id: 17, name: 'Suspense' },
        { id: 18, name: 'Bélica' },
        { id: 19, name: 'Western' },
      ]);
    }
  }, []);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError('');
    const sortParam = sort ? [sort] : undefined;
    const filter: MovieFilter = {
      genreIds: selectedGenreId != null ? [selectedGenreId] : undefined,
      releaseYear: releaseYear ? Number(releaseYear) : undefined,
      minRating: minRating > 0 ? minRating : undefined,
    };
    try {
      if (title) {
        // El backend distingue tildes al filtrar por título. Traemos el conjunto
        // que cumple el resto de filtros y buscamos aquí sin tildes ni mayúsculas.
        const all = await getMovies({ page: 0, size: 1000, sort: sortParam }, filter);
        const filtered = (all.content || []).filter((movie) =>
          matchesSearch(movie.title, title),
        );
        const total = filtered.length;
        const maxPage = Math.max(0, Math.ceil(total / size) - 1);
        const safePage = Math.min(page, maxPage);
        if (safePage !== page) setPage(safePage);
        setMovies(filtered.slice(safePage * size, safePage * size + size));
        setTotalPages(Math.max(1, Math.ceil(total / size)));
        setTotalElements(total);
      } else {
        const res = await getMovies({ page, size, sort: sortParam }, filter);
        setMovies(res.content || []);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || 0);
      }
    } catch (e: any) {
      setError(e.message || 'No se pudieron cargar las películas.');
    } finally {
      setLoading(false);
    }
  }, [page, size, title, selectedGenreId, releaseYear, minRating, sort]);

  useEffect(() => {
    fetchGenres();
    fetchMovies();
  }, [fetchGenres, page, selectedGenreId, releaseYear, minRating, title, sort]);

  const goToPage = (p: number) => {
    if (p < 0 || p >= totalPages) return;
    setPage(p);
  };

  const handleSearchTitle = () => {
    const value = titleInput.trim();
    setTitle(value);
    setPage(0);
    navigate(value ? `/movies?title=${encodeURIComponent(value)}` : '/movies');
  };

  const handleLogin = () => {
    auth.openLogin();
  };

  const handleRegister = () => {
    auth.openRegister();
  };

  return (
    <>
      <Navbar
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
      <section className="page-container flex-1 py-12 sm:py-16">
        <div className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow mb-4">Catálogo</span>
            <h1 className="display-title">Películas</h1>
            <p className="mt-4 text-sm text-muted">
              <span className="font-semibold text-ink">{totalElements}</span>{' '}
              película{totalElements !== 1 ? 's' : ''} encontrada{totalElements !== 1 ? 's' : ''}
            </p>
          </div>
          <BackLink to="/">
            Volver al inicio
          </BackLink>
        </div>

        {/* Filtros */}
        <div className="surface relative z-20 mb-10 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Buscar por título
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => {
                  setTitleInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchTitle();
                  }
                }}
                placeholder="Título de la película..."
                className="w-full rounded-xl border border-transparent bg-ink/5 px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Género
              </label>
              <Select
                ariaLabel="Filtrar por género"
                value={selectedGenreId != null ? String(selectedGenreId) : ''}
                onChange={(value) => {
                  setSelectedGenreId(value ? Number(value) : undefined);
                  setPage(0);
                }}
                options={genreOptions}
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Año de salida
              </label>
              <Select
                ariaLabel="Filtrar por año de salida"
                value={releaseYear}
                onChange={(value) => {
                  setReleaseYear(value);
                  setPage(0);
                }}
                options={yearOptions}
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Rating mínimo
              </label>
              <StarRatingInput
                value={minRating}
                onChange={(value) => {
                  setMinRating(value);
                  setPage(0);
                }}
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Ordenar por
              </label>
              <Select
                ariaLabel="Ordenar películas"
                value={sort}
                onChange={(value) => {
                  setSort(value);
                  setPage(0);
                }}
                options={sortOptions}
              />
            </div>
          </div>
        </div>

        {/* Resultados */}
        {loading ? (
          <Loading message="Buscando películas..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMovies} />
        ) : movies.length === 0 ? (
          <div className="surface py-20 text-center">
            <p className="text-base text-muted">
              No se encontraron películas con esos filtros.
            </p>
            <Button onClick={() => {
              setTitle('');
              setTitleInput('');
              setSelectedGenreId(undefined);
              setReleaseYear('');
              setMinRating(0);
              setSort('');
              setPage(0);
            }}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  {...movie}
                  to={`/movies/${movie.id}`}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(page - 1)}
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
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    <Footer />
    {auth.modals}
    </>
  );
}

export default Movies;
