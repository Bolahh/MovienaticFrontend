import { useState, useEffect } from 'react';

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
};

export function HeroCarousel({ title, movies }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide cada 5 segundos si no está en hover
  useEffect(() => {
    if (movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [movies.length, isHovered]);

  const movie = movies[currentIndex];

  return (
    <section className="relative mb-20">
      {title && (
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow mb-3">Destacado</span>
            <h2 className="section-title">{title}</h2>
          </div>
        </div>
      )}
      {/* Imagen de fondo grande */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative h-[560px] overflow-hidden rounded-[1.75rem] border border-line/10 bg-surface shadow-[0_40px_80px_-50px_rgba(0,0,0,0.7)] lg:h-[620px]"
      >
        {/* Fondo de reserva si el póster no carga */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(124,58,237,0.22),transparent_55%),radial-gradient(circle_at_15%_85%,rgba(56,189,248,0.12),transparent_55%),linear-gradient(135deg,#0e0c15,#151122_55%,#1a1329)]"
        />
        <img
          src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=800&fit=crop'}
          alt={movie.title}
          onError={(event) => {
            event.currentTarget.style.visibility = 'hidden';
          }}
          className="relative h-full w-full object-cover opacity-95 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        {/* Overlays para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
          }}
          aria-label="Película anterior"
          className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white opacity-0 ring-1 ring-white/25 backdrop-blur-md transition-all hover:bg-white hover:text-[#14121c] focus-visible:opacity-100 group-hover:opacity-100 sm:left-6 sm:h-12 sm:w-12"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>

        {/* Flecha derecha */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev + 1) % movies.length);
          }}
          aria-label="Película siguiente"
          className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white opacity-0 ring-1 ring-white/25 backdrop-blur-md transition-all hover:bg-white hover:text-[#14121c] focus-visible:opacity-100 group-hover:opacity-100 sm:right-6 sm:h-12 sm:w-12"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m18 5 7 7-7 7" />
          </svg>
        </button>

        {/* Contenido superpuesto */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9 lg:p-12">
          <div className="max-w-3xl">
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

            <h2 className="font-heading text-3xl font-extrabold leading-[1.04] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              {movie.title}
            </h2>
            {movie.description && (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                {movie.description}
              </p>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                className="group/cta inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#14121c] transition-all hover:-translate-y-px hover:bg-[#ede9fe]"
              >
                Ver más
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m18 5 7 7-7 7" />
                </svg>
              </button>
              <button
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                Agregar a pendientes
              </button>
            </div>
          </div>
        </div>

        {/* Indicadores de página */}
        <div className="absolute bottom-7 right-7 z-20 hidden items-center gap-2 sm:flex lg:bottom-9 lg:right-10">
          {movies.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir a la película ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-7 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
