import { useCallback, useEffect, useState } from 'react';
import { getPublicLists, type MovieList } from '../api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';

export function Social() {
  const auth = useAuthFlow();
  const [lists, setLists] = useState<MovieList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const ls = await getPublicLists();
      setLists([...(ls || [])].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0)));
    } catch (e: any) {
      setError(e.message || 'No se pudieron cargar las listas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        onLogin={auth.openLogin}
        onRegister={auth.openRegister}
      />
      <section className="page-container flex-1 py-12 sm:py-16">
        <div className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow mb-4">Comunidad</span>
            <h1 className="display-title">Social</h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
              Descubre listas de películas creadas por la comunidad y guarda las
              que te inspiren.
            </p>
          </div>
          <BackLink to="/">
            Volver al inicio
          </BackLink>
        </div>

        <div className="mb-8 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M3 6h18M3 12h12M3 18h6" />
          </svg>
          Ordenadas por popularidad
        </div>

        {loading ? (
          <Loading message="Cargando listas..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLists} />
        ) : lists.length === 0 ? (
          <div className="surface py-20 text-center">
            <p className="text-base text-muted">
              No hay listas disponibles aún.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {lists.map((list) => (
              <div
                key={list.id}
                className="group rounded-3xl border border-line/10 bg-surface p-6 shadow-[0_1px_2px_rgba(16,12,30,0.03)] transition-all hover:-translate-y-0.5 hover:border-line/15 hover:shadow-[0_30px_60px_-40px_rgba(16,12,30,0.5)]"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                      {list.user?.username.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-ink">
                        {list.user?.username || 'Usuario'}
                      </h3>
                      <span className="text-xs text-faint">
                        {list.movies?.length ?? 0} película
                        {list.movies?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M12 21s-7.5-4.6-9.6-9.1C.8 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.4.4.6.6 1.2.6 1.2h2.8s.2-.6.6-1.2C14.8 6.1 16.2 5 18.2 5c3.4 0 5 3.6 3.4 6.9C19.5 16.4 12 21 12 21Z" />
                    </svg>
                    {list.likeCount ?? 0}
                  </span>
                </div>

                <h4 className="font-heading text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-accent">
                  {list.name}
                </h4>
                {list.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {list.description}
                  </p>
                )}

                <div className="mt-5 grid grid-cols-4 gap-2.5">
                  {(list.movies || []).slice(0, 4).map((movie) => (
                    <div
                      key={movie.id}
                      className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gradient-to-br from-[#241d38] via-[#191524] to-[#12212e] ring-1 ring-line/10"
                    >
                      <img
                        src={
                          movie.posterURL ||
                          `https://picsum.photos/seed/movienatic-${movie.id}/200/300`
                        }
                        alt={movie.title}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                        }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6">
                        <p className="truncate text-[10px] font-medium text-white">
                          {movie.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
      {auth.modals}
    </div>
  );
}

export default Social;
