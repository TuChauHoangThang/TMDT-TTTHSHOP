import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customOrderService } from '../../services/customOrderService';
import '../../css/CustomOrder.css';

const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const fmtDate = (s: string) => new Date(s).toLocaleString('vi-VN');

interface EscrowRecord {
  id: number;
  request: {
    id: number;
    title: string;
    description: string;
  };
  customer: {
    id: number;
    fullName: string;
  };
  contractor: {
    id: number;
    fullName: string;
  };
  amount: number;
  status: 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
  paymentMethod: string;
  disputeReason?: string;
  disputeResolution?: string;
  createdAt: string;
}

interface WithdrawReq {
  id: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
  createdAt: string;
  processedAt?: string;
}

const AdminEscrowDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'escrow' | 'withdraw'>('escrow');
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [withdraws, setWithdraws] = useState<WithdrawReq[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'HELD' | 'DISPUTED' | 'RELEASED' | 'REFUNDED'>('ALL');
  const [withdrawFilter, setWithdrawFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processingWithdrawId, setProcessingWithdrawId] = useState<number | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const escrowData = await customOrderService.getAllEscrows();
      setEscrows(escrowData);

      const withdrawData = await customOrderService.getAllWithdrawRequestsAdmin();
      setWithdraws(withdrawData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu admin:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleResolve = async (escrowId: number, resolution: 'RELEASE' | 'REFUND') => {
    if (!adminNotes.trim()) {
      alert('Vui lòng nhập lý do phân xử / ghi chú trước khi đưa ra quyết định.');
      return;
    }

    const actionText = resolution === 'RELEASE' ? 'GIẢI NGÂN cho Nhà thầu' : 'HOÀN TIỀN cho Khách hàng';
    if (!window.confirm(`Xác nhận phân xử: ${actionText} cho giao dịch tạm giữ này?`)) return;

    setResolvingId(escrowId);
    try {
      await customOrderService.resolveDispute(escrowId, resolution, adminNotes);
      showToast('Đã xử lý tranh chấp thành công!');
      setAdminNotes('');
      loadAllData();
    } catch (error: any) {
      showToast(error?.response?.data?.error || 'Xử lý tranh chấp thất bại.', 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const handleApproveWithdraw = async (reqId: number) => {
    if (!window.confirm('Xác nhận đã chuyển khoản ngân hàng ngoài đời thực và phê duyệt yêu cầu rút tiền này?')) return;
    setProcessingWithdrawId(reqId);
    try {
      await customOrderService.approveWithdrawalAdmin(reqId);
      showToast('Phê duyệt yêu cầu rút tiền thành công!');
      loadAllData();
    } catch (error: any) {
      showToast(error?.response?.data?.error || 'Phê duyệt thất bại.', 'error');
    } finally {
      setProcessingWithdrawId(null);
    }
  };

  const handleRejectWithdraw = async (reqId: number) => {
    if (!window.confirm('Xác nhận từ chối yêu cầu rút tiền này? Số tiền sẽ được hoàn trả lại ví của người dùng.')) return;
    setProcessingWithdrawId(reqId);
    try {
      await customOrderService.rejectWithdrawalAdmin(reqId);
      showToast('Đã từ chối và hoàn tiền lại ví thành công!');
      loadAllData();
    } catch (error: any) {
      showToast(error?.response?.data?.error || 'Từ chối thất bại.', 'error');
    } finally {
      setProcessingWithdrawId(null);
    }
  };

  if (loading) return <div className="co-page"><div className="co-loading"><div className="co-spinner"></div></div></div>;

  const filteredEscrows = escrows.filter(e => {
    if (filter === 'ALL') return true;
    return e.status === filter;
  });

  const filteredWithdraws = withdraws.filter(w => {
    if (withdrawFilter === 'ALL') return true;
    return w.status === withdrawFilter;
  });

  return (
    <div className="co-page" style={{ paddingTop: '5.5rem', minHeight: '80vh' }}>
      <div className="co-container--wide">
        
        <div className="co-breadcrumb" style={{ marginBottom: '1rem' }}>
          <Link to="/">Trang chủ</Link>
          <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem', margin: '0 8px' }}></i>
          <span>Ban quản trị</span>
        </div>

        {/* Dashboard Title & Tabs Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="co-page-title" style={{ margin: 0, fontSize: '1.6rem' }}>
            <i className="fa-solid fa-screwdriver-wrench" style={{ marginRight: 8, color: 'var(--color-primary)' }}></i>
            Quản trị Ví & Tạm giữ Escrow
          </h1>
          
          {/* Main Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
            <button
              onClick={() => setActiveTab('escrow')}
              style={{
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: activeTab === 'escrow' ? '#fff' : 'transparent',
                color: activeTab === 'escrow' ? 'var(--color-primary)' : '#64748b',
                boxShadow: activeTab === 'escrow' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <i className="fa-solid fa-gavel" style={{ marginRight: 6 }}></i>
              Tranh chấp Escrow ({escrows.filter(e => e.status === 'DISPUTED').length})
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              style={{
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: activeTab === 'withdraw' ? '#fff' : 'transparent',
                color: activeTab === 'withdraw' ? 'var(--color-primary)' : '#64748b',
                boxShadow: activeTab === 'withdraw' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <i className="fa-solid fa-building-columns" style={{ marginRight: 6 }}></i>
              Yêu cầu Rút tiền ({withdraws.filter(w => w.status === 'PENDING').length})
            </button>
          </div>
        </div>

        {/* ================= TAB 1: ESCROW DISPUTE RESOLUTION ================= */}
        {activeTab === 'escrow' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {(['ALL', 'HELD', 'DISPUTED', 'RELEASED', 'REFUNDED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: filter === f ? 'var(--color-primary)' : '#e2e8f0',
                    color: filter === f ? '#fff' : '#475569',
                    boxShadow: filter === f ? '0 4px 10px rgba(90,124,101,0.2)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {f === 'ALL' && 'Tất cả'}
                  {f === 'HELD' && '🔒 Đang tạm giữ'}
                  {f === 'DISPUTED' && '⚠️ Đang tranh chấp'}
                  {f === 'RELEASED' && '🔓 Đã giải ngân'}
                  {f === 'REFUNDED' && '↩️ Đã hoàn tiền'}
                </button>
              ))}
            </div>

            {filteredEscrows.length === 0 ? (
              <div className="co-card" style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                <i className="fa-regular fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block' }}></i>
                Không tìm thấy giao dịch tạm giữ nào phù hợp bộ lọc.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredEscrows.map(escrow => (
                  <div key={escrow.id} className="co-card" style={{
                    border: escrow.status === 'DISPUTED' ? '2px solid #fca5a5' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}>
                    {/* Header */}
                    <div style={{
                      background: escrow.status === 'DISPUTED' ? '#fef2f2' : '#f8fafc',
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>Giao dịch #ESC-{escrow.id}</strong>
                        <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '12px' }}>
                          Yêu cầu thiết kế: <Link to={`/custom-orders/${escrow.request?.id}`} style={{ fontWeight: 600 }}>#REQ-{escrow.request?.id} - {escrow.request?.title}</Link>
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: escrow.status === 'HELD' ? '#dbeafe' : escrow.status === 'DISPUTED' ? '#fee2e2' : escrow.status === 'RELEASED' ? '#dcfce7' : '#f1f5f9',
                        color: escrow.status === 'HELD' ? '#1e40af' : escrow.status === 'DISPUTED' ? '#991b1b' : escrow.status === 'RELEASED' ? '#166534' : '#475569'
                      }}>
                        {escrow.status === 'PENDING' && '⏳ Chờ thanh toán'}
                        {escrow.status === 'HELD' && '🔒 Đang tạm giữ'}
                        {escrow.status === 'DISPUTED' && '⚠️ Tranh chấp'}
                        {escrow.status === 'RELEASED' && '🔓 Đã giải ngân'}
                        {escrow.status === 'REFUNDED' && '↩️ Đã hoàn tiền'}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="co-card__body" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.88rem', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ color: '#666' }}>Khách hàng: </span><strong>{escrow.customer?.fullName}</strong> <span style={{ color: '#888' }}>(#{escrow.customer?.id})</span>
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>Nhà thầu: </span><strong>{escrow.contractor?.fullName}</strong> <span style={{ color: '#888' }}>(#{escrow.contractor?.id})</span>
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>Số tiền: </span><strong style={{ color: '#ef4444' }}>{fmtVND(escrow.amount)}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>Ngày tạo: </span><strong>{fmtDate(escrow.createdAt)}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>P.Thức T.Toán: </span><strong style={{ color: 'var(--color-primary)' }}>{escrow.paymentMethod || 'Không rõ'}</strong>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px dashed #eee', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                        <p style={{ margin: '0 0 6px 0', color: '#475569' }}><strong>Mô tả yêu cầu gốc:</strong> {escrow.request?.description}</p>
                      </div>

                      {/* Disputed details and resolution form */}
                      {escrow.status === 'DISPUTED' && (
                        <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#b45309' }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }}></i>Lý do khách hàng khiếu nại:</strong>
                            <p style={{ margin: '4px 0 0 0', color: '#78350f', fontStyle: 'italic' }}>"{escrow.disputeReason}"</p>
                          </div>

                          {/* Admin resolving panel */}
                          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #fde68a' }}>
                            <label style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '6px', fontSize: '0.82rem' }}>Quyết định & Ghi chú phân xử của Admin:</label>
                            <textarea
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'inherit', marginBottom: '10px' }}
                              rows={2}
                              placeholder="Mô tả lý do phân xử (ví dụ: Nhà thầu đồng ý hoàn tiền, hoặc Sản phẩm đã bàn giao đầy đủ đúng hẹn...)"
                              value={adminNotes}
                              onChange={e => setAdminNotes(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <button
                                className="btn btn--primary"
                                style={{ background: '#166534', color: '#fff', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
                                onClick={() => handleResolve(escrow.id, 'RELEASE')}
                                disabled={resolvingId === escrow.id}
                              >
                                <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }}></i>
                                Giải ngân cho nhà thầu
                              </button>
                              <button
                                className="btn"
                                style={{ background: '#ef4444', color: '#fff', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
                                onClick={() => handleResolve(escrow.id, 'REFUND')}
                                disabled={resolvingId === escrow.id}
                              >
                                <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: 6 }}></i>
                                Hoàn tiền cho khách hàng
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* resolved notes */}
                      {escrow.disputeResolution && (
                        <div style={{ marginTop: '1rem', padding: '0.85rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.83rem' }}>
                          <strong style={{ color: '#166534' }}><i className="fa-solid fa-gavel" style={{ marginRight: 6 }}></i>Nội dung phân xử tranh chấp:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#14532d' }}>"{escrow.disputeResolution}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ================= TAB 2: BANK WITHDRAWAL APPROVALS ================= */}
        {activeTab === 'withdraw' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(wf => (
                <button
                  key={wf}
                  onClick={() => setWithdrawFilter(wf)}
                  style={{
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: withdrawFilter === wf ? 'var(--color-primary)' : '#e2e8f0',
                    color: withdrawFilter === wf ? '#fff' : '#475569',
                    boxShadow: withdrawFilter === wf ? '0 4px 10px rgba(90,124,101,0.2)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {wf === 'ALL' && 'Tất cả'}
                  {wf === 'PENDING' && '⏳ Chờ phê duyệt'}
                  {wf === 'APPROVED' && '✅ Đã phê duyệt'}
                  {wf === 'REJECTED' && '❌ Đã từ chối'}
                </button>
              ))}
            </div>

            {filteredWithdraws.length === 0 ? (
              <div className="co-card" style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                <i className="fa-regular fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block' }}></i>
                Không tìm thấy yêu cầu rút tiền nào phù hợp bộ lọc.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredWithdraws.map(req => (
                  <div key={req.id} className="co-card" style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong>Yêu cầu rút tiền #WR-{req.id}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '10px' }}>Gửi lúc: {fmtDate(req.createdAt)}</span>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: req.status === 'PENDING' ? '#fef3c7' : req.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                        color: req.status === 'PENDING' ? '#b45309' : req.status === 'APPROVED' ? '#15803d' : '#991b1b',
                      }}>
                        {req.status === 'PENDING' && 'Chờ duyệt'}
                        {req.status === 'APPROVED' && 'Đã duyệt (Thành công)'}
                        {req.status === 'REJECTED' && 'Đã từ chối'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Thành viên: </span>
                        <strong>{req.user?.fullName}</strong> <span style={{ color: '#888' }}>(Role: {req.user?.role})</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Email: {req.user?.email}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Thông tin tài khoản nhận: </span>
                        <div><strong>Ngân hàng: </strong>{req.bankName}</div>
                        <div><strong>STK: </strong>{req.accountNumber}</div>
                        <div><strong>Chủ TK: </strong>{req.accountHolderName}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Số tiền yêu cầu rút: </span>
                        <h3 style={{ margin: '4px 0', color: '#b91c1c', fontSize: '1.25rem', fontWeight: 800 }}>{fmtVND(req.amount)}</h3>
                      </div>

                      {/* Action buttons for PENDING requests */}
                      {req.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn--primary"
                            style={{ background: '#166534', color: '#fff', fontSize: '0.78rem', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                            onClick={() => handleApproveWithdraw(req.id)}
                            disabled={processingWithdrawId === req.id}
                          >
                            <i className="fa-solid fa-check" style={{ marginRight: 4 }}></i> Phê duyệt
                          </button>
                          <button
                            className="btn"
                            style={{ background: '#ef4444', color: '#fff', fontSize: '0.78rem', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                            onClick={() => handleRejectWithdraw(req.id)}
                            disabled={processingWithdrawId === req.id}
                          >
                            <i className="fa-solid fa-xmark" style={{ marginRight: 4 }}></i> Từ chối
                          </button>
                        </div>
                      )}

                      {req.status !== 'PENDING' && req.processedAt && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div>Xử lý lúc:</div>
                          <strong>{fmtDate(req.processedAt)}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      {toast && (
        <div className={`co-toast co-toast--${toast.type}`} style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminEscrowDashboard;
