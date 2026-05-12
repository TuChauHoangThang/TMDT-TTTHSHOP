import axios from 'axios';
import type { Product, Category } from '../types';

const API_URL = 'http://localhost:8080/api';

export const productService = {
  // Lấy sản phẩm nổi bật
  getFeatured: async (limit: number = 4): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products/featured?limit=${limit}`);
    return response.data;
  },

  // Lấy danh sách sản phẩm (có phân trang)
  getProducts: async (params?: { keyword?: string; categorySlug?: string; page?: number; size?: number }) => {
    const response = await axios.get(`${API_URL}/products`, { params });
    return response.data; // PagedProductResponse
  },

  // Chi tiết sản phẩm
  getProductBySlug: async (slug: string) => {
    const response = await axios.get(`${API_URL}/products/slug/${slug}`);
    return response.data;
  }
};

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  }
};
