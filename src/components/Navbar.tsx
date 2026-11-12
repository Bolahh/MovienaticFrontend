import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from '../router';
import { useAuth } from '../auth/AuthProvider';
import { Logo } from './Logo';

type NavbarProps = {
  onLogin?: () => void;
  onRegister?: () => void;
};

type IconProps = { className?: string };

function HomeIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function FilmIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 3v18M16.5 3v18M3 7.5h4.5M3 12h18M3 16.5h4.5M16.5 7.5H21M16.5 16.5H21" />
    </svg>
  );
}

function UsersIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
      <circle cx="10" cy="7.5" r="3.5" />
      <path d="M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.38M15.5 4.13a3.5 3.5 0 0 1 0 6.74" />
    </svg>
  );
}

function SearchIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function MenuIcon({ open, className = '' }: IconProps & { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" className={className} aria-hidden="true">
      {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', Icon: HomeIcon },
  { to: '/movies', label: 'Películas', Icon: FilmIcon },
  { to: '/social', label: 'Social', Icon: UsersIcon },
] as const;

function isActivePath(pathname: string, to: string): boolean {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);
}

export function Navbar({ onLogin, onRegister }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, username, email, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const pathname = useMemo(() => {
    try {
      return new URL(location).pathname;
    } catch {
      return location.split('?')[0];
    }
  }, [location]);

  // Al cambiar de ruta cerramos menús y sincronizamos el buscador con ?title=.
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);

    const params = new URLSearchParams(location.split('?')[1] || '');
    setSearch(params.get('title') || '');
  }, [location]);

  // Cierra el menú de usuario al hacer clic fuera.
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [menuOpen]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    if (value) {
      navigate(`/movies?title=${encodeURIComponent(value)}`);
    }
  };

  const initial = username?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="sticky top-3 sm:top-4 z-50 px-3 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-3xl md:rounded-full border border-white/70 bg-white/85 backdrop-blur-xl ring-1 ring-[#e2e8f0]/80 shadow-[0_12px_40px_-16px_rgba(124,58,237,0.28)]">
          {/* Brillo superior */}
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#c4b5fd]/80 to-transparent" />

          <div className="px-3 sm:px-5 lg:px-6 py-2.5">
            <div className="flex items-center justify-between h-12 gap-2 lg:gap-5">
              {/* Logo */}
              <div className="flex flex-shrink-0 items-center">
                <Logo size={36} />
              </div>

              {/* Enlaces del centro */}
              <div className="hidden md:flex items-center gap-0.5 rounded-full border border-[#eef2f7] bg-[#f8fafc]/90 p-1">
                {NAV_ITEMS.map(({ to, label, Icon }) => {
                  const active = isActivePath(pathname, to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-white text-[#7c3aed] shadow-[0_2px_10px_rgba(139,92,246,0.16)] ring-1 ring-[#ede9fe]'
                          : 'text-[#64748b] hover:bg-white/70 hover:text-[#0f172a]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                })}
              </div>

              {/* Buscador */}
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="search"
                  name="navbar-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar..."
                  className="w-40 lg:w-52 xl:w-60 rounded-full border border-[#e2e8f0] bg-[#f8fafc]/80 py-2 pl-9 pr-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] transition-all focus:border-[#c4b5fd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                />
              </form>

              {/* Botones de la derecha */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isLoading ? (
                  <div className="h-9 w-24 rounded-full bg-[#f1f5f9] animate-pulse" />
                ) : !isAuthenticated ? (
                  <>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); onLogin?.(); }}
                      className="hidden sm:inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium text-[#475569] hover:bg-[#f5f3ff] hover:text-[#7c3aed] transition-colors whitespace-nowrap"
                    >
                      Iniciar sesión
                    </a>
                    <button
                      onClick={onRegister}
                      className="px-4 sm:px-5 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white text-sm font-medium rounded-full hover:from-[#7c3aed] hover:to-[#6d28d9] transition-all shadow-[0_6px_18px_-6px_rgba(124,58,237,0.7)]"
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
                      className="flex items-center gap-2 rounded-full border border-[#ede9fe] bg-white px-1.5 sm:px-2 py-1.5 text-sm font-medium text-[#0f172a] shadow-sm hover:border-[#c4b5fd] hover:shadow-md transition-all"
                    >
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-xs font-bold text-white">
                        {initial}
                      </span>
                      <span className="hidden sm:block max-w-[9rem] truncate pr-1">
                        {username}
                      </span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                        strokeLinecap="round" strokeLinejoin="round"
                        className={`hidden sm:block mr-1.5 h-3.5 w-3.5 text-[#94a3b8] transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {menuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 mt-3 w-64 rounded-2xl border border-[#e2e8f0] bg-white shadow-xl shadow-[#0f172a]/10 p-2"
                      >
                        <div className="px-3 py-2">
                          <p className="text-sm font-semibold text-[#0f172a] truncate">
                            {username}
                          </p>
                          {email && (
                            <p className="text-xs text-[#64748b] truncate">{email}</p>
                          )}
                        </div>
                        <div className="my-1 h-px bg-[#e2e8f0]" />
                        <Link
                          to="/movies"
                          role="menuitem"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#475569] hover:bg-[#f5f3ff] hover:text-[#7c3aed] transition-colors"
                        >
                          <FilmIcon className="h-4 w-4" />
                          Explorar películas
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-xl text-sm text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
                            strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
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
                  aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                  aria-expanded={mobileOpen}
                  className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc] hover:text-[#7c3aed] transition-colors"
                >
                  <MenuIcon open={mobileOpen} className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Panel móvil */}
            {mobileOpen && (
              <div className="md:hidden mt-2 border-t border-[#eef2f7] pt-3 pb-2">
                <form onSubmit={handleSearch} className="relative mb-2">
                  <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                  <input
                    type="search"
                    name="navbar-search-mobile"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar..."
                    className="w-full rounded-full border border-[#e2e8f0] bg-[#f8fafc]/80 py-2.5 pl-10 pr-4 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#c4b5fd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                  />
                </form>

                <div className="flex flex-col gap-1">
                  {NAV_ITEMS.map(({ to, label, Icon }) => {
                    const active = isActivePath(pathname, to);
                    return (
                      <Link
                        key={to}
                        to={to}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-[#f5f3ff] text-[#7c3aed]'
                            : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    );
                  })}

                  {!isAuthenticated && (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileOpen(false);
                        onLogin?.();
                      }}
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors sm:hidden"
                    >
                      Iniciar sesión
                    </a>
                  )}
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
