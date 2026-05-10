import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="container">
        
        <div className="footer-main">
          
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon"><i className="fa fa-house-chimney"></i></div>
              <span className="footer-logo-name">HTTTSHOP</span>
            </Link>
            <p className="footer-brand-desc">
              HTTTSHOP chuyên thiết kế và sản xuất nội thất theo yêu cầu – từng cm, từng đường nét được chăm chút tỉ mỉ bởi những người thợ tài hoa. Nội thất đẹp, bền, đúng bạn.
            </p>
            <div className="footer-contact">
              <div className="footer-contact-item"><i className="fa fa-phone"></i><span>0901 234 567</span></div>
              <div className="footer-contact-item"><i className="fa fa-envelope"></i><span>info@htttshop.vn</span></div>
              <div className="footer-contact-item"><i className="fa fa-location-dot"></i><span>123 Nguyễn Văn Trỗi, Q. Phú Nhuận, TP. HCM</span></div>
              <div className="footer-contact-item"><i className="fa fa-clock"></i><span>Thứ 2 – Thứ 7: 8:00 – 17:30</span></div>
            </div>
            <div className="footer-socials">
              <a href="#" className="footer-social facebook" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="footer-social instagram" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" className="footer-social tiktok" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
              <a href="#" className="footer-social youtube" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
              <a href="#" className="footer-social zalo" aria-label="Zalo" style={{ fontSize: '0.7rem', fontWeight: 900 }}>Zalo</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Sản Phẩm</h4>
            <ul className="footer-links">
              <li><Link to="/products?cat=sofa" className="footer-link"><i className="fa fa-chevron-right"></i> Sofa & Ghế</Link></li>
              <li><Link to="/products?cat=ban-ghe" className="footer-link"><i className="fa fa-chevron-right"></i> Bàn Ghế</Link></li>
              <li><Link to="/products?cat=tu-ke" className="footer-link"><i className="fa fa-chevron-right"></i> Tủ & Kệ</Link></li>
              <li><Link to="/products?cat=giuong" className="footer-link"><i className="fa fa-chevron-right"></i> Giường Ngủ</Link></li>
              <li><Link to="/products?cat=den" className="footer-link"><i className="fa fa-chevron-right"></i> Đèn Trang Trí</Link></li>
              <li><Link to="/products?cat=decor" className="footer-link"><i className="fa fa-chevron-right"></i> Decor & Phụ Kiện</Link></li>
              <li><Link to="/products?cat=van-phong" className="footer-link"><i className="fa fa-chevron-right"></i> Văn Phòng</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Danh Mục</h4>
            <ul className="footer-links">
              <li><Link to="/products?room=phong-khach" className="footer-link"><i className="fa fa-chevron-right"></i> Phòng Khách</Link></li>
              <li><Link to="/products?room=phong-ngu" className="footer-link"><i className="fa fa-chevron-right"></i> Phòng Ngủ</Link></li>
              <li><Link to="/products?room=phong-an" className="footer-link"><i className="fa fa-chevron-right"></i> Phòng Ăn</Link></li>
              <li><Link to="/products?room=phong-lam-viec" className="footer-link"><i className="fa fa-chevron-right"></i> Phòng Làm Việc</Link></li>
              <li><Link to="/products?room=phong-bep" className="footer-link"><i className="fa fa-chevron-right"></i> Phòng Bếp</Link></li>
              <li><Link to="/promotions" className="footer-link"><i className="fa fa-chevron-right"></i> Hàng Thanh Lý</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Chính Sách</h4>
            <ul className="footer-links">
              <li><Link to="/policy#bao-hanh" className="footer-link"><i className="fa fa-chevron-right"></i> Bảo Hành Sản Phẩm</Link></li>
              <li><Link to="/policy#doi-tra" className="footer-link"><i className="fa fa-chevron-right"></i> Đổi Trả Hàng</Link></li>
              <li><Link to="/policy#van-chuyen" className="footer-link"><i className="fa fa-chevron-right"></i> Vận Chuyển</Link></li>
              <li><Link to="/policy#thanh-toan" className="footer-link"><i className="fa fa-chevron-right"></i> Thanh Toán</Link></li>
              <li><Link to="/policy#bao-mat" className="footer-link"><i className="fa fa-chevron-right"></i> Bảo Mật Thông Tin</Link></li>
              <li><Link to="/about" className="footer-link"><i className="fa fa-chevron-right"></i> Về Chúng Tôi</Link></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2025 HTTTSHOP. Bảo lưu mọi quyền. Thiết kế với ♥ tại Việt Nam.</p>
          <div className="footer-payments">
            <span className="payment-badge"><i className="fab fa-cc-visa"></i> VISA</span>
            <span className="payment-badge"><i className="fab fa-cc-mastercard"></i> MC</span>
            <span className="payment-badge"><i className="fas fa-money-bill-wave"></i> COD</span>
            <span className="payment-badge" style={{ fontSize: '0.7rem', fontWeight: 900 }}>MoMo</span>
            <span className="payment-badge" style={{ fontSize: '0.7rem', fontWeight: 900 }}>ZaloPay</span>
            <span className="payment-badge" style={{ fontSize: '0.7rem', fontWeight: 900 }}>Bank</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
