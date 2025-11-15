import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { initDatabase } from '../db';

interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isLoading: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  isLoading: true,
});

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('habitTracker.db');
        await initDatabase(database);
        setDb(database);
      } catch (error) {
        console.error('Failed to setup database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupDatabase();
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isLoading }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
};

