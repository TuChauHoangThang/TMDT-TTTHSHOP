import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customOrderService } from '../../services/customOrderService';
import '../../css/CustomOrder.css';

const fmtVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const fmtDate = (s: string) => new Date(s).toLocaleString('vi-VN');

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

const Wallet: React.FC = () => {
  const [wallet, setWallet] = useState<{ userId: number; fullName: string; walletBalance: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawReq[]>([]);
  const [loading, setLoading] = useState(true);

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
      const wData = await customOrderService.getWallet();
      setWallet(wData);
      
      const txData = await customOrderService.getWalletTransactions();
      setTransactions(txData);

      const wrData = await customOrderService.getWithdrawalRequests();
      setWithdrawRequests(wrData);
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

      </div>

      {toast && (
        <div className={`co-toast co-toast--${toast.type}`} style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default Wallet;
