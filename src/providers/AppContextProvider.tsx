import { apiPost } from '@/lib/apiMethods';
import { Toast } from '@/lib/Toast';
import { removeFromLocalStorage, saveToLocalStorage } from '@/lib/utils';
import { ILogin, IRegister } from '@/types/auth';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  repoHistory: string[];
}

interface IAuth {
  isAuthenticated: boolean;
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface IAppContext {
  auth: IAuth;
  handleLogin: (values: ILogin) => Promise<void>;
  handleRegister: (values: IRegister) => Promise<void>;
  handleLogout: () => void;
}

const initialAuthState: IAuth = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
};

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [auth, setAuth] = useState<IAuth>(initialAuthState);
  const router = useRouter();

  // On mount, check if auth is saved in localStorage (simplified)
  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      setAuth(JSON.parse(savedAuth));
    }
  }, []);

  // Persist auth to localStorage on change
  useEffect(() => {
    if (auth.isAuthenticated) {
      localStorage.setItem('auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('auth');
    }
  }, [auth]);

  const handleLogin = async (values: ILogin) => {
    try {
      const res = await apiPost('/users/login', values);

      if (res?.statusCode === 200) {
        const { accessToken, refreshToken, user } = res.data;

        // Save to localStorage for persistence
        saveToLocalStorage('token', accessToken);
        saveToLocalStorage('refreshToken', refreshToken);
        saveToLocalStorage('user', user);

        // Update context state
        setAuth({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken,
        });

        Toast.success(res?.message || 'Logged in successfully');
        setTimeout(() => router.push('/home'), 300);
      } else {
        Toast.error(res?.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      Toast.error('Something went wrong. Try again.');
    }
  };

  const handleRegister = async (values: IRegister) => {
    try {
      const res = await apiPost('/users/register', values);

      if (res?.statusCode === 200) {
        Toast.success('Registered successfully!');
        router.push('/login');
      } else {
        Toast.error(res?.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Register error:', err);
      Toast.error('Something went wrong. Try again.');
    }
  };
  const handleLogout = async () => {
    try {
      // Call backend logout API
      const res = await apiPost('/users/logout');

      if (res?.statusCode === 200) {
        Toast.success('Logged out successfully');
      } else {
        Toast.error(res?.message || 'Logout failed');
      }
    } catch (err) {
      console.error('❌ Logout error:', err);
      Toast.error('Something went wrong during logout');
    } finally {
      // Clear all local/session data no matter what
      setAuth(initialAuthState);
      removeFromLocalStorage('token');
      removeFromLocalStorage('refreshToken');
      removeFromLocalStorage('user');
      localStorage.removeItem('auth');
      router.push('/login');
    }
  };

  return (
    <AppContext.Provider
      value={{ auth, handleLogin, handleLogout, handleRegister }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx)
    throw new Error('useAppContext must be used within AppContextProvider');
  return ctx;
}
