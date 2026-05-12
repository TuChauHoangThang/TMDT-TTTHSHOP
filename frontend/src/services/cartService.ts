import axios from 'axios';

const API_URL = 'http://localhost:8080/api/cart';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  quantity: number;
  totalLinePrice: number;
}

export interface Cart {
  items: CartItem[];
  cartTotal: number;
}

// Lấy headers từ AuthContext hoặc localStorage (Mock cho X-Customer-Id)
const getHeaders = () => {
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return { 'X-Customer-Id': String(user.id) };
  }
  return {};
};

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const response = await axios.get(API_URL, { headers: getHeaders() });
    return response.data;
  },

  addToCart: async (productId: number, quantity: number = 1) => {
    const response = await axios.post(`${API_URL}/add`, { productId, quantity }, { headers: getHeaders() });
    return response.data;
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const response = await axios.put(`${API_URL}/item/${itemId}`, { quantity }, { headers: getHeaders() });
    return response.data;
  },

  removeCartItem: async (itemId: number) => {
    const response = await axios.delete(`${API_URL}/item/${itemId}`, { headers: getHeaders() });
    return response.data;
  },

  clearCart: async () => {
    const response = await axios.delete(`${API_URL}/clear`, { headers: getHeaders() });
    return response.data;
  }
};
