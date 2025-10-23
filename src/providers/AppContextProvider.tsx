import { User } from '@/api/services';
import { Toast } from '@/lib/Toast';
import { ILogin } from '@/types/auth';
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
  handleLogin: ({ email, password }: ILogin) => Promise<void>;
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

  async function handleLogin(body: ILogin) {
    const response = await User.handleLogin(body);
    if (response?.success) {
      setAuth({
        isAuthenticated: true,
        user: response?.data?.data?.user,
        accessToken: response.data?.data?.accessToken,
        refreshToken: response.data?.data?.refreshToken,
      });
      Toast.success('Logged in successfully');
      setTimeout(() => router.push('/home'), 300); // ✅ navigate after small delay
      console.log('✅ Logged in successful and navigated to home');
    } else {
      Toast.error(response?.message || 'Login failed');
    }
  }

  function handleLogout() {
    setAuth(initialAuthState);
    localStorage.clear();
    router.push('/login');
  }

  return (
    <AppContext.Provider value={{ auth, handleLogin, handleLogout }}>
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
