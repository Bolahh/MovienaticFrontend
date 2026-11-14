import { useState, useEffect } from 'react';
import { Link } from '../router';

type HeroMovie = {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster?: string;
  genre?: string;
  description?: string;
};

type HeroCarouselProps = {
  title: string;
  movies: HeroMovie[];
  /** Ids de películas que el usuario ya tiene en pendientes. */
  pendingIds?: Set<number>;
  /** Id de la película cuya petición de pendientes está en curso. */
  pendingBusyId?: number | null;
  /** Si se indica, el botón de pendientes ejecuta esta acción. */
  onAddPending?: (movieId: number) => void;
};

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=1200&fit=crop';

export function HeroCarousel({
  title,
  movies,
  pendingIds,
  pendingBusyId,
  onAddPending,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide cada 5 segundos si no está en hover
  useEffect(() => {
    if (movies.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [movies.length, isHovered]);

  if (movies.length === 0) return null;

  const movie = movies[currentIndex];
  const poster = movie.poster || FALLBACK_POSTER;
  const isPending = pendingIds?.has(movie.id) ?? false;
  const pendingBusy = pendingBusyId === movie.id;

  const goTo = (index: number) => {
    setCurrentIndex((index + movies.length) % movies.length);
  };

  return (
    <section className="relative mb-20">
      {title && (
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow mb-3">Destacado</span>
            <h2 className="section-title">{title}</h2>
          </div>

          {/* Indicadores fuera de la tarjeta para no tapar el contenido */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {movies.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`Ir a la película ${idx + 1}`}
                aria-current={currentIndex === idx ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-7 bg-accent'
                    : 'w-3 bg-ink/20 hover:bg-ink/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative overflow-hidden rounded-[1.75rem] border border-line/10 bg-[#0b0912] shadow-[0_40px_80px_-50px_rgba(0,0,0,0.7)]"
      >
        {/* Fondo cinematográfico: el póster desenfocado llena el ancho */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <img
            key={`backdrop-${movie.id}`}
            src={poster}
            alt=""
            onError={(event) => {
              event.currentTarget.style.visibility = 'hidden';
            }}
            className="h-full w-full scale-110 object-cover opacity-40 blur-2xl transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0812] via-[#0a0812]/85 to-[#0a0812]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0812] via-transparent to-[#0a0812]/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.18),transparent_55%)]" />
        </div>

        {/* Contenido: texto a la izquierda, póster vertical a la derecha */}
        <div className="relative z-10 grid min-h-[460px] grid-cols-1 items-center gap-8 px-14 py-10 pb-14 sm:min-h-[520px] sm:px-16 sm:py-12 md:grid-cols-[minmax(0,1fr)_210px] md:gap-10 md:px-20 lg:grid-cols-[minmax(0,1fr)_270px] lg:px-24 lg:py-14">
          <div className="max-w-2xl">
            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white ring-1 ring-white/25 backdrop-blur-md">
                {movie.year}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-[#c4b5fd]" aria-hidden="true">
                  <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z" />
                </svg>
                {movie.rating.toFixed(1)}
              </span>
              {movie.genre && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">
                  {movie.genre}
                </span>
              )}
            </div>

            <h2 className="line-clamp-3 font-heading text-3xl font-extrabold leading-[1.04] tracking-[-0.03em] text-white text-balance sm:text-4xl lg:text-5xl">
              {movie.title}
            </h2>

            {movie.description && (
              <p className="mt-4 line-clamp-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                {movie.description}
              </p>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/movies/${movie.id}`}
                className="group/cta inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#14121c] transition-all hover:-translate-y-px hover:bg-[#ede9fe]"
              >
                Ver más
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m18 5 7 7-7 7" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => onAddPending?.(movie.id)}
                disabled={pendingBusy || isPending || !onAddPending}
                aria-pressed={isPending}
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:cursor-default disabled:opacity-80"
              >
                {pendingBusy
                  ? 'Guardando…'
                  : isPending
                    ? 'En pendientes'
                    : 'Agregar a pendientes'}
              </button>
            </div>
          </div>

          {/* Póster en su proporción real (2:3) */}
          <div className="hidden md:block">
            <div className="relative mx-auto aspect-[2/3] w-full max-w-[270px] overflow-hidden rounded-2xl bg-ink/5 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.85)] ring-1 ring-white/15">
              <img
                key={`poster-${movie.id}`}
                src={poster}
                alt={`Póster de ${movie.title}`}
                onError={(event) => {
                  event.currentTarget.style.visibility = 'hidden';
                }}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>
          </div>
        </div>

        {/* Flechas simples en los laterales, dentro del espacio reservado */}
        {movies.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              aria-label="Película anterior"
              className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-white hover:text-[#14121c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-5 sm:h-10 sm:w-10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(currentIndex + 1)}
              aria-label="Película siguiente"
              className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-white hover:text-[#14121c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-5 sm:h-10 sm:w-10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default HeroCarousel;
