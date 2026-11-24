
export type DashboardNotificationType =
  | "registration"
  | "payment"
  | "checkin"
  | "export"
  | "event";

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: DashboardNotificationType;
  date: string;
  read: boolean;
}

type NotificationListener = (
  notifications: DashboardNotification[]
) => void;

const NOTIFICATIONS_STORAGE_KEY = "carshow2027_notifications";

const loadSavedNotifications = (): DashboardNotification[] => {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    const validTypes: DashboardNotificationType[] = [
      "registration",
      "payment",
      "checkin",
      "export",
      "event",
    ];

    return parsed.filter((item): item is DashboardNotification => {
      return (
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.message === "string" &&
        validTypes.includes(item.type) &&
        typeof item.date === "string" &&
        typeof item.read === "boolean"
      );
    }).slice(0, 50);
  } catch {
    return [];
  }
};

let notifications: DashboardNotification[] =
  loadSavedNotifications();

const listeners = new Set<NotificationListener>();

const saveNotifications = () => {
  try {
    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications)
    );
  } catch (error) {
    console.error("Failed to save notifications:", error);
  }
};

const emit = () => {
  listeners.forEach((listener) => {
    listener([...notifications]);
  });
};

export const getDashboardNotifications = () => [
  ...notifications,
];

export const subscribeToNotifications = (
  listener: NotificationListener
) => {
  listeners.add(listener);

  listener([...notifications]);

  return () => {
    listeners.delete(listener);
  };
};

export const addDashboardNotification = (
  title: string,
  message: string,
  type: DashboardNotificationType
) => {
  const newNotification: DashboardNotification = {
    id: crypto.randomUUID(),
    title,
    message,
    type,
    date: new Date().toISOString(),
    read: false,
  };

  notifications = [newNotification, ...notifications].slice(0, 50);

  saveNotifications();
  emit();
};

export const markDashboardNotificationAsRead = (id: string) => {
  notifications = notifications.map((notification) =>
    notification.id === id
      ? { ...notification, read: true }
      : notification
  );

  saveNotifications();
  emit();
};

export const markAllDashboardNotificationsAsRead = () => {
  notifications = notifications.map((notification) => ({
    ...notification,
    read: true,
  }));

  saveNotifications();
  emit();
};

export const clearDashboardNotifications = () => {
  notifications = [];

  saveNotifications();
  emit();
};
