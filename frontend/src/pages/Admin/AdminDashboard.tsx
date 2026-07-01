import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import type { AdminStats } from '../../services/adminService';
import { AdminCharts } from './AdminCharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  const fetchStats = (start?: string, end?: string) => {
    setFiltering(true);
    adminService.getStats(start, end)
      .then(setStats)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setFiltering(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(startDate || undefined, endDate || undefined);
  };

  const handleQuickFilter = (type: 'today' | 'yesterday' | 'this_month' | 'all') => {
    let start = '';
    let end = '';
    const today = new Date();
    
    if (type === 'today') {
      const offset = 7 * 60;
      const vnToday = new Date(today.getTime() + offset * 60 * 1000);
      const yyyymmdd = vnToday.toISOString().split('T')[0];
      start = yyyymmdd;
      end = yyyymmdd;
    } else if (type === 'yesterday') {
      const offset = 7 * 60;
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000 + offset * 60 * 1000);
      const yyyymmdd = yesterday.toISOString().split('T')[0];
      start = yyyymmdd;
      end = yyyymmdd;
    } else if (type === 'this_month') {
      const offset = 7 * 60;
      const vnToday = new Date(today.getTime() + offset * 60 * 1000);
      const yyyy = vnToday.getFullYear();
      const mm = String(vnToday.getMonth() + 1).padStart(2, '0');
      start = `${yyyy}-${mm}-01`;
      end = vnToday.toISOString().split('T')[0];
    }
    
    setStartDate(start);
    setEndDate(end);
    fetchStats(start || undefined, end || undefined);
  };

  if (loading && !stats) {
    return (
      <div className="admin-loading">
        <i className="fa-solid fa-spinner fa-spin" />
        Đang tải thống kê...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0 0' }}>Tổng quan hoạt động của hệ thống TTTH Furniture</p>
        </div>

        {/* Date Filter Form */}
        <form onSubmit={handleFilter} className="admin-date-filter" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#fff', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Từ:</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.3rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Đến:</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.3rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.85rem' }} />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary admin-btn-sm" style={{ padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} disabled={filtering}>
            {filtering ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-filter" />} Lọc
          </button>
          
          <div style={{ display: 'flex', gap: '0.35rem', borderLeft: '1px solid var(--color-border)', paddingLeft: '0.75rem' }}>
            <button type="button" onClick={() => handleQuickFilter('today')} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Hôm nay</button>
            <button type="button" onClick={() => handleQuickFilter('this_month')} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Tháng này</button>
            <button type="button" onClick={() => handleQuickFilter('all')} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Tất cả</button>
          </div>
        </form>
      </div>

      {/* ── Stat cards row 1 ── */}
      <div className="admin-stat-grid">
        <div className="admin-stat-card stat-blue">
          <div className="stat-icon-wrap bg-blue">
            <i className="fa-solid fa-users" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Khách Hàng</div>
          </div>
        </div>

        <div className="admin-stat-card stat-gold">
          <div className="stat-icon-wrap bg-gold">
            <i className="fa-solid fa-hammer" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalContractors}</div>
            <div className="stat-label">Nhà Thầu</div>
          </div>
        </div>

        <div className="admin-stat-card stat-green">
          <div className="stat-icon-wrap bg-green">
            <i className="fa-solid fa-box-open" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Tổng Đơn Hàng</div>
          </div>
        </div>

        <div className="admin-stat-card stat-purple">
          <div className="stat-icon-wrap bg-purple">
            <i className="fa-solid fa-pen-ruler" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalCustomOrders}</div>
            <div className="stat-label">Đơn Theo Yêu Cầu</div>
          </div>
        </div>
      </div>

      {/* ── Revenue + Products ── */}
      <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="admin-stat-card stat-green" style={{ gridColumn: 'span 2' }}>
          <div className="stat-icon-wrap bg-green">
            <i className="fa-solid fa-sack-dollar" />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{fmt(stats.totalRevenue)}</div>
            <div className="stat-label">Tổng Doanh Thu (tất cả đơn)</div>
          </div>
        </div>

        <div className="admin-stat-card stat-navy">
          <div className="stat-icon-wrap bg-navy">
            <i className="fa-solid fa-couch" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Sản Phẩm</div>
          </div>
        </div>
      </div>

      {/* ── Visual Analytics Charts ── */}
      <AdminCharts data={stats.chartData || []} />

      <div style={{ height: '2rem' }} />

      {/* ── Order breakdown ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Orders status */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <i className="fa-solid fa-box-open" />
              Trạng Thái Đơn Hàng
            </h3>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => navigate('/admin/orders')}>
              Xem tất cả
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <StatusRow label="Chờ xử lý" value={stats.pendingOrders} total={stats.totalOrders} color="#d97706" />
            <StatusRow label="Hoàn thành" value={stats.completedOrders} total={stats.totalOrders} color="#16a34a" />
            <StatusRow label="Đã hủy" value={stats.cancelledOrders} total={stats.totalOrders} color="#dc2626" />
          </div>
        </div>

        {/* Custom orders status */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <i className="fa-solid fa-pen-ruler" />
              Trạng Thái Đơn Yêu Cầu
            </h3>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => navigate('/admin/custom-orders')}>
              Xem tất cả
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <StatusRow label="Đang mở" value={stats.openCustomOrders} total={stats.totalCustomOrders} color="#2563eb" />
            <StatusRow label="Đang thực hiện" value={stats.inProgressCustomOrders} total={stats.totalCustomOrders} color="#d97706" />
            <StatusRow label="Hoàn thành" value={stats.completedCustomOrders} total={stats.totalCustomOrders} color="#16a34a" />
          </div>
        </div>
      </div>

      {/* ── Quick links ── */}
      <div className="admin-card" style={{ marginTop: 0 }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-bolt" />
            Truy Cập Nhanh
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="admin-btn admin-btn-primary" onClick={() => navigate('/admin/orders')}>
            <i className="fa-solid fa-box-open" /> Quản lý đơn hàng
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => navigate('/admin/custom-orders')}>
            <i className="fa-solid fa-pen-ruler" /> Đơn theo yêu cầu
          </button>
          <button className="admin-btn admin-btn-ghost" onClick={() => navigate('/admin/customers')}>
            <i className="fa-solid fa-users" /> Khách hàng
          </button>
          <button className="admin-btn admin-btn-ghost" onClick={() => navigate('/admin/contractors')}>
            <i className="fa-solid fa-hammer" /> Nhà thầu
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatusRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const StatusRow: React.FC<StatusRowProps> = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
        <span style={{ color: '#0f172a', fontWeight: 500 }}>{label}</span>
        <span style={{ color: '#64748b' }}>{value} <span style={{ color: '#94a3b8' }}>({pct}%)</span></span>
      </div>
      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
};

export default AdminDashboard;
