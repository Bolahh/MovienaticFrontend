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
    <div className="flex min-h-screen flex-col">
      <Navbar
        onLogin={auth.openLogin}
        onRegister={auth.openRegister}
      />

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

        {/* Sección 1: Hero Carousel - Películas del año 2026 */}
        <HeroCarousel title="Películas del año 2026" movies={movies2026} />

        {/* Sección 2: Películas mejor valoradas */}
        <section className="mb-16">
          <div className="mb-7">
            <span className="eyebrow mb-3">Aclamadas</span>
            <h2 className="section-title">Las mejor valoradas de Movienatic</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
            {topRated.map((movie) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        </section>

        <div className="hairline mb-16" />

        {/* Sección 3: Acción */}
        <section className="mb-16">
          <div className="mb-7">
            <span className="eyebrow mb-3">Energía</span>
            <h2 className="section-title">Películas de acción</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
            {actionMovies.map((movie) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        </section>

        {/* Sección 4: Terror */}
        <section className="mb-16">
          <div className="mb-7">
            <span className="eyebrow mb-3">Tensión</span>
            <h2 className="section-title">Películas de terror</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
            {horrorMovies.map((movie) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        </section>

        {/* Sección 5: Comedia */}
        <section className="mb-16">
          <div className="mb-7">
            <span className="eyebrow mb-3">Buen rollo</span>
            <h2 className="section-title">Películas de comedia</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
            {comedyMovies.map((movie) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        </section>

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
              Filtra por género, año o valoración y encuentra exactamente lo que
              te apetece ver hoy.
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
      </main>

      <Footer />

      {/* Modales */}
      {auth.modals}
    </div>
  );
}

export default Home;
