import { useEffect, useState } from 'react';
import { Link, useParams } from '../router';
import {
  getUserDetail,
  getUserReviews,
  type Review,
  type UserDetail,
} from '../api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackLink } from '../components/BackLink';
import { useAuthFlow } from '../components/AuthFlow';
import { Loading, ErrorState } from '../components/Spinner';
import { ProfileReviewCard } from '../components/ProfileReviewCard';

export function UserReviewsPage() {
  const { userId } = useParams();
  const auth = useAuthFlow();

  const profileId = userId ? Number(userId) : null;

  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
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
      const [userDetail, userReviews] = await Promise.all([
        getUserDetail(profileId),
        getUserReviews(profileId),
      ]);

      setDetail(userDetail);
      setReviews(userReviews ?? []);
    } catch (e) {
      const status = (e as { status?: number }).status;
      setError(
        status === 401
          ? 'Inicia sesión para ver las reseñas.'
          : e instanceof Error
            ? e.message
            : 'No se pudieron cargar las reseñas.',
      );
      setDetail(null);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLogin={auth.openLogin} onRegister={auth.openRegister} />

      <main className="page-container flex-1 py-10 sm:py-14">
        <BackLink
          to={profileId ? `/users/${profileId}` : '/profile'}
          back
          className="mb-7"
        >
          Volver al perfil
        </BackLink>

        {loading ? (
          <Loading message="Cargando reseñas..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : detail ? (
          <>
            <header className="surface p-6 sm:p-8">
              <span className="eyebrow mb-2.5">Su opinión</span>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink">
                Reseñas
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <span>
                  {reviews.length}{' '}
                  {reviews.length === 1 ? 'reseña' : 'reseñas'} de{' '}
                  <Link
                    to={`/users/${detail.id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {detail.username}
                  </Link>
                </span>
              </p>
            </header>

            <section className="mt-10">
              {reviews.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line/10 bg-surface/60 px-5 py-10 text-sm text-faint">
                  Este usuario todavía no ha escrito reseñas.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {reviews.map((review, index) => (
                    <ProfileReviewCard
                      key={review.id ?? `${review.timestamp}-${index}`}
                      review={review}
                    />
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

export default UserReviewsPage;
