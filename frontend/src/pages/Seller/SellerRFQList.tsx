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

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: 220 }}>
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
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {filtered.length} yêu cầu
          </span>
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
          <div className="co-rfq-grid">
            {filtered.map(order => {
              const urgent = isUrgent(order.deadline);
              return (
                <div
                  key={order.id}
                  className="co-rfq-card"
                  id={`rfq-card-${order.id}`}
                  onClick={() => navigate(`/seller/rfq/${order.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="co-rfq-card__top">
                    <div className="co-rfq-card__type">{order.furnitureType}</div>
                    <div className="co-rfq-card__title">{order.title}</div>
                  </div>
                  <div className="co-rfq-card__body">
                    <p className="co-rfq-card__desc">{order.description}</p>
                    <div className="co-rfq-card__tags">
                      {order.material && <span className="co-rfq-tag"><i className="fa fa-layer-group" style={{ marginRight: 3 }}></i>{order.material}</span>}
                      {order.dimensions && <span className="co-rfq-tag"><i className="fa fa-ruler" style={{ marginRight: 3 }}></i>{order.dimensions}</span>}
                      {order.colorStyle && <span className="co-rfq-tag"><i className="fa fa-palette" style={{ marginRight: 3 }}></i>{order.colorStyle}</span>}
                    </div>
                    <div className="co-rfq-card__budget">
                      <i className="fa fa-sack-dollar"></i>
                      {fmtVND(order.budgetMin)} – {fmtVND(order.budgetMax)}
                    </div>
                  </div>
                  <div className="co-rfq-card__footer">
                    <span className={`co-rfq-card__deadline ${urgent ? 'urgent' : ''}`}>
                      <i className={`fa ${urgent ? 'fa-triangle-exclamation' : 'fa-calendar-days'}`}></i>
                      Hạn: {fmtDate(order.deadline)}{urgent ? ' (Gấp!)' : ''}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      <i className="fa fa-tag"></i> {order.quotes.length} báo giá
                      <i className="fa fa-arrow-right" style={{ fontSize: '0.7rem', marginLeft: 2 }}></i>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerRFQList;
