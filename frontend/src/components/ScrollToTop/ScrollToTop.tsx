import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cuộn lên đầu trang ngay lập tức khi chuyển sang trang mới
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
