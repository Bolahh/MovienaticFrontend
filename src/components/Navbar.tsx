import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "../router";
import { useAuth } from "../auth/AuthProvider";
import { useTheme } from "../theme/ThemeProvider";
import { Logo } from "./Logo";

type NavbarProps = {
  onLogin?: () => void;
  onRegister?: () => void;
};

type SearchScope = "movies" | "users";

type IconProps = { className?: string };

function HomeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function FilmIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 3v18M16.5 3v18M3 7.5h4.5M3 12h18M3 16.5h4.5M16.5 7.5H21M16.5 16.5H21" />
    </svg>
  );
}

function UsersIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
      <circle cx="10" cy="7.5" r="3.5" />
      <path d="M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.38M15.5 4.13a3.5 3.5 0 0 1 0 6.74" />
    </svg>
  );
}

function UserIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}

function SearchIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function MenuIcon({ open, className = "" }: IconProps & { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      {open ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

function SunIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: "/", label: "Inicio", Icon: HomeIcon },
  { to: "/movies", label: "Películas", Icon: FilmIcon },
  { to: "/social", label: "Social", Icon: UsersIcon },
] as const;

function isActivePath(pathname: string, to: string): boolean {
  return to === "/"
    ? pathname === "/"
    : pathname === to || pathname.startsWith(`${to}/`);
}

export function Navbar({ onLogin, onRegister }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, username, email, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchScope, setSearchScope] = useState<SearchScope>("movies");
  const menuRef = useRef<HTMLDivElement>(null);

  const pathname = useMemo(() => {
    try {
      return new URL(location).pathname;
    } catch {
      return location.split("?")[0];
    }
  }, [location]);

  // Al cambiar de ruta cerramos menús y sincronizamos el buscador con ?title= o ?user=.
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);

    const params = new URLSearchParams(location.split("?")[1] || "");
    if (pathname === "/social" || params.has("user")) {
      setSearchScope("users");
      setSearch(params.get("user") || "");
    } else if (pathname === "/movies" || params.has("title")) {
      setSearchScope("movies");
      setSearch(params.get("title") || "");
    } else {
      setSearch("");
    }
  }, [location, pathname]);

  // En /movies o /social el buscador del navbar filtra en vivo según el modo activo.
  useEffect(() => {
    if (searchScope === "movies" && pathname === "/movies") {
      const value = search.trim();
      const current =
        new URLSearchParams(location.split("?")[1] || "").get("title") || "";
      if (value === current) return;

      const timeoutId = window.setTimeout(() => {
        navigate(
          value ? `/movies?title=${encodeURIComponent(value)}` : "/movies",
          { replace: true },
        );
      }, 300);

      return () => window.clearTimeout(timeoutId);
    }

    if (searchScope === "users" && pathname === "/social") {
      const value = search.trim();
      const current =
        new URLSearchParams(location.split("?")[1] || "").get("user") || "";
      if (value === current) return;

      const timeoutId = window.setTimeout(() => {
        navigate(
          value ? `/social?user=${encodeURIComponent(value)}` : "/social",
          { replace: true },
        );
      }, 300);

      return () => window.clearTimeout(timeoutId);
    }
  }, [search, searchScope, location, pathname, navigate]);

  // Cierra el menú de usuario al hacer clic fuera.
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    if (!value) return;

    if (searchScope === "users") {
      navigate(`/social?user=${encodeURIComponent(value)}`);
    } else {
      navigate(`/movies?title=${encodeURIComponent(value)}`);
    }
  };

  const initial = username?.charAt(0).toUpperCase() || "?";
  const searchPlaceholder =
    searchScope === "users" ? "Buscar usuarios..." : "Buscar películas...";

  return (
    <nav className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-2xl md:rounded-full border border-line/10 bg-surface/80 backdrop-blur-2xl ring-1 ring-line/10 shadow-[0_1px_2px_rgba(16,12,30,0.04),0_18px_50px_-30px_rgba(16,12,30,0.35)]">
          {/* Brillo superior */}
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-line/20 to-transparent" />

          <div className="px-3 sm:px-5 lg:px-6 py-2">
            <div className="flex items-center justify-between h-12 gap-2 lg:gap-5">
              {/* Logo */}
              <div className="flex flex-shrink-0 items-center">
                <Logo size={36} />
              </div>

              {/* Enlaces del centro */}
              <div className="hidden md:flex items-center gap-0.5 rounded-full border border-line/10 bg-ink/5 p-1">
                {NAV_ITEMS.map(({ to, label, Icon }) => {
                  const active = isActivePath(pathname, to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium tracking-tight transition-all duration-200 ${
                        active
                          ? "bg-accent text-white shadow-[0_6px_18px_-8px_rgba(16,12,30,0.65)]"
                          : "text-muted hover:bg-surface hover:text-ink"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                })}
              </div>

              {/* Buscador con selector Películas / Usuarios */}
              <form
                onSubmit={handleSearch}
                className="relative hidden md:flex items-center rounded-full border border-transparent bg-ink/5 pl-3 pr-1 py-1 transition-all focus-within:border-accent/30 focus-within:bg-surface-2 focus-within:ring-2 focus-within:ring-accent/15"
              >
                <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
                <input
                  type="search"
                  name="navbar-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-32 lg:w-44 xl:w-52 bg-transparent py-1 pl-2 pr-2 text-sm text-ink placeholder:text-faint focus:outline-none"
                />
                <div
                  role="group"
                  aria-label="Tipo de búsqueda"
                  className="flex items-center rounded-full border border-line/10 bg-surface/80 p-0.5 text-[11px] font-medium"
                >
                  <button
                    type="button"
                    onClick={() => setSearchScope("movies")}
                    title="Buscar películas"
                    className={`flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${
                      searchScope === "movies"
                        ? "bg-accent text-white"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    <FilmIcon className="h-3 w-3" />
                    <span className="hidden xl:inline">Películas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchScope("users")}
                    title="Buscar usuarios"
                    className={`flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${
                      searchScope === "users"
                        ? "bg-accent text-white"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    <UsersIcon className="h-3 w-3" />
                    <span className="hidden xl:inline">Usuarios</span>
                  </button>
                </div>
              </form>

              {/* Botones de la derecha */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={
                    theme === "dark"
                      ? "Cambiar a tema claro"
                      : "Cambiar a tema oscuro"
                  }
                  title={
                    theme === "dark"
                      ? "Cambiar a tema claro"
                      : "Cambiar a tema oscuro"
                  }
                  className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full border border-line/10 bg-surface text-muted transition-all hover:border-line/20 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-4 w-4" />
                  ) : (
                    <MoonIcon className="h-4 w-4" />
                  )}
                </button>
                {isLoading ? (
                  <div className="h-9 w-24 rounded-full bg-ink/5 animate-pulse" />
                ) : !isAuthenticated ? (
                  <>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onLogin?.();
                      }}
                      className="hidden sm:inline-flex items-center rounded-full px-3.5 py-2 text-[13px] font-medium text-muted hover:bg-ink/5 hover:text-ink transition-colors whitespace-nowrap"
                    >
                      Iniciar sesión
                    </a>
                    <button
                      onClick={onRegister}
                      className="rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(16,12,30,0.8)] transition-all hover:-translate-y-px hover:bg-accent-strong sm:px-5"
                    >
                      Regístrate
                    </button>
                  </>
                ) : (
                  <div className="relative" ref={menuRef}>
                    <button
                      type="button"
                      onClick={() => setMenuOpen((open) => !open)}
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      className="flex items-center gap-2 rounded-full border border-line/10 bg-surface px-1.5 sm:px-2 py-1.5 text-[13px] font-medium text-ink shadow-sm hover:border-line/15 hover:shadow-md transition-all"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                        {initial}
                      </span>
                      <span className="hidden sm:block max-w-[9rem] truncate pr-1">
                        {username}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`hidden sm:block mr-1.5 h-3.5 w-3.5 text-faint transition-transform ${menuOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {menuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 mt-3 w-64 rounded-2xl border border-line/10 bg-surface p-2 shadow-[0_20px_60px_-24px_rgba(16,12,30,0.35)]"
                      >
                        <div className="px-3 py-2">
                          <p className="text-sm font-semibold text-ink truncate">
                            {username}
                          </p>
                          {email && (
                            <p className="text-xs text-muted truncate">
                              {email}
                            </p>
                          )}
                        </div>
                        <div className="my-1 h-px bg-line/10" />
                        <Link
                          to="/profile"
                          role="menuitem"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:bg-accent-soft hover:text-accent transition-colors"
                        >
                          <UserIcon className="h-4 w-4" />
                          Mi perfil
                        </Link>
                        <Link
                          to="/createList"
                          role="menuitem"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:bg-accent-soft hover:text-accent transition-colors"
                        >
                          <FilmIcon className="h-4 w-4" />
                          Crear lista de películas
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-xl text-sm text-danger hover:bg-danger-soft transition-colors"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <path d="m16 17 5-5-5-5M21 12H9" />
                          </svg>
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Botón menú móvil */}
                <button
                  type="button"
                  onClick={() => setMobileOpen((open) => !open)}
                  aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
                  aria-expanded={mobileOpen}
                  className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/10 bg-surface text-muted hover:bg-surface-2 hover:text-accent transition-colors"
                >
                  <MenuIcon open={mobileOpen} className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Panel móvil */}
            {mobileOpen && (
              <div className="md:hidden mt-2 border-t border-line/10 pt-3 pb-2">
                <form onSubmit={handleSearch} className="mb-2 space-y-2">
                  <div className="flex items-center gap-1 rounded-full border border-line/10 bg-ink/5 p-1">
                    <button
                      type="button"
                      onClick={() => setSearchScope("movies")}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors ${
                        searchScope === "movies"
                          ? "bg-accent text-white"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      <FilmIcon className="h-3.5 w-3.5" />
                      Películas
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchScope("users")}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors ${
                        searchScope === "users"
                          ? "bg-accent text-white"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      <UsersIcon className="h-3.5 w-3.5" />
                      Usuarios
                    </button>
                  </div>

                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                    <input
                      type="search"
                      name="navbar-search-mobile"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full rounded-full border border-transparent bg-ink/5 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-faint focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                  </div>
                </form>

                <div className="flex flex-col gap-1">
                  {NAV_ITEMS.map(({ to, label, Icon }) => {
                    const active = isActivePath(pathname, to);
                    return (
                      <Link
                        key={to}
                        to={to}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-accent text-white"
                            : "text-muted hover:bg-ink/5 hover:text-ink"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    );
                  })}

                  {isAuthenticated && (
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-ink/5 hover:text-ink transition-colors"
                    >
                      <UserIcon className="h-4 w-4" />
                      Mi perfil
                    </Link>
                  )}

                  {!isAuthenticated && (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileOpen(false);
                        onLogin?.();
                      }}
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-ink/5 hover:text-ink transition-colors sm:hidden"
                    >
                      Iniciar sesión
                    </a>
                  )}

                  <div className="my-1 h-px bg-line/10" />

                  <button
                    type="button"
                    onClick={toggleTheme}
                    role="switch"
                    aria-checked={theme === "light"}
                    aria-label={
                      theme === "dark"
                        ? "Cambiar a tema claro"
                        : "Cambiar a tema oscuro"
                    }
                    className="flex items-center justify-between gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-ink/5 hover:text-ink transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      {theme === "light" ? (
                        <SunIcon className="h-4 w-4" />
                      ) : (
                        <MoonIcon className="h-4 w-4" />
                      )}
                      Tema claro
                    </span>
                    <span
                      aria-hidden="true"
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        theme === "light" ? "bg-accent" : "bg-line/20"
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-transform ${
                          theme === "light"
                            ? "translate-x-[18px]"
                            : "translate-x-0.5"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
