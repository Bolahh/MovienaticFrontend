/**
 * Router sencillo basado en la History API.
 * Provee Router, Route, Link, useNavigate, useLocation, useParams.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type ComponentType,
} from 'react';

type RouteConfig = {
  path: string;
  element: ComponentType;
};

type RouterContextType = {
  navigate: (to: string, options?: { replace?: boolean }) => void;
  location: string;
  params: Record<string, string>;
};

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function useNavigate() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useNavigate debe usarse dentro de un Router');
  return ctx.navigate;
}

export function useLocation() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useLocation debe usarse dentro de un Router');
  return ctx.location;
}

export function useParams() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useParams debe usarse dentro de un Router');
  return ctx.params;
}

export function Link({
  to,
  children,
  className,
  ...rest
}: {
  to: string;
  children: ReactNode;
  className?: string;
} & Record<string, unknown>) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}

function pathToRegex(path: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];
  let regex = path
    .replace(/:([^/]+)/g, (_: string, key: string) => {
      keys.push(key);
      return '([^/]+)';
    })
    .replace(/\*/g, '(.*)');
  regex = `^${regex}$`;
  return { regex: new RegExp(regex), keys };
}

export function Router({
  routes,
  NotFound,
}: {
  routes: RouteConfig[];
  NotFound?: ComponentType;
}) {
  const [fullUrl, setFullUrl] = useState(window.location.href);
  const [pathname, setPathname] = useState(window.location.pathname);

  const navigate = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      const normalized = to.startsWith('/') ? to : `/${to}`;
      if (options?.replace) {
        window.history.replaceState(null, '', normalized);
      } else {
        window.history.pushState(null, '', normalized);
      }
      setFullUrl(window.location.href);
      setPathname(window.location.pathname);
    },
    []
  );

  useEffect(() => {
    const onPopState = () => {
      setFullUrl(window.location.href);
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const match = useMemo(() => {
    let best: { element: ComponentType | null; params: Record<string, string> } = {
      element: null,
      params: {},
    };
    let bestScore = -1;

    for (const route of routes) {
      const { regex, keys } = pathToRegex(route.path);
      const m = pathname.match(regex);
      if (m) {
        const params: Record<string, string> = {};
        keys.forEach((key, i) => {
          params[key] = m[i + 1];
        });
        const score = keys.length * 10 + (route.path === pathname ? 100 : 1);
        if (score > bestScore) {
          bestScore = score;
          best = { element: route.element, params };
        }
      }
    }

    return best;
  }, [pathname, routes]);

  const Component = match.element;

  return (
    <RouterContext.Provider value={{ navigate, location: fullUrl, params: match.params }}>
      {Component ? (
        <Component />
      ) : NotFound ? (
        <NotFound />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted">
          <h2 className="text-xl font-bold text-ink mb-2">Página no encontrada</h2>
          <p>La página que buscas no existe.</p>
        </div>
      )}
    </RouterContext.Provider>
  );
}

export function Route(_: RouteConfig) {
  return null;
}
