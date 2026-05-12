import axios from 'axios';
import type { CustomOrderRequest, CustomOrderQuote } from '../types/customOrder';

const API_URL = 'http://localhost:8080/api/custom-orders';

const getCustomerHeaders = () => {
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return { 'X-Customer-Id': String(user.id) };
  }
  return {};
};

const getContractorHeaders = () => {
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    // Giả lập Shop ID luôn = 1 cho đơn giản
    return { 'X-Contractor-Id': String(user.id), 'X-Shop-Id': '1' };
  }
  return {};
};

export const customOrderService = {
  // ================= CUSTOMER API =================

  createRequest: async (data: any, images: File[]) => {
    const formData = new FormData();
    // Spring Boot expects the DTO as a JSON string or blob in the "data" part
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    
    images.forEach(img => {
      formData.append('images', img);
    });

    const response = await axios.post(API_URL, formData, {
      headers: {
        ...getCustomerHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyRequests: async (): Promise<CustomOrderRequest[]> => {
    const response = await axios.get(API_URL, { headers: getCustomerHeaders() });
    return response.data;
  },

  getRequestDetail: async (id: number): Promise<CustomOrderRequest> => {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getCustomerHeaders() });
    return response.data;
  },

  selectQuote: async (id: number, quoteId: number): Promise<CustomOrderRequest> => {
    const response = await axios.post(`${API_URL}/${id}/select-quote/${quoteId}`, {}, { headers: getCustomerHeaders() });
    return response.data;
  },

  cancelRequest: async (id: number) => {
    const response = await axios.patch(`${API_URL}/${id}/cancel`, {}, { headers: getCustomerHeaders() });
    return response.data;
  },

  // ================= CONTRACTOR API =================

  getOpenRequests: async (params?: any) => {
    const response = await axios.get(`${API_URL}/open`, { params });
    return response.data;
  },

  getOpenRequestDetail: async (id: number): Promise<CustomOrderRequest> => {
    const response = await axios.get(`${API_URL}/open/${id}`);
    return response.data;
  },

  submitQuote: async (id: number, data: { quotedPrice: number, estimatedDays: number, note: string }): Promise<CustomOrderQuote> => {
    const response = await axios.post(`${API_URL}/${id}/quotes`, data, { headers: getContractorHeaders() });
    return response.data;
  },

  withdrawQuote: async (requestId: number, quoteId: number) => {
    const response = await axios.delete(`${API_URL}/${requestId}/quotes/${quoteId}`, { headers: getContractorHeaders() });
    return response.data;
  }
};
