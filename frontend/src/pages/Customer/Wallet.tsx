import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customOrderService } from '../../services/customOrderService';
import '../../css/CustomOrder.css';

const fmtVND = (n: number) => {
  if (n === undefined || n === null) return '0đ';
  return n.toLocaleString('vi-VN') + 'đ';
};
const fmtDate = (s: string) => {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('vi-VN');
};

interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface WithdrawReq {
  id: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  processedAt?: string;
}

interface EscrowRecord {
  id: number;
  request: { id: number; title: string };
  contractor: { id: number; fullName: string };
  amount: number;
  commissionAmount: number;
  netAmount: number;
  status: 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
  paymentMethod: string;
  disputeReason?: string;
  createdAt: string;
  releasedAt?: string;
  refundedAt?: string;
}

const Wallet: React.FC = () => {
  const [wallet, setWallet] = useState<{ userId: number; fullName: string; walletBalance: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawReq[]>([]);
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wallet'|'escrow'>('wallet');

  // Dispute modal state
  const [disputingEscrow, setDisputingEscrow] = useState<EscrowRecord | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Confirm modal state
  const [confirmingRelease, setConfirmingRelease] = useState<EscrowRecord | null>(null);
  const [releaseSubmitting, setReleaseSubmitting] = useState(false);

  // Forms state
  const [depositAmt, setDepositAmt] = useState('');
  const [depositing, setDepositing] = useState(false);

  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAllData = async () => {
    try {
      const [wData, txData, wrData, escrowData] = await Promise.all([
        customOrderService.getWallet(),
        customOrderService.getWalletTransactions(),
        customOrderService.getWithdrawalRequests(),
        customOrderService.getMyEscrows().catch(() => []),
      ]);
      setWallet(wData);
      setTransactions(txData);
      setWithdrawRequests(wrData);
      setEscrows(escrowData);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu ví:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleDepositMock = async () => {
    if (!depositAmt || Number(depositAmt) <= 0) {
      showToast('Vui lòng nhập số tiền nạp hợp lệ', 'error');
      return;
    }
    setDepositing(true);
    try {
      await customOrderService.depositWalletMock(Number(depositAmt));
      showToast(`Đã nạp giả lập ${fmtVND(Number(depositAmt))} vào ví thành công!`, 'success');
      setDepositAmt('');
      fetchAllData();
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Nạp tiền thất bại', 'error');
    } finally {
      setDepositing(false);
    }
  };

  const handleDepositVNPay = async () => {
    if (!depositAmt || Number(depositAmt) <= 0) {
      showToast('Vui lòng nhập số tiền nạp hợp lệ', 'error');
      return;
    }
    setDepositing(true);
    try {
      const res = await customOrderService.depositWalletVNPay(Number(depositAmt));
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        showToast('Không kết nối được cổng VNPay', 'error');
      }
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Nạp tiền VNPay thất bại', 'error');
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdrawRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmt || Number(withdrawAmt) <= 0) {
      showToast('Vui lòng nhập số tiền rút hợp lệ', 'error');
      return;
    }
    const amt = Number(withdrawAmt);
    if (wallet && amt > wallet.walletBalance) {
      showToast('Số dư ví khả dụng không đủ', 'error');
      return;
    }
    if (!bankName.trim() || !accountNumber.trim() || !accountHolderName.trim()) {
      showToast('Vui lòng nhập đầy đủ thông tin ngân hàng nhận tiền', 'error');
      return;
    }

    setWithdrawing(true);
    try {
      await customOrderService.createWithdrawalRequest(
        amt, 
        bankName.trim(), 
        accountNumber.trim(), 
        accountHolderName.trim()
      );
      showToast(`Đã gửi yêu cầu rút ${fmtVND(amt)}. Vui lòng chờ Admin phê duyệt!`, 'success');
      setWithdrawAmt('');
      setBankName('');
      setAccountNumber('');
      setAccountHolderName('');
      fetchAllData();
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Tạo yêu cầu rút tiền thất bại', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  // ── Xác nhận hoàn thành đơn hàng → giải ngân ──────────────────
  const handleConfirmRelease = async () => {
    if (!confirmingRelease) return;
    setReleaseSubmitting(true);
    try {
      await customOrderService.releaseEscrow(confirmingRelease.request.id);
      showToast('Đã xác nhận! Admin sẽ kiểm duyệt và giải ngân cho nhà thầu sớm nhất.', 'success');
      setConfirmingRelease(null);
      fetchAllData();
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Xác nhận thất bại', 'error');
    } finally {
      setReleaseSubmitting(false);
    }
  };

  // ── Gửi khiếu nại ─────────────────────────────────────────────
  const handleSubmitDispute = async () => {
    if (!disputingEscrow) return;
    if (!disputeReason.trim()) {
      showToast('Vui lòng nhập lý do khiếu nại', 'error'); return;
    }
    setDisputeSubmitting(true);
    try {
      await customOrderService.disputeEscrow(disputingEscrow.request.id, disputeReason.trim());
      showToast('Đã gửi khiếu nại! Admin sẽ xem xét và phân xử trong 1–3 ngày làm việc.', 'success');
      setDisputingEscrow(null);
      setDisputeReason('');
      fetchAllData();
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Gửi khiếu nại thất bại', 'error');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  if (loading) return <div className="co-page"><div className="co-loading"><div className="co-spinner"></div></div></div>;
  if (!wallet) return <div className="co-page"><div className="co-container"><p>Không thể lấy thông tin ví. Vui lòng đăng nhập lại.</p></div></div>;

  return (
    <div className="co-page" style={{ paddingTop: '5.5rem', minHeight: '80vh' }}>
      <div className="co-container--wide">
        
        {/* Breadcrumb */}
        <div className="co-breadcrumb" style={{ marginBottom: '1.5rem' }}>
          <Link to="/">Trang chủ</Link>
          <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem', margin: '0 8px' }}></i>
          <span>Ví tiền & Giao dịch</span>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:8, marginBottom:'1.5rem', background:'#f1f5f9', padding:4, borderRadius:12, width:'fit-content' }}>
          <button onClick={() => setActiveTab('wallet')} style={{
            border:'none', padding:'9px 22px', borderRadius:9, cursor:'pointer', fontWeight:600, fontSize:'0.85rem', fontFamily:'inherit',
            background: activeTab==='wallet' ? '#fff' : 'transparent',
            color: activeTab==='wallet' ? '#3d5c49' : '#64748b',
            boxShadow: activeTab==='wallet' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition:'all 0.2s'
          }}>
            <i className="fa-solid fa-wallet" style={{ marginRight:6 }}/>Ví Tiền
          </button>
          <button onClick={() => setActiveTab('escrow')} style={{
            border:'none', padding:'9px 22px', borderRadius:9, cursor:'pointer', fontWeight:600, fontSize:'0.85rem', fontFamily:'inherit',
            background: activeTab==='escrow' ? '#fff' : 'transparent',
            color: activeTab==='escrow' ? '#3d5c49' : '#64748b',
            boxShadow: activeTab==='escrow' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition:'all 0.2s'
          }}>
            <i className="fa-solid fa-shield-halved" style={{ marginRight:6 }}/>Đơn Tạm Giữ
            {escrows.filter(e => e.status === 'DISPUTED').length > 0 && (
              <span style={{ background:'#dc2626', color:'#fff', borderRadius:10, padding:'1px 7px', fontSize:'0.7rem', marginLeft:6 }}>
                {escrows.filter(e => e.status === 'DISPUTED').length}
              </span>
            )}
            {escrows.filter(e => e.status === 'COMPLETED_BY_CONTRACTOR' as any).length > 0 && (
              <span style={{ background:'#16a34a', color:'#fff', borderRadius:10, padding:'1px 7px', fontSize:'0.7rem', marginLeft:6 }}>
                Cần xác nhận
              </span>
            )}
          </button>
        </div>

        {activeTab === 'wallet' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* LEFT COLUMN: BALANCE & FORMS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Glassmorphic Wallet Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              color: '#fff',
              borderRadius: '24px',
              padding: '2rem 1.75rem',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '250px',
                height: '250px',
                background: 'radial-gradient(circle, rgba(90,124,101,0.25) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%'
              }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <div>
                  <p style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Tài khoản ví</p>
                  <h3 style={{ fontSize: '1.1rem', margin: '4px 0 0 0', fontWeight: 700 }}>{wallet.fullName}</h3>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '10px', fontSize: '1.1rem' }}>
                  <i className="fa-solid fa-wallet" style={{ color: '#86efac' }}></i>
                </div>
              </div>

              <div style={{ marginTop: '2rem', position: 'relative', zIndex: 2 }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Số dư ví khả dụng</p>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '5px 0 0 0', color: '#86efac' }}>
                  {fmtVND(wallet.walletBalance)}
                </h1>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: '#94a3b8', position: 'relative', zIndex: 2 }}>
                <span>TTTH Furniture E-Wallet</span>
                <span>Mã ví: #{wallet.userId}</span>
              </div>
            </div>

            {/* Deposit Form */}
            <div className="co-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <h3 className="co-card-title" style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-plus" style={{ color: 'var(--color-primary)' }}></i>
                Nạp tiền vào ví điện tử
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, marginBottom: '1rem' }}>
                Nạp tiền vào ví để đặt cọc nhanh chóng cho các báo giá đơn hàng thiết kế theo yêu cầu.
              </p>
              
              <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                <div className="co-input-prefix" style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>VNĐ</span>
                  <input 
                    type="number" 
                    placeholder="Nhập số tiền nạp (ví dụ: 1000000)" 
                    className="co-input" 
                    value={depositAmt}
                    onChange={e => setDepositAmt(e.target.value)}
                    style={{ paddingLeft: '50px', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={handleDepositVNPay}
                    className="btn btn--primary" 
                    style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem', borderRadius: '8px' }}
                    disabled={depositing}
                  >
                    <i className="fa-solid fa-credit-card" style={{ marginRight: 6 }}></i>
                    Cổng VNPay
                  </button>
                  <button 
                    onClick={handleDepositMock}
                    className="btn btn--outline" 
                    style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem', borderRadius: '8px', border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)' }}
                    disabled={depositing}
                  >
                    <i className="fa-solid fa-flask" style={{ marginRight: 6 }}></i>
                    Giả lập (Mock)
                  </button>
                </div>
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="co-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <h3 className="co-card-title" style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-building-columns" style={{ color: 'var(--color-primary)' }}></i>
                Yêu cầu rút tiền về Ngân hàng
              </h3>
              
              <form onSubmit={handleWithdrawRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Tên Ngân hàng:</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Vietcombank, Techcombank..." 
                    className="co-input" 
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    style={{ borderRadius: '8px' }}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Số Tài khoản:</label>
                    <input 
                      type="text" 
                      placeholder="Số tài khoản nhận tiền" 
                      className="co-input" 
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Tên Chủ tài khoản:</label>
                    <input 
                      type="text" 
                      placeholder="Tên viết hoa không dấu" 
                      className="co-input" 
                      value={accountHolderName}
                      onChange={e => setAccountHolderName(e.target.value)}
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Số tiền rút (VND):</label>
                  <input 
                    type="number" 
                    placeholder="Nhập số tiền muốn rút" 
                    className="co-input" 
                    value={withdrawAmt}
                    onChange={e => setWithdrawAmt(e.target.value)}
                    style={{ borderRadius: '8px' }}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn--primary" 
                  style={{ width: '100%', padding: '11px 0', fontSize: '0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: '4px' }}
                  disabled={withdrawing}
                >
                  {withdrawing ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu rút tiền'}
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT COLUMN: HISTORY TABLES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Transactions Ledger */}
            <div className="co-card" style={{ padding: '1.25rem', borderRadius: '16px', minHeight: '300px' }}>
              <h3 className="co-card-title" style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
                <i className="fa-solid fa-list-check" style={{ marginRight: 6, color: 'var(--color-primary)' }}></i>
                Lịch sử giao dịch ví gần đây
              </h3>

              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Chưa ghi nhận biến động số dư nào.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '8px 4px' }}>Thời gian</th>
                        <th style={{ padding: '8px 4px' }}>Nội dung</th>
                        <th style={{ padding: '8px 4px', textAlign: 'right' }}>Số tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map(tx => {
                        const isPositive = tx.type === 'DEPOSIT' || tx.type === 'ESCROW_REFUND' || tx.type === 'ESCROW_RELEASE';
                        return (
                          <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 4px', color: '#64748b', whiteSpace: 'nowrap' }}>{fmtDate(tx.createdAt)}</td>
                            <td style={{ padding: '10px 4px', color: '#334155', fontWeight: 500 }}>{tx.description}</td>
                            <td style={{ 
                              padding: '10px 4px', 
                              textAlign: 'right', 
                              fontWeight: 700, 
                              color: isPositive ? '#166534' : '#991b1b' 
                            }}>
                              {isPositive ? '+' : ''}{fmtVND(tx.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Withdrawal Requests Status */}
            <div className="co-card" style={{ padding: '1.25rem', borderRadius: '16px', minHeight: '250px' }}>
              <h3 className="co-card-title" style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 6, color: 'var(--color-primary)' }}></i>
                Trạng thái yêu cầu rút tiền
              </h3>

              {withdrawRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Chưa gửi yêu cầu rút tiền nào.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '8px 4px' }}>Thời gian</th>
                        <th style={{ padding: '8px 4px' }}>Ngân hàng</th>
                        <th style={{ padding: '8px 4px' }}>Số tiền</th>
                        <th style={{ padding: '8px 4px', textAlign: 'right' }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawRequests.map(req => (
                        <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 4px', color: '#64748b' }}>{fmtDate(req.createdAt)}</td>
                          <td style={{ padding: '10px 4px', color: '#334155' }}>
                            <div><strong>{req.bankName}</strong></div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{req.accountNumber}</div>
                          </td>
                          <td style={{ padding: '10px 4px', fontWeight: 600, color: '#334155' }}>{fmtVND(req.amount)}</td>
                          <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: req.status === 'PENDING' ? '#fef3c7' : req.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                              color: req.status === 'PENDING' ? '#b45309' : req.status === 'APPROVED' ? '#15803d' : '#991b1b',
                            }}>
                              {req.status === 'PENDING' && 'Chờ duyệt'}
                              {req.status === 'APPROVED' && 'Thành công'}
                              {req.status === 'REJECTED' && 'Bị từ chối'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
        )}

        {/* ═══ TAB ESCROW ═══ */}
        {activeTab === 'escrow' && (
          <div>
            {escrows.length === 0 ? (
              <div style={{ textAlign:'center', padding:'4rem', color:'#94a3b8' }}>
                <i className="fa-solid fa-shield-halved" style={{ fontSize:'2.5rem', display:'block', marginBottom:12, opacity:0.3 }}/>
                Chưa có đơn hàng tạm giữ nào.
              </div>
            ) : escrows.map(esc => {
              const statusMap: Record<string, {label:string;bg:string;color:string}> = {
                PENDING:   {label:'⏳ Chờ thanh toán',        bg:'#fef3c7', color:'#b45309'},
                HELD:      {label:'🔒 Tiền đang tạm giữ',      bg:'#dbeafe', color:'#1e40af'},
                AWAITING_RELEASE: {label:'⏳ Chờ admin giải ngân', bg:'#dcfce7', color:'#166534'},
                RELEASED:  {label:'✅ Đã giải ngân',            bg:'#dcfce7', color:'#166534'},
                REFUNDED:  {label:'↩️ Đã hoàn tiền',            bg:'#f3e8ff', color:'#7e22ce'},
                DISPUTED:  {label:'⚠️ Đang khiếu nại',         bg:'#fee2e2', color:'#991b1b'},
              };
              const s = statusMap[esc.status] ?? {label: esc.status, bg:'#f1f5f9', color:'#64748b'};
              const needConfirm = (esc.status as string) === 'COMPLETED_BY_CONTRACTOR';
              return (
                <div key={esc.id} style={{ border:`2px solid ${esc.status==='DISPUTED'?'#fca5a5':needConfirm?'#86efac':'#e2e8f0'}`, borderRadius:14, marginBottom:16, overflow:'hidden' }}>
                  {/* Header */}
                  <div style={{ background: needConfirm?'#f0fdf4':esc.status==='DISPUTED'?'#fef2f2':'#f8fafc', padding:'12px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                    <div>
                      <strong>ESC-{esc.id}</strong>
                      <span style={{ color:'#64748b', fontSize:'0.82rem', marginLeft:10 }}>
                        Đơn #{esc.request?.id} — {esc.request?.title}
                      </span>
                    </div>
                    <span style={{ ...s, padding:'3px 12px', borderRadius:20, fontSize:'0.78rem', fontWeight:700 }}>{needConfirm ? '🚚 Nhà thầu đã giao — Cần xác nhận' : s.label}</span>
                  </div>
                  {/* Body */}
                  <div style={{ padding:'14px 18px' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:'8px 20px', fontSize:'0.85rem', marginBottom:12 }}>
                      <div><span style={{color:'#64748b'}}>Nhà thầu: </span><strong>{esc.contractor?.fullName}</strong></div>
                      <div><span style={{color:'#64748b'}}>Tổng đơn: </span><strong style={{color:'#dc2626'}}>{fmtVND(esc.amount)}</strong></div>
                      <div><span style={{color:'#64748b'}}>Hoa hồng platform: </span><span style={{color:'#d97706'}}>{fmtVND(esc.commissionAmount)} (5%)</span></div>
                      <div><span style={{color:'#64748b'}}>Nhà thầu nhận: </span><strong style={{color:'#16a34a'}}>{fmtVND(esc.netAmount)}</strong></div>
                      <div><span style={{color:'#64748b'}}>Thanh toán: </span>{esc.paymentMethod||'—'}</div>
                      <div><span style={{color:'#64748b'}}>Ngày tạo: </span>{fmtDate(esc.createdAt)}</div>
                      {esc.releasedAt && <div><span style={{color:'#64748b'}}>Giải ngân: </span>{fmtDate(esc.releasedAt)}</div>}
                      {esc.refundedAt && <div><span style={{color:'#64748b'}}>Hoàn tiền: </span>{fmtDate(esc.refundedAt)}</div>}
                    </div>
                    {/* Nhà thầu đã giao → khách xác nhận hoặc khiếu nại */}
                    {needConfirm && (
                      <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:10, padding:'14px', marginTop:8 }}>
                        <p style={{ margin:'0 0 12px', fontWeight:600, color:'#166534', fontSize:'0.9rem' }}>
                          <i className="fa-solid fa-truck-ramp-box" style={{marginRight:8}}/>Nhà thầu báo đã hoàn thành và bàn giao. Bạn đã nhận được sản phẩm chưa?
                        </p>
                        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                          <button className="btn btn--primary" style={{ background:'#166534', color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}
                            onClick={() => setConfirmingRelease(esc)}>
                            <i className="fa-solid fa-circle-check" style={{marginRight:6}}/>Xác nhận đã nhận hàng
                          </button>
                          <button style={{ background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}
                            onClick={() => setDisputingEscrow(esc)}>
                            <i className="fa-solid fa-triangle-exclamation" style={{marginRight:6}}/>Có vấn đề → Khiếu nại
                          </button>
                        </div>
                        <p style={{ margin:'10px 0 0', fontSize:'0.78rem', color:'#64748b' }}>
                          <i className="fa-solid fa-circle-info" style={{marginRight:4}}/>Sau khi xác nhận, Admin sẽ kiểm duyệt và giải ngân tiền cho nhà thầu.
                        </p>
                      </div>
                    )}
                    {/* Đang tạm giữ → có thể khiếu nại */}
                    {esc.status === 'HELD' && (
                      <div style={{ marginTop:8, textAlign:'right' }}>
                        <button style={{ background:'transparent', color:'#dc2626', border:'1px solid #fca5a5', padding:'6px 14px', borderRadius:7, cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }}
                          onClick={() => setDisputingEscrow(esc)}>
                          <i className="fa-solid fa-flag" style={{marginRight:6}}/>Mở khiếu nại
                        </button>
                      </div>
                    )}
                    {/* Chờ admin giải ngân */}
                    {esc.status === 'AWAITING_RELEASE' && (
                      <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:8, padding:'10px 14px', marginTop:8, fontSize:'0.85rem' }}>
                        <strong style={{color:'#166534'}}><i className="fa-solid fa-clock" style={{marginRight:6}}/>Đang chờ Admin giải ngân</strong>
                        <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:'0.78rem' }}>Bạn đã xác nhận nhận hàng. Admin sẽ kiểm duyệt và chuyển tiền cho nhà thầu trong thời gian sớm nhất.</p>
                      </div>
                    )}
                    {/* Đang tranh chấp */}
                    {esc.status === 'DISPUTED' && (
                      <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', marginTop:8, fontSize:'0.85rem' }}>
                        <strong style={{color:'#991b1b'}}><i className="fa-solid fa-clock" style={{marginRight:6}}/>Khiếu nại đang chờ Admin xử lý</strong>
                        <p style={{ margin:'4px 0 0', color:'#b91c1c', fontStyle:'italic' }}>Lý do: "{esc.disputeReason}"</p>
                        <p style={{ margin:'6px 0 0', color:'#64748b', fontSize:'0.78rem' }}>Admin sẽ liên hệ và phân xử trong 1–3 ngày làm việc.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ═══ MODAL: Xác nhận đã nhận hàng ═══ */}
      {confirmingRelease && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={() => setConfirmingRelease(null)}>
          <div style={{ background:'#fff', borderRadius:16, padding:'28px', maxWidth:460, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize:'3rem', color:'#16a34a', display:'block', marginBottom:12 }}/>
              <h3 style={{ margin:0, fontFamily:'Playfair Display, serif', fontSize:'1.2rem' }}>Xác nhận đã nhận hàng</h3>
            </div>
            <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:10, padding:'14px', marginBottom:20, fontSize:'0.88rem' }}>
              <div><strong>Đơn hàng:</strong> {confirmingRelease.request?.title}</div>
              <div style={{ marginTop:6 }}><strong>Số tiền escrow:</strong> <span style={{color:'#16a34a', fontWeight:700}}>{fmtVND(confirmingRelease.amount)}</span></div>
            </div>
            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:'0.85rem', color:'#92400e' }}>
              <i className="fa-solid fa-circle-info" style={{marginRight:6}}/>
              Sau khi xác nhận, Admin sẽ kiểm tra và <strong>giải ngân tiền cho nhà thầu</strong> trong thời gian sớm nhất. Tiền hiện vẫn được giữ an toàn cho đến khi Admin giải ngân.
            </div>
            <p style={{ fontSize:'0.85rem', color:'#64748b', marginBottom:20, textAlign:'center' }}>
              Bạn có chắc đã nhận được sản phẩm đúng như yêu cầu?
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, padding:'11px', background:'#166534', color:'#fff', border:'none', borderRadius:9, fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}
                onClick={handleConfirmRelease} disabled={releaseSubmitting}>
                {releaseSubmitting ? 'Đang xử lý...' : '✅ Xác nhận đã nhận hàng'}
              </button>
              <button style={{ flex:1, padding:'11px', background:'#f1f5f9', color:'#475569', border:'none', borderRadius:9, fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}
                onClick={() => setConfirmingRelease(null)}>
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Khiếu nại ═══ */}
      {disputingEscrow && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={() => setDisputingEscrow(null)}>
          <div style={{ background:'#fff', borderRadius:16, padding:'28px', maxWidth:500, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <i className="fa-solid fa-flag" style={{ fontSize:'3rem', color:'#dc2626', display:'block', marginBottom:12 }}/>
              <h3 style={{ margin:0, fontFamily:'Playfair Display, serif', fontSize:'1.2rem' }}>Gửi Khiếu Nại</h3>
              <p style={{ color:'#64748b', fontSize:'0.85rem', margin:'8px 0 0' }}>Đơn: {disputingEscrow.request?.title}</p>
            </div>
            <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:10, padding:'12px 14px', marginBottom:16, fontSize:'0.83rem', color:'#92400e' }}>
              <i className="fa-solid fa-circle-info" style={{marginRight:6}}/>
              Khiếu nại sẽ tạm dừng giao dịch. Admin sẽ xem xét và liên hệ cả hai bên trong <strong>1–3 ngày làm việc</strong>. Tiền vẫn được giữ an toàn cho đến khi có phán quyết.
            </div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.85rem', color:'#374151', marginBottom:8 }}>
              Mô tả vấn đề gặp phải: <span style={{color:'#dc2626'}}>*</span>
            </label>
            <textarea rows={4} style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:9, fontSize:'0.85rem', fontFamily:'inherit', resize:'vertical', outline:'none', marginBottom:16 }}
              placeholder="Ví dụ: Sản phẩm không đúng như mô tả, bị hư hỏng khi nhận hàng, nhà thầu không liên lạc được..."
              value={disputeReason} onChange={e => setDisputeReason(e.target.value)} />
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, padding:'11px', background:'#dc2626', color:'#fff', border:'none', borderRadius:9, fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}
                onClick={handleSubmitDispute} disabled={disputeSubmitting || !disputeReason.trim()}>
                {disputeSubmitting ? 'Đang gửi...' : '⚠️ Gửi khiếu nại'}
              </button>
              <button style={{ flex:1, padding:'11px', background:'#f1f5f9', color:'#475569', border:'none', borderRadius:9, fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}
                onClick={() => { setDisputingEscrow(null); setDisputeReason(''); }}>
                Huỷ
              </button>
            </div>
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

export default Wallet;
