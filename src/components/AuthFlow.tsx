import { useState, type ReactNode } from 'react';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';
import {
  login,
  register,
  setAuthToken,
  getCurrentUser,
  logout,
  type AuthUser,
} from '../api';

/**
 * Gestiona el estado de autenticación y los modales de login/registro.
 * Se usa en todas las páginas para que el navbar funcione igual en todas.
 */
export function useAuthFlow() {
  const stored = getCurrentUser();
  const [user, setUser] = useState<AuthUser | null>(stored);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const openLogin = () => {
    setLoginError('');
    setLoginOpen(true);
  };

  const openRegister = () => {
    setRegisterError('');
    setRegisterOpen(true);
  };

  const handleLogin = async (data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    setLoginError('');
    try {
      const res = await login({ email: data.email, password: data.password });
      const token = res.token || res.accessToken || null;
      if (token) setAuthToken(token);
      setUser(res.user ?? null);
      setLoginOpen(false);
    } catch (err: any) {
      setLoginError(err.message || 'Credenciales incorrectas.');
    }
  };

  const handleRegister = async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    setRegisterError('');
    try {
      const res = await register(data);
      const token = res.token || res.accessToken || null;
      if (token) setAuthToken(token);
      setUser(res.user ?? null);
      setRegisterOpen(false);
    } catch (err: any) {
      setRegisterError(err.message || 'No se pudo crear la cuenta.');
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const modals: ReactNode = (
    <>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onSubmit={handleLogin}
        error={loginError}
      />
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        onSubmit={handleRegister}
        error={registerError}
      />
    </>
  );

  return {
    user,
    isLoggedIn: !!user,
    openLogin,
    openRegister,
    handleLogout,
    modals,
  };
}

export default useAuthFlow;
