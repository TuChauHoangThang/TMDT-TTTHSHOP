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
    return { 
      'X-Contractor-Id': String(user.id)
    };
  }
  return {};
};

export const customOrderService = {
  // ================= CUSTOMER API =================

  createRequest: async (data: any, images: File[]) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    images.forEach(img => formData.append('images', img));

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

  submitQuote: async (id: number, data: { quotedPrice: number, estimatedDays: number, note: string }, images?: File[]): Promise<CustomOrderQuote> => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (images) {
      images.forEach(img => formData.append('images', img));
    }

    const response = await axios.post(`${API_URL}/${id}/quotes`, formData, { 
      headers: {
        ...getContractorHeaders(),
        'Content-Type': 'multipart/form-data',
      } 
    });
    return response.data;
  },

  withdrawQuote: async (requestId: number, quoteId: number) => {
    const response = await axios.delete(`${API_URL}/${requestId}/quotes/${quoteId}`, { headers: getContractorHeaders() });
    return response.data;
  },

  // ================= ESCROW & WALLET API =================

  getEscrow: async (requestId: number): Promise<any> => {
    const response = await axios.get(`http://localhost:8080/api/escrows/${requestId}`);
    return response.data;
  },

  depositMock: async (requestId: number): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/escrows/${requestId}/deposit-mock`, {}, { headers: getCustomerHeaders() });
    return response.data;
  },

  depositWithWallet: async (requestId: number): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/escrows/${requestId}/deposit-wallet`, {}, { headers: getCustomerHeaders() });
    return response.data;
  },

  getVNPayUrl: async (requestId: number): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/escrows/${requestId}/vnpay-url`, {}, { headers: getCustomerHeaders() });
    return response.data;
  },

  shipProject: async (requestId: number): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/escrows/${requestId}/ship`, {}, { headers: getContractorHeaders() });
    return response.data;
  },

  releaseEscrow: async (requestId: number): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/escrows/${requestId}/release`, {}, { headers: getCustomerHeaders() });
    return response.data;
  },

  disputeEscrow: async (requestId: number, reason: string): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/escrows/${requestId}/dispute`, { reason }, { headers: getCustomerHeaders() });
    return response.data;
  },

  getWallet: async (): Promise<any> => {
    const response = await axios.get(`http://localhost:8080/api/users/wallet`, { headers: getCustomerHeaders() });
    return response.data;
  },

  depositWalletMock: async (amount: number): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/users/wallet/deposit-mock`, { amount }, { headers: getCustomerHeaders() });
    return response.data;
  },

  depositWalletVNPay: async (amount: number): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/users/wallet/deposit-vnpay`, { amount }, { headers: getCustomerHeaders() });
    return response.data;
  },

  getWalletTransactions: async (): Promise<any> => {
    const response = await axios.get(`http://localhost:8080/api/users/wallet/transactions`, { headers: getCustomerHeaders() });
    return response.data;
  },

  createWithdrawalRequest: async (amount: number, bankName: string, accountNumber: string, accountHolderName: string): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/users/wallet/withdraw-request`, { amount, bankName, accountNumber, accountHolderName }, { headers: getCustomerHeaders() });
    return response.data;
  },

  getWithdrawalRequests: async (): Promise<any> => {
    const response = await axios.get(`http://localhost:8080/api/users/wallet/withdraw-requests`, { headers: getCustomerHeaders() });
    return response.data;
  },

  // ================= ADMIN ESCROW & WALLET API =================

  getAllEscrows: async (): Promise<any> => {
    const response = await axios.get(`http://localhost:8080/api/escrows/admin/all`, { headers: getCustomerHeaders() });
    return response.data;
  },

  resolveDispute: async (escrowId: number, resolution: 'RELEASE' | 'REFUND', notes: string): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/escrows/admin/${escrowId}/resolve`, { resolution, notes }, { headers: getCustomerHeaders() });
    return response.data;
  },

  getAllWithdrawRequestsAdmin: async (): Promise<any> => {
    const response = await axios.get(`http://localhost:8080/api/users/wallet/admin/withdraw-requests`, { headers: getCustomerHeaders() });
    return response.data;
  },

  approveWithdrawalAdmin: async (id: number): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/users/wallet/admin/withdraw-requests/${id}/approve`, {}, { headers: getCustomerHeaders() });
    return response.data;
  },

  rejectWithdrawalAdmin: async (id: number): Promise<any> => {
    const response = await axios.post(`http://localhost:8080/api/users/wallet/admin/withdraw-requests/${id}/reject`, {}, { headers: getCustomerHeaders() });
    return response.data;
  }
};
