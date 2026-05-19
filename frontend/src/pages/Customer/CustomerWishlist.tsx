import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useFavorite } from '../../context/FavoriteContext';

const CustomerWishlist: React.FC = () => {
  const { favorites } = useFavorite();

  return (
    <div>
      {favorites.length === 0 ? (
        <div className="customer-empty" style={{ marginTop: 40 }}>
          <i className="fa-regular fa-heart" />
          Bạn chưa có sản phẩm yêu thích nào.
          <div style={{ marginTop: 16 }}>
            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#3d5c49',
                color: '#fff',
                padding: '9px 20px',
                borderRadius: 24,
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <i className="fa-solid fa-store" />
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 18, fontSize: '0.875rem', color: '#7a6e63' }}>
            <i className="fa-solid fa-heart" style={{ color: '#c0392b', marginRight: 6 }} />
            {favorites.length} sản phẩm yêu thích
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}>
            {favorites.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerWishlist;
