import axios from 'axios';

const BASE = 'http://localhost:8080/api/admin';

export interface AdminStats {
  totalUsers: number;
  totalContractors: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCustomOrders: number;
  openCustomOrders: number;
  inProgressCustomOrders: number;
  completedCustomOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminContractor extends AdminUser {
  shopId?: number;
  shopName?: string;
  shopSlug?: string;
  shopRating?: number;
  shopRatingCount?: number;
  shopAddress?: string;
}

export interface AdminOrder {
  id: number;
  customerId: string;
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  note: string;
  createdAt: string;
}

export interface AdminOrderDetail extends AdminOrder {
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: { id: number; name: string; slug: string };
  }>;
}

export interface AdminCustomOrder {
  id: number;
  customerId: number;
  customerName?: string;
  title: string;
  furnitureType: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  status: string;
  quoteCount: number;
  selectedQuoteId?: number;
  createdAt: string;
}

export interface AdminCustomOrderDetail extends AdminCustomOrder {
  description: string;
  material: string;
  dimensions: string;
  colorStyle: string;
  customerPhone?: string;
  imageUrls: string[];
  quotes: Array<{
    id: number;
    contractorId: number;
    contractorName?: string;
    shopId: number;
    shopName?: string;
    quotedPrice: number;
    estimatedDays: number;
    note: string;
    status: string;
    createdAt: string;
  }>;
  updatedAt: string;
}

export const adminService = {
  getStats: (startDate?: string, endDate?: string): Promise<AdminStats> =>
    axios.get<AdminStats>(`${BASE}/stats`, { params: { startDate, endDate } }).then(r => r.data),

  getAllUsers: (): Promise<AdminUser[]> =>
    axios.get<AdminUser[]>(`${BASE}/users`).then(r => r.data),

  getCustomers: (): Promise<AdminUser[]> =>
    axios.get<AdminUser[]>(`${BASE}/users/customers`).then(r => r.data),

  getContractors: (): Promise<AdminContractor[]> =>
    axios.get<AdminContractor[]>(`${BASE}/users/contractors`).then(r => r.data),

  toggleUserActive: (id: number): Promise<{ message: string; isActive: boolean }> =>
    axios.patch<{ message: string; isActive: boolean }>(`${BASE}/users/${id}/toggle-active`).then(r => r.data),

  getAllOrders: (): Promise<AdminOrder[]> =>
    axios.get<AdminOrder[]>(`${BASE}/orders`).then(r => r.data),

  getOrderDetail: (id: number): Promise<AdminOrderDetail> =>
    axios.get<AdminOrderDetail>(`${BASE}/orders/${id}`).then(r => r.data),

  updateOrderStatus: (id: number, status: string): Promise<{ message: string; status: string }> =>
    axios.patch<{ message: string; status: string }>(`${BASE}/orders/${id}/status`, { status }).then(r => r.data),

  getAllCustomOrders: (): Promise<AdminCustomOrder[]> =>
    axios.get<AdminCustomOrder[]>(`${BASE}/custom-orders`).then(r => r.data),

  getCustomOrderDetail: (id: number): Promise<AdminCustomOrderDetail> =>
    axios.get<AdminCustomOrderDetail>(`${BASE}/custom-orders/${id}`).then(r => r.data),

  updateCustomOrderStatus: (id: number, status: string): Promise<{ message: string; status: string }> =>
    axios.patch<{ message: string; status: string }>(`${BASE}/custom-orders/${id}/status`, { status }).then(r => r.data),
};
