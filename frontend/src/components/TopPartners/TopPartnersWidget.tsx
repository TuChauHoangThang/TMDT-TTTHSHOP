import React, { useEffect, useState } from 'react';
import { statsService } from '../../services/statsService';
import type { TopPartner } from '../../services/statsService';

const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

interface Props {
    type: 'contractor' | 'customer';
    limit?: number;
    cardClassName?: string;
    titleClassName?: string;
    title?: string;
}

export const TopPartnersWidget: React.FC<Props> = ({
                                                       type,
                                                       limit = 10,
                                                       cardClassName = 'admin-card',
                                                       titleClassName = 'admin-card-title',
                                                       title,
                                                   }) => {
    const [data, setData] = useState<TopPartner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetcher = type === 'contractor' ? statsService.getTopContractors : statsService.getTopCustomers;
        fetcher(limit)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [type, limit]);

    const heading = title ?? (type === 'contractor' ? 'Top Nhà Thầu' : 'Top Khách Hàng');
    const maxAmount = data.length > 0 ? Math.max(...data.map(p => p.totalAmount)) : 0;

    if (loading) return <div style={{ padding: '1rem', color: '#64748b' }}>Đang tải...</div>;

    return (
        <div className={cardClassName}>
            <div className="admin-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className={titleClassName}>
                    <i className={`fa-solid ${type === 'contractor' ? 'fa-hammer' : 'fa-user'}`} />
                    {' '}{heading}
                </h3>
            </div>

            {data.length === 0 ? (
                <div style={{ color: '#94a3b8', padding: '0.5rem' }}>Chưa có dữ liệu giao dịch.</div>
            ) : (
                <>
                    {/* ── Biểu đồ cột ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {data.slice(0, 5).map((p, idx) => {
                            const pct = maxAmount > 0 ? Math.round((p.totalAmount / maxAmount) * 100) : 0;
                            return (
                                <div key={p.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                                        <span style={{ fontWeight: 600, color: idx < 3 ? '#d97706' : '#334155' }}>
                                            #{idx + 1} {p.fullName}
                                        </span>
                                        <span style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(p.totalAmount)}</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${pct}%`,
                                                background: type === 'contractor' ? '#3d5c49' : '#3b82f6',
                                                borderRadius: '4px',
                                                transition: 'width 0.6s ease',
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Bảng chi tiết ── */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                        <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '6px 4px' }}>#</th>
                            <th style={{ padding: '6px 4px' }}>Tên</th>
                            <th style={{ padding: '6px 4px' }}>Email</th>
                            <th style={{ padding: '6px 4px', textAlign: 'center' }}>Số GD</th>
                            <th style={{ padding: '6px 4px', textAlign: 'right' }}>Tổng tiền</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.map((p, idx) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '6px 4px', fontWeight: 700, color: idx < 3 ? '#d97706' : '#94a3b8' }}>{idx + 1}</td>
                                <td style={{ padding: '6px 4px', fontWeight: 500 }}>{p.fullName}</td>
                                <td style={{ padding: '6px 4px', color: '#64748b' }}>{p.email}</td>
                                <td style={{ padding: '6px 4px', textAlign: 'center' }}>{p.transactionCount}</td>
                                <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{fmt(p.totalAmount)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};