import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from '../router';
import {
  getFollowers,
  getFollowing,
  getUserDetail,
  type UserBasic,
  type UserDetail,
} from '../api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function UserRow({ user }: { user: UserBasic }) {
  return (
    <Link
      to={`/users/${user.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-line/10 bg-surface px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-line/20 hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-white">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.username}
            className="h-full w-full object-cover"
          />
        ) : (
          initials(user.username)
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-sm font-semibold text-ink group-hover:text-accent">
          {user.username}
        </span>
        <span className="block text-xs text-faint">Ver perfil</span>
      </span>
      <span
        aria-hidden="true"
        className="text-faint transition-colors group-hover:text-accent"
      >
        →
      </span>
    </Link>
  );
}

export function ConnectionsPage() {
  const { userId } = useParams();
  const location = useLocation();
  const auth = useAuthFlow();

  const profileId = userId ? Number(userId) : null;
  const pathname = location.split('?')[0];
  const mode = pathname.endsWith('/followers') ? 'followers' : 'following';

  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [users, setUsers] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (profileId == null || !Number.isFinite(profileId) || profileId <= 0) {
      setError('El usuario indicado no existe.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [userDetail, connections] = await Promise.all([
        getUserDetail(profileId),
        mode === 'followers'
          ? getFollowers(profileId)
          : getFollowing(profileId),
      ]);

      setDetail(userDetail);
      setUsers(connections ?? []);
    } catch (e) {
      const status = (e as { status?: number }).status;
      setError(
        status === 401
          ? 'No se pudo cargar la comunidad.'
          : e instanceof Error
            ? e.message
            : 'No se pudieron cargar los usuarios.',
      );
      setDetail(null);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, mode]);

  const isFollowers = mode === 'followers';
  const title = isFollowers ? 'Seguidores' : 'Siguiendo';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLogin={auth.openLogin} onRegister={auth.openRegister} />

      <main className="page-container flex-1 py-10 sm:py-14">
        <BackLink to={profileId ? `/users/${profileId}` : '/profile'} className="mb-7">
          Volver al perfil
        </BackLink>

        {loading ? (
          <Loading message={`Cargando ${title.toLowerCase()}...`} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : detail ? (
          <>
            <header className="surface p-6 sm:p-8">
              <span className="eyebrow mb-2.5">Comunidad</span>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink">
                {title}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {isFollowers
                  ? `Usuarios que siguen a `
                  : `Usuarios a los que sigue `}
                <Link
                  to={`/users/${detail.id}`}
                  className="font-medium text-accent hover:underline"
                >
                  {detail.username}
                </Link>
                {' · '}
                <span className="font-semibold text-ink">
                  {isFollowers
                    ? detail.followersCount
                    : detail.followingCount}
                </span>
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  to={`/users/${detail.id}/following`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    !isFollowers
                      ? 'bg-accent text-white'
                      : 'border border-line/10 bg-surface text-muted hover:text-ink'
                  }`}
                >
                  Siguiendo · {detail.followingCount}
                </Link>
                <Link
                  to={`/users/${detail.id}/followers`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isFollowers
                      ? 'bg-accent text-white'
                      : 'border border-line/10 bg-surface text-muted hover:text-ink'
                  }`}
                >
                  Seguidores · {detail.followersCount}
                </Link>
              </div>
            </header>

            <section className="mt-8">
              {users.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line/10 bg-surface/60 px-5 py-10 text-sm text-faint">
                  {isFollowers
                    ? 'Este usuario todavía no tiene seguidores.'
                    : 'Este usuario todavía no sigue a nadie.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {users.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>

      <Footer />
      {auth.modals}
    </div>
  );
}

export default ConnectionsPage;
