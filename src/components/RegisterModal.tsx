import { useState } from 'react';

type RegisterModalProps = {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
  onSubmit?: (data: {
    username: string;
    email: string;
    password: string;
  }) => void;
  error?: string;
};

export function RegisterModal({ open, onClose, onSwitchToLogin, onSubmit, error }: RegisterModalProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    onSubmit?.({ username, email, password });
  };

  if (!open) return null;

  return (
    <>
      {/* Fondo overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-3xl border border-line/10 bg-surface p-6 shadow-[0_40px_100px_-40px_rgba(16,12,30,0.6)] sm:p-7"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <span className="eyebrow mb-2">Únete a Movienatic</span>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-ink">
                Crear cuenta
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/10 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="moviefan123"
                className="w-full rounded-xl border border-transparent bg-ink/5 px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-transparent bg-ink/5 px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-xl border border-transparent bg-ink/5 px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Repetir contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-xl border border-transparent bg-ink/5 px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/30 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/15"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-white shadow-[0_16px_36px_-18px_rgba(16,12,30,0.8)] transition-all hover:bg-accent-strong"
            >
              Crear cuenta
            </button>
          </form>

          <div className="mt-6 border-t border-line/10 pt-4 text-center">
            <p className="text-sm text-muted">
              ¿Ya tienes cuenta?
              <button
                onClick={onSwitchToLogin}
                className="ml-1 font-medium text-accent hover:underline"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterModal;
