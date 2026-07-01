import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination/Pagination';

const BASE = 'http://localhost:8080/api/admin';

// Luôn đính kèm token từ localStorage vào mỗi request
const api = () => {
  const token = localStorage.getItem('auth_token');
  return axios.create({
    baseURL: BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  priceCurrent: number | null;
  priceContact: boolean;
  status: string;
  ratingStars: number;
  ratingCount: number;
  primaryImage: string;
  imageCount: number;
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

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filtered, setFiltered] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [bulkUrls, setBulkUrls] = useState('');
  const pagination = usePagination(filtered, 20);

  // ── Load products ────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api().get<AdminProduct[]>('/products');
      setProducts(res.data);
      setFiltered(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      toast.error(status === 403
        ? 'Không có quyền truy cập (403)'
        : `Không thể tải sản phẩm (${status ?? 'network error'})`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Filter ───────────────────────────────────────────────────
  useEffect(() => {
    let result = products;
    if (catFilter) result = result.filter(p => p.categoryName === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.slug.includes(q)
      );
    }
    setFiltered(result);
    pagination.setPage(1);
  }, [search, catFilter, products]);

  // ── Open image editor ────────────────────────────────────────
  const openEdit = async (product: AdminProduct) => {
    setEditingProduct(product);
    setBulkUrls('');
    setNewImageUrl('');
    setImagesLoading(true);
    try {
      const res = await api().get<ProductImage[]>(`/products/${product.id}/images`);
      setImages(res.data);
      setBulkUrls(res.data.map(i => i.imageUrl).join('\n'));
    } catch {
      toast.error('Không thể tải ảnh sản phẩm');
    } finally {
      setImagesLoading(false);
    }
  };

  // ── Handlers ─────────────────────────────────────────────────
  const handleUpdateSingleImage = async (imageId: number, newUrl: string) => {
    if (!newUrl.trim()) return;
    setSavingId(imageId);
    try {
      await api().put(`/products/images/${imageId}`, { imageUrl: newUrl.trim() });
      setImages(prev => prev.map(i => i.id === imageId ? { ...i, imageUrl: newUrl.trim() } : i));
      toast.success('Đã cập nhật ảnh');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSavingId(null);
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await api().patch(`/products/images/${imageId}/set-primary`);
      setImages(prev => prev.map(i => ({ ...i, isPrimary: i.id === imageId })));
      toast.success('Đã đặt ảnh đại diện');
    } catch {
      toast.error('Thất bại');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Xóa ảnh này?')) return;
    try {
      await api().delete(`/products/images/${imageId}`);
      setImages(prev => prev.filter(i => i.id !== imageId));
      toast.success('Đã xóa ảnh');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim() || !editingProduct) return;
    try {
      const res = await api().post(`/products/${editingProduct.id}/images`, {
        imageUrl: newImageUrl.trim(),
        isPrimary: images.length === 0
      });
      setImages(prev => [...prev, res.data]);
      setNewImageUrl('');
      toast.success('Đã thêm ảnh');
    } catch {
      toast.error('Thêm ảnh thất bại');
    }
  };

  const handleBulkReplace = async () => {
    if (!editingProduct) return;
    const urls = bulkUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length === 0) { toast.error('Nhập ít nhất 1 link'); return; }
    if (!window.confirm(`Xóa ${images.length} ảnh cũ và thay bằng ${urls.length} ảnh mới?`)) return;
    try {
      await api().put(`/products/${editingProduct.id}/images`, { imageUrls: urls });
      const res = await api().get<ProductImage[]>(`/products/${editingProduct.id}/images`);
      setImages(res.data);
      setProducts(prev => prev.map(p =>
        p.id === editingProduct.id
          ? { ...p, primaryImage: res.data[0]?.imageUrl ?? '', imageCount: res.data.length }
          : p
      ));
      toast.success(`Đã thay ${urls.length} ảnh`);
    } catch {
      toast.error('Thay ảnh thất bại');
    }
  };

  const categories = [...new Set(products.map(p => p.categoryName))].sort();

  // ── Render ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="admin-loading">
        <i className="fa-solid fa-spinner fa-spin" /> Đang tải sản phẩm...
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản Lý Sản Phẩm & Ảnh</h1>
        <p>Xem và cập nhật ảnh sản phẩm trực tiếp từ đây</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-images" />
            Danh Sách Sản Phẩm ({filtered.length})
          </h3>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <div className="admin-search-wrap">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              className="admin-search-input"
              style={{ width: '100%' }}
              placeholder="Tìm theo tên, slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-filter-select"
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-box-open" /> Không có sản phẩm nào
          </div>
        ) : (
            <>
            <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ảnh</th>
                  <th>Tên Sản Phẩm</th>
                  <th>Danh Mục</th>
                  <th>Giá</th>
                  <th>Rating</th>
                  <th>Số Ảnh</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {pagination.paged.map(p => (
                  <tr key={p.id}>
                    <td><span className="id-cell">#{p.id}</span></td>
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
                      <div className="name-cell" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.slug}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{p.categoryName}</td>
                    <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {p.priceContact
                        ? <span style={{ color: '#d97706', fontWeight: 600 }}>Liên hệ</span>
                        : fmt(p.priceCurrent)}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>⭐ {p.ratingStars} ({p.ratingCount})</td>
                    <td>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>
                        {p.imageCount}
                      </span>
                    </td>
                    <td>
                      <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => openEdit(p)}>
                        <i className="fa-solid fa-images" /> Sửa ảnh
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

      {/* ── Modal sửa ảnh ── */}
      {editingProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <i className="fa-solid fa-images" style={{ marginRight: 8, color: '#2563eb' }} />
                {editingProduct.name}
              </h3>
              <button className="admin-modal-close" onClick={() => setEditingProduct(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
              {imagesLoading ? (
                <div className="admin-loading" style={{ minHeight: 100 }}>
                  <i className="fa-solid fa-spinner fa-spin" /> Đang tải ảnh...
                </div>
              ) : (
                <>
                  {/* Danh sách ảnh */}
                  <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.875rem' }}>
                    Ảnh hiện có ({images.length})
                  </div>

                  {images.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0', fontSize: '0.85rem' }}>
                      Chưa có ảnh nào
                    </div>
                  )}

                  {images.map(img => (
                    <ImageRow
                      key={img.id}
                      img={img}
                      isSaving={savingId === img.id}
                      onUpdate={handleUpdateSingleImage}
                      onSetPrimary={handleSetPrimary}
                      onDelete={handleDeleteImage}
                    />
                  ))}

                  {/* Thêm ảnh lẻ */}
                  <div style={{ marginTop: 18, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.875rem' }}>
                      <i className="fa-solid fa-plus" style={{ marginRight: 6, color: '#16a34a' }} />
                      Thêm ảnh mới
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem', outline: 'none' }}
                        placeholder="https://images.unsplash.com/photo-..."
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddImage(); }}
                      />
                      <button className="admin-btn admin-btn-success" onClick={handleAddImage}>
                        <i className="fa-solid fa-plus" /> Thêm
                      </button>
                    </div>
                  </div>

                  {/* Thay hàng loạt */}
                  <div style={{ marginTop: 18, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                    <div style={{ fontWeight: 700, marginBottom: 3, fontSize: '0.875rem', color: '#dc2626' }}>
                      <i className="fa-solid fa-rotate" style={{ marginRight: 6 }} />
                      Thay toàn bộ ảnh
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 8 }}>
                      Mỗi link 1 dòng. Dòng đầu tiên = ảnh đại diện. <b>Xóa hết ảnh cũ.</b>
                    </div>
                    <textarea
                      style={{ width: '100%', minHeight: 90, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.8rem', fontFamily: 'monospace', resize: 'vertical', outline: 'none' }}
                      placeholder={'https://link1.com/anh1.jpg\nhttps://link2.com/anh2.jpg\nhttps://link3.com/anh3.jpg'}
                      value={bulkUrls}
                      onChange={e => setBulkUrls(e.target.value)}
                    />
                    <button className="admin-btn admin-btn-danger" style={{ marginTop: 8 }} onClick={handleBulkReplace}>
                      <i className="fa-solid fa-rotate" /> Thay toàn bộ ({bulkUrls.split('\n').filter(u => u.trim()).length} link)
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-ghost" onClick={() => setEditingProduct(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-component: 1 hàng ảnh ───────────────────────────────────
interface ImageRowProps {
  img: ProductImage;
  isSaving: boolean;
  onUpdate: (id: number, url: string) => void;
  onSetPrimary: (id: number) => void;
  onDelete: (id: number) => void;
}

const ImageRow: React.FC<ImageRowProps> = ({ img, isSaving, onUpdate, onSetPrimary, onDelete }) => {
  const [url, setUrl] = useState(img.imageUrl);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
      padding: '8px 12px', borderRadius: 10,
      background: img.isPrimary ? '#f0fdf4' : '#f8fafc',
      border: `1px solid ${img.isPrimary ? '#bbf7d0' : '#e2e8f0'}`
    }}>
      <img
        src={img.imageUrl}
        alt=""
        style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/46x46?text=err'; }}
      />
      <input
        style={{ flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: '0.78rem', fontFamily: 'monospace', outline: 'none', background: '#fff', minWidth: 0 }}
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      {img.isPrimary && (
        <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 10, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
          ĐẠI DIỆN
        </span>
      )}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          className="admin-btn admin-btn-success admin-btn-sm"
          disabled={isSaving || url === img.imageUrl}
          title="Lưu URL mới"
          onClick={() => onUpdate(img.id, url)}
        >
          {isSaving ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-check" />}
        </button>
        {!img.isPrimary && (
          <button className="admin-btn admin-btn-ghost admin-btn-sm" title="Đặt ảnh đại diện" onClick={() => onSetPrimary(img.id)}>
            <i className="fa-solid fa-star" />
          </button>
        )}
        <button className="admin-btn admin-btn-danger admin-btn-sm" title="Xóa ảnh" onClick={() => onDelete(img.id)}>
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  );
};

export default AdminProducts;
