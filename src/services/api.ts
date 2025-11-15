// API service để fetch thói quen mẫu

export interface ApiHabit {
  id?: string | number;
  title?: string;
  description?: string;
  active?: number;
}

// Mock API endpoint - URL thật từ mockapi.io
const API_URL = 'https://68e67be521dd31f22cc5d844.mockapi.io/habit';

// Hàm fetch habits từ API
export const fetchHabitsFromAPI = async (): Promise<ApiHabit[]> => {
  try {
    console.log('Fetching habits from API:', API_URL);
    
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('API Response:', data);
    
    // API đã trả về đúng format, chỉ cần return
    return data as ApiHabit[];
  } catch (error) {
    console.error('Error fetching habits from API:', error);
    throw error;
  }
};

