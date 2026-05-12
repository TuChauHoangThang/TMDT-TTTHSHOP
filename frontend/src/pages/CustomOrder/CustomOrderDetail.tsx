import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../css/CustomOrder.css';
import { customOrderService } from '../../services/customOrderService';
import type { CustomOrderRequest, CustomOrderQuote } from '../../types/customOrder';



const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const fmtDate = (s: string) => new Date(s).toLocaleDateString('vi-VN');

const StarRating: React.FC<{ rating?: number | null }> = ({ rating }) => {
  const safeRating = rating ?? 5.0;
  return (
    <span className="co-quote-shop__rating">
      {[1,2,3,4,5].map(i => (
        <i key={i} className={`fa fa-star${i <= Math.round(safeRating) ? '' : '-o'}`} style={{ marginRight: 1 }}></i>
      ))} {safeRating.toFixed(1)}
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
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };

  const handleSelectQuote = async (quote: CustomOrderQuote) => {
    if (!window.confirm(`Xác nhận chọn báo giá ${fmtVND(quote.quotedPrice)} từ "${quote.shopName}"?`)) return;
    setSelecting(quote.id);
    try {
      const updated = await customOrderService.selectQuote(Number(id), quote.id);
      setOrder(updated as any);
      showToast(`Đã chọn "${quote.shopName}"! Nhà thầu sẽ liên hệ bạn sớm.`);
    } catch {
      showToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
    } finally { setSelecting(null); }
  };

  if (loading) return <div className="co-page"><div className="co-loading"><div className="co-spinner"></div></div></div>;
  if (!order) return <div className="co-page"><div className="co-container"><p>Không tìm thấy yêu cầu.</p></div></div>;

  const canSelectQuote = order.status === 'OPEN' || order.status === 'QUOTED';

  return (
    <div className="co-page">
      <div className="co-container--wide">
        {/* Breadcrumb */}
        <div className="co-page-header">
          <div className="co-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
            <Link to="/custom-orders">Yêu cầu của tôi</Link>
            <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
            <span>Chi tiết #{order.id}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 className="co-page-title" style={{ fontSize: '1.5rem' }}>{order.title}</h1>
            <span className={`co-status co-status--${order.status.toLowerCase()}`}>
              {order.status === 'OPEN' && 'Chờ báo giá'}
              {order.status === 'QUOTED' && 'Đã nhận báo giá'}
              {order.status === 'IN_PROGRESS' && 'Đang thực hiện'}
              {order.status === 'COMPLETED' && 'Hoàn thành'}
              {order.status === 'CANCELLED' && 'Đã hủy'}
            </span>
          </div>
        </div>

        <div className="co-detail-layout">
          {/* LEFT: Order Info */}
          <div>
            <div className="co-card" style={{ marginBottom: '1.25rem' }}>
              <div className="co-card__header">
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa fa-circle-info" style={{ color: 'var(--color-primary)' }}></i> Thông tin yêu cầu
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Tạo: {fmtDate(order.createdAt)}</span>
              </div>
              <div className="co-card__body">
                <div className="co-info-block">
                  <div className="co-info-block__label">Mô tả</div>
                  <div className="co-info-block__value">{order.description}</div>
                </div>
                <div className="co-info-grid">
                  <div className="co-info-block">
                    <div className="co-info-block__label">Loại nội thất</div>
                    <div className="co-info-block__value"><span className="co-rfq-tag">{order.furnitureType}</span></div>
                  </div>
                  <div className="co-info-block">
                    <div className="co-info-block__label">Kích thước</div>
                    <div className="co-info-block__value">{order.dimensions || '—'}</div>
                  </div>
                  <div className="co-info-block">
                    <div className="co-info-block__label">Chất liệu</div>
                    <div className="co-info-block__value">{order.material || '—'}</div>
                  </div>
                  <div className="co-info-block">
                    <div className="co-info-block__label">Màu sắc & Phong cách</div>
                    <div className="co-info-block__value">{order.colorStyle || '—'}</div>
                  </div>
                </div>
                <div className="co-info-block">
                  <div className="co-info-block__label">Ngân sách dự kiến</div>
                  <div>
                    <span className="co-budget-highlight">
                      <i className="fa fa-wallet"></i>
                      {fmtVND(order.budgetMin)} – {fmtVND(order.budgetMax)}
                    </span>
                  </div>
                </div>
                <div className="co-info-block" style={{ marginBottom: 0 }}>
                  <div className="co-info-block__label">Hạn cần nhận hàng</div>
                  <div className="co-info-block__value">
                    <i className="fa fa-calendar-days" style={{ color: 'var(--color-primary)', marginRight: 6 }}></i>
                    {fmtDate(order.deadline)}
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            {order.imageUrls && order.imageUrls.length > 0 && (
              <div className="co-card">
                <div className="co-card__header">
                  <span style={{ fontWeight: 700 }}><i className="fa fa-images" style={{ color: 'var(--color-primary)', marginRight: 6 }}></i>Ảnh tham khảo</span>
                </div>
                <div className="co-card__body">
                  <div className="co-image-gallery">
                    {order.imageUrls.map((url, idx) => <img key={idx} src={url} alt="ref" />)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Quotes Panel */}
          <div className="co-quotes-panel">
            <div className="co-card">
              <div className="co-card__header">
                <span style={{ fontWeight: 700 }}>
                  <i className="fa fa-tags" style={{ color: 'var(--color-primary)', marginRight: 6 }}></i>
                  Báo Giá Nhận Được
                </span>
                <span className="co-quote-count">{order.quotes.length} báo giá</span>
              </div>
              <div className="co-card__body" style={{ padding: '1rem' }}>
                {order.quotes.length === 0 ? (
                  <div className="co-no-quotes">
                    <i className="fa fa-hourglass-half"></i>
                    <p>Chưa có báo giá nào.</p>
                    <p style={{ fontSize: '0.78rem' }}>Nhà thầu sẽ sớm gửi báo giá cho bạn!</p>
                  </div>
                ) : (
                  <div className="co-quotes-list">
                    {order.quotes.map(q => (
                      <div key={q.id} className={`co-quote-card ${q.status === 'ACCEPTED' ? 'co-quote-card--accepted' : ''}`}>
                        {q.status === 'ACCEPTED' && <div className="co-quote-card__chosen">✓ Đã chọn</div>}
                        <div className="co-quote-shop">
                          <div className="co-quote-shop__logo">
                            <i className="fa fa-store"></i>
                          </div>
                          <div>
                            <div className="co-quote-shop__name">{q.shopName}</div>
                            <StarRating rating={q.shopRating} />
                          </div>
                        </div>
                        <div className="co-quote-price">{fmtVND(q.quotedPrice)}</div>
                        <div className="co-quote-days">
                          <i className="fa fa-clock" style={{ marginRight: 4 }}></i>
                          Hoàn thành trong {q.estimatedDays} ngày
                        </div>
                        {q.note && <div className="co-quote-note">💬 {q.note}</div>}
                        {canSelectQuote && q.status === 'PENDING' && (
                          <button
                            id={`select-quote-${q.id}`}
                            className="btn btn--primary"
                            style={{ width: '100%', fontSize: '0.85rem' }}
                            onClick={() => handleSelectQuote(q)}
                            disabled={selecting === q.id}
                          >
                            {selecting === q.id
                              ? <><div className="co-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div> Đang xử lý...</>
                              : <><i className="fa fa-handshake"></i> Chọn Báo Giá Này</>
                            }
                          </button>
                        )}
                        {q.status === 'REJECTED' && (
                          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)', padding: '0.25rem 0' }}>
                            Không được chọn
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cancel button */}
            {(order.status === 'OPEN' || order.status === 'QUOTED') && (
              <button
                className="btn btn--outline"
                style={{ width: '100%', marginTop: '0.75rem', borderColor: 'var(--color-sale)', color: 'var(--color-sale)' }}
                onClick={async () => {
                  if (window.confirm('Bạn chắc chắn muốn hủy yêu cầu này?')) {
                    try {
                      await customOrderService.cancelRequest(Number(id));
                      setOrder({ ...order, status: 'CANCELLED' });
                      showToast('Đã hủy yêu cầu thành công.');
                    } catch (e) {
                      showToast('Lỗi khi hủy yêu cầu', 'error');
                    }
                  }
                }}
              >
                <i className="fa fa-xmark"></i> Hủy Yêu Cầu
              </button>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className={`co-toast co-toast--${toast.type}`}>
          <i className={`fa ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default CustomOrderDetail;
