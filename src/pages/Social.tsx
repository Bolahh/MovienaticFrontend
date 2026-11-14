import { useCallback, useEffect, useState } from 'react';
import {
  getLikedListIds,
  getPublicLists,
  getUserIdByUsername,
  likeList,
  unlikeList,
  type MovieList,
} from '../api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { PublicListCard } from '../components/PublicListCard';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';

export function Social() {
  const auth = useAuthFlow();
  const [lists, setLists] = useState<MovieList[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [likeBusyId, setLikeBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const ls = await getPublicLists(50);
      setLists(ls);

      if (auth.isAuthenticated && auth.username) {
        const userId = await getUserIdByUsername(auth.username);
        setCurrentUserId(userId);
        setLikedIds(new Set(await getLikedListIds(userId)));
      } else {
        setCurrentUserId(null);
        setLikedIds(new Set());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las listas.');
    } finally {
      setLoading(false);
    }
  }, [auth.isAuthenticated, auth.username]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const toggleLike = async (list: MovieList) => {
    if (!auth.isAuthenticated || !auth.username) {
      auth.openLogin();
      return;
    }
    if (likeBusyId != null) return;

    setLikeBusyId(list.id);
    try {
      const userId =
        currentUserId ?? (await getUserIdByUsername(auth.username));
      if (currentUserId == null) setCurrentUserId(userId);

      const isLiked = likedIds.has(list.id);
      const result = isLiked
        ? await unlikeList(userId, list.id)
        : await likeList(userId, list.id);

      setLikedIds((prev) => {
        const next = new Set(prev);
        if (result.liked) next.add(list.id);
        else next.delete(list.id);
        return next;
      });

      setLists((prev) =>
        prev
          .map((item) =>
            item.id === list.id
              ? { ...item, likeCount: result.likeCount }
              : item,
          )
          .sort(
            (a, b) =>
              (b.likeCount ?? 0) - (a.likeCount ?? 0) || a.id - b.id,
          ),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo actualizar el me gusta.',
      );
    } finally {
      setLikeBusyId(null);
    }
  };

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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {lists.map((list) => (
              <PublicListCard
                key={list.id}
                list={list}
                liked={likedIds.has(list.id)}
                likeBusy={likeBusyId === list.id}
                onToggleLike={() => toggleLike(list)}
              />
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
