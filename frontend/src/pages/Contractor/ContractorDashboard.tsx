import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { statsService } from '../../services/statsService';
import type { TopPartner } from '../../services/statsService';
import { TopPartnersWidget } from '../../components/TopPartners/TopPartnersWidget';
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

const formatCurrency = (amount: number) => {
  if (amount == null) return 'Thỏa thuận';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatCurrencyVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return 'Chưa có';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const requestStatusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    OPEN:     { label: 'Chờ Báo Giá',   cls: 'pending'   },
    QUOTED:   { label: 'Đã Báo Giá',    cls: 'active'    },
    ACCEPTED: { label: 'Đã Chấp Nhận',  cls: 'accepted'  },
    CANCELLED:{ label: 'Đã Hủy',        cls: 'cancelled' },
  };
  const info = map[status] ?? { label: status, cls: 'pending' };
  return <span className={`status-badge ${info.cls}`}>{info.label}</span>;
};

const projectStatusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    ACCEPTED:    { label: 'Đang Thực Hiện', cls: 'active'    },
    COMPLETED:   { label: 'Hoàn Thành',     cls: 'accepted'  },
    CANCELLED:   { label: 'Đã Hủy',         cls: 'cancelled' },
  };
  const info = map[status] ?? { label: status, cls: 'active' };
  return <span className={`status-badge ${info.cls}`}>{info.label}</span>;
};

/* ════════════════════════════════════════════════════════ */

const ContractorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [openRequests, setOpenRequests] = useState<CustomOrderRequest[]>([]);
  const [activeProjects, setActiveProjects] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myStats, setMyStats] = useState<TopPartner | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const headers = { 'X-Contractor-Id': String(user.id) };

        const [openRes, projectsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/custom-orders/open?size=50'),
          axios.get('http://localhost:8080/api/custom-orders/contractor/projects', { headers }),
        ]);

        setOpenRequests(openRes.data?.content || []);
        setActiveProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      } catch (error) {
        console.error('Error fetching contractor dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    statsService.getContractorStats(Number(user.id))
        .then(setMyStats)
        .catch(err => console.error('Error fetching contractor stats:', err));
  }, [user]);

  if (isLoading) {
    return (
        <div className="contractor-loading">
          <i className="fa-solid fa-circle-notch fa-spin" />
          Đang tải dữ liệu...
        </div>
    );
  }

  return (
      <div className="contractor-dashboard">

        {/* ── Stat cards ── */}
        <div className="contractor-stat-grid">

          <div className="contractor-stat-card stat-blue">
            <div className="stat-icon-wrap bg-blue">
              <i className="fa-solid fa-file-invoice" />
            </div>
            <div>
              <div className="stat-value">{openRequests.length}</div>
              <div className="stat-label">Yêu Cầu Chờ Báo Giá</div>
            </div>
          </div>

          <div className="contractor-stat-card stat-green">
            <div className="stat-icon-wrap bg-green">
              <i className="fa-solid fa-hammer" />
            </div>
            <div>
              <div className="stat-value">{activeProjects.length}</div>
              <div className="stat-label">Dự Án Đang Thực Hiện</div>
            </div>
          </div>

          <div className="contractor-stat-card stat-gold">
            <div className="stat-icon-wrap bg-gold">
              <i className="fa-solid fa-star" />
            </div>
            <div>
              <div className="stat-value">4.8</div>
              <div className="stat-label">Đánh Giá Trung Bình</div>
            </div>
          </div>

          <div className="contractor-stat-card stat-navy">
            <div className="stat-icon-wrap bg-navy">
              <i className="fa-solid fa-sack-dollar" />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.15rem' }}>
                {myStats ? formatCurrencyVND(myStats.totalAmount) : '—'}
              </div>
              <div className="stat-label">
                Tổng Doanh Thu ({myStats?.transactionCount ?? 0} giao dịch)
              </div>
            </div>
          </div>

        </div>

        {/* ── Open requests ── */}
        <div className="contractor-card">
          <h3 className="contractor-card-title">
            Yêu Cầu Báo Giá Gần Đây
            <a href="/contractor/rfq">Xem tất cả →</a>
          </h3>

          {openRequests.length === 0 ? (
              <div className="contractor-empty">
                <i className="fa-regular fa-folder-open" />
                Chưa có yêu cầu báo giá nào mới.
              </div>
          ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="contractor-table">
                  <thead>
                  <tr>
                    <th>Mã YC</th>
                    <th>Sản Phẩm</th>
                    <th>Ngân Sách</th>
                    <th>Hạn Chót</th>
                    <th>Trạng Thái</th>
                  </tr>
                  </thead>
                  <tbody>
                  {openRequests.slice(0, 5).map(req => (
                      <tr key={req.id}>
                        <td className="id-cell">#REQ-{req.id}</td>
                        <td>{req.furnitureType || 'Chưa phân loại'}</td>
                        <td>{req.budgetMax ? formatCurrency(req.budgetMax) : 'Thỏa thuận'}</td>
                        <td>{formatDate(req.deadline)}</td>
                        <td>{requestStatusBadge(req.status)}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>

        {/* ── Active projects ── */}
        <div className="contractor-card">
          <h3 className="contractor-card-title">
            Dự Án Đang Thực Hiện
          </h3>

          {activeProjects.length === 0 ? (
              <div className="contractor-empty">
                <i className="fa-regular fa-pen-to-square" />
                Bạn chưa có dự án nào đang thực hiện.
              </div>
          ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="contractor-table">
                  <thead>
                  <tr>
                    <th>Mã Dự Án</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                  </thead>
                  <tbody>
                  {activeProjects.map(project => (
                      <tr key={project.id}>
                        <td className="id-cell">#PRJ-{project.id}</td>
                        <td>{projectStatusBadge(project.status)}</td>
                        <td>
                          {project.requestId ? (
                              <Link
                                  to={`/contractor/rfq/${project.requestId}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    background: '#eaf1ed',
                                    color: '#3d5c49',
                                    padding: '5px 12px',
                                    borderRadius: 20,
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                  }}
                              >
                                <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.7rem' }} />
                                Xem Chi Tiết
                              </Link>
                          ) : (
                              <span style={{ color: '#a89f92', fontSize: '0.8rem' }}>Không có chi tiết</span>
                          )}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>
        {/* ── Top Khách Hàng ── */}
        <TopPartnersWidget
            type="customer"
            limit={10}
            cardClassName="contractor-card"
            titleClassName="contractor-card-title"
            title="Top Khách Hàng"
        />

      </div>
  );
};

export default ContractorDashboard;