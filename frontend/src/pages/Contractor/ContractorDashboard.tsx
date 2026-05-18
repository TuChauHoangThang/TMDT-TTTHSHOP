import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface CustomOrderRequest {
  id: number;
  furnitureType: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  status: string;
}

interface Quote {
  id: number;
  requestId: number;
  status: string;
}

const ContractorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [openRequests, setOpenRequests] = useState<CustomOrderRequest[]>([]);
  const [activeProjects, setActiveProjects] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const headers = { 'X-Contractor-Id': String(user.id) };

        // Lấy danh sách yêu cầu chờ báo giá
        const openRes = await axios.get('http://localhost:8080/api/custom-orders/open?size=50');
        setOpenRequests(openRes.data?.content || []);

        // Lấy danh sách dự án đang thực hiện (các báo giá đã được chấp nhận)
        const projectsRes = await axios.get('http://localhost:8080/api/custom-orders/contractor/projects', { headers });
        setActiveProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);

      } catch (error) {
        console.error("Error fetching contractor dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    if (amount == null) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="contractor-dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div className="contractor-card" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: 0 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <i className="fa-solid fa-file-invoice"></i>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{openRequests.length}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Yêu Cầu Chờ Báo Giá</div>
          </div>
        </div>

        <div className="contractor-card" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: 0 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <i className="fa-solid fa-hammer"></i>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{activeProjects.length}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Dự Án Đang Thực Hiện</div>
          </div>
        </div>

        <div className="contractor-card" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: 0 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <i className="fa-solid fa-star"></i>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>4.8</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Đánh Giá Trung Bình</div>
          </div>
        </div>

      </div>

      <div className="contractor-card">
        <h3 className="contractor-card-title">Yêu Cầu Báo Giá Gần Đây</h3>
        {openRequests.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Chưa có yêu cầu báo giá nào mới.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '10px 0' }}>Mã YC</th>
                  <th style={{ padding: '10px 0' }}>Sản Phẩm</th>
                  <th style={{ padding: '10px 0' }}>Ngân Sách</th>
                  <th style={{ padding: '10px 0' }}>Hạn Chót</th>
                  <th style={{ padding: '10px 0' }}>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {openRequests.slice(0, 5).map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 0', fontWeight: 500 }}>#REQ-{req.id}</td>
                    <td style={{ padding: '15px 0' }}>{req.furnitureType || 'Chưa phân loại'}</td>
                    <td style={{ padding: '15px 0' }}>
                      {req.budgetMax ? formatCurrency(req.budgetMax) : 'Thỏa thuận'}
                    </td>
                    <td style={{ padding: '15px 0' }}>{formatDate(req.deadline)}</td>
                    <td style={{ padding: '15px 0' }}>
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {req.status === 'OPEN' ? 'Chờ Báo Giá' : req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="contractor-card">
        <h3 className="contractor-card-title">Dự Án Đang Thực Hiện</h3>
        {activeProjects.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Bạn chưa có dự án nào đang thực hiện.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '10px 0' }}>Mã Dự Án (Quote)</th>
                  <th style={{ padding: '10px 0' }}>Trạng Thái</th>
                  <th style={{ padding: '10px 0' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {activeProjects.map(project => (
                  <tr key={project.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 0', fontWeight: 500 }}>#PRJ-{project.id}</td>
                    <td style={{ padding: '15px 0' }}>
                      <span style={{ background: '#e6f7ff', color: '#1890ff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {project.status === 'ACCEPTED' ? 'Đang Thực Hiện' : project.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px 0' }}>
                      {project.requestId ? (
                        <Link to={`/seller/rfq/${project.requestId}`} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
                          Xem Chi Tiết
                        </Link>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Không có chi tiết</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorDashboard;
