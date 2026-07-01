import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminCustomOrder, AdminCustomOrderDetail } from '../../services/adminService';
import { toast } from 'react-toastify';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination/Pagination';

const CUSTOM_STATUSES = ['OPEN', 'QUOTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const statusLabel: Record<string, string> = {
  OPEN: 'Đang mở',
  QUOTED: 'Đã báo giá',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const statusClass: Record<string, string> = {
  OPEN: 'open',
  QUOTED: 'quoted',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const fmt = (n?: number) =>
    n != null
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
        : '—';

const fmtDate = (s?: string) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const AdminCustomOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminCustomOrder[]>([]);
  const [filtered, setFiltered] = useState<AdminCustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminCustomOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const pagination = usePagination(filtered, 15);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    adminService.getAllCustomOrders()
        .then(data => { setOrders(data); setFiltered(data); })
        .catch(() => toast.error('Không thể tải danh sách đơn yêu cầu'))
        .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter) result = result.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
          o.title.toLowerCase().includes(q) ||
          (o.customerName || '').toLowerCase().includes(q) ||
          String(o.id).includes(q)
      );
    }
    setFiltered(result);
    pagination.setPage(1);
  }, [search, statusFilter, orders]);

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const detail = await adminService.getCustomOrderDetail(id);
      setSelectedOrder(detail);
    } catch {
      toast.error('Không thể tải chi tiết đơn yêu cầu');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminService.updateCustomOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : prev);
      }
      toast.success('Cập nhật trạng thái thành công');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setUpdatingId(null);
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
          Đang tải đơn yêu cầu...
        </div>
    );
  }

  return (
      <div>
        <style>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
            font-size: 11pt !important;
          }
          /* Ẩn thanh công cụ điều hướng, thanh trạng thái nhanh, bộ lọc và modal chi tiết */
          .admin-sidebar, .admin-navbar, .admin-filters, .admin-btn, .no-print, .admin-modal-overlay, select {
            display: none !important;
          }
          
          /* Triệt tiêu hoàn toàn lớp overlay thông báo Toastify */
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
          .admin-table td div.name-cell {
            white-space: normal !important;
            max-width: none !important;
            overflow: visible !important;
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
        /* Mặc định ẩn phần header PDF khi xem trên website thông thường */
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
              <div><strong>Mẫu báo cáo:</strong> BC-ĐHYC-03</div>
              <div><strong>Ngày xuất file:</strong> {new Date().toLocaleDateString('vi-VN')}</div>
            </div>
          </div>
          <center><h2 style={{ marginTop: '20px', textTransform: 'uppercase' }}>BÁO CÁO THỐNG KÊ ĐƠN HÀNG THEO YÊU CẦU</h2></center>
        </div>

        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1>Đơn Hàng Theo Yêu Cầu</h1>
            <p>Quản lý tất cả yêu cầu đặt hàng tùy chỉnh (RFQ) trong hệ thống</p>
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

        <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {CUSTOM_STATUSES.map(s => (
              <button
                  key={s}
                  className={`admin-btn ${statusFilter === s ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                  onClick={() => setStatusFilter(prev => prev === s ? '' : s)}
              >
                {statusLabel[s]} ({orders.filter(o => o.status === s).length})
              </button>
          ))}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <i className="fa-solid fa-pen-ruler" />
              Danh Sách Đơn Yêu Cầu ({filtered.length})
            </h3>
          </div>

          <div className="admin-filters no-print">
            <div className="admin-search-wrap">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  placeholder="Tìm theo tiêu đề, khách hàng, mã..."
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
              {CUSTOM_STATUSES.map(s => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
              <div className="admin-empty">
                <i className="fa-solid fa-pen-ruler" />
                Không có đơn yêu cầu nào
              </div>
          ) : (
              <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tiêu Đề</th>
                    <th>Khách Hàng</th>
                    <th>Loại Nội Thất</th>
                    <th>Ngân Sách</th>
                    <th>Báo Giá</th>
                    <th>Hạn</th>
                    <th>Trạng Thái</th>
                    <th className="no-print">Thao Tác</th>
                  </tr>
                  </thead>
                  <tbody>
                  {pagination.paged.map(order => (
                      <tr key={order.id}>
                        <td><span className="id-cell">#{order.id}</span></td>
                        <td>
                          <div className="name-cell" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {order.title}
                          </div>
                        </td>
                        <td>{order.customerName || `#${order.customerId}`}</td>
                        <td style={{ fontSize: '0.8rem' }}>{order.furnitureType || '—'}</td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {order.budgetMin || order.budgetMax
                              ? `${fmt(order.budgetMin)} – ${fmt(order.budgetMax)}`
                              : '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        background: order.quoteCount > 0 ? '#f0fdf4' : '#f1f5f9',
                        color: order.quoteCount > 0 ? '#15803d' : '#94a3b8',
                        borderRadius: '20px',
                        padding: '2px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {order.quoteCount}
                      </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{fmtDate(order.deadline)}</td>
                        <td>
                      <span className={`status-badge ${statusClass[order.status] || 'open'}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                        </td>
                        {/* Hộp chọn trạng thái và nút xem chi tiết sẽ tự động ẩn đi trên file PDF */}
                        <td className="no-print">
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                className="admin-btn admin-btn-ghost admin-btn-sm"
                                onClick={() => openDetail(order.id)}
                            >
                              <i className="fa-solid fa-eye" />
                            </button>
                            <select
                                className="admin-filter-select"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                value={order.status}
                                disabled={updatingId === order.id}
                                onChange={e => handleStatusChange(order.id, e.target.value)}
                            >
                              {CUSTOM_STATUSES.map(s => (
                                  <option key={s} value={s}>{statusLabel[s]}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
              <Pagination {...pagination} onPageChange={p => { pagination.setPage(p); }} />
              </>
          )}
        </div>

        {(selectedOrder || detailLoading) && (
            <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
              <div className="admin-modal" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">
                    Chi Tiết Đơn Yêu Cầu #{selectedOrder?.id}
                  </h3>
                  <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
                <div className="admin-modal-body">
                  {detailLoading ? (
                      <div className="admin-loading" style={{ minHeight: 120 }}>
                        <i className="fa-solid fa-spinner fa-spin" /> Đang tải...
                      </div>
                  ) : selectedOrder && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                          <div className="detail-row">
                            <span className="detail-label">Khách hàng:</span>
                            <span className="detail-value">{selectedOrder.customerName || `#${selectedOrder.customerId}`}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">SĐT:</span>
                            <span className="detail-value">{selectedOrder.customerPhone || '—'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Loại nội thất:</span>
                            <span className="detail-value">{selectedOrder.furnitureType || '—'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Chất liệu:</span>
                            <span className="detail-value">{selectedOrder.material || '—'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Kích thước:</span>
                            <span className="detail-value">{selectedOrder.dimensions || '—'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Màu sắc:</span>
                            <span className="detail-value">{selectedOrder.colorStyle || '—'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Ngân sách:</span>
                            <span className="detail-value">{fmt(selectedOrder.budgetMin)} – {fmt(selectedOrder.budgetMax)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Hạn chót:</span>
                            <span className="detail-value">{fmtDate(selectedOrder.deadline)}</span>
                          </div>
                        </div>

                        <div className="detail-row" style={{ flexDirection: 'column', gap: '4px' }}>
                          <span className="detail-label">Mô tả:</span>
                          <span className="detail-value" style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', lineHeight: 1.6 }}>
                      {selectedOrder.description}
                    </span>
                        </div>

                        <div className="detail-row">
                          <span className="detail-label">Trạng thái:</span>
                          <span className="detail-value">
                      <span className={`status-badge ${statusClass[selectedOrder.status] || 'open'}`}>
                        {statusLabel[selectedOrder.status] || selectedOrder.status}
                      </span>
                    </span>
                        </div>
                        
                        {selectedOrder.quotes && selectedOrder.quotes.length > 0 && (
                            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                              <div style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.875rem' }}>
                                Báo giá nhận được ({selectedOrder.quotes.length}):
                              </div>
                              {selectedOrder.quotes.map(q => (
                                  <div key={q.id} style={{
                                    padding: '12px',
                                    background: q.id === selectedOrder.selectedQuoteId ? '#f0fdf4' : '#f8fafc',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    border: q.id === selectedOrder.selectedQuoteId ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                                    fontSize: '0.85rem'
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                      <span style={{ fontWeight: 600 }}>{q.shopName || `Shop #${q.shopId}`}</span>
                                      <span style={{ fontWeight: 700, color: '#16a34a' }}>{fmt(q.quotedPrice)}</span>
                                    </div>
                                    <div style={{ color: '#64748b' }}>
                                      Nhà thầu: {q.contractorName || `#${q.contractorId}`} · {q.estimatedDays} ngày
                                      {q.id === selectedOrder.selectedQuoteId && (
                                          <span style={{ marginLeft: '8px', background: '#dcfce7', color: '#15803d', padding: '1px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                                ĐÃ CHỌN
                              </span>
                                      )}
                                    </div>
                                    {q.note && <div style={{ color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>{q.note}</div>}
                                  </div>
                              ))}
                            </div>
                        )}
                      </>
                  )}
                </div>
                <div className="admin-modal-footer">
                  {selectedOrder && (
                      <select
                          className="admin-filter-select"
                          value={selectedOrder.status}
                          disabled={updatingId === selectedOrder.id}
                          onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                      >
                        {CUSTOM_STATUSES.map(s => (
                            <option key={s} value={s}>{statusLabel[s]}</option>
                        ))}
                      </select>
                  )}
                  <button className="admin-btn admin-btn-ghost" onClick={() => setSelectedOrder(null)}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminCustomOrders;