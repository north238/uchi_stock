// contexts/LoadingContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type LoadingContextType = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

// コンテキストの作成と初期値設定
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// カスタムフックで簡単に利用
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
