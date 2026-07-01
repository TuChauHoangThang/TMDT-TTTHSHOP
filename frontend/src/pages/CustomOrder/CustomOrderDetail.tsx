import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../css/CustomOrder.css';
import { customOrderService } from '../../services/customOrderService';
import type { CustomOrderRequest, CustomOrderQuote } from '../../types/customOrder';

// --- UTILS ---
const fmtVND = (n: number | null | undefined) => {
  if (n == null) return '0đ';
  return n.toLocaleString('vi-VN') + 'đ';
};
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
  const [layout, setLayout] = useState<'list' | 'grid'>('list'); // Thêm toggle layout

  // Escrow States
  const [escrow, setEscrow] = useState<any | null>(null);
  const [paying, setPaying] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await customOrderService.getRequestDetail(Number(id));
        setOrder(data as any);
        if (data.status !== 'OPEN' && data.status !== 'QUOTED') {
          try {
            const escrowData = await customOrderService.getEscrow(Number(id));
            setEscrow(escrowData);
          } catch (e) {
            console.error('Lỗi khi lấy thông tin Escrow:', e);
          }
        }
        try {
          const w = await customOrderService.getWallet();
          setWalletBalance(w.walletBalance);
        } catch (e) {
          console.error('Lỗi khi lấy số dư ví:', e);
        }
      } catch (error) {
        console.error('Error fetching order detail', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleVNPayEscrow = async () => {
    setPaying(true);
    try {
      const res = await customOrderService.getVNPayUrl(Number(id));
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        showToast('Không thể kết nối đến cổng thanh toán VNPay', 'error');
      }
    } catch (error) {
      showToast('Có lỗi xảy ra khi khởi tạo giao dịch VNPay', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleMockEscrow = async () => {
    if (!window.confirm('Xác nhận đặt cọc tiền tạm giữ qua ví mô phỏng?')) return;
    setPaying(true);
    try {
      const updatedEscrow = await customOrderService.depositMock(Number(id));
      setEscrow(updatedEscrow);
      const updatedOrder = await customOrderService.getRequestDetail(Number(id));
      setOrder(updatedOrder as any);
      showToast('Thanh toán đặt cọc tạm giữ giả lập thành công! Nhà thầu có thể tiến hành chế tác.');
    } catch (error) {
      showToast('Đặt cọc giả lập thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleWalletEscrow = async () => {
    if (!window.confirm('Xác nhận đặt cọc tiền tạm giữ bằng số dư ví điện tử của bạn?')) return;
    setPaying(true);
    try {
      const updatedEscrow = await customOrderService.depositWithWallet(Number(id));
      setEscrow(updatedEscrow);
      const updatedOrder = await customOrderService.getRequestDetail(Number(id));
      setOrder(updatedOrder as any);
      const w = await customOrderService.getWallet();
      setWalletBalance(w.walletBalance);
      showToast('Đặt cọc tạm giữ bằng số dư ví thành công! Nhà thầu có thể tiến hành chế tác.');
    } catch (error: any) {
      showToast(error?.response?.data?.error || 'Thanh toán bằng ví thất bại.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleReleaseEscrow = async () => {
    if (!window.confirm('Xác nhận sản phẩm đã bàn giao đầy đủ và đúng như yêu cầu? Tiền cọc sẽ được chuyển ngay vào ví nhà thầu.')) return;
    setReleasing(true);
    try {
      const updatedEscrow = await customOrderService.releaseEscrow(Number(id));
      setEscrow(updatedEscrow);
      const updatedOrder = await customOrderService.getRequestDetail(Number(id));
      setOrder(updatedOrder as any);
      showToast('Giải ngân tiền tạm giữ thành công! Đơn hàng hoàn thành.');
    } catch (error) {
      showToast('Giải ngân thất bại.', 'error');
    } finally {
      setReleasing(false);
    }
  };

  const handleDisputeEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      alert('Vui lòng nhập lý do khiếu nại');
      return;
    }
    setReleasing(true);
    try {
      const updatedEscrow = await customOrderService.disputeEscrow(Number(id), disputeReason);
      setEscrow(updatedEscrow);
      const updatedOrder = await customOrderService.getRequestDetail(Number(id));
      setOrder(updatedOrder as any);
      setShowDisputeModal(false);
      showToast('Đã gửi khiếu nại. Ban quản trị hệ thống sẽ xử lý và liên hệ với bạn.', 'success');
    } catch (error) {
      showToast('Gửi khiếu nại thất bại.', 'error');
    } finally {
      setReleasing(false);
    }
  };

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

  const handleCancelRequest = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu đặt theo yêu cầu này? Hành động này không thể hoàn tác.')) return;
    try {
      await customOrderService.cancelRequest(Number(id));
      const updated = await customOrderService.getRequestDetail(Number(id));
      setOrder(updated as any);
      showToast('Đã hủy yêu cầu thành công.', 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.error || 'Hủy yêu cầu thất bại.', 'error');
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h1 className="co-page-title" style={{ fontSize: '1.5rem', margin: 0 }}>{order.title}</h1>
                <span className={`co-status co-status--${order.status.toLowerCase()}`}>
                  {order.status === 'OPEN' && 'Chờ báo giá'}
                  {order.status === 'QUOTED' && 'Đã có báo giá'}
                  {order.status === 'WAITING_FOR_PAYMENT' && 'Chờ đặt cọc'}
                  {order.status === 'IN_PROGRESS' && 'Đang chế tác'}
                  {order.status === 'COMPLETED_BY_CONTRACTOR' && 'Đã bàn giao'}
                  {order.status === 'COMPLETED' && 'Hoàn thành'}
                  {order.status === 'DISPUTED' && 'Tranh chấp/Khiếu nại'}
                  {order.status === 'CANCELLED' && 'Đã hủy/Hoàn tiền'}
                </span>
              </div>

              {order.status === 'OPEN' && (
                <button
                  onClick={handleCancelRequest}
                  className="btn btn--outline"
                  style={{
                    borderColor: '#dc2626',
                    color: '#dc2626',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <i className="fa-solid fa-ban"></i> Hủy Yêu Cầu
                </button>
              )}
            </div>
          </div>

          <div className="co-detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '2rem' }}>

            {/* LEFT: Request Details */}
            <div>
              {/* WAITING FOR ESCROW PAYMENT */}
              {order.status === 'WAITING_FOR_PAYMENT' && (
                <div className="co-card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--color-primary)' }}>
                  <div className="co-card__header" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                    <span style={{ fontWeight: 700 }}>
                      <i className="fa fa-shield-halved" style={{ marginRight: 8 }}></i>
                      Thanh toán tạm giữ (Escrow Deposit)
                    </span>
                  </div>
                  <div className="co-card__body" style={{ padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.5, marginBottom: '1rem' }}>
                      Bạn đã chọn báo giá từ nhà thầu. Để đảm bảo an toàn cho giao dịch, vui lòng đặt cọc số tiền báo giá. 
                      <strong> Tiền sẽ được hệ thống tạm giữ an toàn</strong> và chỉ giải ngân cho nhà thầu sau khi bạn nhận sản phẩm và hài lòng.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#64748b' }}>Nhà thầu được chọn:</span>
                        <strong style={{ color: '#334155' }}>{order.quotes.find(q => q.id === order.selectedQuoteId)?.shopName || 'Nhà thầu'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#64748b' }}>Số tiền cần đặt cọc:</span>
                        <strong style={{ color: '#ef4444', fontSize: '1.1rem' }}>
                          {fmtVND(order.quotes.find(q => q.id === order.selectedQuoteId)?.quotedPrice || 0)}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px' }}>
                        <span style={{ color: '#64748b' }}>Số dư ví của bạn:</span>
                        <strong style={{ color: 'var(--color-primary)' }}>
                          {walletBalance !== null ? fmtVND(walletBalance) : 'Đang tải...'}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {walletBalance !== null && walletBalance >= (order.quotes.find(q => q.id === order.selectedQuoteId)?.quotedPrice || 0) ? (
                        <button 
                          className="btn" 
                          style={{ width: '100%', padding: '12px 0', fontSize: '0.85rem', borderRadius: '8px', background: '#166534', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                          onClick={handleWalletEscrow}
                          disabled={paying}
                        >
                          <i className="fa-solid fa-wallet" style={{ marginRight: 6 }}></i>
                          {paying ? 'Đang xử lý...' : 'Thanh toán bằng Số dư ví'}
                        </button>
                      ) : (
                        <div style={{ padding: '10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.82rem', color: '#991b1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>❌ Số dư ví không đủ để đặt cọc.</span>
                          <Link to="/customer/wallet" style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline' }}>Nạp thêm tiền vào ví</Link>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                          className="btn btn--outline" 
                          style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem', borderRadius: '8px' }}
                          onClick={handleVNPayEscrow}
                          disabled={paying}
                        >
                          <i className="fa-solid fa-credit-card" style={{ marginRight: 6 }}></i>
                          {paying ? 'Đang kết nối...' : 'Thanh toán VNPay'}
                        </button>
                        <button 
                          className="btn" 
                          style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem', background: '#3b82f6', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                          onClick={handleMockEscrow}
                          disabled={paying}
                        >
                          <i className="fa-solid fa-flask" style={{ marginRight: 6 }}></i>
                          {paying ? 'Đang xử lý...' : 'Cọc giả lập (Mock)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ESCROW STATUS DISPLAY */}
              {escrow && (
                <div className="co-card" style={{ marginBottom: '1.5rem', border: '1px solid #ddd' }}>
                  <div className="co-card__header" style={{ background: '#f8fafc' }}>
                    <span style={{ fontWeight: 700 }}>
                      <i className="fa fa-shield-halved" style={{ color: 'var(--color-primary)', marginRight: 8 }}></i>
                      Chi tiết tạm giữ giao dịch (Escrow Status)
                    </span>
                  </div>
                  <div className="co-card__body" style={{ padding: '1.2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ color: '#666' }}>Giao dịch tạm giữ: </span><strong>#ESC-{escrow.id}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>Số tiền tạm giữ: </span><strong style={{ color: '#ef4444' }}>{fmtVND(escrow.amount)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>Trạng thái tiền: </span>
                        <strong style={{
                          color: escrow.status === 'HELD' ? '#3b82f6'
                               : escrow.status === 'RELEASED' ? '#2e7d32'
                               : escrow.status === 'DISPUTED' ? '#ef4444'
                               : escrow.status === 'REFUNDED' ? '#c62828'
                               : '#888'
                        }}>
                          {escrow.status === 'HELD' && '🔒 Đang tạm giữ'}
                          {escrow.status === 'RELEASED' && '🔓 Đã giải ngân'}
                          {escrow.status === 'DISPUTED' && '⚠️ Tranh chấp (Đang phân xử)'}
                          {escrow.status === 'REFUNDED' && '↩️ Đã hoàn tiền'}
                          {escrow.status === 'PENDING' && '⏳ Chờ thanh toán'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>Phương thức nạp: </span><strong>{escrow.paymentMethod || 'Chưa nạp'}</strong>
                      </div>
                    </div>

                    {escrow.status === 'DISPUTED' && escrow.disputeReason && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '10px', borderRadius: '6px', marginTop: '10px', fontSize: '0.85rem' }}>
                        <strong style={{ color: '#b91c1c' }}>Lý do khiếu nại: </strong>
                        <span style={{ color: '#7f1d1d' }}>"{escrow.disputeReason}"</span>
                      </div>
                    )}

                    {escrow.disputeResolution && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '10px', borderRadius: '6px', marginTop: '10px', fontSize: '0.85rem' }}>
                        <strong style={{ color: '#166534' }}>Phân xử tranh chấp: </strong>
                        <span style={{ color: '#14532d' }}>"{escrow.disputeResolution}"</span>
                      </div>
                    )}

                    {/* CONFIRM RECEIPT / DISPUTE ACTIONS */}
                    {order.status === 'COMPLETED_BY_CONTRACTOR' && (
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px' }}>
                          Nhà thầu đã giao hàng thành công. Vui lòng nhận sản phẩm, kiểm tra chất lượng và xác nhận để giải ngân tiền tạm giữ.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button 
                            className="btn btn--primary" 
                            style={{ flex: 2, padding: '10px 0', fontSize: '0.85rem', borderRadius: '8px' }}
                            onClick={handleReleaseEscrow}
                            disabled={releasing}
                          >
                            <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }}></i>
                            {releasing ? 'Đang xử lý...' : 'Xác nhận nhận hàng & Giải ngân'}
                          </button>
                          <button 
                            className="btn" 
                            style={{ flex: 1, padding: '10px 0', fontSize: '0.85rem', background: '#ef4444', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                            onClick={() => setShowDisputeModal(true)}
                            disabled={releasing}
                          >
                            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }}></i>
                            Yêu cầu Khiếu nại
                          </button>
                        </div>
                      </div>
                    )}

                    {/* DISPUTE ACTION IN IN_PROGRESS */}
                    {order.status === 'IN_PROGRESS' && (
                      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}
                          onClick={() => setShowDisputeModal(true)}
                        >
                          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }}></i>
                          Mở khiếu nại / Hoàn tiền
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="co-card" style={{ marginBottom: '1.5rem' }}>
                <div className="co-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>
                  <i className="fa fa-circle-info" style={{ color: 'var(--color-primary)', marginRight: 8 }}></i>
                  Thông tin yêu cầu
                </span>
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
                <div className="co-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>
                  <i className="fa fa-tags" style={{ color: 'var(--color-primary)', marginRight: 8 }}></i>
                  Báo giá ({order.quotes.length})
                </span>
                  <div className="co-layout-toggle" style={{ display: 'flex', background: '#f5f5f5', borderRadius: 8, padding: 2 }}>
                    <button 
                        onClick={() => setLayout('list')}
                        style={{ border: 'none', background: layout === 'list' ? '#fff' : 'transparent', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', boxShadow: layout === 'list' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
                      <i className="fa fa-list"></i>
                    </button>
                    <button 
                        onClick={() => setLayout('grid')}
                        style={{ border: 'none', background: layout === 'grid' ? '#fff' : 'transparent', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', boxShadow: layout === 'grid' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
                      <i className="fa fa-th-large"></i>
                    </button>
                  </div>
                </div>
                <div className="co-card__body" style={{ padding: '1rem' }}>
                  {order.quotes.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#999', padding: '1rem 0' }}>Chưa có báo giá nào.</p>
                  ) : (
                      <div className={`co-quotes-${layout}`} style={{ 
                        display: layout === 'grid' ? 'grid' : 'block',
                        gridTemplateColumns: layout === 'grid' ? '1fr 1fr' : 'none',
                        gap: layout === 'grid' ? '1rem' : '0'
                      }}>
                        {order.quotes.map(q => (
                            <div key={q.id} className={`co-quote-card ${q.status === 'ACCEPTED' ? 'co-quote-card--accepted' : ''}`}
                                 style={{ 
                                   border: q.status === 'ACCEPTED' ? '2px solid #2e7d32' : '1px solid #eee', 
                                   padding: '1.2rem', 
                                   borderRadius: 16, 
                                   marginBottom: layout === 'list' ? '1.5rem' : '0', 
                                   position: 'relative', 
                                   background: '#fff',
                                   transition: 'all 0.3s ease',
                                   boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                 }}>

                              {q.status === 'ACCEPTED' && (
                                  <div style={{ position: 'absolute', top: -10, right: 10, background: '#2e7d32', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                                    ĐÃ CHỌN
                                  </div>
                              )}

                              {/* Contractor & Shop Info */}
                              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                <img 
                                    src={q.shopLogo ? (q.shopLogo.startsWith('http') ? q.shopLogo : `http://localhost:8080${q.shopLogo}`) : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                                    alt="logo" 
                                    style={{ width: 50, height: 50, borderRadius: 12, objectFit: 'cover', background: '#f5f5f5' }} 
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Link to={`/shops/${q.shopSlug}`} style={{ fontWeight: 700, color: '#333', textDecoration: 'none', fontSize: '1rem' }}>
                                      {q.shopName}
                                    </Link>
                                    <StarRating rating={q.shopRating} />
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 2 }}>
                                    <i className="fa fa-location-dot" style={{ marginRight: 5, fontSize: '0.75rem' }}></i>
                                    {q.shopAddress || "Đang cập nhật địa chỉ"}
                                  </div>
                                </div>
                              </div>

                              {/* Price & Note */}
                              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 12, marginBottom: 12, border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.2rem' }}>{fmtVND(q.quotedPrice)}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                                    <i className="fa fa-truck-fast" style={{ marginRight: 4 }}></i>
                                    {q.estimatedDays} ngày
                                  </div>
                                </div>
                                {q.note && <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: 8, lineHeight: 1.4 }}>"{q.note}"</div>}
                              </div>

                              {/* Quote Demo Images */}
                              {q.imageUrls && q.imageUrls.length > 0 && (
                                  <div style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Ảnh demo từ nhà thầu:</div>
                                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                                      {q.imageUrls.map((imgUrl, i) => (
                                          <img 
                                              key={i}
                                              src={imgUrl.startsWith('http') ? imgUrl : `http://localhost:8080${imgUrl}`} 
                                              alt="demo" 
                                              style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #eee' }} 
                                          />
                                      ))}
                                    </div>
                                  </div>
                              )}

                              {/* Action */}
                              {canSelectQuote && q.status === 'PENDING' && (
                                  <button
                                      className="btn btn--primary"
                                      style={{ width: '100%', fontSize: '0.85rem', padding: '10px', borderRadius: 10 }}
                                      onClick={() => handleSelectQuote(q)}
                                      disabled={selecting === q.id}
                                  >
                                    {selecting === q.id ? 'Đang xử lý...' : 'Chọn báo giá này'}
                                  </button>
                              )}
                              
                              {q.status === 'ACCEPTED' && (
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <a href={`tel:${q.contractorPhone}`} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#334155', fontSize: '0.8rem', textAlign: 'center', textDecoration: 'none', padding: '8px 0', borderRadius: 8 }}>
                                      <i className="fa fa-phone" style={{ marginRight: 5 }}></i> Gọi điện
                                    </a>
                                    <button className="btn btn--primary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px 0', borderRadius: 8 }}>
                                      <i className="fa fa-comments" style={{ marginRight: 5 }}></i> Nhắn tin
                                    </button>
                                  </div>
                              )}
                            </div>
                        ))}
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showDisputeModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div className="co-card" style={{ width: '450px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: 'none' }}>
              <div className="co-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }}></i>
                  Yêu cầu Khiếu nại / Hoàn tiền
                </span>
                <button onClick={() => setShowDisputeModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#666' }}>&times;</button>
              </div>
              <form onSubmit={handleDisputeEscrow} style={{ padding: '1.25rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Lý do khiếu nại của bạn:</label>
                  <textarea 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit' }}
                    rows={4}
                    placeholder="Vui lòng nêu chi tiết vấn đề (ví dụ: sản phẩm hỏng, sai kích thước, trễ hẹn hoặc nhà thầu không phản hồi...)"
                    value={disputeReason}
                    onChange={e => setDisputeReason(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn" onClick={() => setShowDisputeModal(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" className="btn" style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }} disabled={releasing}>
                    {releasing ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {toast && (
            <div className={`co-toast co-toast--${toast.type}`} style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
              {toast.msg}
            </div>
        )}
      </div>
  );
};

export default CustomOrderDetail;