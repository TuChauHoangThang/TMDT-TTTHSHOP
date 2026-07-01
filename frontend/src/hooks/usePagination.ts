import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], pageSize = 15) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Reset về trang 1 khi items thay đổi (filter mới)
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  return {
    page: safePage,
    setPage,
    totalPages,
    paged,
    total: items.length,
    from: items.length === 0 ? 0 : (safePage - 1) * pageSize + 1,
    to: Math.min(safePage * pageSize, items.length),
  };
}
