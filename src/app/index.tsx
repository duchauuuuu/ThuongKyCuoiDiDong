import React, { useState, useCallback } from "react";
import { Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDatabase } from "../contexts/DatabaseContext";
import { Habit } from "../types/habit";
import AddHabitModal from "../components/AddHabitModal";
import { useHabits } from "../hooks/useHabits";

export default function HabitListScreen() {
  const { db, isLoading: dbLoading } = useDatabase();
  const { top } = useSafeAreaInsets();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Sử dụng custom hook
  const {
    habits,
    filteredHabits,
    isLoading,
    isRefreshing,
    isImporting,
    searchQuery,
    showActiveOnly,
    setSearchQuery,
    setShowActiveOnly,
    refreshHabits,
    addHabit,
    editHabit,
    removeHabit,
    toggleHabitDone,
    importFromAPI,
    clearSearch,
  } = useHabits(db);

  // Xử lý lưu habit (thêm hoặc sửa)
  const handleSaveHabit = useCallback(
    async (title: string, description: string) => {
      if (editingHabit) {
        const updatedHabit: Habit = {
          ...editingHabit,
          title,
          description: description || null,
        };
        await editHabit(updatedHabit);
      } else {
        await addHabit(title, description);
      }
      setEditingHabit(null);
    },
    [editingHabit, addHabit, editHabit]
  );

  // Mở modal thêm mới
  const handleOpenAddModal = useCallback(() => {
    setEditingHabit(null);
    setModalVisible(true);
  }, []);

  // Mở modal sửa
  const handleOpenEditModal = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setModalVisible(true);
  }, []);

  // Đóng modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingHabit(null);
  }, []);

  // Xử lý xóa thói quen với xác nhận
  const handleDeleteHabit = useCallback(
    (habit: Habit) => {
      if (!habit.id) return;

      Alert.alert(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn xóa thói quen "${habit.title}" không?`,
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: () => removeHabit(habit.id!),
          },
        ],
        { cancelable: true }
      );
    },
    [removeHabit]
  );

  // Render item trong FlatList - wrapped với useCallback để tối ưu
  const renderHabitItem = useCallback(
    ({ item }: { item: Habit }) => {
      const isDone = item.done_today === 1;
    
      return (
        <TouchableOpacity
          onPress={() => toggleHabitDone(item)}
          disabled={isLoading || isImporting}
          activeOpacity={0.7}
          className={`p-4 mb-3 rounded-lg shadow-sm border-2 ${
            isDone
              ? 'bg-green-50 border-green-300'
              : 'bg-white border-gray-200'
          } ${isLoading || isImporting ? 'opacity-50' : ''}`}
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
          
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleOpenEditModal(item);
              }}
              disabled={isLoading || isImporting}
              className={`px-3 py-2 rounded-md ${
                isLoading || isImporting ? 'bg-orange-300' : 'bg-orange-500'
              }`}
            >
              <Text className="text-white text-xs font-semibold">✏️ Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteHabit(item);
              }}
              disabled={isLoading || isImporting}
              className={`px-3 py-2 rounded-md ${
                isLoading || isImporting ? 'bg-red-300' : 'bg-red-500'
              }`}
            >
              <Text className="text-white text-xs font-semibold">🗑️ Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
        </TouchableOpacity>
      );
    },
    [toggleHabitDone, handleOpenEditModal, handleDeleteHabit, isLoading, isImporting]
  );

  // Empty state - wrapped với useCallback để tối ưu
  const renderEmptyState = useCallback(() => {
    // Nếu đang search hoặc filter
    if (searchQuery.trim() || showActiveOnly) {
      return (
        <View className="flex-1 justify-center items-center px-6 py-20">
          <Text className="text-6xl mb-4">🔍</Text>
          <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
            Không tìm thấy kết quả
          </Text>
          <Text className="text-gray-500 text-center text-base">
            {searchQuery.trim() 
              ? `Không có thói quen nào khớp với "${searchQuery}"`
              : 'Không có thói quen chưa làm nào'}
          </Text>
          {searchQuery.trim() && (
            <TouchableOpacity 
              onPress={clearSearch}
              className="mt-4 bg-blue-500 px-6 py-2 rounded-lg"
              disabled={isLoading}
            >
              <Text className="text-white font-medium">Xóa tìm kiếm</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Empty state mặc định
    return (
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
  }, [searchQuery, showActiveOnly, clearSearch, isLoading]);

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

      {/* Search & Filter Section */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        {/* Search Input */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm thói quen..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-gray-900"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="ml-2">
              <Text className="text-gray-500 text-lg">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Toggle & Import Button */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-700 mr-2">
              Hiển thị {filteredHabits.length} / {habits.length} thói quen
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => setShowActiveOnly(!showActiveOnly)}
            disabled={isLoading}
            className={`flex-row items-center px-3 py-1.5 rounded-full ${
              showActiveOnly ? 'bg-blue-100' : 'bg-gray-100'
            } ${isLoading ? 'opacity-50' : ''}`}
          >
            <Text className={`text-xs font-medium ${
              showActiveOnly ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {showActiveOnly ? '✓ ' : ''}Chỉ chưa làm
            </Text>
          </TouchableOpacity>
        </View>

        {/* Import Button */}
        <TouchableOpacity
          onPress={importFromAPI}
          disabled={isImporting || isLoading}
          className={`flex-row items-center justify-center py-2.5 rounded-lg border-2 ${
            isImporting || isLoading ? 'bg-gray-100 border-gray-300' : 'bg-purple-50 border-purple-300'
          }`}
        >
          {isImporting ? (
            <>
              <ActivityIndicator size="small" color="#9333EA" className="mr-2" />
              <Text className="text-purple-700 font-semibold text-sm">Đang import...</Text>
            </>
          ) : (
            <>
              <Text className="text-purple-700 font-semibold text-sm mr-1">📥</Text>
              <Text className="text-purple-700 font-semibold text-sm">Import thói quen từ API</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Danh sách thói quen với Pull to Refresh */}
      <FlatList
        data={filteredHabits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item.id?.toString() || ''}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshHabits}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
            title="Đang tải..."
            titleColor="#6B7280"
          />
        }
      />

      {/* Nút thêm thói quen */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity 
          className={`py-4 rounded-lg items-center shadow-md ${
            isLoading || isImporting ? 'bg-blue-300' : 'bg-blue-500'
          }`}
          onPress={handleOpenAddModal}
          disabled={isLoading || isImporting}
        >
          <Text className="text-white font-semibold text-base">+ Thêm thói quen mới</Text>
        </TouchableOpacity>
      </View>

      {/* Modal thêm/sửa thói quen */}
      <AddHabitModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
      />
    </View>
  );
}
