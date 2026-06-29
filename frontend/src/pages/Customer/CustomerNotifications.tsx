import React, { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import type { NotificationItem } from '../../services/notificationService';
import { toast } from 'react-toastify';
import './CustomerNotifications.css';

const CustomerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thao tác');
    }
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#777' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
          Đang tải thông báo...
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Thông Báo Của Bạn</h2>
        {notifications.some(n => !n.read) && (
          <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
            <i className="fa-solid fa-check-double"></i> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <i className="fa-regular fa-bell-slash"></i>
          <p>Bạn chưa có thông báo nào.</p>
        </div>
      ) : (
        <ul className="notifications-list">
          {notifications.map(notification => (
            <li
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div className="notification-icon">
                <i className={`fa-solid ${notification.title.includes('thành công') ? 'fa-circle-check' : 'fa-circle-info'}`}></i>
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              {!notification.read && <span className="unread-dot"></span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerNotifications;
