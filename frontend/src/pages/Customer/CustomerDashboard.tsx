import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { statsService } from '../../services/statsService';
import type { TopPartner } from '../../services/statsService';
import { TopPartnersWidget } from '../../components/TopPartners/TopPartnersWidget';
interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: number;
    product: { name: string };
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

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

/* ── Order status badge ── */
const orderStatusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING:    { label: 'Chờ Xác Nhận',     cls: 'pending'    },
    PROCESSING: { label: 'Đang Xử Lý',       cls: 'processing' },
    SHIPPING:   { label: 'Đang Vận Chuyển',  cls: 'shipping'   },
    DELIVERED:  { label: 'Đã Giao',          cls: 'delivered'  },
    CANCELLED:  { label: 'Đã Hủy',           cls: 'cancelled'  },
  };
  const info = map[status] ?? { label: status, cls: 'pending' };
  return <span className={`status-badge ${info.cls}`}>{info.label}</span>;
};

/* ── Custom-order status badge ── */
const customStatusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    OPEN:        { label: 'Chờ Báo Giá',     cls: 'open'      },
    QUOTED:      { label: 'Đã Có Báo Giá',   cls: 'quoted'    },
    IN_PROGRESS: { label: 'Đang Thực Hiện',  cls: 'progress'  },
    COMPLETED:   { label: 'Hoàn Thành',      cls: 'completed' },
    CANCELLED:   { label: 'Đã Hủy',          cls: 'cancelled' },
  };
  const info = map[status] ?? { label: status, cls: 'open' };
  return <span className={`status-badge ${info.cls}`}>{info.label}</span>;
};

/* ════════════════════════════════════════════════════════ */

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  const [orders, setOrders]               = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomOrderRequest[]>([]);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);
  const [isLoading, setIsLoading]         = useState(true);
  const [myStats, setMyStats]             = useState<TopPartner | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const headers = { 'X-Customer-Id': String(user.id) };

        const [ordersRes, customRes, favRes] = await Promise.all([
          axios.get('http://localhost:8080/api/orders', { headers }),
          axios.get('http://localhost:8080/api/custom-orders', { headers }),
          axios.get('http://localhost:8080/api/favorites', { headers }),
        ]);

        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setCustomRequests(Array.isArray(customRes.data) ? customRes.data : []);
        setFavoriteCount(Array.isArray(favRes.data) ? favRes.data.length : 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    statsService.getCustomerStats(Number(user.id))
        .then(setMyStats)
        .catch(err => console.error('Error fetching customer stats:', err));
  }, [user]);

  const activeOrdersCount =
      orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;
  const activeRequestsCount =
      customRequests.filter(r => !['CANCELLED', 'COMPLETED'].includes(r.status)).length;

  if (isLoading) {
    return (
        <div className="customer-loading">
          <i className="fa-solid fa-circle-notch fa-spin" />
          Đang tải dữ liệu...
        </div>
    );
  }

  return (
      <div className="customer-dashboard">

        {/* ── Stat cards ── */}
        <div className="customer-stat-grid">

          <div className="customer-stat-card stat-green">
            <div className="stat-icon-wrap bg-green">
              <i className="fa-solid fa-box-open" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{activeOrdersCount}</div>
              <div className="stat-label">Đơn Hàng Đang Xử Lý</div>
            </div>
          </div>

          <div className="customer-stat-card stat-gold">
            <div className="stat-icon-wrap bg-gold">
              <i className="fa-solid fa-pen-ruler" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{activeRequestsCount}</div>
              <div className="stat-label">Yêu Cầu Đang Xử Lý</div>
            </div>
          </div>

          <div className="customer-stat-card stat-red">
            <div className="stat-icon-wrap bg-red">
              <i className="fa-solid fa-heart" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{favoriteCount}</div>
              <div className="stat-label">Sản Phẩm Yêu Thích</div>
            </div>
          </div>

          <div className="customer-stat-card stat-blue">
            <div className="stat-icon-wrap bg-blue">
              <i className="fa-solid fa-sack-dollar" />
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ fontSize: '1.15rem' }}>
                {formatCurrency(myStats?.totalAmount ?? 0)}
              </div>
              <div className="stat-label">
                Đã Chi Tiêu ({myStats?.transactionCount ?? 0} đơn hoàn thành)
              </div>
            </div>
          </div>

        </div>

        {/* ── Recent orders ── */}
        <div className="customer-card">
          <h3 className="customer-card-title">
            Đơn Hàng Gần Đây
            <a href="/customer/orders">Xem tất cả →</a>
          </h3>

          {orders.length === 0 ? (
              <div className="customer-empty">
                <i className="fa-regular fa-folder-open" />
                Bạn chưa có đơn hàng nào.
              </div>
          ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="customer-table">
                  <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Sản Phẩm</th>
                    <th>Ngày Đặt</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                  </tr>
                  </thead>
                  <tbody>
                  {orders.slice(0, 5).map(order => {
                    const firstName =
                        order.items?.[0]?.product?.name ?? 'Sản phẩm';
                    const extra =
                        order.items?.length > 1
                            ? ` (+${order.items.length - 1})`
                            : '';
                    return (
                        <tr key={order.id}>
                          <td className="order-id-cell">#ORD-{order.id}</td>
                          <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {firstName}{extra}
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td style={{ fontWeight: 600, color: '#1e1a14' }}>
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td>{orderStatusBadge(order.status)}</td>
                        </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
          )}
        </div>

        {/* ── Custom requests ── */}
        <div className="customer-card">
          <h3 className="customer-card-title">
            Yêu Cầu Đặt Theo Yêu Cầu
            <a href="/custom-orders">Xem tất cả →</a>
          </h3>

          {customRequests.length === 0 ? (
              <div className="customer-empty">
                <i className="fa-regular fa-pen-to-square" />
                Bạn chưa có yêu cầu đặt hàng nào.
              </div>
          ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="customer-table">
                  <thead>
                  <tr>
                    <th>Mã YC</th>
                    <th>Loại Nội Thất</th>
                    <th>Ngày Tạo</th>
                    <th>Trạng Thái</th>
                  </tr>
                  </thead>
                  <tbody>
                  {customRequests.slice(0, 5).map(req => (
                      <tr key={req.id}>
                        <td className="order-id-cell">#REQ-{req.id}</td>
                        <td>{req.furnitureType || 'Chưa phân loại'}</td>
                        <td>{formatDate(req.createdAt)}</td>
                        <td>{customStatusBadge(req.status)}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>

        {/* ── Top Nhà Thầu ── */}
        <TopPartnersWidget
            type="contractor"
            limit={10}
            cardClassName="customer-card"
            titleClassName="customer-card-title"
            title="Top Nhà Thầu"
        />

      </div>
  );
};

export default CustomerDashboard;