import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataContextType, Genre } from 'types';

// コンテキストの作成と初期値設定
const DataContext = createContext<DataContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [genres, setGenres] = useState<Genre[]>([]);

  return (
    <DataContext.Provider
      value={{
        genres,
        setGenres,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// カスタムフックで簡単に利用
export const useDataContext = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
