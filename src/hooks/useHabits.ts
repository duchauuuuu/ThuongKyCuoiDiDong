import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { SQLiteDatabase } from 'expo-sqlite';
import {
  getAllHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleDoneToday,
} from '../db';
import { Habit } from '../types/habit';
import { fetchHabitsFromAPI } from '../services/api';

interface UseHabitsReturn {
  habits: Habit[];
  filteredHabits: Habit[];
  isLoading: boolean;
  isRefreshing: boolean;
  isImporting: boolean;
  searchQuery: string;
  showActiveOnly: boolean;
  setSearchQuery: (query: string) => void;
  setShowActiveOnly: (show: boolean) => void;
  loadHabits: () => Promise<void>;
  refreshHabits: () => Promise<void>;
  addHabit: (title: string, description: string) => Promise<void>;
  editHabit: (habit: Habit) => Promise<void>;
  removeHabit: (habitId: number) => Promise<void>;
  toggleHabitDone: (habit: Habit) => Promise<void>;
  importFromAPI: () => Promise<void>;
  clearSearch: () => void;
}

export const useHabits = (db: SQLiteDatabase | null): UseHabitsReturn => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Load habits từ database
  const loadHabits = useCallback(async () => {
    if (!db) return;

    try {
      setIsLoading(true);
      const data = await getAllHabits(db);
      setHabits(data);
    } catch (error) {
      console.error('Error loading habits:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách thói quen');
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  // Refresh habits (cho pull-to-refresh)
  const refreshHabits = useCallback(async () => {
    if (!db) return;

    try {
      setIsRefreshing(true);
      const data = await getAllHabits(db);
      setHabits(data);
    } catch (error) {
      console.error('Error refreshing habits:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [db]);

  // Load habits khi component mount
  useEffect(() => {
    if (db) {
      loadHabits();
    }
  }, [db, loadHabits]);

  // Filter habits theo search query và active status
  const filteredHabits = useMemo(() => {
    let result = habits;

    // Filter theo search query
    if (searchQuery.trim()) {
      result = result.filter((habit) =>
        habit.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter theo done_today
    if (showActiveOnly) {
      result = result.filter((habit) => habit.done_today === 0);
    }

    return result;
  }, [habits, searchQuery, showActiveOnly]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Thêm habit mới
  const addHabit = useCallback(
    async (title: string, description: string) => {
      if (!db) return;

      try {
        const newHabit = {
          title,
          description: description || null,
          active: 1,
          done_today: 0,
          created_at: Date.now(),
        };

        await createHabit(db, newHabit);
        await loadHabits();
        Alert.alert('Thành công', 'Đã thêm thói quen mới!');
      } catch (error) {
        console.error('Error adding habit:', error);
        Alert.alert('Lỗi', 'Không thể thêm thói quen. Vui lòng thử lại!');
      }
    },
    [db, loadHabits]
  );

  // Sửa habit
  const editHabit = useCallback(
    async (habit: Habit) => {
      if (!db) return;

      try {
        await updateHabit(db, habit);
        await loadHabits();
        Alert.alert('Thành công', 'Đã cập nhật thói quen!');
      } catch (error) {
        console.error('Error updating habit:', error);
        Alert.alert('Lỗi', 'Không thể cập nhật thói quen. Vui lòng thử lại!');
      }
    },
    [db, loadHabits]
  );

  // Xóa habit
  const removeHabit = useCallback(
    async (habitId: number) => {
      if (!db) return;

      try {
        await deleteHabit(db, habitId);
        await loadHabits();
        Alert.alert('Thành công', 'Đã xóa thói quen!');
      } catch (error) {
        console.error('Error deleting habit:', error);
        Alert.alert('Lỗi', 'Không thể xóa thói quen. Vui lòng thử lại!');
      }
    },
    [db, loadHabits]
  );

  // Toggle done_today
  const toggleHabitDone = useCallback(
    async (habit: Habit) => {
      if (!db || !habit.id) return;

      try {
        await toggleDoneToday(db, habit.id, habit.done_today);

        // Optimistic update
        setHabits((prevHabits) =>
          prevHabits.map((h) =>
            h.id === habit.id ? { ...h, done_today: h.done_today === 1 ? 0 : 1 } : h
          )
        );
      } catch (error) {
        console.error('Error toggling habit:', error);
        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng thử lại!');
        await loadHabits(); // Rollback
      }
    },
    [db, loadHabits]
  );

  // Import từ API
  const importFromAPI = useCallback(async () => {
    if (!db) return;

    try {
      setIsImporting(true);

      const apiHabits = await fetchHabitsFromAPI();

      if (!apiHabits || apiHabits.length === 0) {
        Alert.alert('Thông báo', 'Không có thói quen nào từ API');
        return;
      }

      const existingTitles = habits.map((h) => h.title.toLowerCase().trim());

      let importedCount = 0;
      let skippedCount = 0;

      for (const apiHabit of apiHabits) {
        const title = (apiHabit.title || '').trim();

        if (!title) {
          skippedCount++;
          continue;
        }

        if (existingTitles.includes(title.toLowerCase())) {
          console.log(`Skipping duplicate: ${title}`);
          skippedCount++;
          continue;
        }

        const newHabit = {
          title,
          description: apiHabit.description || null,
          active: apiHabit.active !== undefined ? apiHabit.active : 1,
          done_today: 0,
          created_at: Date.now(),
        };

        await createHabit(db, newHabit);
        importedCount++;
        existingTitles.push(title.toLowerCase());
      }

      await loadHabits();

      if (importedCount > 0) {
        Alert.alert(
          'Import thành công!',
          `Đã thêm ${importedCount} thói quen mới${
            skippedCount > 0 ? `\nBỏ qua ${skippedCount} thói quen trùng lặp` : ''
          }`
        );
      } else {
        Alert.alert(
          'Thông báo',
          'Tất cả thói quen đã tồn tại, không có thói quen mới nào được thêm'
        );
      }
    } catch (error) {
      console.error('Error importing habits:', error);
      Alert.alert(
        'Lỗi khi import',
        'Không thể lấy dữ liệu từ API. Vui lòng kiểm tra kết nối mạng và thử lại!'
      );
    } finally {
      setIsImporting(false);
    }
  }, [db, habits, loadHabits]);

  return {
    habits,
    filteredHabits,
    isLoading,
    isRefreshing,
    isImporting,
    searchQuery,
    showActiveOnly,
    setSearchQuery,
    setShowActiveOnly,
    loadHabits,
    refreshHabits,
    addHabit,
    editHabit,
    removeHabit,
    toggleHabitDone,
    importFromAPI,
    clearSearch,
  };
};

