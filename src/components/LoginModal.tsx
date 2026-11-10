import { useState } from 'react';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  onSubmit?: (data: { email: string; password: string; rememberMe: boolean }) => void;
  error?: string;
};

export function LoginModal({ open, onClose, onSwitchToRegister, onSubmit, error }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    onSubmit?.({ email, password, rememberMe });
  };

  if (!open) return null;

  return (
    <>
      {/* Fondooverlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl border border-[#e2e8f0] w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0f172a]">Iniciar sesión</h2>
            <button
              onClick={onClose}
              className="text-[#64748b] hover:text-[#0f172a] transition-colors"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded border-[#e2e8f0] text-[#8b5cf6] focus:ring-[#8b5cf6] bg-[#f8fafc] cursor-pointer"
              />
              <label className="text-sm text-[#0f172a] cursor-pointer">
                Recuérdame
              </label>
            </div>

            {error && (
              <p className="text-sm text-[#ef4444] bg-[#fef2f2] px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#8b5cf6] text-white text-base font-medium rounded-full hover:bg-[#7c3aed] transition-colors shadow-lg"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#e2e8f0] text-center">
            <p className="text-sm text-[#64748b]">
              ¿No tienes cuenta?
              <button
                onClick={onSwitchToRegister}
                className="text-[#8b5cf6] font-medium hover:underline ml-1"
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginModal;
