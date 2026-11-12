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
    <>
      <Navbar
        onLogin={auth.openLogin}
        onRegister={auth.openRegister}
      />
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Social</h1>
              <p className="text-[#64748b]">
                Descubre listas de películas creadas por la comunidad
              </p>
            </div>
            <BackLink to="/">
              Volver al inicio
            </BackLink>
          </div>

          <div className="text-center mb-8">
            <p className="text-[#64748b] text-sm">
              Listas ordenadas por popularidad (más likes)
            </p>
          </div>

          {loading ? (
            <Loading message="Cargando listas..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchLists} />
          ) : lists.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#64748b] text-lg">
                No hay listas disponibles aún.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#ede9fe] flex items-center justify-center text-[#7c3aed] font-bold">
                        {list.user?.username.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0f172a]">
                          {list.user?.username || 'Usuario'}
                        </h3>
                        <span className="text-xs text-[#64748b]">
                          {list.movies?.length ?? 0} película
                          {list.movies?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#8b5cf6] bg-[#ede9fe] px-2 py-1 rounded-full">
                      ❤️ {list.likeCount ?? 0}
                    </span>
                  </div>

                  <h4 className="text-xl font-semibold text-[#0f172a] mb-3">
                    {list.name}
                  </h4>
                  {list.description && (
                    <p className="text-[#64748b] text-sm mb-4 line-clamp-2">
                      {list.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {(list.movies || []).slice(0, 4).map((movie) => (
                      <div
                        key={movie.id}
                        className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#f1f5f9]"
                      >
                        <img
                          src={
                            movie.posterURL ||
                            `https://picsum.photos/seed/movienatic-${movie.id}/200/300`
                          }
                          alt={movie.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1">
                          <p className="text-[10px] text-white truncate">
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
        </div>
      </section>
      <Footer />
      {auth.modals}
    </>
  );
}

export default Social;
