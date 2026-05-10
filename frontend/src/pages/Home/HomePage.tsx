import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../../components/HeroSlider/HeroSlider';
import ProductCard from '../../components/ProductCard/ProductCard';
import { productService } from '../../services/productService';
import type { Product } from '../../types';
import '../../css/HomePage.css';

const HomePage: React.FC = () => {
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [livingRoomProducts, setLivingRoomProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch 8 featured products
        const products = await productService.getFeatured(8);
        setBestsellerProducts(products.slice(0, 4));
        setLivingRoomProducts(products.slice(4, 8));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main id="main-content">
      <HeroSlider />

      <section className="stats-bar" aria-label="Thống kê">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item fade-in visible">
              <div className="stat-number"><span className="counter">500</span><span className="stat-unit">+</span></div>
              <div className="stat-label">Sản Phẩm</div>
            </div>
            <div className="stat-item fade-in visible fade-in-delay-1">
              <div className="stat-number"><span className="counter">15</span><span className="stat-unit">+</span></div>
              <div className="stat-label">Danh Mục</div>
            </div>
            <div className="stat-item fade-in visible fade-in-delay-2">
              <div className="stat-number"><span className="counter">100</span><span className="stat-unit">%</span></div>
              <div className="stat-label">Thủ Công</div>
            </div>
            <div className="stat-item fade-in visible fade-in-delay-3">
              <div className="stat-number">Hơn<span className="counter">2000</span></div>
              <div className="stat-label">Khách Hàng</div>
            </div>
            <div className="stat-item fade-in visible fade-in-delay-4">
              <div className="stat-number"><span className="counter">5</span><span className="stat-unit">Năm</span></div>
              <div className="stat-label">Bảo Hành</div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-bar" aria-hidden="true">
        <div className="marquee-track" id="marquee-track">
          <span className="marquee-item"><i className="fa fa-star marquee-icon"></i> Tay Nghề Thủ Công</span>
          <span className="marquee-item"><i className="fa fa-leaf marquee-icon"></i> Gỗ Tự Nhiên Bền Vững</span>
          <span className="marquee-item"><i className="fa fa-pencil-ruler marquee-icon"></i> Thiết Kế Đặc Biệt</span>
          <span className="marquee-item"><i className="fa fa-shield-halved marquee-icon"></i> Bảo Hành 5 Năm</span>
          <span className="marquee-item"><i className="fa fa-truck marquee-icon"></i> Giao Hàng Toàn Quốc</span>
          <span className="marquee-item"><i className="fa fa-star marquee-icon"></i> Tay Nghề Thủ Công</span>
          <span className="marquee-item"><i className="fa fa-leaf marquee-icon"></i> Gỗ Tự Nhiên Bền Vững</span>
          <span className="marquee-item"><i className="fa fa-pencil-ruler marquee-icon"></i> Thiết Kế Đặc Biệt</span>
          <span className="marquee-item"><i className="fa fa-shield-halved marquee-icon"></i> Bảo Hành 5 Năm</span>
          <span className="marquee-item"><i className="fa fa-truck marquee-icon"></i> Giao Hàng Toàn Quốc</span>
        </div>
      </div>

      <section className="categories section" aria-label="Danh mục sản phẩm">
        <div className="container">
          <span className="section-label">Danh Mục</span>
          <h2 className="section-title">Chất Liệu & Phong Cách</h2>
          <p className="section-desc">Khám phá các dòng nội thất được làm từ những vật liệu cao cấp, mỗi phong cách mang một câu chuyện riêng</p>

          <div className="categories-grid">
            <div className="category-card fade-in visible">
              <img className="category-card-img" src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&q=80" alt="Gỗ tự nhiên" />
              <div className="category-card-overlay"></div>
              <div className="category-card-body">
                <div className="category-card-icon"><i className="fa fa-tree"></i></div>
                <div className="category-card-name">Gỗ Tự Nhiên</div>
                <div className="category-card-count">128 sản phẩm</div>
              </div>
            </div>
            <div className="category-card fade-in visible fade-in-delay-1">
              <img className="category-card-img" src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80" alt="Gỗ công nghiệp" />
              <div className="category-card-overlay"></div>
              <div className="category-card-body">
                <div className="category-card-icon"><i className="fa fa-box"></i></div>
                <div className="category-card-name">Gỗ Công Nghiệp</div>
                <div className="category-card-count">94 sản phẩm</div>
              </div>
            </div>
            <div className="category-card fade-in visible fade-in-delay-2">
              <img className="category-card-img" src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" alt="Kim loại kính" />
              <div className="category-card-overlay"></div>
              <div className="category-card-body">
                <div className="category-card-icon"><i className="fa fa-gem"></i></div>
                <div className="category-card-name">Kim Loại & Kính</div>
                <div className="category-card-count">67 sản phẩm</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-label="Sản phẩm bán chạy">
        <div className="container">
          <span className="section-label">Được Yêu Thích</span>
          <h2 className="section-title">Sản Phẩm Bán Chạy</h2>
          <div className="section-divider"></div>

          <div className="products-grid-4">
            {bestsellerProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Link to="/products" className="btn btn--outline">
              <i className="fa fa-th-large"></i> Xem Tất Cả Sản Phẩm
            </Link>
          </div>
        </div>
      </section>

      <section className="promo-section" aria-label="Khuyến mãi">
        <div className="container">
          <div className="promo-grid">
            <div className="promo-card promo-card--tall fade-in visible">
              <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80" alt="Khuyến mãi phòng khách" />
              <div className="promo-overlay"></div>
              <div className="promo-discount">-20%<small>OFF</small></div>
              <div className="promo-body">
                <div className="promo-label">Flash Sale Tuần Này</div>
                <div className="promo-title">Bộ Sofa Phòng Khách<br/>Cao Cấp Giảm Mạnh</div>
                <Link to="/promotions" className="promo-cta">Mua Ngay <i className="fa fa-arrow-right"></i></Link>
              </div>
            </div>
            <div className="promo-card fade-in visible fade-in-delay-1">
              <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80" alt="Khuyến mãi phòng ngủ" />
              <div className="promo-overlay"></div>
              <div className="promo-body">
                <div className="promo-label">Bộ Phòng Ngủ</div>
                <div className="promo-title">Combo Giường + Tủ Tiết Kiệm</div>
                <Link to="/promotions" className="promo-cta">Xem Combo <i className="fa fa-arrow-right"></i></Link>
              </div>
            </div>
            <div className="promo-card fade-in visible fade-in-delay-2">
              <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80" alt="Hàng mới về" />
              <div className="promo-overlay"></div>
              <div className="promo-body">
                <div className="promo-label">New Arrival</div>
                <div className="promo-title">Bộ Sưu Tập Đèn 2025</div>
                <Link to="/products" className="promo-cta">Khám Phá <i className="fa fa-arrow-right"></i></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="collection-section" aria-label="Bộ sưu tập phòng khách">
        <div className="container">
          <div className="collection-header">
            <div>
              <span className="section-label">Bộ Sưu Tập</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>Nội Thất Phòng Khách</h2>
            </div>
            <Link to="/products?room=phong-khach" className="btn btn--outline btn--sm">
              Xem Tất Cả <i className="fa fa-arrow-right"></i>
            </Link>
          </div>
          <div className="collection-slider-wrap">
            <div className="collection-slider">
              {livingRoomProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;
