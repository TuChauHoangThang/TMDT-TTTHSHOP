import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ============================================================
// Types
// ============================================================

export type UserRole = 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
}

// ============================================================
// Context
// ============================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================================
// Mock users DB (replace with real API calls)
// ============================================================

const MOCK_USERS: (User & { password: string })[] = [
  { id: 1, email: 'customer@test.com', password: '123456', fullName: 'Nguyễn Văn A', phone: '0901234567', role: 'CUSTOMER' },
  { id: 2, email: 'seller@test.com',   password: '123456', fullName: 'Trần Thị B',  phone: '0909876543', role: 'CONTRACTOR' },
  { id: 3, email: 'admin@test.com',    password: '123456', fullName: 'Admin TTTH',  phone: '0900000001', role: 'ADMIN' },
];

// ============================================================
// Provider
// ============================================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true while hydrating from storage

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = (u: User, t: string) => {
    localStorage.setItem('auth_token', t);
    localStorage.setItem('auth_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  // ---- Login ----
  const login = useCallback(async (email: string, password: string) => {
    // TODO: replace with → axios.post('/api/auth/login', { email, password })
    await new Promise(r => setTimeout(r, 800)); // Simulate network

    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Email hoặc mật khẩu không đúng');

    const { password: _pwd, ...userWithoutPwd } = found;
    const fakeToken = btoa(`${found.id}:${found.email}:${Date.now()}`);
    persist(userWithoutPwd, fakeToken);
  }, []);

  // ---- Register ----
  const register = useCallback(async (fullName: string, email: string, password: string, phone?: string) => {
    // TODO: replace with → axios.post('/api/auth/register', { fullName, email, password, phone })
    await new Promise(r => setTimeout(r, 900));

    if (MOCK_USERS.find(u => u.email === email)) {
      throw new Error('Email này đã được sử dụng');
    }

    const newUser: User = {
      id: Date.now(),
      email,
      fullName,
      phone,
      role: 'CUSTOMER',
    };
    const fakeToken = btoa(`${newUser.id}:${email}:${Date.now()}`);
    // Push to mock (in-memory only)
    MOCK_USERS.push({ ...newUser, password });
    persist(newUser, fakeToken);
  }, []);

  // ---- Logout ----
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// Hook
// ============================================================

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
