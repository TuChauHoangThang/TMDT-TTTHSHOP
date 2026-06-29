import axios from 'axios';

const API_URL = 'http://localhost:8080/api/orders';

const getHeaders = () => {
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return { 'X-Customer-Id': String(user.id) };
  }
  return {};
};

export const orderService = {
  createOrder: async (orderData: any) => {
    const response = await axios.post(API_URL, orderData, { headers: getHeaders() });
    return response.data;
  },

  getOrders: async () => {
    const response = await axios.get(API_URL, { headers: getHeaders() });
    return response.data;
  },

  getOrderById: async (id: number) => {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getHeaders() });
    return response.data;
  }
};
