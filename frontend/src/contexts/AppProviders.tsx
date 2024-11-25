import React from 'react';
import { AuthContextProvider } from './AuthContext';
import { LoadingProvider } from './LoadingContext';
import { DataProvider } from './DataContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <LoadingProvider>
      <AuthContextProvider>
        <DataProvider>{children}</DataProvider>
      </AuthContextProvider>
    </LoadingProvider>
  );
};
