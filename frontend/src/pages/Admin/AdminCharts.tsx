import React, { useState } from 'react';

interface ChartDataPoint {
  date: string;
  orders: number;
  revenue: number;
}

interface AdminChartsProps {
  data: ChartDataPoint[];
}

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export const AdminCharts: React.FC<AdminChartsProps> = ({ data }) => {
  const [hoveredRevIdx, setHoveredRevIdx] = useState<number | null>(null);
  const [hoveredOrdIdx, setHoveredOrdIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
        Không có dữ liệu thống kê biểu đồ.
      </div>
    );
  }

  // --- Chart 1: Revenue Area Chart ---
  const revWidth = 550;
  const revHeight = 220;
  const padding = 35;
  const chartWidth = revWidth - padding * 2;
  const chartHeight = revHeight - padding * 2;

  const revenues = data.map(d => d.revenue);
  const maxRevenue = Math.max(...revenues, 1000000); // Avoid division by zero, default to min 1M

  // Calculate points
  const revPoints = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
    const y = revHeight - padding - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, date: d.date, value: d.revenue };
  });

  // SVG path for line and area
  const linePath = revPoints.reduce((acc, p, i) => {
    return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }, '');

  const areaPath = revPoints.length > 0
    ? `${linePath} L ${revPoints[revPoints.length - 1].x} ${revHeight - padding} L ${revPoints[0].x} ${revHeight - padding} Z`
    : '';

  // --- Chart 2: Orders Bar Chart ---
  const ordWidth = 550;
  const ordHeight = 220;
  const orders = data.map(d => d.orders);
  const maxOrders = Math.max(...orders, 5); // Avoid division by zero, default to min 5

  const barChartWidth = ordWidth - padding * 2;
  const barChartHeight = ordHeight - padding * 2;
  const barWidth = Math.max(12, (barChartWidth / data.length) * 0.6);
  const barGap = (barChartWidth - barWidth * data.length) / (data.length - 1 || 1);

  const barPoints = data.map((d, i) => {
    const x = padding + i * (barWidth + barGap);
    const h = (d.orders / maxOrders) * barChartHeight;
    const y = ordHeight - padding - h;
    return { x, y, w: barWidth, h, date: d.date, value: d.orders };
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
      
      {/* --- Revenue Chart Card --- */}
      <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', position: 'relative' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Biểu đồ doanh thu</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-primary)' }}>VND</span>
        </h3>

        <svg width="100%" height={revHeight} viewBox={`0 0 ${revWidth} ${revHeight}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
          {/* Gradients */}
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
            const y = padding + r * chartHeight;
            const val = maxRevenue * (1 - r);
            return (
              <g key={idx}>
                <line x1={padding} y1={y} x2={revWidth - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <text x={padding - 5} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{fmtVND(val)}</text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && <path d={areaPath} fill="url(#revGrad)" />}

          {/* Line Path */}
          {linePath && <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

          {/* X Axis Date Labels */}
          {revPoints.map((p, idx) => {
            // Only draw label for every Nth point if there are too many, to avoid overlapping
            const shouldDraw = data.length <= 10 || idx % Math.ceil(data.length / 7) === 0;
            return (
              <g key={idx}>
                {shouldDraw && (
                  <text x={p.x} y={revHeight - 12} textAnchor="middle" fontSize="9" fill="#94a3b8">{p.date}</text>
                )}
                {/* Invisible hover zone */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="14"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredRevIdx(idx)}
                  onMouseLeave={() => setHoveredRevIdx(null)}
                />
                {/* Active circle */}
                {(hoveredRevIdx === idx || (hoveredRevIdx === null && idx === revPoints.length - 1)) && (
                  <circle cx={p.x} cy={p.y} r="5" fill="#10b981" stroke="#fff" strokeWidth="2" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip Overlay */}
        {hoveredRevIdx !== null && (
          <div style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            pointerEvents: 'none',
            zIndex: 10,
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '2px' }}>Ngày: {revPoints[hoveredRevIdx].date}</div>
            <div style={{ fontWeight: 600, color: '#34d399' }}>{fmtVND(revPoints[hoveredRevIdx].value)}</div>
          </div>
        )}
      </div>

      {/* --- Orders Chart Card --- */}
      <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', position: 'relative' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Biểu đồ đơn hàng</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-primary)' }}>Đơn</span>
        </h3>

        <svg width="100%" height={ordHeight} viewBox={`0 0 ${ordWidth} ${ordHeight}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
            const y = padding + r * barChartHeight;
            const val = Math.round(maxOrders * (1 - r));
            return (
              <g key={idx}>
                <line x1={padding} y1={y} x2={ordWidth - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <text x={padding - 5} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{val}</text>
              </g>
            );
          })}

          {/* Bar Rects */}
          {barPoints.map((p, idx) => {
            const isHovered = hoveredOrdIdx === idx;
            return (
              <g key={idx}>
                <rect
                  x={p.x}
                  y={p.y}
                  width={p.w}
                  height={Math.max(2, p.h)}
                  rx={2}
                  fill={isHovered ? '#1d4ed8' : '#3b82f6'}
                  style={{ transition: 'fill 0.2s', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredOrdIdx(idx)}
                  onMouseLeave={() => setHoveredOrdIdx(null)}
                />
                {/* X Axis Labels */}
                {(data.length <= 10 || idx % Math.ceil(data.length / 7) === 0) && (
                  <text x={p.x + p.w / 2} y={ordHeight - 12} textAnchor="middle" fontSize="9" fill="#94a3b8">{p.date}</text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip Overlay */}
        {hoveredOrdIdx !== null && (
          <div style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            pointerEvents: 'none',
            zIndex: 10,
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '2px' }}>Ngày: {barPoints[hoveredOrdIdx].date}</div>
            <div style={{ fontWeight: 600, color: '#60a5fa' }}>{barPoints[hoveredOrdIdx].value} đơn hàng</div>
          </div>
        )}
      </div>

    </div>
  );
};
