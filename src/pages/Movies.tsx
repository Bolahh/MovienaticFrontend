import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from '../router';
import {
  getMovies,
  getGenres,
  type MovieSummary,
  type Genre,
  type MovieFilter,
  type Pageable,
} from '../api';
import { MovieCard } from '../components/MovieCard';
import { Select } from '../components/Select';import { StarRatingInput } from '../components/StarRatingInput';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';
import Button from '../components/Button';

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
  }, [location]);

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
    const pageable: Pageable = { page, size, sort: sort ? [sort] : undefined };
    const filter: MovieFilter = {
      title: title || undefined,
      genreIds: selectedGenreId != null ? [selectedGenreId] : undefined,
      releaseYear: releaseYear ? Number(releaseYear) : undefined,
      minRating: minRating > 0 ? minRating : undefined,
    };
    try {
      const res = await getMovies(pageable, filter);
      setMovies(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
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
      <section className="py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Películas</h1>
            <p className="text-[#64748b]">
              {totalElements} película{totalElements !== 1 ? 's' : ''} encontrada{totalElements !== 1 ? 's' : ''}
            </p>
          </div>
          <BackLink to="/">
            Volver al inicio
          </BackLink>
        </div>

        {/* Filtros */}
        <div className="relative z-20 bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
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
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
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
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
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
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
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
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
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
          <div className="text-center py-20">
            <p className="text-[#64748b] text-lg">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <span className="px-2 text-[#64748b] text-sm">
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
      </div>
    </section>
    <Footer />
    {auth.modals}
    </>
  );
}

export default Movies;
