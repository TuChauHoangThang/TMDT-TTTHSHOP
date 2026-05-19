import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/CustomOrder.css';
import { customOrderService } from '../../services/customOrderService';
import type { CustomOrderRequest } from '../../types/customOrder';



const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const fmtDate = (s: string) => new Date(s).toLocaleDateString('vi-VN');

const isUrgent = (deadline: string) => {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  return days <= 14;
};

const SellerRFQList: React.FC = () => {
  const [orders, setOrders] = useState<CustomOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid'); // Thêm toggle layout
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpenOrders = async () => {
      try {
        const data = await customOrderService.getOpenRequests({ page: 0, size: 50 });
        setOrders(data.content || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOpenOrders();
  }, []);

  const types = ['ALL', ...Array.from(new Set(orders.map(o => o.furnitureType)))];

  const filtered = orders.filter(o => {
    const matchType = typeFilter === 'ALL' || o.furnitureType === typeFilter;
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="co-page">
      <div className="co-container--wide">
        <div className="co-page-header">
          <div className="co-breadcrumb">
            <Link to="/seller/dashboard">Seller Dashboard</Link>
            <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
            <span>Yêu cầu đặt hàng</span>
          </div>
          <h1 className="co-page-title">🔔 Yêu Cầu Từ Khách Hàng</h1>
          <p className="co-page-subtitle">Xem các yêu cầu đặt hàng theo yêu cầu — gửi báo giá để nhận đơn hàng</p>
        </div>

        {/* Filters & Layout Toggle */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 300 }}>
            <div style={{ position: 'relative', flex: '1', maxWidth: 400 }}>
              <i className="fa fa-magnifying-glass" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}></i>
              <input
                className="co-input"
                placeholder="Tìm kiếm yêu cầu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              />
            </div>
            <select className="co-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ minWidth: 160 }}>
              {types.map(t => <option key={t} value={t}>{t === 'ALL' ? 'Tất cả loại' : t}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              {filtered.length} yêu cầu
            </span>
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
        </div>

        {loading ? (
          <div className="co-loading"><div className="co-spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="co-empty">
            <i className="fa fa-inbox"></i>
            <h3>Không có yêu cầu nào</h3>
            <p>Thử thay đổi bộ lọc hoặc quay lại sau</p>
          </div>
        ) : (
          <div className={layout === 'grid' ? "co-rfq-grid" : "co-list"} style={{ display: layout === 'grid' ? 'grid' : 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filtered.map(order => {
              const urgent = isUrgent(order.deadline);
              if (layout === 'grid') {
                return (
                  <div
                    key={order.id}
                    className="co-rfq-card"
                    id={`rfq-card-${order.id}`}
                    onClick={() => navigate(`/contractor/rfq/${order.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="co-rfq-card__top">
                      <div className="co-rfq-card__type">{order.furnitureType}</div>
                      <div className="co-rfq-card__title">{order.title}</div>
                    </div>
                    <div className="co-rfq-card__body">
                      <p className="co-rfq-card__desc">{order.description}</p>
                      <div className="co-rfq-card__tags">
                        {order.material && <span className="co-rfq-tag"><i className="fa fa-layer-group"></i> {order.material}</span>}
                        {order.dimensions && <span className="co-rfq-tag"><i className="fa fa-ruler"></i> {order.dimensions}</span>}
                      </div>
                      <div className="co-rfq-card__budget">
                        <i className="fa fa-sack-dollar"></i>
                        {fmtVND(order.budgetMin)} – {fmtVND(order.budgetMax)}
                      </div>
                    </div>
                    <div className="co-rfq-card__footer">
                      <span className={`co-rfq-card__deadline ${urgent ? 'urgent' : ''}`}>
                        <i className={`fa ${urgent ? 'fa-triangle-exclamation' : 'fa-calendar-days'}`}></i>
                        Hạn: {fmtDate(order.deadline)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        <i className="fa fa-tag"></i> {order.quotes.length} báo giá
                      </span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={order.id} className="co-list-item" onClick={() => navigate(`/contractor/rfq/${order.id}`)} style={{ cursor: 'pointer' }}>
                    <div className="co-list-item__icon" style={{ background: urgent ? '#fff1f0' : '#f6ffed' }}>
                      <i className={`fa ${urgent ? 'fa-hourglass-half' : 'fa-clipboard-list'}`} style={{ color: urgent ? '#cf1322' : '#389e0d' }}></i>
                    </div>
                    <div className="co-list-item__content">
                      <div className="co-list-item__title">{order.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                        <span className="co-rfq-tag">{order.furnitureType}</span>
                        {urgent && <span style={{ color: '#cf1322', fontSize: '0.75rem', fontWeight: 600, background: '#fff1f0', padding: '2px 8px', borderRadius: 4 }}><i className="fa fa-bolt"></i> Cần gấp</span>}
                      </div>
                      <div className="co-list-item__meta">
                        <span><i className="fa fa-wallet"></i> {fmtVND(order.budgetMin)} – {fmtVND(order.budgetMax)}</span>
                        <span><i className="fa fa-calendar-days"></i> Hạn: {fmtDate(order.deadline)}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}><i className="fa fa-clock"></i> Tạo: {fmtDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="co-list-item__right">
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>{order.quotes.length} báo giá</div>
                        <div style={{ fontSize: '0.75rem', color: '#999' }}>Nhấp để xem chi tiết</div>
                      </div>
                      <i className="fa fa-chevron-right" style={{ color: 'var(--color-border)', fontSize: '0.8rem' }}></i>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerRFQList;
