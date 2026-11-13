import { useMemo } from 'react';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetailPage } from './pages/MovieDetail';
import { Social } from './pages/Social';
import { ProfilePage } from './pages/Profile';
import { ListDetailPage } from './pages/ListDetail';
import { MovieCollectionPage } from './pages/MovieCollection';
import { UserReviewsPage } from './pages/UserReviews';
import { ConnectionsPage } from './pages/Connections';
import { InfoPage } from './pages/Info';
import { Router } from './router';

export default function App() {
  const routes = useMemo(
    () => [
      { path: '/', element: Home },
      { path: '/movies', element: Movies },
      { path: '/movies/:movieId', element: MovieDetailPage },
      { path: '/social', element: Social },
      { path: '/profile', element: ProfilePage },
      { path: '/users/:userId', element: ProfilePage },
      { path: '/users/:userId/lists/:listId', element: ListDetailPage },
      { path: '/users/:userId/favourites', element: MovieCollectionPage },
      { path: '/users/:userId/pending', element: MovieCollectionPage },
      { path: '/users/:userId/reviews', element: UserReviewsPage },
      { path: '/users/:userId/followers', element: ConnectionsPage },
      { path: '/users/:userId/following', element: ConnectionsPage },
      { path: '/about', element: InfoPage },
      { path: '/contact', element: InfoPage },
      { path: '/help', element: InfoPage },
      { path: '/privacy', element: InfoPage },
      { path: '/terms', element: InfoPage },
      { path: '/cookies', element: InfoPage },
      { path: '/legal', element: InfoPage },
      { path: '/data', element: InfoPage },
      { path: '/*', element: Home },
    ],
    []
  );

  return <Router routes={routes} />;
}
