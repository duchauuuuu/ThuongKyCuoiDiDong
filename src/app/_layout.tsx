import "../global.css";
import { Slot } from "expo-router";
import { useEffect } from "react";
import * as SQLite from 'expo-sqlite';
import { initDatabase } from "../db";

export default function Layout() {
  useEffect(() => {
    // Khởi tạo database khi app start
    const setupDatabase = async () => {
      try {
        const db = await SQLite.openDatabaseAsync('habitTracker.db');
        await initDatabase(db);
      } catch (error) {
        console.error('Failed to setup database:', error);
      }
    };
    
    setupDatabase();
  }, []);

  return <Slot />;
}
