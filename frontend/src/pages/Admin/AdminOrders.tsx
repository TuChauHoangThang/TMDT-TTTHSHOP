import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminOrder, AdminOrderDetail } from '../../services/adminService';
import { toast } from 'react-toastify';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const statusClass: Record<string, string> = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const paymentLabel: Record<string, string> = {
  COD: 'Tiền mặt (COD)',
  BANK_TRANSFER: 'Chuyển khoản',
  MOMO: 'MoMo',
};

const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const fmtDate = (s: string) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filtered, setFiltered] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    adminService.getAllOrders()
        .then(data => { setOrders(data); setFiltered(data); })
        .catch(() => toast.error('Không thể tải danh sách đơn hàng'))
        .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter) result = result.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
          o.fullName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          String(o.id).includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, orders]);

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const detail = await adminService.getOrderDetail(id);
      setSelectedOrder(detail);
    } catch {
      toast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
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
          Đang tải đơn hàng...
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
          /* Ẩn bớt thanh điều hướng, bộ lọc, nút bấm hệ thống và popup modal chi tiết */
          .admin-sidebar, .admin-navbar, .admin-filters, .admin-btn, .no-print, .admin-modal-overlay, select {
            display: none !important;
          }
          
          /* Triệt tiêu triệt để thông báo Toast tránh việc bị ghi đè lên file PDF */
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
          /* Khi in, hiển thị toàn bộ địa chỉ đầy đủ thay vì cắt chuỗi */
          .admin-table td div style {
            display: block !important;
          }
          .admin-table td div {
            white-space: normal !important;
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
              <div><strong>Mẫu báo cáo:</strong> BC-ĐH-04</div>
              <div><strong>Ngày xuất file:</strong> {new Date().toLocaleDateString('vi-VN')}</div>
            </div>
          </div>
          <center><h2 style={{ marginTop: '20px', textTransform: 'uppercase' }}>BÁO CÁO THỐNG KÊ CHI TIẾT ĐƠN HÀNG</h2></center>
        </div>

        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1>Quản Lý Đơn Hàng</h1>
            <p>Xem và cập nhật trạng thái tất cả đơn hàng trong hệ thống</p>
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
          {ORDER_STATUSES.map(s => (
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
              <i className="fa-solid fa-box-open" />
              Danh Sách Đơn Hàng ({filtered.length})
            </h3>
          </div>

          <div className="admin-filters no-print">
            <div className="admin-search-wrap">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                  className="admin-search-input"
                  style={{ width: '100%' }}
                  placeholder="Tìm theo tên, SĐT, mã đơn..."
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
              {ORDER_STATUSES.map(s => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
              <div className="admin-empty">
                <i className="fa-solid fa-box-open" />
                Không có đơn hàng nào
              </div>
          ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                  <tr>
                    <th>Mã ĐH</th>
                    <th>Khách Hàng</th>
                    <th>SĐT</th>
                    <th>Thanh Toán</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Đặt</th>
                    <th className="no-print">Thao Tác</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filtered.map(order => (
                      <tr key={order.id}>
                        <td><span className="id-cell">#{order.id}</span></td>
                        <td>
                          <div className="name-cell" style={{ fontWeight: 500 }}>{order.fullName}</div>
                          {/* Trên web thì cắt ngắn, lúc in sẽ hiển thị full nhờ class CSS ở trên */}
                          <div className="address-text-cell" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            <span className="no-print">{order.address.substring(0, 40)}{order.address.length > 40 ? '...' : ''}</span>
                            <span style={{ display: 'none' }} className="print-only-text">{order.address}</span>
                          </div>
                        </td>
                        <td>{order.phone}</td>
                        <td>{paymentLabel[order.paymentMethod] || order.paymentMethod}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{fmt(order.totalAmount)}</td>
                        <td>
                      <span className={`status-badge ${statusClass[order.status] || 'pending'}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{fmtDate(order.createdAt)}</td>
                        {/* Cột dropdown thao tác và nút xem chi tiết sẽ tự động ẩn đi trên file PDF */}
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
                              {ORDER_STATUSES.map(s => (
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
          )}
        </div>
        
        {(selectedOrder || detailLoading) && (
            <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
              <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">
                    Chi Tiết Đơn Hàng #{selectedOrder?.id}
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
                        <div className="detail-row">
                          <span className="detail-label">Khách hàng:</span>
                          <span className="detail-value">{selectedOrder.fullName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Số điện thoại:</span>
                          <span className="detail-value">{selectedOrder.phone}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Địa chỉ:</span>
                          <span className="detail-value">{selectedOrder.address}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Thanh toán:</span>
                          <span className="detail-value">{paymentLabel[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Ghi chú:</span>
                          <span className="detail-value">{selectedOrder.note || '—'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Trạng thái:</span>
                          <span className="detail-value">
                      <span className={`status-badge ${statusClass[selectedOrder.status] || 'pending'}`}>
                        {statusLabel[selectedOrder.status] || selectedOrder.status}
                      </span>
                    </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Ngày đặt:</span>
                          <span className="detail-value">{fmtDate(selectedOrder.createdAt)}</span>
                        </div>

                        <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                          <div style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.875rem' }}>Sản phẩm đặt mua:</div>
                          {selectedOrder.items?.map(item => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                                <span style={{ color: '#0f172a' }}>{item.product?.name || `Sản phẩm #${item.product?.id}`}</span>
                                <span style={{ color: '#64748b' }}>x{item.quantity} — {fmt(item.price * item.quantity)}</span>
                              </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 700, fontSize: '0.9rem' }}>
                            <span>Tổng cộng</span>
                            <span style={{ color: '#16a34a' }}>{fmt(selectedOrder.totalAmount)}</span>
                          </div>
                        </div>
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
                        {ORDER_STATUSES.map(s => (
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

export default AdminOrders;