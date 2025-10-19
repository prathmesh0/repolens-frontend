'use client';
import React from 'react';
import TanstackQueryProvider from '../providers/TanstackQueryProvider';
import { NuqsAdapter } from 'nuqs/adapters/react';

type Props = {
  children: React.ReactNode;
};

const Provider = ({ children }: Props) => {
  return (
    <NuqsAdapter>
      <TanstackQueryProvider>{children}</TanstackQueryProvider>
    </NuqsAdapter>
  );
};

export default Provider;
