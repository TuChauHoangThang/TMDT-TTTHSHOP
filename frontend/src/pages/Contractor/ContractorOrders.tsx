import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';

interface OrderItem {
  id: number;
  product: { id: number; name: string; slug: string };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customerId: string;
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: string;
  totalAmount: number; // calculated as seller's share in backend
  itemCount: number;
  createdAt: string;
  note: string;
  items: OrderItem[];
}

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const statusClass: Record<string, string> = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'accepted', // matches 'accepted' style in ContractorLayout.css
  CANCELLED: 'cancelled',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ContractorOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchOrders();
  }, [user]);

  const fetchOrders = () => {
    setLoading(true);
    orderService.getSellerOrders(user!.id)
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error('Không thể tải danh sách đơn hàng'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let result = orders;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.fullName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        String(o.id).includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [searchQuery, statusFilter, orders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateSellerOrderStatus(orderId, user!.id, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : prev);
      }
      toast.success('Cập nhật trạng thái đơn hàng thành công');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="contractor-loading">
        <i className="fa-solid fa-spinner fa-spin" />
        Đang tải danh sách đơn hàng...
      </div>
    );
  }

  return (
    <div className="contractor-orders-page">
      <style>{`
        .contractor-orders-page {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .co-filter-btn-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .co-filter-btn {
          border: none;
          background: #f4f3f0;
          color: #5c5346;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.88rem;
        }
        .co-filter-btn:hover {
          background: #e9e7e2;
        }
        .co-filter-btn.active {
          background: #3d5c49;
          color: #ffffff;
          box-shadow: 0 4px 6px rgba(61, 92, 73, 0.2);
        }
        .co-search-bar-wrap {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          align-items: center;
          flex-wrap: wrap;
        }
        .co-search-input-wrap {
          position: relative;
          flex: 1;
          min-width: 250px;
        }
        .co-search-input-wrap i {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #a89f92;
        }
        .co-search-input {
          width: 100%;
          padding: 10px 15px 10px 40px;
          border: 1px solid #e1ded7;
          border-radius: 8px;
          font-size: 0.9rem;
          background: #fcfcfb;
          outline: none;
          transition: border 0.2s ease;
        }
        .co-search-input:focus {
          border-color: #3d5c49;
          background: #fff;
        }
        .co-status-select {
          padding: 6px 12px;
          border: 1px solid #e1ded7;
          border-radius: 6px;
          font-size: 0.82rem;
          background: #fff;
          color: #2b2823;
          outline: none;
          cursor: pointer;
          font-weight: 500;
        }
        .co-status-select:focus {
          border-color: #3d5c49;
        }
        /* Modal layout */
        .co-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: modalFadeIn 0.3s ease-out;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .co-modal {
          background: #fff;
          width: 90%;
          max-width: 600px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modalSlideUp {
          from { transform: translateY(40px); }
          to { transform: translateY(0); }
        }
        .co-modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f1eeeb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fbfbf9;
        }
        .co-modal-title {
          font-weight: 700;
          color: #2b2823;
          margin: 0;
          font-size: 1.15rem;
        }
        .co-modal-close {
          border: none;
          background: transparent;
          color: #a89f92;
          font-size: 1.25rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .co-modal-close:hover {
          color: #e05c5c;
        }
        .co-modal-body {
          padding: 20px;
          max-height: 70vh;
          overflow-y: auto;
        }
        .co-modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #f1eeeb;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          background: #fbfbf9;
        }
        .co-detail-row {
          display: flex;
          margin-bottom: 12px;
          font-size: 0.92rem;
          line-height: 1.4;
        }
        .co-detail-label {
          width: 140px;
          color: #7b7160;
          font-weight: 500;
          flex-shrink: 0;
        }
        .co-detail-value {
          color: #2b2823;
          font-weight: 600;
        }
        .co-detail-products-title {
          font-weight: 700;
          font-size: 0.95rem;
          margin: 20px 0 10px 0;
          color: #3d5c49;
          border-bottom: 1px dashed #e1ded7;
          padding-bottom: 6px;
        }
        .co-detail-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f9f8f6;
          font-size: 0.88rem;
        }
        .co-detail-item-name {
          color: #2b2823;
          font-weight: 500;
        }
        .co-detail-item-meta {
          color: #7b7160;
        }
      `}</style>

      {/* Page Title */}
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#2b2823' }}>Quản Lý Đơn Hàng</h1>
        <p style={{ margin: '5px 0 0 0', color: '#7b7160', fontSize: '0.9rem' }}>Xem và quản lý các đơn hàng chứa sản phẩm bán sẵn thuộc xưởng của bạn</p>
      </div>

      {/* Filter bar */}
      <div className="co-filter-btn-group">
        <button
          className={`co-filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          Tất cả ({orders.length})
        </button>
        {ORDER_STATUSES.map(s => (
          <button
            key={s}
            className={`co-filter-btn ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {statusLabel[s]} ({orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {/* Search and filters */}
      <div className="contractor-card">
        <div className="co-search-bar-wrap">
          <div className="co-search-input-wrap">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              className="co-search-input"
              placeholder="Tìm theo tên khách hàng, số điện thoại, mã đơn..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="contractor-empty">
            <i className="fa-regular fa-folder-open" />
            Không có đơn hàng nào khớp với bộ lọc hiện tại.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="contractor-table">
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Khách Hàng</th>
                  <th>SĐT</th>
                  <th style={{ textAlign: 'right' }}>Doanh Thu Xưởng</th>
                  <th>Ngày Đặt</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="id-cell">#ORD-{order.id}</td>
                    <td><span style={{ fontWeight: 600 }}>{order.fullName}</span></td>
                    <td>{order.phone}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#3d5c49' }}>
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${statusClass[order.status] || 'pending'}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn btn--secondary"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <i className="fa-solid fa-eye" style={{ marginRight: '4px' }} />
                          Chi Tiết
                        </button>
                        <select
                          className="co-status-select"
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{statusLabel[s]}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="co-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="co-modal" onClick={e => e.stopPropagation()}>
            <div className="co-modal-header">
              <h3 className="co-modal-title">Chi Tiết Đơn Hàng #ORD-{selectedOrder.id}</h3>
              <button className="co-modal-close" onClick={() => setSelectedOrder(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="co-modal-body">
              <div className="co-detail-row">
                <div className="co-detail-label">Khách hàng:</div>
                <div className="co-detail-value">{selectedOrder.fullName}</div>
              </div>
              <div className="co-detail-row">
                <div className="co-detail-label">Số điện thoại:</div>
                <div className="co-detail-value">{selectedOrder.phone}</div>
              </div>
              <div className="co-detail-row">
                <div className="co-detail-label">Địa chỉ nhận hàng:</div>
                <div className="co-detail-value">{selectedOrder.address}</div>
              </div>
              <div className="co-detail-row">
                <div className="co-detail-label">Thanh toán:</div>
                <div className="co-detail-value">
                  {selectedOrder.paymentMethod === 'COD' ? 'Tiền mặt khi nhận hàng (COD)' : selectedOrder.paymentMethod}
                </div>
              </div>
              <div className="co-detail-row">
                <div className="co-detail-label">Ngày đặt hàng:</div>
                <div className="co-detail-value">{formatDate(selectedOrder.createdAt)}</div>
              </div>
              <div className="co-detail-row">
                <div className="co-detail-label">Ghi chú:</div>
                <div className="co-detail-value" style={{ fontWeight: 'normal', color: '#5c5346' }}>
                  {selectedOrder.note || 'Không có ghi chú'}
                </div>
              </div>
              <div className="co-detail-row">
                <div className="co-detail-label">Trạng thái:</div>
                <div className="co-detail-value">
                  <span className={`status-badge ${statusClass[selectedOrder.status] || 'pending'}`}>
                    {statusLabel[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Products List */}
              <div className="co-detail-products-title">Sản phẩm thuộc xưởng của bạn</div>
              {selectedOrder.items?.map(item => (
                <div key={item.id} className="co-detail-item">
                  <div className="co-detail-item-name">{item.product?.name || `Sản phẩm #${item.product?.id}`}</div>
                  <div className="co-detail-item-meta">
                    {item.quantity} x {formatCurrency(item.price)} ={' '}
                    <span style={{ fontWeight: 700, color: '#3d5c49' }}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '2px solid #3d5c49',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                }}
              >
                <span style={{ color: '#2b2823' }}>TỔNG DOANH THU ĐƠN HÀNG:</span>
                <span style={{ color: '#3d5c49' }}>{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>
            <div className="co-modal-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <span style={{ fontSize: '0.82rem', color: '#7b7160', fontWeight: 500 }}>Cập nhật trạng thái:</span>
                <select
                  className="co-status-select"
                  value={selectedOrder.status}
                  disabled={updatingId === selectedOrder.id}
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                >
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>{statusLabel[s]}</option>
                  ))}
                </select>
              </div>
              <button className="co-filter-btn" onClick={() => setSelectedOrder(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorOrders;
