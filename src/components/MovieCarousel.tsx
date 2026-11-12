import { useState, useEffect } from 'react';
import { MovieCard } from './MovieCard';

type MovieCarouselProps = {
  title: string;
  movies: Array<{
    id: number;
    title: string;
    year: number;
    rating: number;
    poster?: string;
    genre?: string;
  }>;
};

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide cada 4 segundos si no está en hover
  useEffect(() => {
    if (isHovered || movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, movies.length]);

  const visibleMovies = movies.slice(currentIndex, currentIndex + 3);

  return (
    <section className="mb-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="section-title">{title}</h2>
        <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-faint sm:block">
          Desliza
        </span>
      </div>

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative"
      >
        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)}
          aria-label="Película anterior"
          disabled={movies.length <= 3}
          className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/10 bg-surface text-muted opacity-0 shadow-[0_8px_24px_-12px_rgba(16,12,30,0.5)] transition-all hover:border-line/20 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-40 lg:-left-5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>

        {/* Películas */}
        <div className="flex gap-4 overflow-x-auto px-1 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">
          {visibleMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              year={movie.year}
              rating={movie.rating}
              poster={movie.poster}
              genre={movie.genre}
              className="w-44 shrink-0 snap-start sm:w-48"
            />
          ))}
        </div>

        {/* Flecha derecha */}
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % movies.length)}
          aria-label="Película siguiente"
          disabled={movies.length <= 3}
          className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/10 bg-surface text-muted opacity-0 shadow-[0_8px_24px_-12px_rgba(16,12,30,0.5)] transition-all hover:border-line/20 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-40 lg:-right-5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m18 5 7 7-7 7" />
          </svg>
        </button>

        {/* Indicador de posición */}
        {movies.length > 3 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: Math.ceil(movies.length / 3) }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i * 3)}
                aria-label={`Ir al grupo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === i * 3 ? 'w-6 bg-accent' : 'w-1.5 bg-ink/15 hover:bg-ink/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MovieCarousel;
