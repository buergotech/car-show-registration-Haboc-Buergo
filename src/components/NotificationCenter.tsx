
import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  UserPlus,
  Car,
  Download,
  Trash2,
  X,
  CalendarDays,
} from "lucide-react";

import {
  getDashboardNotifications,
  subscribeToNotifications,
  markDashboardNotificationAsRead,
  markAllDashboardNotificationsAsRead,
  clearDashboardNotifications,
  type DashboardNotification,
  type DashboardNotificationType,
} from "../utils/notifications";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<
    DashboardNotification[]
  >(getDashboardNotifications);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return subscribeToNotifications(setNotifications);
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const getIcon = (type: DashboardNotificationType) => {
    switch (type) {
      case "registration":
        return <UserPlus size={18} className="text-blue-400" />;

      case "payment":
        return <CreditCard size={18} className="text-green-400" />;

      case "checkin":
        return <Car size={18} className="text-purple-400" />;

      case "export":
        return <Download size={18} className="text-yellow-400" />;

      case "event":
        return <CalendarDays size={18} className="text-orange-400" />;

      default:
        return <Bell size={18} className="text-slate-400" />;
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative rounded-lg border border-slate-700 bg-[#10243D] p-2.5 text-slate-300 transition hover:border-blue-500 hover:text-white"
        aria-label="Open notifications"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-3 w-[min(90vw,380px)] overflow-hidden rounded-xl border border-slate-700 bg-[#10243D] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-slate-700 p-4">
              <div>
                <h3 className="font-bold text-white">
                  Notifications
                </h3>
                <p className="text-xs text-slate-400">
                  {unreadCount} unread notification(s)
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
              <button
                onClick={markAllDashboardNotificationsAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-400 transition hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCheck size={14} />
                Mark all as read
              </button>

              <button
                onClick={clearDashboardNotifications}
                disabled={notifications.length === 0}
                className="flex items-center gap-1.5 text-xs font-medium text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Bell
                    size={30}
                    className="mx-auto mb-3 text-slate-600"
                  />
                  <p className="text-sm font-medium text-white">
                    No notifications yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Dashboard activities will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-slate-700/70 p-4 transition hover:bg-[#142B46] ${
                      !notification.read ? "bg-blue-500/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-[#071426] p-2">
                        {getIcon(notification.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-white">
                            {notification.title}
                          </h4>

                          {!notification.read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                          )}
                        </div>

                        <p className="mt-1 break-words text-xs leading-relaxed text-slate-400">
                          {notification.message}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500">
                            {formatDate(notification.date)}
                          </span>

                          {!notification.read && (
                            <button
                              onClick={() =>
                                markDashboardNotificationAsRead(
                                  notification.id
                                )
                              }
                              className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300"
                            >
                              <Check size={12} />
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
