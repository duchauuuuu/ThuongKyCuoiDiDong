import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
}

export default function AddHabitModal({ visible, onClose, onSave }: AddHabitModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');

  const handleSave = () => {
    // Validate: title không được rỗng
    if (!title.trim()) {
      setTitleError('Tên thói quen không được để trống!');
      Alert.alert('Lỗi', 'Vui lòng nhập tên thói quen');
      return;
    }

    // Lưu thói quen
    onSave(title.trim(), description.trim());
    
    // Reset form và đóng modal
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setTitleError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '80%' }}>
            {/* Header */}
            <View className="px-6 py-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-900">Thêm Thói Quen</Text>
                <TouchableOpacity onPress={handleClose} className="p-2">
                  <Text className="text-2xl text-gray-500">×</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Content */}
            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              {/* Title Input */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-900 mb-2">
                  Tên thói quen <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (text.trim()) {
                      setTitleError('');
                    }
                  }}
                  placeholder="Ví dụ: Uống 2 lít nước"
                  className={`border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base text-gray-900`}
                  placeholderTextColor="#9CA3AF"
                />
                {titleError ? (
                  <Text className="text-red-500 text-sm mt-1">{titleError}</Text>
                ) : null}
              </View>

              {/* Description Input */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-900 mb-2">
                  Mô tả (tùy chọn)
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Mô tả chi tiết về thói quen của bạn..."
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                  style={{ minHeight: 100 }}
                />
              </View>

              {/* Tips */}
              <View className="bg-blue-50 p-4 rounded-lg mb-4">
                <Text className="text-blue-800 text-sm font-medium mb-1">💡 Mẹo nhỏ</Text>
                <Text className="text-blue-700 text-sm">
                  Đặt mục tiêu cụ thể và có thể đo lường được để dễ dàng theo dõi tiến độ!
                </Text>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View className="px-6 py-4 border-t border-gray-200 flex-row gap-3">
              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 bg-gray-200 py-4 rounded-lg items-center"
              >
                <Text className="text-gray-700 font-semibold text-base">Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-blue-500 py-4 rounded-lg items-center"
              >
                <Text className="text-white font-semibold text-base">Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

