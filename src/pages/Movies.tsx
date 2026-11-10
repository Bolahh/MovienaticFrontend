import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from '../router';
import {
  getMovies,
  getGenres,
  type Movie,
  type Genre,
  type MovieFilter,
  type Pageable,
} from '../api';
import { MovieCard } from '../components/MovieCard';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';
import Button from '../components/Button';

export function Movies() {
  const navigate = useNavigate();
  const auth = useAuthFlow();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(12);

  // Filtros - estado de input (inmediato, no interrumpe escritura)
  const [titleInput, setTitleInput] = useState('');
  // Estado de filtro (se actualiza con debounce)
  const [title, setTitle] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(undefined);
  const [releaseYear, setReleaseYear] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');

  const location = useLocation();

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
    const pageable: Pageable = { page, size, sort: ['title,asc'] };
    const filter: MovieFilter = {
      title: title || undefined,
      genreIds: selectedGenreId != null ? [selectedGenreId] : undefined,
      releaseYear: releaseYear ? Number(releaseYear) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
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
  }, [page, size, title, selectedGenreId, releaseYear, minRating]);

  useEffect(() => {
    fetchGenres();
    fetchMovies();
  }, [fetchGenres, page, selectedGenreId, releaseYear, minRating, title]);

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

  const handleLogout = () => {
    auth.handleLogout();
  };

  return (
    <>
      <Navbar
        isLoggedIn={auth.isLoggedIn}
        user={auth.user}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
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
          <Link to="/" className="text-sm text-[#8b5cf6] hover:underline">
            ← Volver al inicio
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <select
                value={selectedGenreId ?? ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedGenreId(id === 0 ? undefined : id);
                  setPage(0);
                }}
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-colors"
              >
                <option value="0">Todos los géneros</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
                Año de salida
              </label>
              <select
                value={releaseYear}
                onChange={(e) => {
                  setReleaseYear(e.target.value);
                  setPage(0);
                }}
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-colors"
              >
                <option value="">Cualquier año</option>
                {[...Array(127)].map((_, i) => 2026 - i).map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
                Rating mínimo
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="5"
                value={minRating}
                onChange={(e) => {
                  setMinRating(e.target.value);
                  setPage(0);
                }}
                placeholder="0.5"
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-colors"
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
              setMinRating('');
              setPage(0);
            }}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie) => (
                <MovieCard key={movie.id} {...movie} />
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
