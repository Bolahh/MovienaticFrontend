import { useState, type ReactNode } from 'react';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';
import { useAuth } from '../auth/AuthProvider';

/**
 * Gestiona los modales de login/registro.
 *
 * La sesión real (tokens, usuario, refresco automático) vive en el
 * `AuthProvider` global; este hook solo abre/cierra los modales y traduce los
 * errores del backend a mensajes legibles.
 */
export function useAuthFlow() {
  const auth = useAuth();
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

  const closeLogin = () => setLoginOpen(false);
  const closeRegister = () => setRegisterOpen(false);

  const handleLogin = async (data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    setLoginError('');
    try {
      await auth.login(data.email, data.password);
      setLoginOpen(false);
    } catch (err) {
      const status = (err as { status?: number }).status;
      setLoginError(
        status === 401
          ? 'Correo o contraseña incorrectos.'
          : (err as Error).message || 'No se pudo iniciar sesión.'
      );
    }
  };

  const handleRegister = async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    setRegisterError('');
    try {
      await auth.register(data.username, data.email, data.password);
      setRegisterOpen(false);
    } catch (err) {
      const status = (err as { status?: number }).status;
      setRegisterError(
        status === 409
          ? 'Ya existe una cuenta con ese correo o nombre de usuario.'
          : (err as Error).message || 'No se pudo crear la cuenta.'
      );
    }
  };

  const handleLogout = () => {
    auth.logout();
  };

  const modals: ReactNode = (
    <>
      <LoginModal
        open={loginOpen}
        onClose={closeLogin}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onSubmit={handleLogin}
        error={loginError}
      />
      <RegisterModal
        open={registerOpen}
        onClose={closeRegister}
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
    ...auth,
    user: auth.user,
    isLoggedIn: auth.isAuthenticated,
    openLogin,
    openRegister,
    handleLogout,
    modals,
  };
}

export default useAuthFlow;
