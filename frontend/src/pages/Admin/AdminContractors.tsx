import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminContractor } from '../../services/adminService';
import { toast } from 'react-toastify';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination/Pagination';

const fmtDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = Math.round(rating);
  return (
      <span style={{ color: '#d97706', fontSize: '0.8rem' }}>
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        <span style={{ color: '#64748b', marginLeft: '4px' }}>{rating?.toFixed(1)}</span>
    </span>
  );
};

const AdminContractors: React.FC = () => {
  const [contractors, setContractors] = useState<AdminContractor[]>([]);
  const [filtered, setFiltered] = useState<AdminContractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [selectedContractor, setSelectedContractor] = useState<AdminContractor | null>(null);
  const pagination = usePagination(filtered, 15);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    adminService.getContractors()
        .then(data => { setContractors(data); setFiltered(data); })
        .catch(() => toast.error('Không thể tải danh sách nhà thầu'))
        .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = contractors;
    if (statusFilter === 'active') result = result.filter(u => u.isActive);
    if (statusFilter === 'inactive') result = result.filter(u => !u.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.shopName || '').toLowerCase().includes(q) ||
          u.phone.includes(q)
      );
    }
    setFiltered(result);
    pagination.setPage(1);
  }, [search, statusFilter, contractors]);

  const handleToggle = async (id: number) => {
    setTogglingId(id);
    try {
      const res = await adminService.toggleUserActive(id);
      setContractors(prev => prev.map(u => u.id === id ? { ...u, isActive: res.isActive } : u));
      if (selectedContractor?.id === id) {
        setSelectedContractor(prev => prev ? { ...prev, isActive: res.isActive } : prev);
      }
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
          Đang tải danh sách nhà thầu...
        </div>
    );
  }

  const activeCount = contractors.filter(u => u.isActive).length;
  const withShopCount = contractors.filter(u => u.shopId).length;

  return (
      <div>
        <style>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
            font-size: 11pt !important;
          }
          /* Ẩn thanh công cụ, các bộ lọc, nút bấm và lớp overlay Modal */
          .admin-sidebar, .admin-navbar, .admin-filters, .admin-btn, .no-print, .admin-modal-overlay {
            display: none !important;
          }
          
          /* Ẩn triệt để thông báo Toast tránh bị dính đè lên file */
          .Toastify, .Toastify__toast-container {
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
            font-size: 9.5pt !important;
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
        /* Ẩn header PDF khi xem thông thường trên trình duyệt web */
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
              <div><strong>Mẫu báo cáo:</strong> BC-NT-02</div>
              <div><strong>Ngày xuất file:</strong> {new Date().toLocaleDateString('vi-VN')}</div>
            </div>
          </div>
          <center><h2 style={{ marginTop: '20px', textTransform: 'uppercase' }}>BÁO CÁO THỐNG KÊ DANH SÁCH NHÀ THẦU</h2></center>
        </div>

        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1>Quản Lý Nhà Thầu</h1>
            <p>Xem và quản lý tài khoản nhà thầu và cửa hàng trong hệ thống</p>
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
          <div className="admin-stat-card stat-gold">
            <div className="stat-icon-wrap bg-gold"><i className="fa-solid fa-hammer" /></div>
            <div className="stat-info">
              <div className="stat-value">{contractors.length}</div>
              <div className="stat-label">Tổng Nhà Thầu</div>
            </div>
          </div>
          <div className="admin-stat-card stat-green">
            <div className="stat-icon-wrap bg-green"><i className="fa-solid fa-store" /></div>
            <div className="stat-info">
              <div className="stat-value">{withShopCount}</div>
              <div className="stat-label">Có Cửa Hàng</div>
            </div>
          </div>
          <div className="admin-stat-card stat-blue">
            <div className="stat-icon-wrap bg-blue"><i className="fa-solid fa-user-check" /></div>
            <div className="stat-info">
              <div className="stat-value">{activeCount}</div>
              <div className="stat-label">Đang Hoạt Động</div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <i className="fa-solid fa-hammer" />
              Danh Sách Nhà Thầu ({filtered.length})
            </h3>
          </div>

          <div className="admin-filters no-print">
            <div className="admin-search-wrap">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  placeholder="Tìm theo tên, email, tên shop..."
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
                <i className="fa-solid fa-hammer" />
                Không tìm thấy nhà thầu nào
              </div>
          ) : (
              <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nhà Thầu</th>
                    <th>Email / SĐT</th>
                    <th>Cửa Hàng</th>
                    <th>Đánh Giá</th>
                    <th>Ngày Đăng Ký</th>
                    <th>Trạng Thái</th>
                    <th className="no-print">Thao Tác</th>
                  </tr>
                  </thead>
                  <tbody>
                  {pagination.paged.map(contractor => (
                      <tr key={contractor.id}>
                        <td><span className="id-cell">#{contractor.id}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="no-print" style={{
                              width: '34px', height: '34px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #d97706, #92400e)',
                              color: '#fff', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                            }}>
                              {contractor.fullName?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                            <span className="name-cell" style={{ fontWeight: 500 }}>{contractor.fullName}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{contractor.email}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{contractor.phone || '—'}</div>
                        </td>
                        <td>
                          {contractor.shopName ? (
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{contractor.shopName}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{contractor.shopAddress?.substring(0, 35) || '—'}</div>
                              </div>
                          ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Chưa có shop</span>
                          )}
                        </td>
                        <td>
                          {contractor.shopRating != null
                              ? <StarRating rating={contractor.shopRating} />
                              : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                          }
                          {contractor.shopRatingCount != null && (
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({contractor.shopRatingCount} đánh giá)</div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{fmtDate(contractor.createdAt)}</td>
                        <td>
                      <span className={`status-badge ${contractor.isActive ? 'active' : 'inactive'}`}>
                        {contractor.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                        </td>
                        <td className="no-print">
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                className="admin-btn admin-btn-ghost admin-btn-sm"
                                onClick={() => setSelectedContractor(contractor)}
                            >
                              <i className="fa-solid fa-eye" />
                            </button>
                            <button
                                className={`admin-btn admin-btn-sm ${contractor.isActive ? 'admin-btn-danger' : 'admin-btn-success'}`}
                                disabled={togglingId === contractor.id}
                                onClick={() => handleToggle(contractor.id)}
                            >
                              {togglingId === contractor.id
                                  ? <i className="fa-solid fa-spinner fa-spin" />
                                  : contractor.isActive
                                      ? <><i className="fa-solid fa-ban" /> Vô hiệu</>
                                      : <><i className="fa-solid fa-check" /> Kích hoạt</>
                              }
                            </button>
                          </div>
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
        
        {selectedContractor && (
            <div className="admin-modal-overlay" onClick={() => setSelectedContractor(null)}>
              <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">Thông Tin Nhà Thầu</h3>
                  <button className="admin-modal-close" onClick={() => setSelectedContractor(null)}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
                <div className="admin-modal-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #d97706, #92400e)',
                      color: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 700, fontSize: '1.4rem', flexShrink: 0
                    }}>
                      {selectedContractor.fullName?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selectedContractor.fullName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedContractor.email}</div>
                      <span className={`status-badge ${selectedContractor.isActive ? 'active' : 'inactive'}`} style={{ marginTop: '4px', display: 'inline-flex' }}>
                    {selectedContractor.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hoá'}
                  </span>
                    </div>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Số điện thoại:</span>
                    <span className="detail-value">{selectedContractor.phone || '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ngày đăng ký:</span>
                    <span className="detail-value">{fmtDate(selectedContractor.createdAt)}</span>
                  </div>

                  {selectedContractor.shopName && (
                      <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.875rem', color: '#0f172a' }}>
                          <i className="fa-solid fa-store" style={{ marginRight: '6px', color: '#d97706' }} />
                          Thông Tin Cửa Hàng
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Tên shop:</span>
                          <span className="detail-value" style={{ fontWeight: 600 }}>{selectedContractor.shopName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Địa chỉ:</span>
                          <span className="detail-value">{selectedContractor.shopAddress || '—'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Đánh giá:</span>
                          <span className="detail-value">
                      {selectedContractor.shopRating != null
                          ? <StarRating rating={selectedContractor.shopRating} />
                          : '—'}
                            {selectedContractor.shopRatingCount != null && (
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '6px' }}>
                          ({selectedContractor.shopRatingCount} đánh giá)
                        </span>
                            )}
                    </span>
                        </div>
                      </div>
                  )}
                </div>
                <div className="admin-modal-footer">
                  <button
                      className={`admin-btn ${selectedContractor.isActive ? 'admin-btn-danger' : 'admin-btn-success'}`}
                      disabled={togglingId === selectedContractor.id}
                      onClick={() => handleToggle(selectedContractor.id)}
                  >
                    {togglingId === selectedContractor.id
                        ? <><i className="fa-solid fa-spinner fa-spin" /> Đang xử lý...</>
                        : selectedContractor.isActive
                            ? <><i className="fa-solid fa-ban" /> Vô hiệu hoá tài khoản</>
                            : <><i className="fa-solid fa-check" /> Kích hoạt tài khoản</>
                    }
                  </button>
                  <button className="admin-btn admin-btn-ghost" onClick={() => setSelectedContractor(null)}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminContractors;