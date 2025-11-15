import React, { useEffect, useState } from "react";
import { Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDatabase } from "../contexts/DatabaseContext";
import { getAllHabits, createHabit } from "../db";
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

  // Render item trong FlatList
  const renderHabitItem = ({ item }: { item: Habit }) => (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-900 flex-1">{item.title}</Text>
        {item.done_today === 1 && (
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-medium">✓ Hoàn thành</Text>
          </View>
        )}
        {item.done_today === 0 && (
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-gray-600 text-xs font-medium">Chưa làm</Text>
          </View>
        )}
      </View>
      
      {item.description && (
        <Text className="text-gray-600 text-sm leading-5">{item.description}</Text>
      )}
      
      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <Text className="text-xs text-gray-400">
          {new Date(item.created_at).toLocaleDateString('vi-VN')}
        </Text>
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-md">
          <Text className="text-white text-sm font-medium">Đánh dấu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
