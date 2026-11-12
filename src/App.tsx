import { useMemo } from 'react';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetailPage } from './pages/MovieDetail';
import { Social } from './pages/Social';
import { InfoPage } from './pages/Info';
import { Router } from './router';

export default function App() {
  const routes = useMemo(
    () => [
      { path: '/', element: Home },
      { path: '/movies', element: Movies },
      { path: '/movies/:movieId', element: MovieDetailPage },
      { path: '/social', element: Social },
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
