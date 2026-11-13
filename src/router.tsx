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
  useRef,
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
  back: (fallback: string) => void;
  location: string;
  params: Record<string, string>;
};

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function useNavigate() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useNavigate debe usarse dentro de un Router');
  return ctx.navigate;
}

/** Vuelve a la página anterior; si no hay historial interno usa `fallback`. */
export function useBack() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useBack debe usarse dentro de un Router');
  return ctx.back;
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
  // Indica si el usuario ha navegado dentro de la SPA (para poder volver atrás).
  const hasInternalHistory = useRef(false);
  // Posición de scroll guardada por URL, para restaurarla al volver atrás.
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const currentUrlRef = useRef(window.location.href);

  // Restaura el scroll de una URL. Reintenta mientras la página carga datos.
  const restoreScroll = useCallback((url: string) => {
    const target = scrollPositions.current.get(url) ?? 0;
    let attempts = 0;

    const tryRestore = () => {
      window.scrollTo(0, target);
      attempts += 1;
      if (attempts < 60 && Math.abs(window.scrollY - target) > 1) {
        window.setTimeout(tryRestore, 50);
      }
    };

    tryRestore();
  }, []);

  // Desactiva la restauración automática del navegador: la gestionamos nosotros.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const navigate = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      const normalized = to.startsWith('/') ? to : `/${to}`;

      // Guardamos dónde estaba el usuario antes de cambiar de página.
      scrollPositions.current.set(currentUrlRef.current, window.scrollY);

      if (options?.replace) {
        window.history.replaceState(null, '', normalized);
      } else {
        window.history.pushState(null, '', normalized);
        hasInternalHistory.current = true;
      }

      currentUrlRef.current = window.location.href;
      setFullUrl(window.location.href);
      setPathname(window.location.pathname);

      // Una página nueva siempre empieza arriba.
      window.scrollTo(0, 0);
    },
    []
  );

  const back = useCallback(
    (fallback: string) => {
      if (hasInternalHistory.current) {
        window.history.back();
      } else {
        navigate(fallback);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const onPopState = () => {
      hasInternalHistory.current = true;

      // Guardamos el scroll de la página que dejamos y restauramos el destino.
      scrollPositions.current.set(currentUrlRef.current, window.scrollY);
      currentUrlRef.current = window.location.href;

      setFullUrl(window.location.href);
      setPathname(window.location.pathname);

      restoreScroll(window.location.href);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [restoreScroll]);

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
    <RouterContext.Provider value={{ navigate, back, location: fullUrl, params: match.params }}>
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
