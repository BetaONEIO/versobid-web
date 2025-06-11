import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types/notification';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { role, toggleRole } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();

    // Subscribe to realtime notifications - both INSERT and UPDATE events
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, payload => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications'
      }, payload => {
        const updatedNotification = payload.new as Notification;
        setNotifications(prev =>
          prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
        );
        // Recalculate unread count
        setNotifications(current => {
          const newUnreadCount = current.filter(n => 
            n.id === updatedNotification.id ? !updatedNotification.read : !n.read
          ).length;
          setUnreadCount(newUnreadCount);
          return current.map(n => n.id === updatedNotification.id ? updatedNotification : n);
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    try {
      await notificationService.markAsRead(notification.id);
      // Update local state immediately for responsive UI
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => notification.read ? prev : prev - 1);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }

    // Navigate based on notification type and data
    if (notification.data && typeof notification.data === 'object') {
      const data = notification.data as any;
      
      // If it's a bid-related notification with bidId, navigate to bid details
      if (data.bidId && ['bid_accepted', 'bid_rejected', 'info'].includes(notification.type)) {
        setIsOpen(false);
        
        // Handle role switching for notifications where user is the bidder
        if ((notification.type === 'info' && notification.message.includes('counter offer')) ||
            ['bid_accepted', 'bid_rejected'].includes(notification.type)) {
          // User is receiving notification about their bid - they are the bidder (seller role)
          if (role !== 'seller') {
            toggleRole();
          }
        }
        
        navigate(`/bids/${data.bidId}`);
        return;
      }
      
      // If it's a bid received notification, navigate to bids page
      if (notification.type === 'bid_received') {
        setIsOpen(false);
        navigate('/bids');
        return;
      }
    }
    
    // Default: just close the dropdown
    setIsOpen(false);
  };

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 translate-x-[24%] mt-2 w-96 overflow-y-scroll h-96 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
            <div className="mt-4 space-y-4">
              {notifications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No notifications</p>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                      notification.read
                        ? 'bg-gray-50 dark:bg-gray-700'
                        : 'bg-blue-50 dark:bg-blue-900'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                    {!notification.read && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          New
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};