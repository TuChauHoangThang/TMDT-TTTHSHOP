import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminUser } from '../../services/adminService';
import { toast } from 'react-toastify';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination/Pagination';

const fmtDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const pagination = usePagination(filtered, 15);
  const [isExporting, setIsExporting] = useState(false);

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
    pagination.setPage(1);
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

  const handleExportPDF = () => {
    setIsExporting(true);

    const toastId = toast.info('Đang chuẩn bị bản in PDF...', { autoClose: false });

    setTimeout(() => {
      toast.dismiss(toastId);

      setTimeout(() => {
        window.print();
        setIsExporting(false);
      }, 150);
    }, 400);
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
        <style>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
            font-size: 11pt !important;
          }
          /* Ẩn các thành phần điều hướng của hệ thống admin */
          .admin-sidebar, .admin-navbar, .admin-filters, .admin-btn, .no-print {
            display: none !important;
          }
          
          /* FIX TRIỆT ĐỂ: Ép ẩn toàn bộ container chứa thông báo Toastify khi in file */
          .Toastify, .Toastify__toast-container, [id^="toast-"] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          
          .admin-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .admin-table-wrap {
            overflow: visible !important;
          }
          .admin-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .admin-table th, .admin-table td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
            font-size: 10pt !important;
          }
          .status-badge {
            border: 1px solid #000 !important;
            background: transparent !important;
            color: #000 !important;
            padding: 2px 6px !important;
          }
          .pdf-header-report {
            display: block !important;
            margin-bottom: 25px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 12mm;
          }
        }
        /* Mặc định trên trình duyệt màn hình web sẽ ẩn header PDF */
        .pdf-header-report {
          display: none;
        }
      `}</style>

        <div className="pdf-header-report">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, color: '#1e3a8a' }}>TTTH FURNITURE SHOP</h2>
              <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#555' }}>Hệ thống quản lý nội thất thương mại điện tử</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
              <div><strong>Mẫu báo cáo:</strong> BC-KH-01</div>
              <div><strong>Ngày xuất file:</strong> {new Date().toLocaleDateString('vi-VN')}</div>
            </div>
          </div>
          <center><h2 style={{ marginTop: '20px', textTransform: 'uppercase' }}>BÁO CÁO THỐNG KÊ DANH SÁCH KHÁCH HÀNG</h2></center>
        </div>

        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1>Quản Lý Khách Hàng</h1>
            <p>Xem và quản lý tài khoản khách hàng trong hệ thống</p>
          </div>

          <button
              className="admin-btn admin-btn-primary no-print"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '6px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
              }}
              onClick={handleExportPDF}
              disabled={isExporting}
          >
            {isExporting ? (
                <><i className="fa-solid fa-spinner fa-spin" /> Đang tạo PDF...</>
            ) : (
                <><i className="fa-solid fa-file-pdf" style={{ fontSize: '1.1rem' }} /> Xuất báo cáo PDF</>
            )}
          </button>
        </div>

        <div className="admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
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
          
          <div className="admin-filters no-print">
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
              <>
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
                    <th className="no-print">Thao Tác</th>
                  </tr>
                  </thead>
                  <tbody>
                  {pagination.paged.map(user => (
                      <tr key={user.id}>
                        <td><span className="id-cell">#{user.id}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Avatar dạng tròn sẽ ẩn đi hoặc căn chỉnh tinh gọn lại khi in */}
                            <div className="no-print" style={{
                              width: '34px', height: '34px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: '#fff', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                            }}>
                              {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="name-cell" style={{ fontWeight: 500 }}>{user.fullName}</span>
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
                        {/* Cột thao tác kích hoạt/vô hiệu hóa sẽ tự động biến mất khi lưu file PDF */}
                        <td className="no-print">
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
              <Pagination {...pagination} onPageChange={pagination.setPage} />
              </>
          )}
        </div>
      </div>
  );
};

export default AdminCustomers;