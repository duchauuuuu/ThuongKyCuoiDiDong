import * as SQLite from 'expo-sqlite';

// Mở kết nối database SQLite
const db = SQLite.openDatabaseSync('habitTracker.db');

// Khởi tạo các bảng cần thiết
export const initDatabase = () => {
  try {
    // Tạo bảng habits theo cấu trúc đề bài
    db.execSync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        active INTEGER DEFAULT 1,
        done_today INTEGER DEFAULT 0,
        created_at INTEGER
      );
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

export default db;

