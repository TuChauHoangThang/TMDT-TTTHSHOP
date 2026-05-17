import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useFavorite } from '../../context/FavoriteContext';

const Wishlist: React.FC = () => {
  const { favorites } = useFavorite();

  return (
    <main style={{ paddingTop: '8rem', paddingBottom: '4rem', background: '#fcfcfc', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ padding: '2rem 0', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
            Danh sách yêu thích
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Các sản phẩm bạn đã lưu lại để xem sau.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <i className="fa-regular fa-heart" style={{ fontSize: '5rem', color: '#ddd', marginBottom: '1.5rem' }}></i>
            <h2 style={{ fontSize: '1.5rem', color: '#555', marginBottom: '1rem' }}>Bạn chưa có sản phẩm yêu thích nào</h2>
            <Link to="/products" className="btn btn--primary" style={{ marginTop: '1rem', padding: '12px 30px', borderRadius: '30px' }}>
              Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {favorites.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;
