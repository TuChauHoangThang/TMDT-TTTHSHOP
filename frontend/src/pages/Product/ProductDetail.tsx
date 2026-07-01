import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorite } from '../../context/FavoriteContext';
import { toast } from 'react-toastify';
import type { Product } from '../../types';
import '../../css/ProductCard.css';
import './ProductDetail.css';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImage, setActiveImage] = useState<string>('');
  
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { favoriteProductIds, toggleFavorite } = useFavorite();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!slug) return;
        setLoading(true);
        const data = await productService.getProductBySlug(slug);
        setProduct(data);
        
        // Handle images
        const initialImg = data.image || (data as any).images?.[0];
        setActiveImage(initialImg);
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết sản phẩm', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      navigate('/login');
      return;
    }
    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng.');
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để lưu sản phẩm yêu thích!');
      navigate('/login');
      return;
    }
    if (!product) return;
    try {
      await toggleFavorite(product.id);
      toast.success(isFavorite ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra.');
    }
  };

  const isFavorite = product ? favoriteProductIds.includes(product.id) : false;

  const formatPrice = (p: number | string | undefined) => {
    if (typeof p === 'number') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p).replace('₫', 'đ');
    }
    return p;
  };

  if (loading) {
    return (
      <div className="container section" style={{ minHeight: '60vh', paddingTop: '8rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section" style={{ minHeight: '60vh', paddingTop: '8rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: '#555' }}>Không tìm thấy sản phẩm!</h2>
        <Link to="/products" className="btn btn--primary" style={{ marginTop: '1rem' }}>Quay lại cửa hàng</Link>
      </div>
    );
  }

  // Fallback for multiple images (if the API supports it, otherwise mock some based on the main image)
  const productImages = (product as any).images || [product.image, product.image, product.image];

  return (
    <main className="product-detail-page">
      <div className="container">
        <div className="pd-breadcrumb">
          <Link to="/">Trang chủ</Link> <i className="fa fa-angle-right"></i> 
          <Link to="/products">Sản phẩm</Link> <i className="fa fa-angle-right"></i> 
          <span className="current">{product.name}</span>
        </div>

        <div className="pd-main-grid">
          {/* ---- Left: Image Gallery ---- */}
          <div className="pd-gallery">
            <div className="pd-gallery-thumbnails">
              {productImages.slice(0, 4).map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  className={`pd-thumbnail ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx}`} />
                </div>
              ))}
            </div>
            <div className="pd-gallery-main">
              <img src={activeImage} alt={product.name} />
              {product.badges && product.badges.length > 0 && (
                <div className="pd-badges">
                  {product.badges.map((badge, idx) => (
                    <span key={idx} className="pd-badge">{badge}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---- Right: Info & Actions ---- */}
          <div className="pd-info">
            <div className="pd-category">
              {product.categoryName || (typeof product.category === 'object' ? (product.category as any).name : product.category)}
            </div>
            <h1 className="pd-title">{product.name}</h1>
            
            <div className="pd-rating-wrap">
              <div className="pd-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className={`fa ${star <= product.ratingStars ? 'fa-star' : (star - 0.5 === product.ratingStars ? 'fa-star-half-stroke' : 'fa-star empty')}`}></i>
                ))}
              </div>
              <span className="pd-rating-text">{product.ratingStars} / 5</span>
              <span className="pd-rating-count">({product.ratingCount} đánh giá)</span>
            </div>

            <div className="pd-price-wrap">
              {product.priceContact ? (
                <span className="pd-price-contact">Liên hệ để biết giá</span>
              ) : (
                <>
                  <span className="pd-price-current">{formatPrice(product.priceCurrent)}</span>
                  {product.priceOriginal && (
                    <span className="pd-price-original">{formatPrice(product.priceOriginal)}</span>
                  )}
                  {product.priceOriginal && product.priceCurrent && typeof product.priceOriginal === 'number' && typeof product.priceCurrent === 'number' && (
                     <span className="pd-price-discount">
                        Tiết kiệm {Math.round((1 - product.priceCurrent / product.priceOriginal) * 100)}%
                     </span>
                  )}
                </>
              )}
            </div>

            <p className="pd-short-desc">
              {(product as any).description || 'Sản phẩm nội thất cao cấp mang lại sự sang trọng và thoải mái cho không gian sống của bạn. Được chế tác từ những vật liệu tốt nhất, đảm bảo độ bền và tính thẩm mỹ vượt thời gian.'}
            </p>

            <div className="pd-status">
              Tình trạng: <strong style={{ color: (product.stock !== undefined && product.stock <= 0) ? 'var(--color-sale)' : 'green' }}>
                {product.status === 'ACTIVE' && (product.stock === undefined || product.stock > 0) ? 'Còn hàng trong kho' : 'Tạm hết hàng'}
              </strong>
              {product.stock !== undefined && product.stock > 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                  ({product.stock} sản phẩm có sẵn)
                </span>
              )}
            </div>

            <div className="pd-actions">
              <div className="pd-quantity">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={product.stock !== undefined && product.stock <= 0}>
                  <i className="fa fa-minus"></i>
                </button>
                <input type="number" value={product.stock !== undefined && product.stock <= 0 ? 0 : quantity} readOnly />
                <button onClick={() => setQuantity(Math.min(product.stock ?? 99, quantity + 1))} disabled={product.stock !== undefined && (product.stock <= 0 || quantity >= product.stock)}>
                  <i className="fa fa-plus"></i>
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart} 
                className="btn btn--primary pd-btn-add"
                disabled={product.status !== 'ACTIVE' || product.priceContact || (product.stock !== undefined && product.stock <= 0)}
              >
                <i className="fa fa-bag-shopping"></i> {product.stock !== undefined && product.stock <= 0 ? 'Tạm Hết Hàng' : 'Thêm Vào Giỏ Hàng'}
              </button>
              
              <button className="btn btn--outline pd-btn-wishlist" onClick={handleToggleFavorite}>
                <i className={`fa-heart ${isFavorite ? 'fa-solid' : 'fa-regular'}`} style={isFavorite ? { color: 'red' } : {}}></i>
              </button>
            </div>

            <button className="btn btn--outline pd-btn-custom" onClick={() => navigate('/custom-orders/create')}>
              <i className="fa fa-pen-ruler"></i> Thiết Kế Theo Yêu Cầu Riêng
            </button>

          </div>
        </div>

        {/* ---- Tabs Section ---- */}
        <div className="pd-tabs-section">
          <div className="pd-tabs-header">
            <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Mô tả chi tiết</button>
            <button className={activeTab === 'specs' ? 'active' : ''} onClick={() => setActiveTab('specs')}>Thông số kỹ thuật</button>
            <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Đánh giá ({product.ratingCount})</button>
          </div>
          <div className="pd-tabs-content">
            {activeTab === 'description' && (
              <div className="pd-tab-pane fade-in visible">
                <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Đặc Điểm Nổi Bật</h3>
                <p style={{ lineHeight: 1.8, color: '#555', marginBottom: '1.5rem' }}>
                  {(product as any).description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
                </p>
                <p style={{ lineHeight: 1.8, color: '#555' }}>
                  Sản phẩm được lấy cảm hứng từ phong cách nội thất tối giản (Minimalism) kết hợp với những đường nét hiện đại. Quá trình sản xuất áp dụng công nghệ tiên tiến, cùng với sự tỉ mỉ của các nghệ nhân lành nghề, mang đến một sản phẩm không chỉ đẹp mắt mà còn vô cùng bền bỉ với thời gian.
                </p>
              </div>
            )}
            
            {activeTab === 'specs' && (
              <div className="pd-tab-pane fade-in visible">
                <table className="pd-specs-table">
                  <tbody>
                    <tr><th>Thương hiệu</th><td>TTTH Furniture</td></tr>
                    <tr><th>Xuất xứ</th><td>Việt Nam</td></tr>
                    <tr><th>Chất liệu</th><td>Gỗ tự nhiên cao cấp, Vải bọc nhập khẩu</td></tr>
                    <tr><th>Kích thước</th><td>Tiêu chuẩn</td></tr>
                    <tr><th>Màu sắc</th><td>Đa dạng (Có thể tùy chỉnh)</td></tr>
                    <tr><th>Bảo hành</th><td>2 Năm</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="pd-tab-pane fade-in visible">
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
                  <i className="fa-regular fa-comment-dots" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ccc' }}></i>
                  <p>Tính năng đánh giá sản phẩm đang được xây dựng.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
};

export default ProductDetail;
