import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../css/CustomOrder.css';
import { customOrderService } from '../../services/customOrderService';
import type { CustomOrderRequest, CustomOrderQuote } from '../../types/customOrder';

// --- UTILS ---
const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const fmtDate = (s: string) => new Date(s).toLocaleDateString('vi-VN');

const StarRating: React.FC<{ rating?: number | null }> = ({ rating }) => {
  const safeRating = rating ?? 5.0;
  return (
      <span className="co-quote-shop__rating" style={{ color: '#ffc107' }}>
      {[1, 2, 3, 4, 5].map(i => (
          <i key={i} className={`fa fa-star${i <= Math.round(safeRating) ? '' : '-o'}`} style={{ marginRight: 2 }}></i>
      ))}
        <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: 4 }}>{safeRating.toFixed(1)}</span>
    </span>
  );
};

const CustomOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<CustomOrderRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await customOrderService.getRequestDetail(Number(id));
        setOrder(data as any);
      } catch (error) {
        console.error('Error fetching order detail', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectQuote = async (quote: CustomOrderQuote) => {
    if (!window.confirm(`Xác nhận chọn báo giá ${fmtVND(quote.quotedPrice)} từ "${quote.shopName}"?`)) return;
    setSelecting(quote.id);
    try {
      const updated = await customOrderService.selectQuote(Number(id), quote.id);
      setOrder(updated as any);
      showToast(`Đã chọn "${quote.shopName}"! Hãy liên hệ nhà thầu ngay.`);
    } catch {
      showToast('Có lỗi xảy ra khi chọn báo giá.', 'error');
    } finally {
      setSelecting(null);
    }
  };

  if (loading) return <div className="co-page"><div className="co-loading"><div className="co-spinner"></div></div></div>;
  if (!order) return <div className="co-page"><div className="co-container"><p>Không tìm thấy yêu cầu.</p></div></div>;

  const canSelectQuote = order.status === 'OPEN' || order.status === 'QUOTED';

  return (
      <div className="co-page">
        <div className="co-container--wide">
          <div className="co-page-header">
            <div className="co-breadcrumb">
              <Link to="/">Trang chủ</Link>
              <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
              <Link to="/custom-orders">Yêu cầu của tôi</Link>
              <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
              <span>Chi tiết #{order.id}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <h1 className="co-page-title" style={{ fontSize: '1.5rem', margin: 0 }}>{order.title}</h1>
              <span className={`co-status co-status--${order.status.toLowerCase()}`}>
              {order.status === 'OPEN' && 'Chờ báo giá'}
                {order.status === 'QUOTED' && 'Đã có báo giá'}
                {order.status === 'IN_PROGRESS' && 'Đang thực hiện'}
                {order.status === 'COMPLETED' && 'Hoàn thành'}
                {order.status === 'CANCELLED' && 'Đã hủy'}
            </span>
            </div>
          </div>

          <div className="co-detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>

            {/* LEFT: Request Details */}
            <div>
              <div className="co-card" style={{ marginBottom: '1.5rem' }}>
                <div className="co-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>
                  <i className="fa fa-circle-info" style={{ color: 'var(--color-primary)', marginRight: 8 }}></i>
                  Thông tin yêu cầu
                </span>
                  {/* SỬ DỤNG fmtDate Ở ĐÂY ĐỂ HIỂN THỊ NGÀY TẠO ĐƠN */}
                  <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>
                   Ngày tạo: {fmtDate(order.createdAt)}
                </span>
                </div>
                <div className="co-card__body">
                  <div className="co-info-block" style={{ marginBottom: '1rem' }}>
                    <div className="co-info-block__label">Mô tả</div>
                    <div className="co-info-block__value" style={{ whiteSpace: 'pre-wrap' }}>{order.description}</div>
                  </div>
                  <div className="co-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="co-info-block">
                      <div className="co-info-block__label">Loại nội thất</div>
                      <div className="co-info-block__value"><span className="co-rfq-tag">{order.furnitureType}</span></div>
                    </div>
                    <div className="co-info-block">
                      <div className="co-info-block__label">Kích thước</div>
                      <div className="co-info-block__value">{order.dimensions || '—'}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div className="co-info-block__label">Ngân sách dự kiến</div>
                      <span className="co-budget-highlight" style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                      {fmtVND(order.budgetMin)} – {fmtVND(order.budgetMax)}
                    </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="co-info-block__label">Hạn nhận hàng</div>
                      <div style={{ fontWeight: 600 }}>{fmtDate(order.deadline)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              {order.imageUrls && order.imageUrls.length > 0 && (
                  <div className="co-card">
                    <div className="co-card__header">
                  <span style={{ fontWeight: 700 }}>
                    <i className="fa fa-images" style={{ color: 'var(--color-primary)', marginRight: 8 }}></i>
                    Ảnh đính kèm
                  </span>
                    </div>
                    <div className="co-card__body">
                      <div className="co-image-gallery" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {order.imageUrls.map((url, idx) => {
                          const fullUrl = url.startsWith('http') ? url : `http://localhost:8080${url}`;
                          return (
                              <a href={fullUrl} target="_blank" rel="noreferrer" key={idx}>
                                <img
                                    src={fullUrl}
                                    alt={`ref-${idx}`}
                                    style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                                />
                              </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
              )}
            </div>

            {/* RIGHT: Quotes List */}
            <div className="co-quotes-panel">
              <div className="co-card">
                <div className="co-card__header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>
                  <i className="fa fa-tags" style={{ color: 'var(--color-primary)', marginRight: 8 }}></i>
                  Báo giá
                </span>
                  <span style={{ fontSize: '0.8rem', background: '#eee', padding: '2px 8px', borderRadius: 10 }}>
                  {order.quotes.length} báo giá
                </span>
                </div>
                <div className="co-card__body" style={{ padding: '1rem' }}>
                  {order.quotes.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#999', padding: '1rem 0' }}>Chưa có báo giá nào.</p>
                  ) : (
                      order.quotes.map(q => (
                          <div key={q.id} className={`co-quote-card ${q.status === 'ACCEPTED' ? 'co-quote-card--accepted' : ''}`}
                               style={{ border: q.status === 'ACCEPTED' ? '2px solid #2e7d32' : '1px solid #eee', padding: '1rem', borderRadius: 12, marginBottom: '1rem', position: 'relative', background: '#fff' }}>

                            {q.status === 'ACCEPTED' && (
                                <div style={{ position: 'absolute', top: -10, right: 10, background: '#2e7d32', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                                  ĐÃ CHỌN
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                              <div style={{ width: 45, height: 45, background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa fa-user-tie" style={{ color: '#999' }}></i>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700 }}>{q.contractorName || q.shopName}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                  <i className="fa fa-phone" style={{ marginRight: 5, fontSize: '0.75rem' }}></i>
                                  {q.contractorPhone ? (
                                      <a href={`tel:${q.contractorPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{q.contractorPhone}</a>
                                  ) : (
                                      "Chưa cập nhật SĐT"
                                  )}
                                </div>
                                <StarRating rating={q.shopRating} />
                              </div>
                            </div>

                            <div style={{ background: '#f9f9f9', padding: '8px 12px', borderRadius: 8, marginBottom: 10 }}>
                              <div style={{ color: '#c62828', fontWeight: 800, fontSize: '1.1rem' }}>{fmtVND(q.quotedPrice)}</div>
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                <i className="fa fa-clock" style={{ marginRight: 4 }}></i>
                                Hoàn thành trong: {q.estimatedDays} ngày
                              </div>
                            </div>

                            {q.note && <div style={{ fontSize: '0.85rem', color: '#555', fontStyle: 'italic', marginBottom: 12, paddingLeft: 8, borderLeft: '2px solid #eee' }}>"{q.note}"</div>}

                            {canSelectQuote && q.status === 'PENDING' && (
                                <button
                                    className="btn btn--primary"
                                    style={{ width: '100%', fontSize: '0.85rem' }}
                                    onClick={() => handleSelectQuote(q)}
                                    disabled={selecting === q.id}
                                >
                                  {selecting === q.id ? 'Đang xử lý...' : 'Chọn báo giá này'}
                                </button>
                            )}
                          </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && (
            <div className={`co-toast co-toast--${toast.type}`} style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
              {toast.msg}
            </div>
        )}
      </div>
  );
};

export default CustomOrderDetail;