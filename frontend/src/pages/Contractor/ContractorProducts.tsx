import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  image: string;
  priceCurrent: number | null;
  priceOriginal: number | null;
  priceContact: boolean;
  status: string;
  ratingStars: number;
  ratingCount: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ContractorProducts: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceCurrent, setPriceCurrent] = useState('');
  const [priceOriginal, setPriceOriginal] = useState('');
  const [priceContact, setPriceContact] = useState(false);
  const [imageUrls, setImageUrls] = useState('');
  const [badges, setBadges] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchProducts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/products/seller?page=${page}&size=10`, {
        headers: { 'X-Contractor-Id': String(user.id) },
      });
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (error) {
      console.error('Error fetching contractor products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [user, page]);

  // Tự động tạo slug khi người dùng nhập tên sản phẩm mới
  const handleNameChange = (val: string) => {
    setName(val);
    if (modalType === 'add') {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const openAddModal = () => {
    setModalType('add');
    setSelectedProductId(null);
    setName('');
    setSlug('');
    setDescription('');
    setCategoryId(categories[0]?.id ? String(categories[0].id) : '');
    setPriceCurrent('');
    setPriceOriginal('');
    setPriceContact(false);
    setImageUrls('');
    setBadges('');
    setShowModal(true);
  };

  const openEditModal = async (product: ProductSummary) => {
    setModalType('edit');
    setSelectedProductId(product.id);
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/products/${product.id}`);
      const detail = res.data;
      setName(detail.name || '');
      setSlug(detail.slug || '');
      setDescription(detail.description || '');
      // Match category
      const foundCat = categories.find(c => c.name === detail.categoryName);
      setCategoryId(foundCat ? String(foundCat.id) : '');
      setPriceCurrent(detail.priceCurrent ? String(detail.priceCurrent) : '');
      setPriceOriginal(detail.priceOriginal ? String(detail.priceOriginal) : '');
      setPriceContact(detail.priceContact || false);
      setImageUrls(detail.images ? detail.images.join('\n') : '');
      setBadges(detail.badges ? detail.badges.join(', ') : '');
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching product detail:', error);
      toast.error('Không thể tải thông tin chi tiết sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!slug.trim()) {
      toast.error('Vui lòng nhập slug');
      return;
    }
    if (!categoryId) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      categoryId: Number(categoryId),
      priceCurrent: priceContact || !priceCurrent ? null : Number(priceCurrent),
      priceOriginal: priceOriginal ? Number(priceOriginal) : null,
      priceContact,
      imageUrls: imageUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0),
      badges: badges.split(',').map(b => b.trim()).filter(b => b.length > 0),
    };

    try {
      if (modalType === 'add') {
        await axios.post('http://localhost:8080/api/products', payload, {
          headers: { 'X-Contractor-Id': String(user.id) },
        });
        toast.success('Đăng sản phẩm thành công! Chờ Admin duyệt bài.');
      } else {
        await axios.put(`http://localhost:8080/api/products/${selectedProductId}`, payload, {
          headers: { 'X-Contractor-Id': String(user.id) },
        });
        toast.success('Cập nhật sản phẩm thành công! Chờ duyệt lại.');
      }
      setShowModal(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errMsg = error.response?.data?.error || 'Có lỗi xảy ra, vui lòng kiểm tra lại.';
      toast.error(errMsg);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!user?.id) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;

    try {
      await axios.delete(`http://localhost:8080/api/products/${productId}`, {
        headers: { 'X-Contractor-Id': String(user.id) },
      });
      toast.success('Xóa sản phẩm thành công!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Đang bán</span>;
      case 'PENDING':
        return <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Chờ duyệt</span>;
      case 'REJECTED':
        return <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Bị từ chối</span>;
      case 'INACTIVE':
        return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Tạm ẩn</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    }
  };

  return (
    <div className="contractor-products-container" style={{ padding: '8px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 600, margin: '0 0 6px' }}>
            Sản Phẩm Bán Sẵn
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Quản lý các bài đăng bán nội thất sẵn có của bạn trên hệ thống
          </p>
        </div>
        <button 
          onClick={openAddModal}
          style={{
            background: 'var(--cp-green)',
            color: '#fff',
            border: 'none',
            padding: '10px 22px',
            borderRadius: '24px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(61, 92, 73, 0.2)'
          }}
        >
          <i className="fa-solid fa-plus" />
          Đăng Sản Phẩm Mới
        </button>
      </div>

      {/* Main Table */}
      <div className="contractor-card" style={{ margin: 0, overflow: 'hidden' }}>
        {loading && products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px' }} />
            <div>Đang tải danh sách sản phẩm...</div>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: '#64748b' }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', margin: '0 0 6px' }}>Chưa có sản phẩm nào</h3>
            <p style={{ fontSize: '0.85rem', margin: '0 0 16px' }}>Hãy đăng sản phẩm nội thất đầu tiên để bắt đầu tiếp cận khách hàng!</p>
            <button onClick={openAddModal} className="btn btn--outline btn--sm" style={{ borderRadius: '20px' }}>Đăng bán ngay</button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="contractor-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên Sản Phẩm</th>
                    <th>Danh Mục</th>
                    <th>Giá Hiện Tại</th>
                    <th>Đánh Giá</th>
                    <th>Trạng Thái</th>
                    <th style={{ textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.image ? (
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                            onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/50x50?text=N/A'; }}
                          />
                        ) : (
                          <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-image" style={{ color: '#cbd5e1' }} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.slug}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#475569' }}>{p.categoryName}</td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                        {p.priceContact ? (
                          <span style={{ color: '#d97706' }}>Liên hệ</span>
                        ) : (
                          formatCurrency(p.priceCurrent)
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                        ⭐ {p.ratingStars} <span style={{ color: '#94a3b8' }}>({p.ratingCount})</span>
                      </td>
                      <td>{renderStatusBadge(p.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => openEditModal(p)}
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <i className="fa-solid fa-pen" /> Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <i className="fa-solid fa-trash" /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Tổng cộng: {totalElements} sản phẩm
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    disabled={page === 0} 
                    onClick={() => setPage(page - 1)}
                    className="btn btn--outline btn--sm"
                    style={{ borderRadius: '20px', padding: '4px 14px' }}
                  >
                    Trước
                  </button>
                  <span style={{ fontSize: '0.85rem', alignSelf: 'center', fontWeight: 600 }}>
                    Trang {page + 1} / {totalPages}
                  </span>
                  <button 
                    disabled={page >= totalPages - 1} 
                    onClick={() => setPage(page + 1)}
                    className="btn btn--outline btn--sm"
                    style={{ borderRadius: '20px', padding: '4px 14px' }}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '650px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                {modalType === 'add' ? 'Đăng Bán Sản Phẩm Mới' : 'Cập Nhật Thông Tin Sản Phẩm'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Row 1: Name & Slug */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label style={labelStyle}>Tên sản phẩm *</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="Ví dụ: Sofa Da Thật 3 Chỗ"
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label style={labelStyle}>Slug (Đường dẫn tĩnh) *</label>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="sofa-da-that-3-cho"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Row 2: Category & price_contact toggle */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={labelStyle}>Danh mục sản phẩm *</label>
                  <select 
                    value={categoryId} 
                    onChange={e => setCategoryId(e.target.value)}
                    required
                    style={inputStyle as any}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', height: '42px', paddingBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    <input 
                      type="checkbox" 
                      checked={priceContact}
                      onChange={e => setPriceContact(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    Liên hệ để biết giá
                  </label>
                </div>
              </div>

              {/* Row 3: Prices */}
              {!priceContact && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <label style={labelStyle}>Giá bán hiện tại (VND) *</label>
                    <input 
                      type="number" 
                      value={priceCurrent}
                      onChange={e => setPriceCurrent(e.target.value)}
                      placeholder="Ví dụ: 12000000"
                      required={!priceContact}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <label style={labelStyle}>Giá gốc (trước khi giảm) - Không bắt buộc</label>
                    <input 
                      type="number" 
                      value={priceOriginal}
                      onChange={e => setPriceOriginal(e.target.value)}
                      placeholder="Ví dụ: 14500000"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* Image URLs */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Danh sách ảnh sản phẩm (Mỗi link 1 dòng, ảnh đầu làm ảnh đại diện)</label>
                <textarea 
                  rows={4}
                  value={imageUrls}
                  onChange={e => setImageUrls(e.target.value)}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Badges & Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Thẻ nhãn (Cách nhau bằng dấu phẩy, ví dụ: HOT, MỚI, -15%)</label>
                <input 
                  type="text" 
                  value={badges}
                  onChange={e => setBadges(e.target.value)}
                  placeholder="HOT, MỚI"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Mô tả sản phẩm</label>
                <textarea 
                  rows={5}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Thông số, chất liệu, kích thước, chế độ bảo hành..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '24px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  style={{
                    background: 'var(--cp-green)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '24px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(61, 92, 73, 0.2)'
                  }}
                >
                  Lưu & Đăng Bán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* Styles */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '0.875rem',
  color: '#1e293b',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box'
};

export default ContractorProducts;
