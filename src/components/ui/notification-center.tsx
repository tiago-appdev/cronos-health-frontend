import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, X, Star, Calendar, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast-context";
import { notificationApi, type Notification } from "@/services/notification-api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const NotificationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications(20, 0, true); // Include read notifications
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { unreadCount: count } = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;
    
    try {
      await notificationApi.markAsRead(notification.id);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast({
        title: "Notificación marcada como leída",
        type: "success",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída",
        type: "error",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      
      toast({
        title: "Todas las notificaciones marcadas como leídas",
        type: "success",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "No se pudieron marcar todas las notificaciones como leídas",
        type: "error",
      });
    }
  };

  const handleDeleteNotification = async (notification: Notification) => {
    try {
      await notificationApi.deleteNotification(notification.id);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      if (!notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast({
        title: "Notificación eliminada",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación",
        type: "error",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'survey_reminder':
        return <Star className="h-4 w-4" />;
      case 'appointment_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'system_notification':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  };
  const unreadNotifications = notifications.filter(n => !n.isRead);

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Cargando notificaciones...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No tienes notificaciones
            </div>
          ) : (
            <Tabs defaultValue="unread" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mx-2 mt-2">
                <TabsTrigger value="unread" className="text-xs">
                  No leídas ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs">
                  Todas ({notifications.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="unread" className="mt-0">
                {unreadNotifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No tienes notificaciones sin leer
                  </div>
                ) : (
                  <div className="space-y-0">
                    {unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDeleteNotification}
                        getIcon={getNotificationIcon}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="all" className="mt-0">
                <div className="space-y-0">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                      getIcon={getNotificationIcon}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Separate component for notification items
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  getIcon,
  getPriorityColor
}: {
  notification: Notification;
  onMarkAsRead: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  getIcon: (type: string) => React.ReactElement;
  getPriorityColor: (priority: string) => string;
}) => {
  const handleNotificationClick = () => {
    // Handle notification click based on type
    if (notification.type === 'survey_reminder' && notification.data.action_url) {
      window.location.href = notification.data.action_url as string;
    }
    
    // Mark as read if not already read
    if (!notification.isRead) {
      onMarkAsRead(notification);
    }
  };

  return (
    <div 
      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`${getPriorityColor(notification.priority)} mt-1`}>
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </p>
            <div className="flex items-center space-x-1 ml-2">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification);
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {notification.timeAgo}
          </p>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
          )}
        </div>
      </div>
    </div>
  );
};
