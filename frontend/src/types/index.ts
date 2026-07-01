export interface Product {
  id: number;
  name: string;
  slug?: string;
  categoryName?: string;
  categorySlug?: string;
  category?: string; // Tạm giữ cho data mock cũ
  image: string;
  priceCurrent?: number | string;
  priceOriginal?: number | string;
  priceContact?: boolean;
  ratingCount: number;
  ratingStars: number;
  badges: string[];
  status?: string;
  stock?: number;
}

export interface Category {
  id: number | string;
  name: string;
  slug?: string;
  icon: string;
  productCount?: number;
  count?: number; // Tạm giữ cho data cũ
  imageUrl?: string;
  image?: string;
}

export interface Promo {
  id: number;
  title: string;
  label: string;
  image: string;
  link: string;
  discount?: string;
  tall?: boolean;
}
