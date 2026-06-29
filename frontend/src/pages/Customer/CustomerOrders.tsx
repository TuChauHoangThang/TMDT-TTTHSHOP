import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';

interface OrderItem {
  id: number;
  product: { name: string; imageUrl?: string };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (s: string) =>
  s ? new Date(s).toLocaleDateString('vi-VN') : '';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:    { label: 'Chờ Xác Nhận',    cls: 'pending'    },
  PROCESSING: { label: 'Đang Xử Lý',      cls: 'processing' },
  SHIPPING:   { label: 'Đang Vận Chuyển', cls: 'shipping'   },
  DELIVERED:  { label: 'Đã Giao',         cls: 'delivered'  },
  COMPLETED:  { label: 'Hoàn Thành',      cls: 'delivered'  },
  CANCELLED:  { label: 'Đã Hủy',          cls: 'cancelled'  },
  PAID:       { label: 'Đã Thanh Toán',   cls: 'delivered'  },
  FAILED:     { label: 'Thanh Toán Lỗi',  cls: 'cancelled'  },
};

type FilterKey = 'ALL' | 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

const CustomerOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    orderService.getOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, [user]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'ALL',        label: 'Tất cả'           },
    { key: 'PENDING',    label: 'Chờ xác nhận'     },
    { key: 'PROCESSING', label: 'Đang xử lý'       },
    { key: 'SHIPPING',   label: 'Đang giao'         },
    { key: 'DELIVERED',  label: 'Đã giao'           },
    { key: 'CANCELLED',  label: 'Đã hủy'            },
  ];

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  if (isLoading) {
    return (
      <div className="customer-loading">
        <i className="fa-solid fa-circle-notch fa-spin" />
        Đang tải đơn hàng...
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="co-filter-bar">
        {filters.map(f => (
          <button
            key={f.key}
            className={`co-filter-btn${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key !== 'ALL' && (
              <span className="co-filter-count">
                {orders.filter(o => o.status === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="customer-empty" style={{ marginTop: 40 }}>
          <i className="fa-regular fa-folder-open" />
          Không có đơn hàng nào.
        </div>
      ) : (
        <div className="co-order-list">
          {filtered.map(order => {
            const info = STATUS_MAP[order.status] ?? { label: order.status, cls: 'pending' };
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="co-order-card">
                {/* Card header */}
                <div className="co-order-card-header">
                  <div className="co-order-id">#ORD-{order.id}</div>
                  <div className="co-order-date">{formatDate(order.createdAt)}</div>
                  <span className={`status-badge ${info.cls}`}>{info.label}</span>
                  <div className="co-order-total">{formatCurrency(order.totalAmount)}</div>
                  <button
                    className="co-order-toggle"
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    aria-label="Chi tiết"
                  >
                    <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} />
                  </button>
                </div>

                {/* Preview: first product */}
                <div className="co-order-preview">
                  <span className="co-order-preview-name">
                    {order.items?.[0]?.product?.name ?? 'Sản phẩm'}
                    {(order.items?.length ?? 0) > 1 && ` (+${order.items.length - 1} sản phẩm)`}
                  </span>
                </div>

                {/* Expanded items */}
                {isOpen && (
                  <div className="co-order-items">
                    <table className="customer-table">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th style={{ textAlign: 'center' }}>SL</th>
                          <th style={{ textAlign: 'right' }}>Đơn giá</th>
                          <th style={{ textAlign: 'right' }}>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map(item => (
                          <tr key={item.id}>
                            <td>{item.product?.name}</td>
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: '#1e1a14' }}>
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="co-order-summary">
                      <span>Tổng cộng</span>
                      <span className="co-order-grand-total">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
