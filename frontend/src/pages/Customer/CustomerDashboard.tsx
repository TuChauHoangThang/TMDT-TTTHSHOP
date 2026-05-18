import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: number;
    product: {
      name: string;
    };
    quantity: number;
    price: number;
  }>;
}

interface CustomOrderRequest {
  id: number;
  status: string;
  furnitureType: string;
  createdAt: string;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomOrderRequest[]>([]);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const headers = { 'X-Customer-Id': String(user.id) };

        // Lấy danh sách đơn hàng mua sẵn
        const ordersRes = await axios.get('http://localhost:8080/api/orders', { headers });
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);

        // Lấy danh sách yêu cầu custom
        const customRes = await axios.get('http://localhost:8080/api/custom-orders', { headers });
        setCustomRequests(Array.isArray(customRes.data) ? customRes.data : []);

        // Lấy danh sách yêu thích
        const favRes = await axios.get('http://localhost:8080/api/favorites', { headers });
        setFavoriteCount(Array.isArray(favRes.data) ? favRes.data.length : 0);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Tính toán số liệu thống kê
  const activeOrdersCount = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;
  const activeRequestsCount = customRequests.filter(r => r.status !== 'CANCELLED' && r.status !== 'COMPLETED').length;

  const getOrderStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span style={{ background: '#fff0e6', color: '#fa8c16', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Chờ Xác Nhận</span>;
      case 'PROCESSING': return <span style={{ background: '#e6f7ff', color: '#1890ff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Đang Xử Lý</span>;
      case 'SHIPPING': return <span style={{ background: '#f9f0ff', color: '#722ed1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Đang Vận Chuyển</span>;
      case 'DELIVERED': return <span style={{ background: '#e6f4ea', color: '#1e8e3e', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Đã Giao</span>;
      case 'CANCELLED': return <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Đã Hủy</span>;
      default: return <span style={{ background: '#f0f0f0', color: '#666', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="customer-dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div className="customer-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 0, background: 'linear-gradient(135deg, #7a9e87, #5a7c65)', color: '#fff' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
            <i className="fa-solid fa-box-open"></i>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 }}>{activeOrdersCount}</div>
            <div style={{ fontWeight: 500, opacity: 0.9 }}>Đơn Hàng Đang Xử Lý</div>
          </div>
        </div>

        <div className="customer-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 0 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
            <i className="fa-solid fa-pen-ruler"></i>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#333', lineHeight: 1.2 }}>{activeRequestsCount}</div>
            <div style={{ color: '#666', fontWeight: 500 }}>Yêu Cầu Đang Xử Lý</div>
          </div>
        </div>

        <div className="customer-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 0 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
            <i className="fa-solid fa-heart"></i>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#333', lineHeight: 1.2 }}>{favoriteCount}</div>
            <div style={{ color: '#666', fontWeight: 500 }}>Sản Phẩm Yêu Thích</div>
          </div>
        </div>

      </div>

      <div className="customer-card">
        <h3 className="customer-card-title">Đơn Hàng Gần Đây</h3>
        {orders.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Bạn chưa có đơn hàng nào.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0', color: '#999', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 0' }}>Mã Đơn</th>
                  <th style={{ padding: '12px 0' }}>Sản Phẩm</th>
                  <th style={{ padding: '12px 0' }}>Ngày Đặt</th>
                  <th style={{ padding: '12px 0' }}>Tổng Tiền</th>
                  <th style={{ padding: '12px 0' }}>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => {
                  const firstItemName = order.items && order.items.length > 0
                    ? order.items[0].product?.name || 'Sản phẩm'
                    : 'Không có sản phẩm';
                  const extraCount = order.items && order.items.length > 1 ? ` (+${order.items.length - 1})` : '';
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '15px 0', fontWeight: 600, color: '#5a7c65' }}>#ORD-{order.id}</td>
                      <td style={{ padding: '15px 0', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {firstItemName}{extraCount}
                      </td>
                      <td style={{ padding: '15px 0', color: '#666', fontSize: '0.85rem' }}>{formatDate(order.createdAt)}</td>
                      <td style={{ padding: '15px 0', fontWeight: 500 }}>{formatCurrency(order.totalAmount)}</td>
                      <td style={{ padding: '15px 0' }}>{getOrderStatusBadge(order.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="customer-card">
        <h3 className="customer-card-title">Yêu Cầu Đặt Hàng Theo Yêu Cầu</h3>
        {customRequests.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Bạn chưa có yêu cầu đặt hàng nào.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0', color: '#999', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 0' }}>Mã YC</th>
                  <th style={{ padding: '12px 0' }}>Loại Nội Thất</th>
                  <th style={{ padding: '12px 0' }}>Ngày Tạo</th>
                  <th style={{ padding: '12px 0' }}>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {customRequests.slice(0, 5).map(req => {
                  const statusMap: Record<string, { label: string; bg: string; color: string }> = {
                    OPEN:        { label: 'Chờ Báo Giá',  bg: '#fef3c7', color: '#d97706' },
                    QUOTED:      { label: 'Đã Có Báo Giá', bg: '#e6f7ff', color: '#1890ff' },
                    IN_PROGRESS: { label: 'Đang Thực Hiện', bg: '#f9f0ff', color: '#722ed1' },
                    COMPLETED:   { label: 'Hoàn Thành',   bg: '#e6f4ea', color: '#1e8e3e' },
                    CANCELLED:   { label: 'Đã Hủy',       bg: '#fee2e2', color: '#ef4444' },
                  };
                  const badge = statusMap[req.status] || { label: req.status, bg: '#f0f0f0', color: '#666' };
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '15px 0', fontWeight: 600, color: '#5a7c65' }}>#REQ-{req.id}</td>
                      <td style={{ padding: '15px 0' }}>{req.furnitureType || 'Chưa phân loại'}</td>
                      <td style={{ padding: '15px 0', color: '#666', fontSize: '0.85rem' }}>{formatDate(req.createdAt)}</td>
                      <td style={{ padding: '15px 0' }}>
                        <span style={{ background: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
