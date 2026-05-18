import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../User/UserProfile.css'; // Tái sử dụng CSS của UserProfile cho nhanh và đồng nhất

interface Shop {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  logoUrl: string;
  rating: number;
  ratingCount: number;
}

const ContractorProfile: React.FC = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: ''
  });
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    
    // Gọi API lấy thông tin shop
    axios.get('http://localhost:8080/api/shops/my-shop', {
      headers: { 'X-Contractor-Id': String(user.id) }
    })
    .then(res => {
      setShop(res.data);
      setFormData({
        name: res.data.name || '',
        description: res.data.description || '',
        address: res.data.address || ''
      });
    })
    .catch(err => {
      console.error("Lỗi lấy thông tin shop:", err);
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    try {
      const res = await axios.put('http://localhost:8080/api/shops/my-shop', formData, {
        headers: { 'X-Contractor-Id': String(user.id) }
      });
      setSuccessMsg('Cập nhật hồ sơ cửa hàng thành công!');
      setShop(res.data);
    } catch (err) {
      setErrorMsg('Cập nhật thất bại. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Hồ Sơ Cửa Hàng</h1>
        <p className="profile-subtitle">Quản lý thông tin hiển thị của cửa hàng (Nhà thầu) trên hệ thống</p>
      </div>

      <div className="profile-body">
        <div className="profile-form-section" style={{ flex: 2 }}>
          <form onSubmit={handleSubmit}>
            
            <div className="form-row">
              <label className="form-label" htmlFor="name">Tên cửa hàng</label>
              <div className="form-value">
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  className="profile-input" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="address">Địa chỉ cửa hàng / Xưởng</label>
              <div className="form-value">
                <input 
                  type="text" 
                  id="address"
                  name="address"
                  className="profile-input" 
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row" style={{ alignItems: 'flex-start' }}>
              <label className="form-label" htmlFor="description" style={{ marginTop: '10px' }}>Mô tả ngắn</label>
              <div className="form-value">
                <textarea 
                  id="description"
                  name="description"
                  className="profile-input" 
                  style={{ height: '100px', resize: 'vertical' }}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Giới thiệu về xưởng, kinh nghiệm, thế mạnh..."
                />
              </div>
            </div>

            {shop && (
              <div className="form-row">
                <div className="form-label">Thống kê</div>
                <div className="form-value text-value">
                  ⭐ {shop.rating} ({shop.ratingCount} đánh giá)
                </div>
              </div>
            )}

            <div className="form-row submit-row">
              {successMsg && <div style={{ color: '#1e8e3e', fontSize: '0.85rem', marginBottom: 8 }}>✅ {successMsg}</div>}
              {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 8 }}>❌ {errorMsg}</div>}
              <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
              </button>
            </div>
            
          </form>
        </div>

        <div className="profile-avatar-section" style={{ flex: 1 }}>
          <div className="avatar-preview" style={{ borderRadius: '8px' }}>
            {shop?.logoUrl ? (
              <img src={shop.logoUrl} alt="Logo Cửa Hàng" style={{ borderRadius: '8px' }} />
            ) : (
              <i className="fa-solid fa-store" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            )}
          </div>
          <button className="btn-upload">Cập Nhật Logo</button>
          <div className="upload-requirements">
            <p>Dung lượng file tối đa 2 MB</p>
            <p>Định dạng: .JPEG, .PNG, .WEBP</p>
            <p>Tỉ lệ 1:1 (Vuông)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorProfile;
