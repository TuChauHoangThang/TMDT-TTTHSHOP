import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { cartService } from '../../services/cartService';
import '../../css/Cart.css';

const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const Cart: React.FC = () => {
    const { cart, loading, refreshCart } = useCart();
    const [updating, setUpdating] = useState<number | null>(null);

    const handleUpdateQuantity = async (itemId: number, newQty: number) => {
        if (newQty < 1) return;
        setUpdating(itemId);
        try {
            await cartService.updateCartItem(itemId, newQty);
            await refreshCart();
        } catch (error) {
            console.error('Update qty error', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!window.confirm('Xoá sản phẩm này khỏi giỏ hàng?')) return;
        try {
            await cartService.removeCartItem(itemId);
            await refreshCart();
        } catch (error) {
            console.error('Remove item error', error);
        }
    };

    if (loading && !cart) {
        return (
            <div className="cart-page">
                <div className="co-loading"><div className="co-spinner"></div></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-empty">
                    <i className="fa fa-shopping-cart"></i>
                    <h2>Giỏ hàng của bạn đang trống</h2>
                    <p>Có vẻ như bạn chưa chọn được sản phẩm ưng ý nào.</p>
                    <Link to="/products" className="btn btn--primary">
                        Khám phá sản phẩm ngay
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-main">
                    <div className="cart-header">
                        <h1>Giỏ hàng của bạn</h1>
                        <p>Bạn đang có <strong>{cart.items.length}</strong> sản phẩm trong giỏ</p>
                    </div>

                    <div className="cart-card">
                        <div className="cart-items-list">
                            {cart.items.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img 
                                        src={item.productImage.startsWith('http') ? item.productImage : `http://localhost:8080${item.productImage}`} 
                                        alt={item.productName} 
                                        className="cart-item__image" 
                                    />
                                    <div className="cart-item__info">
                                        <Link to={`/product/${item.productSlug}`} className="cart-item__name">
                                            {item.productName}
                                        </Link>
                                        <div className="cart-item__price">{fmtVND(item.price)}</div>
                                    </div>

                                    <div className="cart-item__actions">
                                        <div className="quantity-control">
                                            <button 
                                                className="quantity-btn"
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                disabled={updating === item.id || item.quantity <= 1}
                                            >
                                                <i className="fa fa-minus"></i>
                                            </button>
                                            <span className="quantity-value">{item.quantity}</span>
                                            <button 
                                                className="quantity-btn"
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                disabled={updating === item.id}
                                            >
                                                <i className="fa fa-plus"></i>
                                            </button>
                                        </div>

                                        <div className="cart-item__total">
                                            {fmtVND(item.totalLinePrice)}
                                        </div>

                                        <button 
                                            className="cart-item__remove"
                                            onClick={() => handleRemoveItem(item.id)}
                                            title="Xoá"
                                        >
                                            <i className="fa fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="cart-summary">
                    <div className="cart-card summary-card">
                        <h2 className="summary-title">Tổng cộng</h2>
                        <div className="summary-row">
                            <span>Tạm tính</span>
                            <span>{fmtVND(cart.cartTotal)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Phí vận chuyển</span>
                            <span>Miễn phí</span>
                        </div>
                        <div className="summary-row--total">
                            <span>Tổng tiền</span>
                            <span>{fmtVND(cart.cartTotal)}</span>
                        </div>

                        <Link to="/checkout" className="btn btn--primary btn-checkout" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            Tiến hành thanh toán
                        </Link>

                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link to="/products" style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'none' }}>
                                <i className="fa fa-arrow-left" style={{ marginRight: 8 }}></i>
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
