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
    <section className="mb-16 relative">
      {title && (
        <h2 className="text-2xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-[#8b5cf6] rounded-full"></span>
          {title}
        </h2>
      )}
      {/* Imagen de fondo grande */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="h-[600px] lg:h-[700px] rounded-2xl overflow-hidden shadow-2xl border border-[#e2e8f0] relative group cursor-pointer"
      >
        <img
          src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=800&fit=crop'}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
          }}
          aria-label="Película anterior"
          className="absolute left-6 top-1/2 z-20 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-[#0f172a] shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
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
          className="absolute right-6 top-1/2 z-20 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-[#0f172a] shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m18 5 7 7-7 7" />
          </svg>
        </button>

        {/* Contenido superpuesto en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          {/* Fondo degradado para el contenido */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
              {/* Título y descripción a la izquierda */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[#8b5cf6] text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    {movie.year}
                  </span>
                  <span className="px-3 py-1 bg-[#0f172a] text-white text-xs font-bold rounded-full">
                    {movie.rating}★
                  </span>
                  {movie.genre && (
                    <span className="px-3 py-1 bg-white text-[#7c3aed] text-xs font-bold rounded-full border border-white/30">
                      {movie.genre}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight shadow-sm">
                  {movie.title}
                </h2>
                {movie.description && (
                  <p className="text-white/90 text-lg lg:text-xl leading-relaxed mb-6 max-w-md lg:max-w-lg shadow-sm">
                    {movie.description}
                  </p>
                )}
              </div>

              {/* Botones a la derecha */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="px-8 py-3 bg-[#8b5cf6] text-white text-base font-medium rounded-full hover:bg-[#7c3aed] transition-colors shadow-lg"
                >
                  Ver más
                </button>
                <button
                  className="px-8 py-3 bg-white text-[#0f172a] text-base font-medium rounded-full border border-white hover:bg-[#f8fafc] transition-colors shadow-lg"
                >
                  Agregar a pendientes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores de página */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                currentIndex === idx ? 'bg-[#8b5cf6]' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
