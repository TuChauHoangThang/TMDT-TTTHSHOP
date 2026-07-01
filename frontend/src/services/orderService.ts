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
  },

  getSellerOrders: async (contractorId: number) => {
    const response = await axios.get(`${API_URL}/seller`, {
      headers: { 'X-Contractor-Id': String(contractorId) }
    });
    return response.data;
  },

  getSellerOrderDetail: async (id: number, contractorId: number) => {
    const response = await axios.get(`${API_URL}/seller/${id}`, {
      headers: { 'X-Contractor-Id': String(contractorId) }
    });
    return response.data;
  },

  updateSellerOrderStatus: async (id: number, contractorId: number, status: string) => {
    const response = await axios.patch(`${API_URL}/seller/${id}/status`, { status }, {
      headers: { 'X-Contractor-Id': String(contractorId) }
    });
    return response.data;
  }
};
