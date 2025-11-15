import { SQLiteDatabase } from 'expo-sqlite';
import { Habit } from './types/habit';

// Khởi tạo bảng habits
export const initTable = async (db: SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      active INTEGER DEFAULT 1,
      done_today INTEGER DEFAULT 0,
      created_at INTEGER
    )
  `);
};

// Seed dữ liệu mẫu nếu bảng còn trống
const seedSampleData = async (db: SQLiteDatabase) => {
  try {
    // Kiểm tra xem bảng có dữ liệu chưa
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM habits');
    
    if (result && result.count === 0) {
      console.log('📝 Seeding sample habits...');
      
      const sampleHabits = [
        {
          title: 'Uống 2 lít nước',
          description: 'Uống đủ 2 lít nước mỗi ngày để giữ cơ thể khỏe mạnh',
          active: 1,
          done_today: 0,
          created_at: Date.now()
        },
        {
          title: 'Đi bộ 15 phút',
          description: 'Đi bộ ít nhất 15 phút mỗi ngày để cải thiện sức khỏe',
          active: 1,
          done_today: 0,
          created_at: Date.now()
        },
        {
          title: 'Đọc sách 30 phút',
          description: 'Dành thời gian đọc sách để phát triển bản thân',
          active: 1,
          done_today: 0,
          created_at: Date.now()
        }
      ];

      for (const habit of sampleHabits) {
        await db.runAsync(
          'INSERT INTO habits (title, description, active, done_today, created_at) VALUES (?, ?, ?, ?, ?)',
          [habit.title, habit.description, habit.active, habit.done_today, habit.created_at]
        );
      }

      console.log('✅ Sample habits seeded successfully');
    } else {
      console.log('ℹ️  Habits table already contains data, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  }
};

// Khởi tạo database và seed dữ liệu
export const initDatabase = async (db: SQLiteDatabase) => {
  try {
    // Tạo bảng habits theo cấu trúc đề bài
    await initTable(db);
    console.log('✅ Database initialized successfully');
    
    // Seed dữ liệu mẫu nếu bảng trống
    await seedSampleData(db);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

// READ - Lấy tất cả habits
export const getAllHabits = async (db: SQLiteDatabase) => {
  return await db.getAllAsync<Habit>('SELECT * FROM habits WHERE active = 1');
};

// READ - Lấy habit theo ID
export const getHabitById = async (db: SQLiteDatabase, id: number) => {
  return await db.getFirstAsync<Habit>(
    'SELECT * FROM habits WHERE id = ?',
    [id]
  );
};

// CREATE - Thêm habit mới
export const createHabit = async (db: SQLiteDatabase, data: Partial<Habit>) => {
  await db.runAsync(
    'INSERT INTO habits (title, description, active, done_today, created_at) VALUES (?, ?, ?, ?, ?)',
    [data.title!, data.description || null, data.active || 1, data.done_today || 0, data.created_at || Date.now()]
  );
};

// UPDATE - Cập nhật habit
export const updateHabit = async (db: SQLiteDatabase, data: Habit) => {
  await db.runAsync(
    'UPDATE habits SET title = ?, description = ?, active = ?, done_today = ? WHERE id = ?',
    [data.title, data.description, data.active, data.done_today, data.id!]
  );
};

// TOGGLE - Toggle trạng thái done_today (0 ↔ 1)
export const toggleDoneToday = async (db: SQLiteDatabase, id: number, currentStatus: number) => {
  const newStatus = currentStatus === 1 ? 0 : 1;
  await db.runAsync(
    'UPDATE habits SET done_today = ? WHERE id = ?',
    [newStatus, id]
  );
  return newStatus;
};

// DELETE - Xóa mềm habit (set active = 0)
export const deleteHabit = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync('UPDATE habits SET active = 0 WHERE id = ?', [id]);
};

