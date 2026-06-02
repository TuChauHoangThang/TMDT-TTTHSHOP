import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminUser } from '../../services/adminService';
import { toast } from 'react-toastify';

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    adminService.getCustomers()
      .then(data => { setCustomers(data); setFiltered(data); })
      .catch(() => toast.error('Không thể tải danh sách khách hàng'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = customers;
    if (statusFilter === 'active') result = result.filter(u => u.isActive);
    if (statusFilter === 'inactive') result = result.filter(u => !u.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, customers]);

  const handleToggle = async (id: number) => {
    setTogglingId(id);
    try {
      const res = await adminService.toggleUserActive(id);
      setCustomers(prev => prev.map(u => u.id === id ? { ...u, isActive: res.isActive } : u));
      toast.success(res.message);
    } catch {
      toast.error('Thao tác thất bại');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <i className="fa-solid fa-spinner fa-spin" />
        Đang tải danh sách khách hàng...
      </div>
    );
  }

  const activeCount = customers.filter(u => u.isActive).length;
  const inactiveCount = customers.filter(u => !u.isActive).length;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản Lý Khách Hàng</h1>
        <p>Xem và quản lý tài khoản khách hàng trong hệ thống</p>
      </div>

      {/* Summary */}
      <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
        <div className="admin-stat-card stat-blue">
          <div className="stat-icon-wrap bg-blue"><i className="fa-solid fa-users" /></div>
          <div className="stat-info">
            <div className="stat-value">{customers.length}</div>
            <div className="stat-label">Tổng Khách Hàng</div>
          </div>
        </div>
        <div className="admin-stat-card stat-green">
          <div className="stat-icon-wrap bg-green"><i className="fa-solid fa-user-check" /></div>
          <div className="stat-info">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Đang Hoạt Động</div>
          </div>
        </div>
        <div className="admin-stat-card stat-red">
          <div className="stat-icon-wrap bg-red"><i className="fa-solid fa-user-slash" /></div>
          <div className="stat-info">
            <div className="stat-value">{inactiveCount}</div>
            <div className="stat-label">Đã Vô Hiệu Hoá</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-users" />
            Danh Sách Khách Hàng ({filtered.length})
          </h3>
        </div>

        <div className="admin-filters">
          <div className="admin-search-wrap">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              className="admin-search-input"
              style={{ width: '100%' }}
              placeholder="Tìm theo tên, email, SĐT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã vô hiệu hoá</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-users" />
            Không tìm thấy khách hàng nào
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ Tên</th>
                  <th>Email</th>
                  <th>Số Điện Thoại</th>
                  <th>Ngày Đăng Ký</th>
                  <th>Trạng Thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id}>
                    <td><span className="id-cell">#{user.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: '#fff', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                        }}>
                          {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="name-cell">{user.fullName}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{fmtDate(user.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`admin-btn admin-btn-sm ${user.isActive ? 'admin-btn-danger' : 'admin-btn-success'}`}
                        disabled={togglingId === user.id}
                        onClick={() => handleToggle(user.id)}
                      >
                        {togglingId === user.id
                          ? <i className="fa-solid fa-spinner fa-spin" />
                          : user.isActive
                            ? <><i className="fa-solid fa-ban" /> Vô hiệu</>
                            : <><i className="fa-solid fa-check" /> Kích hoạt</>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
