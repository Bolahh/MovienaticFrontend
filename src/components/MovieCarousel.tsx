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
      <h2 className="text-2xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-[#8b5cf6] rounded-full"></span>
        {title}
      </h2>

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
      >
        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)}
          aria-label="Película anterior"
          disabled={movies.length <= 3}
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#8b5cf6] hover:border-[#8b5cf6] transition-colors shadow-sm z-10 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:pointer-events-none`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>

        {/* Películas */}
        <div className="flex gap-4 overflow-x-auto px-2 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">
          {visibleMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              year={movie.year}
              rating={movie.rating}
              poster={movie.poster}
              genre={movie.genre}
              className="w-48 shrink-0 snap-start"
            />
          ))}
        </div>

        {/* Flecha derecha */}
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % movies.length)}
          aria-label="Película siguiente"
          disabled={movies.length <= 3}
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#8b5cf6] hover:border-[#8b5cf6] transition-colors shadow-sm z-10 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:pointer-events-none`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m18 5 7 7-7 7" />
          </svg>
        </button>

        {/* Indicador de posición */}
        {movies.length > 3 && (
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: Math.ceil(movies.length / 3) }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * 3)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentIndex === i * 3 ? 'bg-[#8b5cf6]' : 'bg-[#cbd5e1]'
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
