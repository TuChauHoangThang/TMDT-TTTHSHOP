import React, { createContext, useContext, useState, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from './AuthContext';
import type { Product } from '../types';

interface FavoriteContextType {
  favorites: Product[];
  favoriteProductIds: number[];
  toggleFavorite: (productId: number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState<number[]>([]);

  const refreshFavorites = async () => {
    if (isAuthenticated) {
      try {
        const data = await favoriteService.getFavorites();
        setFavorites(data);
        setFavoriteProductIds(data.map(p => p.id));
      } catch (error) {
        console.error('Failed to load favorites', error);
      }
    } else {
      setFavorites([]);
      setFavoriteProductIds([]);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [isAuthenticated]);

  const toggleFavorite = async (productId: number) => {
    if (!isAuthenticated) return;
    try {
      await favoriteService.toggleFavorite(productId);
      await refreshFavorites();
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      throw error;
    }
  };

  return (
    <FavoriteContext.Provider value={{ favorites, favoriteProductIds, toggleFavorite, refreshFavorites }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorite must be used within a FavoriteProvider');
  }
  return context;
};
