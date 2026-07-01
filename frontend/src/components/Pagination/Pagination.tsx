import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (p: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, total, from, to, onPageChange }) => {
  if (totalPages <= 1 && total === 0) return null;

  // Tạo danh sách số trang hiển thị (với "...")
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btnStyle = (active: boolean, disabled = false): React.CSSProperties => ({
    border: active ? 'none' : '1px solid #e2e8f0',
    padding: '6px 12px',
    borderRadius: 7,
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.82rem',
    fontWeight: active ? 700 : 500,
    background: active ? '#2563eb' : disabled ? '#f8fafc' : '#fff',
    color: active ? '#fff' : disabled ? '#cbd5e1' : '#475569',
    minWidth: 36,
    transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, flexWrap: 'wrap', gap: 10 }}>
      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
        Hiển thị <strong>{from}–{to}</strong> / <strong>{total}</strong> bản ghi
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button style={btnStyle(false, page === 1)} disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          <i className="fa-solid fa-chevron-left" style={{ fontSize: '0.75rem' }} />
        </button>
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`dots-${i}`} style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>
            : <button key={p} style={btnStyle(p === page)} onClick={() => onPageChange(p as number)}>{p}</button>
        )}
        <button style={btnStyle(false, page === totalPages)} disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.75rem' }} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
