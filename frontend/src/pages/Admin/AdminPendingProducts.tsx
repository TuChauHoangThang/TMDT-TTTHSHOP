import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE = 'http://localhost:8080/api/admin';

// Luôn đính kèm token từ localStorage vào mỗi request
const api = () => {
  const token = localStorage.getItem('auth_token');
  return axios.create({
    baseURL: BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

interface PendingProduct {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  priceCurrent: number | null;
  priceOriginal: number | null;
  priceContact: boolean;
  status: string;
  ratingStars: number;
  ratingCount: number;
  primaryImage: string;
  imageCount: number;
  shopName: string;
  description: string;
}

interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

const fmt = (n: number | null) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const AdminPendingProducts: React.FC = () => {
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  const loadPendingProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api().get<PendingProduct[]>('/products/pending');
      setProducts(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      toast.error(status === 403
        ? 'Không có quyền truy cập (403)'
        : `Không thể tải sản phẩm chờ duyệt (${status ?? 'network error'})`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingProducts();
  }, [loadPendingProducts]);

  const handleApprove = async (productId: number) => {
    if (!window.confirm('Duyệt và cho phép sản phẩm này hiển thị công khai?')) return;
    try {
      await api().patch(`/products/${productId}/approve`);
      toast.success('Đã duyệt sản phẩm thành công!');
      setSelectedProduct(null);
      loadPendingProducts();
    } catch {
      toast.error('Duyệt sản phẩm thất bại');
    }
  };

  const handleReject = async (productId: number) => {
    if (!window.confirm('Từ chối duyệt sản phẩm này?')) return;
    try {
      await api().patch(`/products/${productId}/reject`);
      toast.success('Đã từ chối duyệt sản phẩm!');
      setSelectedProduct(null);
      loadPendingProducts();
    } catch {
      toast.error('Thao tác từ chối thất bại');
    }
  };

  const openDetailModal = async (product: PendingProduct) => {
    setSelectedProduct(product);
    setImagesLoading(true);
    try {
      const res = await api().get<ProductImage[]>(`/products/${product.id}/images`);
      setProductImages(res.data);
    } catch {
      toast.error('Không thể tải danh sách ảnh sản phẩm');
    } finally {
      setImagesLoading(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.shopName.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <i className="fa-solid fa-spinner fa-spin" /> Đang tải sản phẩm chờ duyệt...
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Duyệt Sản Phẩm Mới</h1>
        <p>Phê duyệt hoặc từ chối các sản phẩm do Seller (Nhà thầu) đăng bán</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-square-check" style={{ marginRight: 8, color: '#f59e0b' }} />
            Danh Sách Chờ Phê Duyệt ({filtered.length})
          </h3>
        </div>

        {/* Search */}
        <div className="admin-filters">
          <div className="admin-search-wrap" style={{ width: '100%' }}>
            <i className="fa-solid fa-magnifying-glass" />
            <input
              className="admin-search-input"
              style={{ width: '100%' }}
              placeholder="Tìm theo tên sản phẩm, tên shop..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-check-double" style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: 12 }} />
            Không có sản phẩm nào cần duyệt
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên Sản Phẩm</th>
                  <th>Cửa Hàng</th>
                  <th>Danh Mục</th>
                  <th>Giá Bán</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.primaryImage ? (
                        <img
                          src={p.primaryImage}
                          alt={p.name}
                          style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/52x52?text=N/A'; }}
                        />
                      ) : (
                        <div style={{ width: 52, height: 52, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa-solid fa-image" style={{ color: '#94a3b8' }} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div 
                        className="name-cell" 
                        style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onClick={() => openDetailModal(p)}
                        title="Click để xem chi tiết sản phẩm"
                      >
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.slug}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#475569' }}>
                        {p.shopName}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{p.categoryName}</td>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {p.priceContact
                        ? <span style={{ color: '#d97706' }}>Liên hệ</span>
                        : fmt(p.priceCurrent)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button 
                          className="admin-btn admin-btn-success admin-btn-sm" 
                          onClick={() => handleApprove(p.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <i className="fa-solid fa-circle-check" /> Duyệt
                        </button>
                        <button 
                          className="admin-btn admin-btn-danger admin-btn-sm" 
                          onClick={() => handleReject(p.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <i className="fa-solid fa-circle-xmark" /> Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProduct && (
        <div className="admin-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="admin-modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <i className="fa-solid fa-box" style={{ marginRight: 8, color: '#2563eb' }} />
                Chi Tiết Yêu Cầu Duyệt Bài
              </h3>
              <button className="admin-modal-close" onClick={() => setSelectedProduct(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 12, fontWeight: 700, marginRight: 8 }}>
                  {selectedProduct.categoryName}
                </span>
                <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: 12, fontWeight: 700 }}>
                  Seller: {selectedProduct.shopName}
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
                {selectedProduct.name}
              </h2>

              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Giá bán: </span>
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                    {selectedProduct.priceContact ? 'Liên hệ' : fmt(selectedProduct.priceCurrent)}
                  </strong>
                </div>
                {selectedProduct.priceOriginal && (
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Giá gốc: </span>
                    <span style={{ fontSize: '0.95rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                      {fmt(selectedProduct.priceOriginal)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 8, color: '#334155' }}>
                  Mô Tả Sản Phẩm
                </div>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                  {selectedProduct.description || 'Chưa có mô tả.'}
                </p>
              </div>

              {/* Images list */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 10, color: '#334155' }}>
                  Ảnh sản phẩm ({imagesLoading ? '...' : productImages.length})
                </div>

                {imagesLoading ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8' }}>
                    <i className="fa-solid fa-spinner fa-spin" /> Đang tải ảnh...
                  </div>
                ) : productImages.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Không có ảnh.</div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {productImages.map(img => (
                      <div 
                        key={img.id} 
                        style={{ 
                          width: 100, height: 100, borderRadius: 8, overflow: 'hidden', 
                          border: `2px solid ${img.isPrimary ? '#10b981' : '#e2e8f0'}`
                        }}
                      >
                        <img 
                          src={img.imageUrl} 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="admin-btn admin-btn-ghost" onClick={() => setSelectedProduct(null)}>
                Đóng
              </button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleReject(selectedProduct.id)}>
                Từ chối
              </button>
              <button className="admin-btn admin-btn-success" onClick={() => handleApprove(selectedProduct.id)}>
                Duyệt ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingProducts;
