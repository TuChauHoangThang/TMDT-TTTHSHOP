import React from 'react';
import aboutBanner from '../../assets/about_banner.png';
import aboutStory from '../../assets/about_story.png';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page-container">
      {/* 1. Hero Section */}
      <div 
        className="about-hero" 
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${aboutBanner})` }}
      >
        <div className="about-hero-content">
          <span className="about-hero-tag">ABOUT OUR STUDIO</span>
          <h1>Kiến Tạo Không Gian Sống Độc Bản</h1>
          <p>Mang nghệ thuật thiết kế và chất lượng nội thất cao cấp đặt riêng đến ngôi nhà của bạn</p>
        </div>
      </div>

      {/* 2. Our Story Section */}
      <section className="about-story-section container">
        <div className="about-story-grid">
          <div className="story-text-col">
            <span className="section-tag">OUR STORY</span>
            <h2 className="section-title">Hành trình thổi hồn vào những tác phẩm gỗ tự nhiên</h2>
            <p className="story-lead">
              Được thành lập từ niềm đam mê cháy bỏng với đồ gỗ mỹ nghệ và kiến trúc nội thất tối giản, 
              HTTTSHOP ra đời nhằm mang lại những giá trị độc bản cho từng không gian sống.
            </p>
            <p className="story-paragraph">
              Chúng tôi không chỉ bán những món đồ nội thất thông thường; chúng tôi cùng bạn thảo luận, 
              phác thảo ý tưởng và hiện thực hóa từng sản phẩm thông qua dịch vụ <strong>Đặt Theo Yêu Cầu</strong>. 
              Mỗi chiếc bàn ăn, mỗi hệ tủ kệ hay chiếc sofa đều được đo ni đóng giày để vừa vặn tuyệt đối 
              với thói quen sinh hoạt và gu thẩm mỹ của gia chủ.
            </p>
            <p className="story-paragraph">
              Tại HTTTSHOP, sự kết hợp hoàn hảo giữa công nghệ gia công hiện đại và kỹ nghệ chạm khắc 
              thủ công truyền thống của những người thợ lành nghề tạo nên các dòng sản phẩm có độ bền 
              vượt thời gian, mang vẻ đẹp tinh tế, tự nhiên và ấm áp.
            </p>
          </div>
          <div className="story-image-col">
            <div className="story-image-wrapper">
              <img src={aboutStory} alt="Nghệ nhân mộc chế tác gỗ thủ công tại xưởng" className="story-image" />
              <div className="story-image-border"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Values Section */}
      <section className="about-values-section">
        <div className="container">
          <div className="section-center-header">
            <span className="section-tag">OUR VALUES</span>
            <h2 className="section-title">Giá trị tạo nên sự khác biệt</h2>
            <p className="section-subtitle">Triết lý hành động và lời cam kết vững chắc từ HTTTSHOP gửi tới mọi khách hàng</p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <i className="fa fa-gem"></i>
              </div>
              <h3>Chất Lượng Thượng Hạng</h3>
              <p>Tuyển chọn từ những dòng gỗ tự nhiên quý hiếm nhập khẩu, da thật cao cấp cùng phụ kiện kim khí bền bỉ nhất.</p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <i className="fa fa-pencil-ruler"></i>
              </div>
              <h3>Thiết Kế Độc Bản</h3>
              <p>Mỗi tác phẩm là độc nhất, được cá nhân hóa hoàn hảo theo kích thước căn phòng và phong cách riêng của gia chủ.</p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <i className="fa fa-shield-halved"></i>
              </div>
              <h3>Bảo Hành 5 Năm</h3>
              <p>Chính sách bảo hành vàng lên tới 5 năm cho toàn bộ khung xương và bảo trì trọn đời sản phẩm nội thất.</p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <i className="fa fa-face-smile"></i>
              </div>
              <h3>Dịch Vụ Tận Tâm</h3>
              <p>Đồng hành từ tư vấn, phác thảo 3D, đo đạc tại công trình thực tế cho đến bàn giao lắp đặt hoàn thiện.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Stats Section */}
      <section className="about-stats-section container">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">10+</span>
            <span className="stat-label">Năm Kinh Nghiệm</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5k+</span>
            <span className="stat-label">Khách Hàng Hài Lòng</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">150+</span>
            <span className="stat-label">Dự Án Lớn Nhỏ</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5 Năm</span>
            <span className="stat-label">Bảo Hành Vàng</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
