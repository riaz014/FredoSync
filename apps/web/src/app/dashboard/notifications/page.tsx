'use client';

import { useEffect, useState } from 'react';
import { useWorkspaceStore, useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Bell, Trash2, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'MENTION' | 'INVITATION' | 'GOAL_ASSIGNED' | 'ACTION_ITEM_ASSIGNED' | 'ANNOUNCEMENT';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationsPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data || []);
    } catch (error: any) {
      if (error.response?.status !== 403) {
        toast.error('Failed to fetch notifications');
      }
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.put(`/api/notifications/${notificationId}`, { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post(`/api/notifications/mark-all-read`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      MENTION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      INVITATION: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      GOAL_ASSIGNED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      ACTION_ITEM_ASSIGNED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      ANNOUNCEMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    return colors[type as keyof typeof colors] || colors.ANNOUNCEMENT;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      MENTION: 'Mention',
      INVITATION: 'Invitation',
      GOAL_ASSIGNED: 'Goal Assigned',
      ACTION_ITEM_ASSIGNED: 'Task Assigned',
      ANNOUNCEMENT: 'Announcement',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'You are all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread'
                ? 'You have read all your notifications'
                : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-start gap-4 transition-all ${
                !notification.isRead
                  ? 'border-l-4 border-blue-600'
                  : ''
              }`}
            >
              <div className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(notification.type)}`}>
                {getTypeLabel(notification.type)}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {notification.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Archive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
