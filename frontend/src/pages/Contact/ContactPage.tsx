import React, { useState } from 'react';
import { toast } from 'react-toastify';
import contactBg from '../../assets/contact_bg.png';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.warning('Vui lòng điền đầy đủ thông tin để gửi liên hệ!');
      return;
    }

    setIsSubmitting(true);

    // Giả lập gửi tin nhắn thành công
    setTimeout(() => {
      toast.success('Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công.');
      setFormData({
        name: '',
        email: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="contact-page-container">
      <div className="contact-grid">
        {/* Cột trái: Ảnh nền Minimalist */}
        <div 
          className="contact-image-section" 
          style={{ backgroundImage: `url(${contactBg})` }}
          aria-label="Minimalist office space decoration"
        ></div>

        {/* Cột phải: Form & Thông tin liên hệ */}
        <div className="contact-content-section">
          <div className="contact-form-wrapper">
            
            {/* Header */}
            <div className="contact-header">
              <h1>Contact us</h1>
              <p className="contact-subtitle">Contact us for a quote, help or to join the team.</p>
            </div>

            {/* Info block */}
            <div className="contact-info-grid">
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">2713 Lowe Haven</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <a href="mailto:hi@studio.com" className="info-value info-link">hi@studio.com</a>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <a href="tel:071-246-3165" className="info-value info-link">071-246-3165</a>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="contact-form">
              <h2 className="form-title">Get a quote</h2>

              <div className="form-group">
                <label htmlFor="name" className="minimal-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Owen Goodwin"
                  className="minimal-input"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="minimal-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="owen.g@hello.com"
                  className="minimal-input"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="minimal-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Dear Studio,&#10;I would like to launch a new website for people who loves cats..."
                  rows={6}
                  className="minimal-textarea"
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-send-message"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>

            {/* Follow Us */}
            <div className="contact-social-section">
              <h3 className="social-title">Follow us</h3>
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="platform">Facebook</span> <span className="handle">/studio</span>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="platform">Twitter</span> <span className="handle">/studio</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="platform">Instagram</span> <span className="handle">/studio</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="platform">Linkedin</span> <span className="handle">/studio</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
