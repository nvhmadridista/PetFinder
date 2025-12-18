import { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Bell className="mr-2" /> Notifications
      </h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No notifications</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map(notification => (
              <li 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 transition ${!notification.is_read ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-800">{notification.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  {!notification.is_read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
