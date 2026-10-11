import { ApiError, apiPost } from '@/lib/apiMethods';
import { Toast } from '@/lib/Toast';
import { clearAuthStorage, saveToLocalStorage } from '@/lib/utils';
import { ME_QUERY_KEY } from '@/lib/useMe';
import { useQueryClient } from '@tanstack/react-query';
import { ApiBaseResponse } from '@/types/api';
import {
  ILogin,
  ILoginResponse,
  ILogoutResponse,
  IRegister,
} from '@/types/auth';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext } from 'react';

interface IAppContext {
  handleLogin: (values: ILogin) => Promise<void>;
  handleRegister: (values: IRegister) => Promise<void>;
  handleLogout: () => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogin = async (values: ILogin) => {
    try {
      const res = await apiPost<ApiBaseResponse<ILoginResponse>>(
        '/users/login',
        values
      );

      if (res?.statusCode === 200) {
        const { accessToken, refreshToken } = res.data;

        // Tokens stay in localStorage until cookie-only auth (task 4);
        // who is logged in comes from GET /users/me.
        saveToLocalStorage('token', accessToken);
        saveToLocalStorage('refreshToken', refreshToken);
        queryClient.removeQueries({ queryKey: ME_QUERY_KEY });

        Toast.success(res?.message || 'Logged in successfully');
        setTimeout(() => router.push('/home'), 300);
      } else {
        Toast.error(res?.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      Toast.error(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Try again.'
      );
    }
  };

  const handleRegister = async (values: IRegister) => {
    try {
      const res = await apiPost<ApiBaseResponse<IRegister>>(
        '/users/register',
        values
      );

      if (res?.statusCode === 200) {
        Toast.success('Registered successfully!');
        router.push('/login');
      } else {
        Toast.error(res?.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Register error:', err);
      Toast.error(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Try again.'
      );
    }
  };
  const handleLogout = async () => {
    try {
      // Call backend logout API
      const res = await apiPost<ApiBaseResponse<ILogoutResponse>>(
        '/users/logout'
      );

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
      clearAuthStorage();
      queryClient.clear();
      router.push('/login');
    }
  };

  return (
    <AppContext.Provider
      value={{ handleLogin, handleLogout, handleRegister }}
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
