import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { cartService } from '../../services/cartService';
import '../../css/Checkout.css';

const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const Checkout: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: '',
    note: '',
    paymentMethod: 'COD'
  });

  const [submitting, setSubmitting] = useState(false);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <i className="fa fa-shopping-bag" style={{ fontSize: '4rem', color: '#ccc', marginBottom: '1rem' }}></i>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <Link to="/products" className="btn btn--primary" style={{ marginTop: '1rem' }}>Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    setSubmitting(true);
    try {
      // Giả lập gọi API tạo đơn hàng
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Xóa giỏ hàng sau khi đặt thành công
      await cartService.clearCart();
      await refreshCart();

      alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại TTTH.');
      navigate('/');
    } catch (error) {
      alert('Có lỗi xảy ra khi đặt hàng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Thanh Toán</h1>
          <div className="checkout-breadcrumb">
            <Link to="/cart">Giỏ hàng</Link>
            <i className="fa fa-chevron-right"></i>
            <span>Thanh toán</span>
          </div>
        </div>

        <div className="checkout-grid">
          {/* Left: Form */}
          <div className="checkout-main">
            <form onSubmit={handleSubmit} className="checkout-form-card">
              <h2 className="checkout-section-title">Thông tin giao hàng</h2>
              
              <div className="form-group">
                <label>Họ và tên *</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  placeholder="Nhập họ và tên người nhận" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Nhập số điện thoại liên hệ" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ nhận hàng *</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="Nhập địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện...)" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Ghi chú đơn hàng (Tùy chọn)</label>
                <textarea 
                  name="note" 
                  value={formData.note} 
                  onChange={handleChange} 
                  placeholder="Ghi chú thêm về thời gian giao hàng, yêu cầu đóng gói..."
                  rows={3}
                ></textarea>
              </div>

              <h2 className="checkout-section-title" style={{ marginTop: '2rem' }}>Phương thức thanh toán</h2>
              
              <div className="payment-methods">
                <label className={`payment-method ${formData.paymentMethod === 'COD' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="COD" 
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handleChange} 
                  />
                  <div className="payment-method-info">
                    <i className="fa fa-money-bill-wave"></i>
                    <div>
                      <span className="payment-method-name">Thanh toán khi nhận hàng (COD)</span>
                      <span className="payment-method-desc">Thanh toán bằng tiền mặt khi giao hàng</span>
                    </div>
                  </div>
                </label>

                <label className={`payment-method ${formData.paymentMethod === 'VNPAY' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="VNPAY" 
                    checked={formData.paymentMethod === 'VNPAY'}
                    onChange={handleChange} 
                  />
                  <div className="payment-method-info">
                    <i className="fa fa-credit-card"></i>
                    <div>
                      <span className="payment-method-name">Thanh toán qua VNPAY</span>
                      <span className="payment-method-desc">Thanh toán an toàn qua ví điện tử VNPAY</span>
                    </div>
                  </div>
                </label>
              </div>

              <button type="submit" className="btn btn--primary btn-place-order" disabled={submitting}>
                {submitting ? 'Đang xử lý...' : 'ĐẶT HÀNG NGAY'}
              </button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-sidebar">
            <div className="checkout-summary-card">
              <h2 className="checkout-section-title">Đơn hàng của bạn</h2>
              
              <div className="summary-items">
                {cart.items.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-img-wrap">
                      <img 
                        src={item.productImage.startsWith('http') ? item.productImage : `http://localhost:8080${item.productImage}`} 
                        alt={item.productName} 
                      />
                      <span className="summary-item-qty">{item.quantity}</span>
                    </div>
                    <div className="summary-item-info">
                      <span className="summary-item-name">{item.productName}</span>
                    </div>
                    <div className="summary-item-price">
                      {fmtVND(item.totalLinePrice)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>{fmtVND(cart.cartTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng cộng</span>
                  <span className="total-price">{fmtVND(cart.cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
