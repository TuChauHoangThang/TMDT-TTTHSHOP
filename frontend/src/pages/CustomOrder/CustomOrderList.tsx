import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../css/CustomOrder.css';
import { customOrderService } from '../../services/customOrderService';
import type { CustomOrderRequest, CustomOrderStatus } from '../../types/customOrder';



const STATUS_LABELS: Record<CustomOrderStatus, string> = {
  OPEN: 'Đang chờ báo giá',
  QUOTED: 'Đã nhận báo giá',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_ICONS: Record<CustomOrderStatus, string> = {
  OPEN: 'fa-clock',
  QUOTED: 'fa-envelope-open-text',
  IN_PROGRESS: 'fa-hammer',
  COMPLETED: 'fa-circle-check',
  CANCELLED: 'fa-circle-xmark',
};

const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const fmtDate = (s: string) => new Date(s).toLocaleDateString('vi-VN');

const CustomOrderList: React.FC = () => {
  const [orders, setOrders] = useState<CustomOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CustomOrderStatus | 'ALL'>('ALL');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await customOrderService.getMyRequests();
        setOrders(data as any);
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="co-page">
      <div className="co-container">
        {/* Header */}
        <div className="co-page-header">
          <div className="co-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
            <span>Đặt hàng theo yêu cầu</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 className="co-page-title">📋 Yêu Cầu Của Tôi</h1>
              <p className="co-page-subtitle">Theo dõi trạng thái và báo giá từ các nhà thầu</p>
            </div>
            <Link to="/custom-orders/create" className="btn btn--primary" id="co-create-btn">
              <i className="fa fa-plus"></i> Tạo Yêu Cầu Mới
            </Link>
          </div>
        </div>

        {/* Filter & Layout Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['ALL', 'OPEN', 'QUOTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="btn btn--sm"
                style={{
                  background: filter === s ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: filter === s ? '#fff' : 'var(--color-text-muted)',
                  border: `1.5px solid ${filter === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {s === 'ALL' ? 'Tất cả' : STATUS_LABELS[s]}
                {s !== 'ALL' && (
                  <span style={{ marginLeft: 4, background: 'rgba(255,255,255,0.2)', borderRadius: '99px', padding: '0 5px', fontSize: '0.7rem' }}>
                    {orders.filter(o => o.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="co-layout-toggle" style={{ display: 'flex', background: '#f5f5f5', borderRadius: 8, padding: 2 }}>
            <button 
                onClick={() => setLayout('list')}
                style={{ border: 'none', background: layout === 'list' ? '#fff' : 'transparent', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', boxShadow: layout === 'list' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
              <i className="fa fa-list"></i>
            </button>
            <button 
                onClick={() => setLayout('grid')}
                style={{ border: 'none', background: layout === 'grid' ? '#fff' : 'transparent', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', boxShadow: layout === 'grid' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
              <i className="fa fa-th-large"></i>
            </button>
          </div>
        </div>

        {/* List/Grid */}
        {loading ? (
          <div className="co-loading"><div className="co-spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="co-empty">
            <i className="fa fa-inbox"></i>
            <h3>Chưa có yêu cầu nào</h3>
            <p style={{ marginBottom: '1.5rem' }}>Hãy tạo yêu cầu đầu tiên để nhận báo giá từ các nhà thầu</p>
            <Link to="/custom-orders/create" className="btn btn--primary">
              <i className="fa fa-plus"></i> Tạo Yêu Cầu Ngay
            </Link>
          </div>
        ) : (
          <div className={`co-orders-${layout}`} style={{ 
            display: layout === 'grid' ? 'grid' : 'flex', 
            flexDirection: 'column',
            gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : 'none',
            gap: '1.25rem' 
          }}>
            {filtered.map(order => (
              <Link key={order.id} to={`/custom-orders/${order.id}`} className={layout === 'list' ? "co-list-item" : "co-rfq-card"} style={{ textDecoration: 'none', color: 'inherit' }}>
                {layout === 'list' ? (
                  <>
                    <div className="co-list-item__icon">
                      <i className={`fa ${STATUS_ICONS[order.status]}`}></i>
                    </div>
                    <div className="co-list-item__content">
                      <div className="co-list-item__title">{order.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                        <span className={`co-status co-status--${order.status.toLowerCase()}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        <span className="co-rfq-tag">{order.furnitureType}</span>
                      </div>
                      <div className="co-list-item__meta">
                        <span><i className="fa fa-wallet"></i> {fmtVND(order.budgetMin)} – {fmtVND(order.budgetMax)}</span>
                        <span><i className="fa fa-calendar-days"></i> Hạn: {fmtDate(order.deadline)}</span>
                        <span><i className="fa fa-clock"></i> Tạo: {fmtDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="co-list-item__right">
                      <span className="co-quote-count">
                        <i className="fa fa-tag"></i> {order.quoteCount ?? order.quotes?.length ?? 0} báo giá
                      </span>
                      <i className="fa fa-chevron-right" style={{ color: 'var(--color-border)', fontSize: '0.8rem' }}></i>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="co-rfq-card__top">
                      <div className="co-rfq-card__type">{order.furnitureType}</div>
                      <div className="co-rfq-card__title" style={{ fontSize: '1.1rem' }}>{order.title}</div>
                    </div>
                    <div className="co-rfq-card__body">
                      <p className="co-rfq-card__desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{(order as any).description}</p>
                      <div className="co-rfq-card__budget">
                        <i className="fa fa-sack-dollar"></i> {fmtVND(order.budgetMin)} – {fmtVND(order.budgetMax)}
                      </div>
                    </div>
                    <div className="co-rfq-card__footer">
                       <span className={`co-status co-status--${order.status.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                        <i className="fa fa-tag"></i> {order.quoteCount ?? 0} báo giá
                      </span>
                    </div>
                  </>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomOrderList;
