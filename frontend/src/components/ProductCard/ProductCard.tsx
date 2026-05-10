import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import '../../css/ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      navigate('/login');
      return;
    }
    
    try {
      await addToCart(product.id, 1);
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    } catch (error) {
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng.');
    }
  };
  return (
    <div className="product-card fade-in visible">
      <div className="product-card-img-wrap">
        <Link to={`/product/${product.slug}`} style={{ display: 'block' }}>
          <img className="product-card-img" src={product.image} alt={product.name} loading="lazy" />
        </Link>
        
        {product.badges && product.badges.length > 0 && (
          <div className="product-card-badges">
            {product.badges.map((badge, idx) => {
              let badgeClass = 'badge--hot';
              if (badge.toLowerCase().includes('mới')) badgeClass = 'badge--new';
              if (badge.includes('%')) badgeClass = 'badge--sale';
              return <span key={idx} className={`badge ${badgeClass}`}>{badge}</span>;
            })}
          </div>
        )}

        <div className="product-card-actions">
          <button className="product-action-btn wishlist-btn" aria-label="Yêu thích">
            <i className="fa fa-heart"></i>
          </button>
          <Link to={`/product/${product.slug}`} className="product-action-btn" aria-label="Xem nhanh">
            <i className="fa fa-eye"></i>
          </Link>
          <button className="product-action-btn" aria-label="So sánh">
            <i className="fa fa-code-compare"></i>
          </button>
        </div>
        <div className="product-card-overlay-btn" onClick={handleAddToCart}>
          <i className="fa fa-bag-shopping"></i> Thêm Vào Giỏ
        </div>
      </div>
      <div className="product-card-body">
        <div className="product-card-category">{product.categoryName || product.category}</div>
        <Link to={`/product/${product.slug}`} className="product-card-name">
          {product.name}
        </Link>
        <div className="product-card-rating">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <i key={star} className={`fa ${star <= product.ratingStars ? 'fa-star' : (star - 0.5 === product.ratingStars ? 'fa-star-half-stroke' : 'fa-star empty')}`}></i>
            ))}
          </div>
          <span className="rating-count">({product.ratingCount})</span>
        </div>
        <div className="price-wrapper">
          {product.priceContact ? (
            <span className="price-contact">Liên hệ</span>
          ) : (
            <>
              <span className="price-current">
                {typeof product.priceCurrent === 'number' 
                  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.priceCurrent).replace('₫', 'đ') 
                  : product.priceCurrent}
              </span>
              {product.priceOriginal && (
                <span className="price-original">
                  {typeof product.priceOriginal === 'number'
                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.priceOriginal).replace('₫', 'đ')
                    : product.priceOriginal}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
