import React, { useEffect, useState } from "react";
import { Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDatabase } from "../contexts/DatabaseContext";
import { getAllHabits, createHabit, toggleDoneToday } from "../db";
import { Habit } from "../types/habit";
import AddHabitModal from "../components/AddHabitModal";

export default function HabitListScreen() {
  const { db, isLoading: dbLoading } = useDatabase();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const { top } = useSafeAreaInsets();

  // Lấy dữ liệu từ database
  const loadHabits = async () => {
    if (!db) return;
    
    try {
      setIsLoading(true);
      const data = await getAllHabits(db);
      setHabits(data);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (db) {
      loadHabits();
    }
  }, [db]);

  // Xử lý thêm thói quen mới
  const handleAddHabit = async (title: string, description: string) => {
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
      
      // Refresh danh sách ngay lập tức
      await loadHabits();
      
      // Hiển thị thông báo thành công
      Alert.alert('Thành công', 'Đã thêm thói quen mới!');
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Lỗi', 'Không thể thêm thói quen. Vui lòng thử lại!');
    }
  };

  // Xử lý toggle trạng thái done_today
  const handleToggleDone = async (habit: Habit) => {
    if (!db || !habit.id) return;

    try {
      // Toggle trong database
      await toggleDoneToday(db, habit.id, habit.done_today);
      
      // Cập nhật state ngay lập tức (optimistic update)
      setHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === habit.id
            ? { ...h, done_today: h.done_today === 1 ? 0 : 1 }
            : h
        )
      );
    } catch (error) {
      console.error('Error toggling habit:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng thử lại!');
      // Rollback bằng cách reload lại data
      await loadHabits();
    }
  };

  // Render item trong FlatList
  const renderHabitItem = ({ item }: { item: Habit }) => {
    const isDone = item.done_today === 1;
    
    return (
      <TouchableOpacity
        onPress={() => handleToggleDone(item)}
        activeOpacity={0.7}
        className={`p-4 mb-3 rounded-lg shadow-sm border-2 ${
          isDone
            ? 'bg-green-50 border-green-300'
            : 'bg-white border-gray-200'
        }`}
      >
        <View className="flex-row justify-between items-start mb-2">
          {/* Icon check circle lớn */}
          <View className="mr-3 mt-1">
            {isDone ? (
              <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
                <Text className="text-white text-sm font-bold">✓</Text>
              </View>
            ) : (
              <View className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
            )}
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text 
              className={`text-lg font-semibold mb-1 ${
                isDone ? 'text-green-800 line-through' : 'text-gray-900'
              }`}
            >
              {item.title}
            </Text>
            
            {item.description && (
              <Text className={`text-sm leading-5 ${
                isDone ? 'text-green-700' : 'text-gray-600'
              }`}>
                {item.description}
              </Text>
            )}
          </View>

          {/* Badge trạng thái */}
          {isDone && (
            <View className="bg-green-500 px-3 py-1 rounded-full ml-2">
              <Text className="text-white text-xs font-bold">✓ Xong</Text>
            </View>
          )}
        </View>
        
        {/* Footer */}
        <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-200">
          <Text className={`text-xs ${isDone ? 'text-green-600' : 'text-gray-400'}`}>
            📅 {new Date(item.created_at).toLocaleDateString('vi-VN')}
          </Text>
          
          <Text className={`text-sm font-medium ${isDone ? 'text-green-600' : 'text-blue-500'}`}>
            {isDone ? '🎉 Đã hoàn thành hôm nay' : '👉 Chạm để đánh dấu'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6 py-20">
      <Text className="text-6xl mb-4">📝</Text>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        Chưa có thói quen nào
      </Text>
      <Text className="text-gray-500 text-center text-base">
        Hãy thêm một thói quen mới để bắt đầu!
      </Text>
    </View>
  );

  if (dbLoading || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Đang tải...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Thói Quen Của Tôi</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Theo dõi và phát triển thói quen tốt mỗi ngày
        </Text>
      </View>

      {/* Danh sách thói quen */}
      <FlatList
        data={habits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item.id?.toString() || ''}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Nút thêm thói quen */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity 
          className="bg-blue-500 py-4 rounded-lg items-center shadow-md"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-white font-semibold text-base">+ Thêm thói quen mới</Text>
        </TouchableOpacity>
      </View>

      {/* Modal thêm thói quen */}
      <AddHabitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddHabit}
      />
    </View>
  );
}
