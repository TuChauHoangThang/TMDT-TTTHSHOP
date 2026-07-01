import React, { useState, useEffect } from 'react';
import { customOrderService } from '../../services/customOrderService';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination/Pagination';
import '../../css/CustomOrder.css';

const fmtVND = (n: number) => (n ?? 0).toLocaleString('vi-VN') + 'đ';
const fmtDate = (s: string) => s ? new Date(s).toLocaleString('vi-VN') : '—';

type Tab = 'escrow' | 'withdraw' | 'commission';

interface EscrowRecord {
  id: number;
  request: { id: number; title: string; description: string };
  customer: { id: number; fullName: string };
  contractor: { id: number; fullName: string };
  amount: number;
  commissionAmount: number;
  netAmount: number;
  commissionRate: number;
  status: 'PENDING' | 'HELD' | 'AWAITING_RELEASE' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
  paymentMethod: string;
  disputeReason?: string;
  disputeResolution?: string;
  createdAt: string;
  releasedAt?: string;
  refundedAt?: string;
}

interface WithdrawReq {
  id: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: { id: number; fullName: string; email: string; role: string };
  createdAt: string;
  processedAt?: string;
}

interface CommissionStats {
  totalCommissionEarned: number;
  totalReleasedEscrows: number;
  commissionRate: number;
  adminWalletBalance: number;
  recentCommissions: Array<{
    escrowId: number; requestId: number; requestTitle: string;
    amount: number; commissionAmount: number; netAmount: number;
    contractorName: string; customerName: string; releasedAt: string;
  }>;
}

const statusLabel: Record<string, string> = {
  PENDING: '⏳ Chờ thanh toán', HELD: '🔒 Đang tạm giữ',
  AWAITING_RELEASE: '✅ Chờ admin giải ngân',
  RELEASED: '💰 Đã giải ngân', REFUNDED: '↩️ Đã hoàn tiền', DISPUTED: '⚠️ Tranh chấp'
};
const statusColor: Record<string, {bg: string; color: string}> = {
  PENDING: {bg:'#fef3c7', color:'#b45309'}, HELD: {bg:'#dbeafe', color:'#1e40af'},
  AWAITING_RELEASE: {bg:'#dcfce7', color:'#166534'},
  RELEASED: {bg:'#f0fdf4', color:'#15803d'}, REFUNDED: {bg:'#f3e8ff', color:'#7e22ce'},
  DISPUTED: {bg:'#fee2e2', color:'#991b1b'}
};

const AdminEscrowDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('escrow');
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [withdraws, setWithdraws] = useState<WithdrawReq[]>([]);
  const [commission, setCommission] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [withdrawFilter, setWithdrawFilter] = useState<string>('ALL');
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processingWithdrawId, setProcessingWithdrawId] = useState<number | null>(null);
  const [releasingId, setReleasingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{msg: string; type: 'success'|'error'}|null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({msg, type}); setTimeout(() => setToast(null), 4000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [e, w, c] = await Promise.all([
        customOrderService.getAllEscrows(),
        customOrderService.getAllWithdrawRequestsAdmin(),
        customOrderService.getCommissionStats(),
      ]);
      setEscrows(e); setWithdraws(w); setCommission(c);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || err?.message || 'Unknown error';
      console.error('AdminEscrow load error:', status, msg);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleAdminRelease = async (escrowId: number, netAmt: number, commission: number) => {
    if (!window.confirm(`Xác nhận giải ngân:\n• Nhà thầu nhận: ${fmtVND(netAmt)}\n• Hoa hồng platform (5%): ${fmtVND(commission)}\n\nHành động này không thể hoàn tác!`)) return;
    setReleasingId(escrowId);
    try {
      await customOrderService.adminReleaseEscrow(escrowId);
      showToast(`Đã giải ngân ${fmtVND(netAmt)} cho nhà thầu. Hoa hồng ${fmtVND(commission)} đã vào ví platform.`);
      loadAll();
    } catch (err: any) { showToast(err?.response?.data?.error || 'Giải ngân thất bại', 'error'); }
    finally { setReleasingId(null); }
  };

  const handleResolve = async (escrowId: number, resolution: 'RELEASE' | 'REFUND') => {
    if (!adminNotes.trim()) { alert('Vui lòng nhập ghi chú phân xử'); return; }
    const label = resolution === 'RELEASE' ? 'GIẢI NGÂN cho Nhà thầu (trừ 5% hoa hồng)' : 'HOÀN TIỀN đầy đủ cho Khách hàng';
    if (!window.confirm(`Xác nhận: ${label}?`)) return;
    setResolvingId(escrowId);
    try {
      await customOrderService.resolveDispute(escrowId, resolution, adminNotes);
      showToast(resolution === 'RELEASE' ? 'Đã giải ngân thành công (trừ 5% hoa hồng)!' : 'Đã hoàn tiền đầy đủ cho khách hàng!');
      setAdminNotes(''); loadAll();
    } catch (err: any) { showToast(err?.response?.data?.error || 'Xử lý thất bại', 'error'); }
    finally { setResolvingId(null); }
  };

  const handleApproveWithdraw = async (id: number) => {
    if (!window.confirm('Xác nhận đã chuyển khoản ngân hàng và phê duyệt?')) return;
    setProcessingWithdrawId(id);
    try {
      await customOrderService.approveWithdrawalAdmin(id);
      showToast('Phê duyệt thành công!'); loadAll();
    } catch (err: any) { showToast(err?.response?.data?.error || 'Phê duyệt thất bại', 'error'); }
    finally { setProcessingWithdrawId(null); }
  };

  const handleRejectWithdraw = async (id: number) => {
    if (!window.confirm('Từ chối và hoàn tiền lại ví người dùng?')) return;
    setProcessingWithdrawId(id);
    try {
      await customOrderService.rejectWithdrawalAdmin(id);
      showToast('Đã từ chối và hoàn tiền lại ví!'); loadAll();
    } catch (err: any) { showToast(err?.response?.data?.error || 'Thất bại', 'error'); }
    finally { setProcessingWithdrawId(null); }
  };

  const filteredEscrows = escrows.filter(e => filter === 'ALL' || e.status === filter);
  const filteredWithdraws = withdraws.filter(w => withdrawFilter === 'ALL' || w.status === withdrawFilter);

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',gap:12,color:'#64748b'}}>
      <i className="fa-solid fa-spinner fa-spin" style={{fontSize:'1.5rem'}}/> Đang tải dữ liệu...
    </div>
  );

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản Trị Ví & Escrow</h1>
        <p>Giải ngân, xử lý tranh chấp, duyệt rút tiền và theo dõi hoa hồng platform</p>
      </div>

      {/* ── Summary Stats ── */}
      <div className="admin-stat-grid" style={{marginBottom:20}}>
        <div className="admin-stat-card stat-blue">
          <div className="stat-icon-wrap bg-blue"><i className="fa-solid fa-lock"/></div>
          <div className="stat-info">
            <div className="stat-value">{escrows.filter(e=>e.status==='HELD').length}</div>
            <div className="stat-label">Đang tạm giữ</div>
          </div>
        </div>
        <div className="admin-stat-card stat-green">
          <div className="stat-icon-wrap bg-green"><i className="fa-solid fa-circle-check"/></div>
          <div className="stat-info">
            <div className="stat-value">{escrows.filter(e=>e.status==='AWAITING_RELEASE').length}</div>
            <div className="stat-label">Chờ admin giải ngân</div>
          </div>
        </div>
        <div className="admin-stat-card stat-red">
          <div className="stat-icon-wrap bg-red"><i className="fa-solid fa-triangle-exclamation"/></div>
          <div className="stat-info">
            <div className="stat-value">{escrows.filter(e=>e.status==='DISPUTED').length}</div>
            <div className="stat-label">Tranh chấp cần xử lý</div>
          </div>
        </div>
        <div className="admin-stat-card stat-gold">
          <div className="stat-icon-wrap bg-gold"><i className="fa-solid fa-building-columns"/></div>
          <div className="stat-info">
            <div className="stat-value">{withdraws.filter(w=>w.status==='PENDING').length}</div>
            <div className="stat-label">Yêu cầu rút tiền chờ duyệt</div>
          </div>
        </div>
        <div className="admin-stat-card stat-green">
          <div className="stat-icon-wrap bg-green"><i className="fa-solid fa-sack-dollar"/></div>
          <div className="stat-info">
            <div className="stat-value" style={{fontSize:'1.3rem'}}>{fmtVND(commission?.totalCommissionEarned ?? 0)}</div>
            <div className="stat-label">Tổng hoa hồng đã thu</div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{display:'flex',gap:8,marginBottom:20,background:'#f1f5f9',padding:4,borderRadius:12,width:'fit-content'}}>
        {([['escrow','fa-gavel','Escrow & Tranh Chấp'],['withdraw','fa-building-columns','Rút Tiền'],['commission','fa-sack-dollar','Hoa Hồng Platform']] as const).map(([tab, icon, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab as Tab)} style={{
            border:'none', padding:'9px 20px', borderRadius:9, cursor:'pointer', fontWeight:600, fontSize:'0.85rem', fontFamily:'inherit',
            background: activeTab===tab ? '#fff' : 'transparent',
            color: activeTab===tab ? '#1d4ed8' : '#64748b',
            boxShadow: activeTab===tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition:'all 0.2s'
          }}>
            <i className={`fa-solid ${icon}`} style={{marginRight:6}}/>{label}
            {tab==='escrow' && escrows.filter(e=>e.status==='DISPUTED').length > 0 &&
              <span style={{background:'#dc2626',color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:'0.7rem',marginLeft:6}}>{escrows.filter(e=>e.status==='DISPUTED').length}</span>}
            {tab==='withdraw' && withdraws.filter(w=>w.status==='PENDING').length > 0 &&
              <span style={{background:'#d97706',color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:'0.7rem',marginLeft:6}}>{withdraws.filter(w=>w.status==='PENDING').length}</span>}
          </button>
        ))}
      </div>

      {/* ═══════════ TAB 1: ESCROW ═══════════ */}
      {activeTab === 'escrow' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title"><i className="fa-solid fa-gavel"/>Danh sách Escrow ({filteredEscrows.length})</h3>
          </div>
          {/* Filter */}
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
            {['ALL','PENDING','HELD','AWAITING_RELEASE','DISPUTED','RELEASED','REFUNDED'].map(f => (
              <button key={f} onClick={()=>setFilter(f)} className={`admin-btn admin-btn-sm ${filter===f?'admin-btn-primary':'admin-btn-ghost'}`}>
                {f==='ALL'?'Tất cả':statusLabel[f]}
              </button>
            ))}
          </div>
          {filteredEscrows.length === 0 ? (
            <div className="admin-empty"><i className="fa-solid fa-folder-open"/>Không có dữ liệu</div>
          ) : filteredEscrows.map(escrow => (
            <div key={escrow.id} style={{
              border: `2px solid ${escrow.status==='DISPUTED'?'#fca5a5':'#e2e8f0'}`,
              borderRadius:12, marginBottom:16, overflow:'hidden'
            }}>
              {/* Card header */}
              <div style={{background:escrow.status==='DISPUTED'?'#fef2f2':'#f8fafc',padding:'12px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                <div>
                  <strong>ESC-{escrow.id}</strong>
                  <span style={{color:'#64748b',fontSize:'0.82rem',marginLeft:12}}>
                    Đơn #{escrow.request?.id} — {escrow.request?.title}
                  </span>
                </div>
                <span style={{...statusColor[escrow.status],padding:'3px 12px',borderRadius:20,fontSize:'0.78rem',fontWeight:700}}>
                  {statusLabel[escrow.status]}
                </span>
              </div>
              {/* Card body */}
              <div style={{padding:'14px 18px'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'10px 20px',fontSize:'0.85rem',marginBottom:10}}>
                  <div><span style={{color:'#64748b'}}>Khách hàng: </span><strong>{escrow.customer?.fullName}</strong></div>
                  <div><span style={{color:'#64748b'}}>Nhà thầu: </span><strong>{escrow.contractor?.fullName}</strong></div>
                  <div><span style={{color:'#64748b'}}>Tổng đơn: </span><strong style={{color:'#dc2626'}}>{fmtVND(escrow.amount)}</strong></div>
                  <div><span style={{color:'#64748b'}}>Hoa hồng (5%): </span><strong style={{color:'#d97706'}}>{fmtVND(escrow.commissionAmount)}</strong></div>
                  <div><span style={{color:'#64748b'}}>Nhà thầu nhận: </span><strong style={{color:'#16a34a'}}>{fmtVND(escrow.netAmount)}</strong></div>
                  <div><span style={{color:'#64748b'}}>Thanh toán: </span><strong>{escrow.paymentMethod||'—'}</strong></div>
                  <div><span style={{color:'#64748b'}}>Ngày tạo: </span>{fmtDate(escrow.createdAt)}</div>
                  {escrow.releasedAt && <div><span style={{color:'#64748b'}}>Giải ngân: </span>{fmtDate(escrow.releasedAt)}</div>}
                  {escrow.refundedAt && <div><span style={{color:'#64748b'}}>Hoàn tiền: </span>{fmtDate(escrow.refundedAt)}</div>}
                </div>
                {/* AWAITING_RELEASE: Admin giải ngân */}
                {escrow.status === 'AWAITING_RELEASE' && (
                  <div style={{background:'#f0fdf4',border:'2px solid #86efac',borderRadius:10,padding:'14px',marginTop:8}}>
                    <div style={{fontWeight:700,color:'#166534',marginBottom:10,fontSize:'0.9rem'}}>
                      <i className="fa-solid fa-circle-check" style={{marginRight:8}}/>
                      Khách hàng đã xác nhận nhận hàng — Sẵn sàng giải ngân
                    </div>
                    <div style={{display:'flex',gap:8,fontSize:'0.85rem',marginBottom:12,background:'#dcfce7',padding:'10px 12px',borderRadius:8}}>
                      <div style={{flex:1}}><span style={{color:'#64748b'}}>Nhà thầu nhận: </span><strong style={{color:'#166534'}}>{fmtVND(escrow.netAmount)}</strong></div>
                      <div style={{flex:1}}><span style={{color:'#64748b'}}>Hoa hồng (5%): </span><strong style={{color:'#d97706'}}>{fmtVND(escrow.commissionAmount)}</strong></div>
                    </div>
                    <button
                      className="admin-btn admin-btn-success"
                      style={{width:'100%',justifyContent:'center',padding:'11px'}}
                      disabled={releasingId === escrow.id}
                      onClick={() => handleAdminRelease(escrow.id, escrow.netAmount, escrow.commissionAmount)}
                    >
                      {releasingId === escrow.id
                        ? <><i className="fa-solid fa-spinner fa-spin"/>Đang xử lý...</>
                        : <><i className="fa-solid fa-paper-plane"/>Giải ngân {fmtVND(escrow.netAmount)} cho nhà thầu</>
                      }
                    </button>
                  </div>
                )}

                {/* Disputed: phân xử */}
                {escrow.status === 'DISPUTED' && (
                  <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,padding:'12px 14px',marginTop:8}}>
                    <div style={{marginBottom:8}}>
                      <strong style={{color:'#b45309'}}><i className="fa-solid fa-triangle-exclamation" style={{marginRight:6}}/>Lý do khiếu nại:</strong>
                      <p style={{margin:'4px 0 0',color:'#92400e',fontStyle:'italic'}}>"{escrow.disputeReason}"</p>
                    </div>
                    <div style={{borderTop:'1px solid #fde68a',paddingTop:10,marginTop:8}}>
                      <label style={{display:'block',fontWeight:600,fontSize:'0.82rem',color:'#475569',marginBottom:6}}>Ghi chú phân xử (bắt buộc):</label>
                      <textarea rows={2} style={{width:'100%',padding:'8px',borderRadius:7,border:'1px solid #cbd5e1',fontSize:'0.85rem',fontFamily:'inherit',resize:'vertical',marginBottom:10}}
                        placeholder="Mô tả lý do: nhà thầu hoàn thành đúng hẹn / khách hàng có bằng chứng sản phẩm lỗi..."
                        value={adminNotes} onChange={e=>setAdminNotes(e.target.value)}/>
                      <div style={{display:'flex',gap:10}}>
                        <button className="admin-btn admin-btn-success" onClick={()=>handleResolve(escrow.id,'RELEASE')} disabled={resolvingId===escrow.id}>
                          <i className="fa-solid fa-check"/>Giải ngân nhà thầu (trừ 5% hoa hồng)
                        </button>
                        <button className="admin-btn admin-btn-danger" onClick={()=>handleResolve(escrow.id,'REFUND')} disabled={resolvingId===escrow.id}>
                          <i className="fa-solid fa-arrow-rotate-left"/>Hoàn tiền đầy đủ cho khách
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {escrow.disputeResolution && (
                  <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:8,padding:'10px 14px',marginTop:8,fontSize:'0.83rem'}}>
                    <strong style={{color:'#166534'}}><i className="fa-solid fa-gavel" style={{marginRight:6}}/>Quyết định phân xử:</strong>
                    <p style={{margin:'4px 0 0',color:'#14532d'}}>"{escrow.disputeResolution}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ TAB 2: RÚT TIỀN ═══════════ */}
      {activeTab === 'withdraw' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title"><i className="fa-solid fa-building-columns"/>Yêu Cầu Rút Tiền ({filteredWithdraws.length})</h3>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
            {['ALL','PENDING','APPROVED','REJECTED'].map(f => (
              <button key={f} onClick={()=>setWithdrawFilter(f)} className={`admin-btn admin-btn-sm ${withdrawFilter===f?'admin-btn-primary':'admin-btn-ghost'}`}>
                {f==='ALL'?'Tất cả':f==='PENDING'?'⏳ Chờ duyệt':f==='APPROVED'?'✅ Đã duyệt':'❌ Đã từ chối'}
              </button>
            ))}
          </div>
          {filteredWithdraws.length === 0 ? (
            <div className="admin-empty"><i className="fa-solid fa-folder-open"/>Không có yêu cầu nào</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr>
                  <th>Mã</th><th>Thành viên</th><th>Ngân hàng</th><th>Số tiền</th><th>Ngày gửi</th><th>Trạng thái</th><th>Thao tác</th>
                </tr></thead>
                <tbody>
                  {filteredWithdraws.map(req => (
                    <tr key={req.id}>
                      <td><span className="id-cell">#WR-{req.id}</span></td>
                      <td>
                        <div className="name-cell">{req.user?.fullName}</div>
                        <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{req.user?.email} · {req.user?.role}</div>
                      </td>
                      <td>
                        <div style={{fontWeight:600}}>{req.bankName}</div>
                        <div style={{fontSize:'0.78rem',color:'#64748b'}}>{req.accountNumber} — {req.accountHolderName}</div>
                      </td>
                      <td><strong style={{color:'#dc2626',fontSize:'1rem'}}>{fmtVND(req.amount)}</strong></td>
                      <td style={{fontSize:'0.8rem'}}>{fmtDate(req.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${req.status==='PENDING'?'pending':req.status==='APPROVED'?'completed':'cancelled'}`}>
                          {req.status==='PENDING'?'Chờ duyệt':req.status==='APPROVED'?'Đã duyệt':'Đã từ chối'}
                        </span>
                      </td>
                      <td>
                        {req.status === 'PENDING' ? (
                          <div style={{display:'flex',gap:6}}>
                            <button className="admin-btn admin-btn-success admin-btn-sm" onClick={()=>handleApproveWithdraw(req.id)} disabled={processingWithdrawId===req.id}>
                              <i className="fa-solid fa-check"/>Duyệt
                            </button>
                            <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={()=>handleRejectWithdraw(req.id)} disabled={processingWithdrawId===req.id}>
                              <i className="fa-solid fa-xmark"/>Từ chối
                            </button>
                          </div>
                        ) : (
                          <span style={{fontSize:'0.78rem',color:'#94a3b8'}}>{req.processedAt ? fmtDate(req.processedAt) : '—'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ TAB 3: HOA HỒNG ═══════════ */}
      {activeTab === 'commission' && commission && (
        <div>
          {/* Stats cards */}
          <div className="admin-stat-grid" style={{marginBottom:20}}>
            <div className="admin-stat-card stat-green">
              <div className="stat-icon-wrap bg-green"><i className="fa-solid fa-sack-dollar"/></div>
              <div className="stat-info">
                <div className="stat-value" style={{fontSize:'1.4rem'}}>{fmtVND(commission.totalCommissionEarned)}</div>
                <div className="stat-label">Tổng hoa hồng đã thu</div>
              </div>
            </div>
            <div className="admin-stat-card stat-blue">
              <div className="stat-icon-wrap bg-blue"><i className="fa-solid fa-wallet"/></div>
              <div className="stat-info">
                <div className="stat-value" style={{fontSize:'1.4rem'}}>{fmtVND(commission.adminWalletBalance)}</div>
                <div className="stat-label">Số dư ví Admin hiện tại</div>
              </div>
            </div>
            <div className="admin-stat-card stat-purple">
              <div className="stat-icon-wrap bg-purple"><i className="fa-solid fa-percent"/></div>
              <div className="stat-info">
                <div className="stat-value">{(commission.commissionRate * 100).toFixed(0)}%</div>
                <div className="stat-label">Tỷ lệ hoa hồng</div>
              </div>
            </div>
            <div className="admin-stat-card stat-gold">
              <div className="stat-icon-wrap bg-gold"><i className="fa-solid fa-check-double"/></div>
              <div className="stat-info">
                <div className="stat-value">{commission.totalReleasedEscrows}</div>
                <div className="stat-label">Đơn đã giải ngân</div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title"><i className="fa-solid fa-clock-rotate-left"/>Lịch Sử Hoa Hồng Gần Đây</h3>
            </div>
            {commission.recentCommissions.length === 0 ? (
              <div className="admin-empty"><i className="fa-solid fa-coins"/>Chưa có hoa hồng nào được ghi nhận</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr>
                    <th>Mã Escrow</th><th>Đơn hàng</th><th>Khách hàng</th><th>Nhà thầu</th>
                    <th>Tổng đơn</th><th>Hoa hồng (5%)</th><th>NTầu nhận</th><th>Ngày giải ngân</th>
                  </tr></thead>
                  <tbody>
                    {commission.recentCommissions.map(c => (
                      <tr key={c.escrowId}>
                        <td><span className="id-cell">ESC-{c.escrowId}</span></td>
                        <td><div className="name-cell" style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.requestTitle}</div></td>
                        <td style={{fontSize:'0.83rem'}}>{c.customerName}</td>
                        <td style={{fontSize:'0.83rem'}}>{c.contractorName}</td>
                        <td style={{fontWeight:600}}>{fmtVND(c.amount)}</td>
                        <td><strong style={{color:'#d97706'}}>{fmtVND(c.commissionAmount)}</strong></td>
                        <td><strong style={{color:'#16a34a'}}>{fmtVND(c.netAmount)}</strong></td>
                        <td style={{fontSize:'0.8rem'}}>{fmtDate(c.releasedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position:'fixed', bottom:24, right:24, zIndex:9999,
          background: toast.type==='success'?'#166534':'#991b1b',
          color:'#fff', padding:'12px 20px', borderRadius:10,
          boxShadow:'0 4px 20px rgba(0,0,0,0.2)', fontSize:'0.9rem', fontWeight:600,
          display:'flex', alignItems:'center', gap:10
        }}>
          <i className={`fa-solid ${toast.type==='success'?'fa-circle-check':'fa-circle-exclamation'}`}/>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminEscrowDashboard;
