import { Link } from '../router';
import { Navbar } from '../components/Navbar';
import { HeroCarousel } from '../components/HeroCarousel';
import { MovieCard } from '../components/MovieCard';
import { Footer } from '../components/Footer';
import { useAuthFlow } from '../components/AuthFlow';
import { MOVIES } from '../data/mockData';

// Películas del año 2026 (carrusel hero principal)
const movies2026 = MOVIES.filter((m) => m.releaseYear === 2026)
  .slice(0, 6)
  .map((m) => ({
    id: m.id,
    title: m.title,
    year: m.releaseYear,
    rating: m.averageRating ?? 0,
    genre: m.genres?.[0]?.name,
    poster: m.posterURL ?? undefined,
    description: m.description,
  }));

// Películas mejor valoradas
const topRated = [...MOVIES]
  .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
  .slice(0, 5);

// Películas por género
const byGenre = (genreId: number) =>
  MOVIES.filter((m) => m.genres?.some((g) => g.id === genreId)).slice(0, 5);

const actionMovies = byGenre(1);
const horrorMovies = byGenre(11);
const comedyMovies = byGenre(4);

export function Home() {
  const auth = useAuthFlow();

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        isLoggedIn={auth.isLoggedIn}
        user={auth.user}
        onLogin={auth.openLogin}
        onRegister={auth.openRegister}
        onLogout={auth.handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sección 1: Hero Carousel - Películas del año 2026 */}
        <HeroCarousel title="Películas del año 2026" movies={movies2026} />

        {/* Sección 2: Películas mejor valoradas */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#8b5cf6] rounded-full"></span>
            Películas mejor valoradas de Movienatic
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {topRated.map((movie) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        </div>

        {/* Sección 3: Acción */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#8b5cf6] rounded-full"></span>
            Películas de acción
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {actionMovies.map((movie) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        </div>

        {/* Sección 4: Terror */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#8b5cf6] rounded-full"></span>
            Películas de terror
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {horrorMovies.map((movie) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        </div>

        {/* Sección 5: Comedia */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#8b5cf6] rounded-full"></span>
            Películas de comedia
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {comedyMovies.map((movie) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        </div>

        {/* Botón final: Explora todas las películas */}
        <div className="text-center mb-16">
          <Link
            to="/movies"
            className="inline-block px-8 py-3 bg-[#8b5cf6] text-white text-base font-medium rounded-full hover:bg-[#7c3aed] transition-colors shadow-lg"
          >
            Explora todas las películas →
          </Link>
        </div>
      </main>

      <Footer />

      {/* Modales */}
      {auth.modals}
    </div>
  );
}

export default Home;
