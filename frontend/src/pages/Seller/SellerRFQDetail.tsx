import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../css/CustomOrder.css';
import { customOrderService } from '../../services/customOrderService';
import { useAuth } from '../../context/AuthContext';
import type { CustomOrderRequest, SubmitQuoteDto } from '../../types/customOrder';



const fmtVND = (n: number | null | undefined) => {
  if (n == null) return '0đ';
  return n.toLocaleString('vi-VN') + 'đ';
};
const fmtDate = (s: string) => new Date(s).toLocaleDateString('vi-VN');

const SellerRFQDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<CustomOrderRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [quote, setQuote] = useState<SubmitQuoteDto>({
    quotedPrice: '', estimatedDays: '', note: '',
  });
  const [images, setImages] = useState<File[]>([]); // Thêm state cho ảnh báo giá
  const [completionDate, setCompletionDate] = useState('');

  const handleShipProject = async () => {
    if (!window.confirm('Xác nhận bạn đã sản xuất hoàn thành và bàn giao sản phẩm?')) return;
    setShipping(true);
    try {
      await customOrderService.shipProject(Number(id));
      showToast('Đã bàn giao sản phẩm! Đang chờ khách hàng nghiệm thu và giải ngân.');
      const data = await customOrderService.getOpenRequestDetail(Number(id));
      setOrder(data as any);
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Lỗi khi báo cáo giao hàng', 'error');
    } finally {
      setShipping(false);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await customOrderService.getOpenRequestDetail(Number(id));
        setOrder(data as any);
      } catch (error) {
        console.error("Lỗi lấy chi tiết yêu cầu", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };

  const handleSubmitQuote = async () => {
    if (!quote.quotedPrice || Number(quote.quotedPrice) <= 0) {
      showToast('Vui lòng nhập giá báo', 'error'); return;
    }
    if (!quote.estimatedDays || Number(quote.estimatedDays) <= 0) {
      showToast('Vui lòng chọn ngày hoàn thành', 'error'); return;
    }
    if (!quote.note.trim()) {
      showToast('Vui lòng mô tả thêm về giải pháp của bạn', 'error'); return;
    }

    setSubmitting(true);
    try {
      await customOrderService.submitQuote(Number(id), {
        quotedPrice: Number(quote.quotedPrice) * 1000,
        estimatedDays: Number(quote.estimatedDays),
        note: quote.note
      }, images);
      setSubmitted(true);
      showToast('Báo giá đã được gửi thành công! Chúng tôi sẽ thông báo khi khách hàng phản hồi.');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Gửi báo giá thất bại. Vui lòng thử lại.';
      showToast(msg, 'error');
    } finally { setSubmitting(false); }
  };

  const handleWithdrawQuote = async (quoteId: number) => {
    if (!window.confirm('Bạn chắc chắn muốn rút báo giá này? Hành động này không thể hoàn tác.')) return;
    setWithdrawing(true);
    try {
      await customOrderService.withdrawQuote(Number(id), quoteId);
      showToast('Đã rút báo giá thành công.');
      // Reload data
      const data = await customOrderService.getOpenRequestDetail(Number(id));
      setOrder(data as any);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Rút báo giá thất bại.';
      showToast(msg, 'error');
    } finally { setWithdrawing(false); }
  };

  if (loading) return <div className="co-page"><div className="co-loading"><div className="co-spinner"></div></div></div>;
  if (!order) return <div className="co-page"><div className="co-container"><p>Không tìm thấy yêu cầu.</p></div></div>;

  const daysLeft = Math.ceil((new Date(order.deadline).getTime() - Date.now()) / 86400000);
  
  // Kiểm tra nhà thầu đã báo giá cho đơn này chưa
  const myExistingQuote = order.quotes?.find(q => q.contractorId === user?.id);
  const alreadyQuoted = !!myExistingQuote && myExistingQuote.status !== 'WITHDRAWN';
  return (
    <div className="co-page">
      <div className="co-container--wide">
        <div className="co-page-header">
          <div className="co-breadcrumb">
            <Link to="/contractor/dashboard">Dashboard</Link>
            <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
            <Link to="/contractor/rfq">Yêu cầu khách hàng</Link>
            <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
            <span>Chi tiết #{order.id}</span>
          </div>
          <h1 className="co-page-title" style={{ fontSize: '1.5rem' }}>{order.title}</h1>
        </div>

        <div className="co-detail-layout">
          {/* LEFT: Request Info */}
          <div>
            {/* Deadline Alert */}
            {daysLeft <= 14 && (
              <div style={{
                background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                border: '1.5px solid #ffb74d',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1.25rem',
                color: '#e65100',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}>
                <i className="fa fa-triangle-exclamation"></i>
                Yêu cầu cần hoàn thành trong {daysLeft} ngày nữa!
              </div>
            )}

            <div className="co-card" style={{ marginBottom: '1.25rem' }}>
              <div className="co-card__header">
                <span style={{ fontWeight: 700 }}>
                  <i className="fa fa-file-lines" style={{ color: 'var(--color-primary)', marginRight: 6 }}></i>
                  Chi Tiết Yêu Cầu
                </span>
                <span className={`co-status co-status--${order.status.toLowerCase()}`}>
                  {order.status === 'OPEN' ? 'Đang chờ báo giá' : 'Đã có báo giá'}
                </span>
              </div>
              <div className="co-card__body">
                <div className="co-info-block">
                  <div className="co-info-block__label">Mô tả yêu cầu</div>
                  <div className="co-info-block__value">{order.description}</div>
                </div>
                <div className="co-info-grid">
                  <div className="co-info-block">
                    <div className="co-info-block__label">Loại nội thất</div>
                    <div><span className="co-rfq-tag">{order.furnitureType}</span></div>
                  </div>
                  <div className="co-info-block">
                    <div className="co-info-block__label">Kích thước</div>
                    <div className="co-info-block__value">{order.dimensions || '—'}</div>
                  </div>
                  <div className="co-info-block">
                    <div className="co-info-block__label">Chất liệu mong muốn</div>
                    <div className="co-info-block__value">{order.material || '—'}</div>
                  </div>
                  <div className="co-info-block">
                    <div className="co-info-block__label">Màu & Phong cách</div>
                    <div className="co-info-block__value">{order.colorStyle || '—'}</div>
                  </div>
                </div>
                <div className="co-info-block">
                  <div className="co-info-block__label">Ngân sách khách hàng</div>
                  <span className="co-budget-highlight">
                    <i className="fa fa-wallet"></i>
                    {fmtVND(order.budgetMin)} – {fmtVND(order.budgetMax)}
                  </span>
                </div>
                <div className="co-info-block" style={{ marginBottom: 0 }}>
                  <div className="co-info-block__label">Hạn nhận hàng</div>
                  <div className="co-info-block__value">
                    <i className="fa fa-calendar-days" style={{ color: daysLeft <= 14 ? 'var(--color-sale)' : 'var(--color-primary)', marginRight: 6 }}></i>
                    {fmtDate(order.deadline)} ({daysLeft > 0 ? `còn ${daysLeft} ngày` : 'Đã hết hạn'})
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            {order.imageUrls && order.imageUrls.length > 0 && (
                <div className="co-card" style={{ marginTop: '1.25rem' }}>
                  <div className="co-card__header">
                    <span style={{ fontWeight: 700 }}><i className="fa fa-images" style={{ color: 'var(--color-primary)', marginRight: 6 }}></i>Ảnh tham khảo</span>
                  </div>
                  <div className="co-card__body">
                    <div className="co-image-gallery">
                      {/* THÊM ĐOẠN MỚI VÀO ĐÂY */}
                      {order.imageUrls.map((url, idx) => {
                        // Nếu URL từ DB chưa có http thì nối host Backend (8080) vào
                        const fullUrl = url.startsWith('http') ? url : `http://localhost:8080${url}`;
                        return <img key={idx} src={fullUrl} alt="ref" />;
                      })}
                    </div>
                  </div>
                </div>
            )}

            {/* Tips for sellers */}
            <div className="co-card" style={{ marginTop: '1.25rem', background: 'rgba(90,124,101,0.04)', borderColor: 'rgba(90,124,101,0.2)' }}>
              <div className="co-card__body">
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className="fa fa-lightbulb"></i> Mẹo gửi báo giá hiệu quả
                </div>
                <ul style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
                  <li>Báo giá <strong>cạnh tranh</strong> trong khoảng ngân sách khách đề xuất</li>
                  <li>Mô tả <strong>rõ chất liệu</strong> và quy trình sản xuất bạn sẽ dùng</li>
                  <li>Cam kết <strong>thời gian hoàn thành</strong> thực tế và đảm bảo</li>
                  <li>Đề cập <strong>chính sách bảo hành</strong> để tạo niềm tin</li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT: Quote Form */}
          <div>
            {alreadyQuoted && myExistingQuote ? (
              <div className="co-card">
                <div className="co-card__body" style={{ padding: '2rem 1.5rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Bạn đã gửi báo giá</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      Mỗi nhà thầu chỉ được gửi 1 báo giá cho mỗi yêu cầu
                    </p>
                  </div>
                  <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Giá báo</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{fmtVND(myExistingQuote.quotedPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Thời gian</span>
                      <span style={{ fontWeight: 600 }}>{myExistingQuote.estimatedDays} ngày</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Trạng thái báo giá</span>
                      <span style={{
                        fontWeight: 600,
                        color: myExistingQuote.status === 'ACCEPTED' ? '#2e7d32'
                             : myExistingQuote.status === 'REJECTED' ? '#c62828'
                             : 'var(--color-accent)'
                      }}>
                        {myExistingQuote.status === 'PENDING' && '⏳ Chờ phản hồi'}
                        {myExistingQuote.status === 'ACCEPTED' && '✅ Đã được chọn'}
                        {myExistingQuote.status === 'REJECTED' && '❌ Không được chọn'}
                      </span>
                    </div>

                    {myExistingQuote.status === 'ACCEPTED' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Tiến trình Escrow</span>
                        <span style={{
                          fontWeight: 600,
                          color: order.status === 'WAITING_FOR_PAYMENT' ? '#d97706'
                               : order.status === 'IN_PROGRESS' ? '#3b82f6'
                               : order.status === 'COMPLETED_BY_CONTRACTOR' ? '#10b981'
                               : order.status === 'COMPLETED' ? '#15803d'
                               : order.status === 'DISPUTED' ? '#ef4444'
                               : '#888'
                        }}>
                          {order.status === 'WAITING_FOR_PAYMENT' && '⏳ Chờ khách đặt cọc'}
                          {order.status === 'IN_PROGRESS' && '🔒 Đang tạm giữ (Hãy sản xuất)'}
                          {order.status === 'COMPLETED_BY_CONTRACTOR' && '🚚 Đã giao / Chờ khách giải ngân'}
                          {order.status === 'COMPLETED' && '🔓 Đã giải ngân'}
                          {order.status === 'DISPUTED' && '⚠️ Tranh chấp (Đang phân xử)'}
                        </span>
                      </div>
                    )}

                    {myExistingQuote.status === 'ACCEPTED' && order.customerName && (
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginTop: '10px', fontSize: '0.85rem', border: '1px solid #f1f5f9' }}>
                        <div style={{ marginBottom: 4 }}><strong>Khách hàng: </strong>{order.customerName}</div>
                        {order.status !== 'WAITING_FOR_PAYMENT' && order.customerPhone && (
                          <div><strong>Số điện thoại: </strong><a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a></div>
                        )}
                      </div>
                    )}

                    {myExistingQuote.note && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-light)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        💬 Ghi chú của bạn: "{myExistingQuote.note}"
                      </div>
                    )}
                  </div>

                  {/* Actions based on Escrow & Order progress */}
                  {myExistingQuote.status === 'PENDING' && (
                    <button
                      className="btn btn--outline"
                      style={{ width: '100%', borderColor: 'var(--color-sale)', color: 'var(--color-sale)' }}
                      onClick={() => handleWithdrawQuote(myExistingQuote.id)}
                      disabled={withdrawing}
                    >
                      {withdrawing
                        ? <><div className="co-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div> Đang xử lý...</>
                        : <><i className="fa fa-xmark"></i> Rút Báo Giá</>
                      }
                    </button>
                  )}

                  {myExistingQuote.status === 'ACCEPTED' && order.status === 'WAITING_FOR_PAYMENT' && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', color: '#b45309', marginTop: '10px', textAlign: 'center', lineHeight: 1.4 }}>
                      <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }}></i>
                      Hãy bắt đầu sản xuất sản phẩm sau khi khách hàng hoàn tất đặt cọc tiền tạm giữ.
                    </div>
                  )}

                  {myExistingQuote.status === 'ACCEPTED' && order.status === 'IN_PROGRESS' && (
                    <button
                      className="btn btn--primary"
                      style={{ width: '100%', padding: '10px 0', fontSize: '0.85rem', borderRadius: '8px', marginTop: '10px', border: 'none', cursor: 'pointer' }}
                      onClick={handleShipProject}
                      disabled={shipping}
                    >
                      <i className="fa-solid fa-truck" style={{ marginRight: 6 }}></i>
                      {shipping ? 'Đang cập nhật...' : 'Đã chế tác xong & Bàn giao hàng'}
                    </button>
                  )}

                  {myExistingQuote.status === 'ACCEPTED' && order.status === 'COMPLETED_BY_CONTRACTOR' && (
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', color: '#047857', marginTop: '10px', textAlign: 'center', lineHeight: 1.4 }}>
                      <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }}></i>
                      Bạn đã thông báo bàn giao. Đang chờ khách hàng kiểm tra chất lượng và giải ngân tiền.
                    </div>
                  )}

                  {myExistingQuote.status === 'ACCEPTED' && order.status === 'COMPLETED' && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', color: '#15803d', marginTop: '10px', textAlign: 'center', fontWeight: 600 }}>
                      <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }}></i>
                      Tiền tạm giữ đã được giải ngân thành công vào ví của bạn!
                    </div>
                  )}

                  {myExistingQuote.status === 'ACCEPTED' && order.status === 'DISPUTED' && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', color: '#b91c1c', marginTop: '10px', textAlign: 'center', lineHeight: 1.4 }}>
                      <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 6 }}></i>
                      Dự án đang trong trạng thái khiếu nại/tranh chấp. Ban quản trị hệ thống đang tiến hành xác minh và xử lý.
                    </div>
                  )}
                  <Link to="/contractor/rfq" className="btn btn--outline" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <i className="fa fa-arrow-left"></i> Xem yêu cầu khác
                  </Link>
                </div>
              </div>
            ) : submitted ? (
              <div className="co-card">
                <div className="co-card__body" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Báo Giá Đã Gửi!</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Khách hàng sẽ xem xét và thông báo kết quả sớm nhất có thể.
                  </p>
                  <Link to="/contractor/rfq" className="btn btn--outline">
                    <i className="fa fa-arrow-left"></i> Xem yêu cầu khác
                  </Link>
                </div>
              </div>
            ) : (
              <div className="co-quote-form">
                <div className="co-quote-form__title">
                  <i className="fa fa-paper-plane"></i> Gửi Báo Giá Của Bạn
                </div>

                <div className="co-field">
                  <label className="co-label">Giá báo <span>*</span></label>
                  <div className="co-input-prefix" style={{ position: 'relative' }}>
                    <span className="co-input-prefix__label">VNĐ</span>
                    <input
                      id="seller-quote-price"
                      type="number"
                      className="co-input"
                      placeholder="VD: 18500"
                      value={quote.quotedPrice}
                      onChange={e => setQuote(q => ({ ...q, quotedPrice: e.target.value ? Number(e.target.value) : '' }))}
                      min={0}
                      style={{ paddingRight: '55px' }}
                    />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>.000 đ</span>
                  </div>
                  {quote.quotedPrice && (
                    <small style={{ color: 'var(--color-primary)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block', fontWeight: 600 }}>
                      <i className="fa fa-wallet" style={{ marginRight: 6 }}></i>
                      Thực tế: {(Number(quote.quotedPrice) * 1000).toLocaleString('vi-VN')}đ
                    </small>
                  )}
                </div>

                <div className="co-field">
                  <label className="co-label">Ngày dự kiến hoàn thành <span>*</span></label>
                  <input
                    id="seller-quote-days"
                    type="date"
                    className="co-input"
                    value={completionDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => {
                      const selected = e.target.value;
                      setCompletionDate(selected);
                      if (selected) {
                        const days = Math.ceil((new Date(selected).getTime() - Date.now()) / 86400000);
                        setQuote(q => ({ ...q, estimatedDays: days > 0 ? days : 1 }));
                      } else {
                        setQuote(q => ({ ...q, estimatedDays: '' }));
                      }
                    }}
                    style={{ maxWidth: 280 }}
                  />
                  {completionDate && quote.estimatedDays && (
                    <small style={{ color: 'var(--color-primary)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                      <i className="fa fa-clock"></i>
                      Tương đương {quote.estimatedDays} ngày kể từ hôm nay
                    </small>
                  )}
                </div>

                <div className="co-field">
                  <label className="co-label">Mô tả giải pháp & Ghi chú <span>*</span></label>
                  <textarea
                    id="seller-quote-note"
                    className="co-textarea"
                    placeholder="Mô tả chất liệu bạn sẽ dùng, quy trình sản xuất, chính sách bảo hành, dịch vụ lắp đặt..."
                    value={quote.note}
                    onChange={e => setQuote(q => ({ ...q, note: e.target.value }))}
                    rows={5}
                  />
                </div>

                {/* IMAGE UPLOAD */}
                <div className="co-field">
                  <label className="co-label">Ảnh báo giá / Demo (Tùy chọn)</label>
                  <div className="co-image-upload-wrapper" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {images.map((img, idx) => (
                      <div key={idx} className="co-image-preview" style={{ position: 'relative' }}>
                        <img 
                          src={URL.createObjectURL(img)} 
                          alt="preview" 
                          style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid #ddd' }} 
                        />
                        <button 
                          onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                          style={{ position: 'absolute', top: -5, right: -5, background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '10px' }}>
                          <i className="fa fa-times"></i>
                        </button>
                      </div>
                    ))}
                    <label className="co-upload-btn" style={{ width: 80, height: 80, border: '2px dashed #ccc', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}>
                      <i className="fa fa-plus"></i>
                      <span style={{ fontSize: '0.65rem', marginTop: 4 }}>Thêm ảnh</span>
                      <input 
                        type="file" 
                        multiple 
                        hidden 
                        accept="image/*" 
                        onChange={e => {
                          if (e.target.files) {
                            setImages(prev => [...prev, ...Array.from(e.target.files!)]);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>

                {/* Price vs Budget comparison */}
                {quote.quotedPrice && (
                  <div style={{
                    background: (Number(quote.quotedPrice) * 1000) <= order.budgetMax ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)',
                    border: `1.5px solid ${(Number(quote.quotedPrice) * 1000) <= order.budgetMax ? 'rgba(46,125,50,0.3)' : 'rgba(198,40,40,0.3)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.82rem',
                    color: (Number(quote.quotedPrice) * 1000) <= order.budgetMax ? '#2e7d32' : '#c62828',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <i className={`fa ${(Number(quote.quotedPrice) * 1000) <= order.budgetMax ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                    {(Number(quote.quotedPrice) * 1000) <= order.budgetMax
                      ? 'Báo giá nằm trong ngân sách khách hàng ✓'
                      : `Vượt ngân sách tối đa ${fmtVND((Number(quote.quotedPrice) * 1000) - order.budgetMax)}`
                    }
                  </div>
                )}

                <button
                  id="seller-submit-quote-btn"
                  className="btn btn--primary"
                  style={{ width: '100%' }}
                  onClick={handleSubmitQuote}
                  disabled={submitting}
                >
                  {submitting
                    ? <><div className="co-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Đang gửi...</>
                    : <><i className="fa fa-paper-plane"></i> Gửi Báo Giá</>
                  }
                </button>
              </div>
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

export default SellerRFQDetail;
