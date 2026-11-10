import { useState } from 'react';
import { Link, useNavigate } from '../router';

type User = {
  username: string;
};

type NavbarProps = {
  isLoggedIn?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
};

export function Navbar({
  isLoggedIn = false,
  user = null,
  onLogin,
  onRegister,
  onLogout,
}: NavbarProps) {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-4 z-50">
      {/* Todo el navbar como una píldora con fondo blanco */}
      <div className="mx-4 rounded-full bg-white shadow-sm border border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between h-12 gap-3 lg:gap-6">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl font-bold text-[#8b5cf6] tracking-tighter">M</span>
              <span className="font-bold text-xl text-[#0f172a] tracking-tight">ovienatic</span>
            </div>

            {/* Enlaces del centro */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-[#64748b] hover:text-[#8b5cf6] transition-colors">
                Inicio
              </Link>
              <Link to="/movies" className="text-sm font-medium text-[#64748b] hover:text-[#8b5cf6] transition-colors">
                Películas
              </Link>
              <Link to="/social" className="text-sm font-medium text-[#64748b] hover:text-[#8b5cf6] transition-colors">
                Social
              </Link>
            </div>

            {/* Buscador */}
            <div className="hidden md:flex items-center">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem(
                    'navbar-search'
                  ) as HTMLInputElement | null;
                  const value = input?.value.trim() || '';
                  if (value) {
                    navigate(`/movies?title=${encodeURIComponent(value)}`);
                  }
                }}
              >
                <input
                  type="search"
                  name="navbar-search"
                  placeholder="Buscar películas..."
                  className="w-44 lg:w-56 xl:w-64 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-colors"
                />
              </form>
            </div>

            {/* Botones de la derecha */}
            <div className="flex items-center gap-3">
              {!isLoggedIn ? (
                <>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onLogin?.(); }}
                    className="text-sm font-medium text-[#64748b] hover:text-[#8b5cf6] transition-colors whitespace-nowrap"
                  >
                    Iniciar sesión
                  </a>
                  <button
                    onClick={onRegister}
                    className="px-5 py-2 bg-[#8b5cf6] text-white text-sm font-medium rounded-full hover:bg-[#7c3aed] transition-colors shadow-md"
                  >
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  <div
                    onClick={onLogout}
                    className="flex items-center gap-2 px-5 py-2 bg-[#8b5cf6] text-white text-sm font-medium rounded-full hover:bg-[#7c3aed] transition-colors shadow-md cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#8b5cf6]">
                      {user?.username.charAt(0).toUpperCase() || '?'}
                    </span>
                    <span>{user?.username}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
