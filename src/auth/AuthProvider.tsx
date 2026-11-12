import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AUTH_EVENT,
  getStoredSession,
  getTokenExpiry,
  isTokenExpired,
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
  register as registerRequest,
  type AuthSession,
  type AuthUser,
} from '../api';

/**
 * Contexto global de autenticación.
 *
 * - Restaura la sesión JWT desde localStorage al arrancar.
 * - Refresca el access token automáticamente antes de que caduque.
 * - Mantiene sincronizadas todas las pestañas/componentes que usan `useAuth`.
 */
export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  email: string | null;
  roles: string[];
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Se refresca el token este número de segundos antes de que caduque. */
const REFRESH_AHEAD_SECONDS = 30;
const MIN_REFRESH_DELAY_MS = 5_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const clearRefreshTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Programa el siguiente refresco automático a partir de la expiración real
   * del JWT (`exp`). Si el token ya está dentro del margen, refresca enseguida.
   */
  const scheduleRefresh = useCallback(
    (accessToken: string | null) => {
      clearRefreshTimer();
      if (!accessToken) return;

      const expiry = getTokenExpiry(accessToken);
      if (!expiry) return;

      const delay = Math.max(
        expiry * 1000 - Date.now() - REFRESH_AHEAD_SECONDS * 1000,
        MIN_REFRESH_DELAY_MS
      );

      timerRef.current = window.setTimeout(async () => {
        const refreshed = await refreshSession();
        if (!mountedRef.current) return;

        if (refreshed) {
          setSession(refreshed);
          scheduleRefresh(refreshed.accessToken);
        } else {
          // El refresh token ya no es válido: sesión terminada.
          setSession(null);
          clearRefreshTimer();
        }
      }, delay);
    },
    [clearRefreshTimer]
  );

  // Restauración inicial de la sesión.
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const restore = async () => {
      const stored = getStoredSession();

      if (!stored) {
        if (!cancelled) {
          setSession(null);
          setIsLoading(false);
        }
        return;
      }

      if (isTokenExpired(stored.accessToken, REFRESH_AHEAD_SECONDS)) {
        const refreshed = await refreshSession();
        if (cancelled) return;
        setSession(refreshed);
        setIsLoading(false);
        scheduleRefresh(refreshed?.accessToken ?? null);
        return;
      }

      if (!cancelled) {
        setSession(stored);
        setIsLoading(false);
        scheduleRefresh(stored.accessToken);
      }
    };

    restore();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      clearRefreshTimer();
    };
  }, [clearRefreshTimer, scheduleRefresh]);

  // La capa de API guarda/limpia tokens por su cuenta (login, refresh, 401…).
  // Este evento mantiene el contexto sincronizado con localStorage.
  useEffect(() => {
    const handleChange = () => {
      const stored = getStoredSession();
      setSession(stored);
      setIsLoading(false);
      scheduleRefresh(stored?.accessToken ?? null);
    };

    window.addEventListener(AUTH_EVENT, handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      window.removeEventListener(AUTH_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, [scheduleRefresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const nextSession = await loginRequest({ email, password });
      setSession(nextSession);
      setIsLoading(false);
      scheduleRefresh(nextSession.accessToken);
    },
    [scheduleRefresh]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await registerRequest({ username, email, password });

      // El backend solo confirma el registro, así que iniciamos sesión.
      try {
        await login(email, password);
      } catch {
        throw new Error(
          'Cuenta creada correctamente, pero no se pudo iniciar sesión. Prueba a iniciar sesión manualmente.'
        );
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    logoutRequest();
    clearRefreshTimer();
    setSession(null);
    setIsLoading(false);
  }, [clearRefreshTimer]);

  const refresh = useCallback(async () => {
    const refreshed = await refreshSession();
    setSession(refreshed);
    scheduleRefresh(refreshed?.accessToken ?? null);
    return refreshed !== null;
  }, [scheduleRefresh]);

  const value = useMemo<AuthContextValue>(() => {
    const user: AuthUser | null = session
      ? {
          username: session.username,
          email: session.email,
          roles: session.roles,
        }
      : null;

    return {
      user,
      isAuthenticated: session !== null,
      isLoading,
      username: session?.username ?? null,
      email: session?.email ?? null,
      roles: session?.roles ?? [],
      accessToken: session?.accessToken ?? null,
      refreshToken: session?.refreshToken ?? null,
      tokenType: session?.tokenType ?? null,
      login,
      register,
      logout,
      refresh,
    };
  }, [session, isLoading, login, register, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return context;
}

export default AuthProvider;
