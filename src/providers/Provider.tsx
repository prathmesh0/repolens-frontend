'use client';
import React from 'react';
import TanstackQueryProvider from '../providers/TanstackQueryProvider';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { AppContextProvider } from './AppContextProvider';
import ToastProvider from './ToastProvider';

type Props = {
  children: React.ReactNode;
};

const Provider = ({ children }: Props) => {
  return (
    <NuqsAdapter>
      <TanstackQueryProvider>
        <AppContextProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppContextProvider>
      </TanstackQueryProvider>
    </NuqsAdapter>
  );
};

export default Provider;
