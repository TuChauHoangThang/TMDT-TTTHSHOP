import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/CustomOrder.css';
import { customOrderService } from '../../services/customOrderService';
import type { CreateCustomOrderDto, FurnitureType } from '../../types/customOrder';

const FURNITURE_TYPES: FurnitureType[] = [
  'Sofa & Ghế', 'Bàn & Ghế', 'Giường Ngủ', 'Tủ & Kệ',
  'Bàn Làm Việc', 'Nội thất nhà bếp', 'Nội thất ngoài trời', 'Khác',
];

const STEPS = ['Thông tin cơ bản', 'Chi tiết kỹ thuật', 'Ngân sách & Thời hạn', 'Ảnh tham khảo'];

const CreateCustomOrder: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState<CreateCustomOrderDto>({
    title: '',
    description: '',
    furnitureType: '',
    material: '',
    dimensions: '',
    colorStyle: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    images: [],
  });

  const [previews, setPreviews] = useState<string[]>([]);

  const update = (field: keyof CreateCustomOrderDto, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }));

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - form.images.length);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setForm(f => ({ ...f, images: [...f.images, ...newFiles] }));
    setPreviews(p => [...p, ...newPreviews]);
  };

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const validateStep = (): boolean => {
    if (step === 0 && (!form.title.trim() || !form.description.trim() || !form.furnitureType)) {
      showToast('Vui lòng điền đầy đủ thông tin cơ bản', 'error'); return false;
    }
    if (step === 2) {
      if (!form.budgetMin || !form.budgetMax) {
        showToast('Vui lòng nhập ngân sách dự kiến', 'error'); return false;
      }
      if (Number(form.budgetMin) > Number(form.budgetMax)) {
        showToast('Ngân sách tối thiểu không được lớn hơn tối đa', 'error'); return false;
      }
      if (!form.deadline) {
        showToast('Vui lòng chọn thời hạn cần hàng', 'error'); return false;
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => Math.min(s + 1, 3)); };
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const submitData = {
        ...form,
        budgetMin: Number(form.budgetMin) * 1000,
        budgetMax: Number(form.budgetMax) * 1000,
      };
      // Gọi API thực tế
      await customOrderService.createRequest(submitData, form.images);
      
      showToast('Yêu cầu đã được gửi! Nhà thầu sẽ sớm báo giá cho bạn.', 'success');
      setTimeout(() => navigate('/custom-orders'), 1500);
    } catch {
      showToast('Gửi yêu cầu thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="co-page">
      <div className="co-container">

        {/* Breadcrumb */}
        <div className="co-page-header">
          <div className="co-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
            <Link to="/custom-orders">Đặt hàng theo yêu cầu</Link>
            <i className="fa fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
            <span>Tạo yêu cầu mới</span>
          </div>
          <h1 className="co-page-title">✏️ Tạo Yêu Cầu Đặt Hàng</h1>
          <p className="co-page-subtitle">Mô tả chi tiết nhu cầu của bạn — các nhà thầu sẽ gửi báo giá tốt nhất!</p>
        </div>

        {/* Step Indicator */}
        <div className="co-steps">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className={`co-step ${i < step ? 'co-step--done' : i === step ? 'co-step--active' : ''}`}>
                <div className="co-step__dot">
                  {i < step ? <i className="fa fa-check"></i> : i + 1}
                </div>
                <span className="co-step__label">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="co-step__line"></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="co-form">

          {/* ---- Step 0: Thông Tin Cơ Bản ---- */}
          {step === 0 && (
            <div className="co-form-section">
              <div className="co-form-section__title">
                <i className="fa fa-circle-info"></i> Thông Tin Cơ Bản
              </div>
              <div className="co-form-section__body">
                <div className="co-field">
                  <label className="co-label">Tiêu đề yêu cầu <span>*</span></label>
                  <input
                    id="co-title"
                    className="co-input"
                    placeholder="VD: Sofa góc L phòng khách 25m², màu xanh lá"
                    value={form.title}
                    onChange={e => update('title', e.target.value)}
                    maxLength={200}
                  />
                </div>
                <div className="co-field">
                  <label className="co-label">Loại nội thất <span>*</span></label>
                  <select
                    id="co-furniture-type"
                    className="co-select"
                    value={form.furnitureType}
                    onChange={e => update('furnitureType', e.target.value)}
                  >
                    <option value="">-- Chọn loại nội thất --</option>
                    {FURNITURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="co-field">
                  <label className="co-label">Mô tả chi tiết yêu cầu <span>*</span></label>
                  <textarea
                    id="co-description"
                    className="co-textarea"
                    placeholder="Mô tả kỹ càng về kiểu dáng, công năng, phong cách bạn mong muốn..."
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---- Step 1: Chi Tiết Kỹ Thuật ---- */}
          {step === 1 && (
            <div className="co-form-section">
              <div className="co-form-section__title">
                <i className="fa fa-ruler-combined"></i> Chi Tiết Kỹ Thuật
              </div>
              <div className="co-form-section__body">
                <div className="co-field">
                  <label className="co-label">Kích thước mong muốn</label>
                  <input
                    id="co-dimensions"
                    className="co-input"
                    placeholder="VD: Dài 2.5m × Rộng 1.8m × Cao 0.85m"
                    value={form.dimensions}
                    onChange={e => update('dimensions', e.target.value)}
                  />
                </div>
                <div className="co-field">
                  <label className="co-label">Chất liệu mong muốn</label>
                  <input
                    id="co-material"
                    className="co-input"
                    placeholder="VD: Gỗ sồi nguyên khối, da thật, vải nhung..."
                    value={form.material}
                    onChange={e => update('material', e.target.value)}
                  />
                </div>
                <div className="co-field">
                  <label className="co-label">Màu sắc & Phong cách</label>
                  <input
                    id="co-color"
                    className="co-input"
                    placeholder="VD: Màu walnut tối, phong cách Scandinavian, minimalist..."
                    value={form.colorStyle}
                    onChange={e => update('colorStyle', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---- Step 2: Ngân Sách & Thời Hạn ---- */}
          {step === 2 && (
            <div className="co-form-section">
              <div className="co-form-section__title">
                <i className="fa fa-wallet"></i> Ngân Sách & Thời Hạn
              </div>
              <div className="co-form-section__body">
                <div className="co-field">
                  <label className="co-label">Ngân sách dự kiến <span>*</span></label>
                  <div className="co-input-row">
                    <div className="co-input-prefix" style={{ position: 'relative' }}>
                      <span className="co-input-prefix__label">Tối thiểu</span>
                      <input
                        id="co-budget-min"
                        type="number"
                        className="co-input"
                        placeholder="VD: 5000"
                        value={form.budgetMin}
                        onChange={e => update('budgetMin', e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        style={{ paddingRight: '55px' }}
                      />
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>.000 đ</span>
                    </div>
                    <div className="co-input-prefix" style={{ position: 'relative' }}>
                      <span className="co-input-prefix__label">Tối đa</span>
                      <input
                        id="co-budget-max"
                        type="number"
                        className="co-input"
                        placeholder="VD: 15000"
                        value={form.budgetMax}
                        onChange={e => update('budgetMax', e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        style={{ paddingRight: '55px' }}
                      />
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>.000 đ</span>
                    </div>
                  </div>
                  {(form.budgetMin !== '' || form.budgetMax !== '') && (
                    <small style={{ color: 'var(--color-primary)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block', fontWeight: 600 }}>
                      <i className="fa fa-wallet" style={{ marginRight: 6 }}></i>
                      Thực tế: {form.budgetMin !== '' ? (Number(form.budgetMin) * 1000).toLocaleString('vi-VN') : 0}đ – {form.budgetMax !== '' ? (Number(form.budgetMax) * 1000).toLocaleString('vi-VN') : 0}đ
                    </small>
                  )}
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                    Nhập ngân sách giúp nhà thầu đưa ra báo giá phù hợp hơn
                  </small>
                </div>
                <div className="co-field">
                  <label className="co-label">Thời hạn cần nhận hàng <span>*</span></label>
                  <input
                    id="co-deadline"
                    type="date"
                    className="co-input"
                    value={form.deadline}
                    min={todayStr}
                    onChange={e => update('deadline', e.target.value)}
                    style={{ maxWidth: 280 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---- Step 3: Ảnh Tham Khảo ---- */}
          {step === 3 && (
            <div className="co-form-section">
              <div className="co-form-section__title">
                <i className="fa fa-images"></i> Ảnh Tham Khảo (Tùy chọn — tối đa 5 ảnh)
              </div>
              <div className="co-form-section__body">
                <div
                  className={`co-upload-zone ${dragOver ? 'drag-over' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                >
                  <i className="fa fa-cloud-arrow-up"></i>
                  <p><strong>Kéo & thả ảnh vào đây</strong> hoặc click để chọn</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>PNG, JPG, WEBP — tối đa 5MB/ảnh</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handleFiles(e.target.files)}
                  />
                </div>
                {previews.length > 0 && (
                  <div className="co-preview-grid">
                    {previews.map((src, i) => (
                      <div key={i} className="co-preview-item">
                        <img src={src} alt={`preview-${i}`} />
                        <button className="co-preview-remove" onClick={() => removeImage(i)} type="button">
                          <i className="fa fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="co-submit-row">
            {step > 0 && (
              <button className="btn btn--outline" onClick={handleBack} type="button">
                <i className="fa fa-arrow-left"></i> Quay lại
              </button>
            )}
            <Link to="/custom-orders" className="btn btn--ghost" style={{ color: 'var(--color-text-muted)', border: '2px solid var(--color-border)' }}>
              Hủy
            </Link>
            {step < 3 ? (
              <button className="btn btn--primary" onClick={handleNext} type="button">
                Tiếp theo <i className="fa fa-arrow-right"></i>
              </button>
            ) : (
              <button
                id="co-submit-btn"
                className="btn btn--primary"
                onClick={handleSubmit}
                disabled={submitting}
                type="button"
              >
                {submitting ? <><div className="co-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Đang gửi...</> : <><i className="fa fa-paper-plane"></i> Gửi Yêu Cầu</>}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`co-toast co-toast--${toast.type}`}>
          <i className={`fa ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default CreateCustomOrder;
