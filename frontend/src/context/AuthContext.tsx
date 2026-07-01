import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ============================================================
// Types & Config
// ============================================================

export type UserRole = 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  shopId?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<any>;
  registerContractor: (fullName: string, email: string, password: string, phone: string, shopName: string, shopDescription: string, shopAddress: string) => Promise<any>;
  verifyOtp: (email: string, otpCode: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  sendForgotPasswordOtp: (email: string) => Promise<void>;
  resetPassword: (email: string, otpCode: string, newPassword: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const API_BASE_URL = 'http://localhost:8080/api/auth';

// ============================================================
// Context
// ============================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Hydrate: Phục hồi phiên đăng nhập từ LocalStorage
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const persist = (u: User, t: string) => {
    localStorage.setItem('auth_token', t);
    localStorage.setItem('auth_user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
  };

  // ---- Login ----
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });

      console.log("Dữ liệu gốc từ API:", response.data); // Dòng này để ní check F12 xem nó ra cái gì

      let userData: User;
      let userToken: string;

      // Trường hợp 1: Backend trả về kiểu { token, user: { ... } }
      if (response.data.user) {
        userData = response.data.user;
        userToken = response.data.token;
      }
      // Trường hợp 2: Backend trả về kiểu phẳng { token, id, fullName... }
      else {
        const { token, ...rest } = response.data;
        userData = rest as User;
        userToken = token;
      }

      persist(userData, userToken);
    } catch (error: any) {
      const msg = error.response?.data || 'Email hoặc mật khẩu không chính xác';
      throw new Error(typeof msg === 'string' ? msg : 'Lỗi đăng nhập');
    }
  }, []);

  // ---- Register ----
  const register = useCallback(async (fullName: string, email: string, password: string, phone?: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        fullName, email, password, phone
      });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data || 'Đăng ký thất bại';
      throw new Error(typeof msg === 'string' ? msg : 'Lỗi đăng ký');
    }
  }, []);

  // ---- Register Contractor ----
  const registerContractor = useCallback(async (
    fullName: string, email: string, password: string, phone: string,
    shopName: string, shopDescription: string, shopAddress: string
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register-contractor`, {
        fullName, email, password, phone, shopName, shopDescription, shopAddress
      });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data || 'Đăng ký nhà thầu thất bại';
      throw new Error(typeof msg === 'string' ? msg : 'Lỗi đăng ký nhà thầu');
    }
  }, []);

  // ---- Verify OTP ----
  const verifyOtp = useCallback(async (email: string, otpCode: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
        email, otpCode
      });

      let userData: User;
      let userToken: string;

      if (response.data.user) {
        userData = response.data.user;
        userToken = response.data.token;
      } else {
        const { token, ...rest } = response.data;
        userData = rest as User;
        userToken = token;
      }

      persist(userData, userToken);
    } catch (error: any) {
      const msg = error.response?.data || 'Xác thực OTP thất bại';
      throw new Error(typeof msg === 'string' ? msg : 'Lỗi xác thực OTP');
    }
  }, []);

  // ---- Resend OTP ----
  const resendOtp = useCallback(async (email: string) => {
    try {
      await axios.post(`${API_BASE_URL}/resend-otp`, { email });
    } catch (error: any) {
      const msg = error.response?.data || 'Gửi lại OTP thất bại';
      throw new Error(typeof msg === 'string' ? msg : 'Lỗi gửi lại OTP');
    }
  }, []);

  // ---- Send Forgot Password OTP ----
  const sendForgotPasswordOtp = useCallback(async (email: string) => {
    try {
      await axios.post(`${API_BASE_URL}/forgot-password`, { email });
    } catch (error: any) {
      const msg = error.response?.data || 'Yêu cầu OTP khôi phục mật khẩu thất bại';
      throw new Error(typeof msg === 'string' ? msg : 'Lỗi gửi yêu cầu khôi phục');
    }
  }, []);

  // ---- Reset Password ----
  const resetPassword = useCallback(async (email: string, otpCode: string, newPassword: string) => {
    try {
      await axios.post(`${API_BASE_URL}/reset-password`, { email, otpCode, newPassword });
    } catch (error: any) {
      const msg = error.response?.data || 'Đặt lại mật khẩu thất bại';
      throw new Error(typeof msg === 'string' ? msg : 'Lỗi đặt lại mật khẩu');
    }
  }, []);

  // ---- Logout ----
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  }, []);

  return (
      <AuthContext.Provider value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        registerContractor,
        verifyOtp,
        resendOtp,
        sendForgotPasswordOtp,
        resetPassword,
        logout,
        setUser
      }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};