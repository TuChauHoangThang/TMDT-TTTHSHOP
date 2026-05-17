import axios from 'axios';
import type { Product } from '../types';

const API_URL = 'http://localhost:8080/api/favorites';

const getHeaders = () => {
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return { 'X-Customer-Id': String(user.id) };
  }
  return {};
};

export const favoriteService = {
  getFavorites: async (): Promise<Product[]> => {
    const response = await axios.get(API_URL, { headers: getHeaders() });
    return response.data;
  },

  toggleFavorite: async (productId: number) => {
    const response = await axios.post(`${API_URL}/toggle/${productId}`, {}, { headers: getHeaders() });
    return response.data;
  }
};
