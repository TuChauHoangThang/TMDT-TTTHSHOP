import axios from 'axios';

const API_URL = 'http://localhost:8080/api/notifications';

const getHeaders = () => {
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return { 'X-Customer-Id': String(user.id) };
  }
  return {};
};

export interface NotificationItem {
  id: number;
  customerId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await axios.get(API_URL, { headers: getHeaders() });
    return response.data;
  },
  
  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get(`${API_URL}/unread-count`, { headers: getHeaders() });
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await axios.put(`${API_URL}/${id}/read`, {}, { headers: getHeaders() });
  },

  markAllAsRead: async (): Promise<void> => {
    await axios.put(`${API_URL}/read-all`, {}, { headers: getHeaders() });
  }
};
