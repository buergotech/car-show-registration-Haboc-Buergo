
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  CheckCircle2,
  Bell,
  RotateCcw,
} from "lucide-react";

import { addDashboardNotification } from "../utils/notifications";

type ReminderMinutes = 5 | 15 | 30 | 1440;

type EventStatus =
  | "Upcoming"
  | "Due Today"
  | "Past Due"
  | "Completed";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  reminderMinutes: ReminderMinutes;
  reminderSent: boolean;
  completed: boolean;
}

const EVENTS_STORAGE_KEY = "carshow2027_events";

const getLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const loadSavedEvents = (): EventItem[] => {
  try {
    const savedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);

    if (!savedEvents) return [];

    const parsedEvents: unknown = JSON.parse(savedEvents);

    if (!Array.isArray(parsedEvents)) return [];

    return parsedEvents.filter((event): event is EventItem => {
      return (
        typeof event.id === "string" &&
        typeof event.title === "string" &&
        typeof event.date === "string" &&
        typeof event.time === "string" &&
        typeof event.location === "string" &&
        typeof event.description === "string" &&
        [5, 15, 30, 1440].includes(event.reminderMinutes) &&
        typeof event.reminderSent === "boolean" &&
        typeof event.completed === "boolean"
      );
    });
  } catch {
    return [];
  }
};

const getEventDateTime = (event: EventItem) =>
  new Date(`${event.date}T${event.time}:00`);

const getReminderLabel = (minutes: ReminderMinutes) => {
  switch (minutes) {
    case 5:
      return "5 minutes before";
    case 15:
      return "15 minutes before";
    case 30:
      return "30 minutes before";
    case 1440:
      return "1 day before";
  }
};

const getEventStatus = (
  event: EventItem,
  now: Date
): EventStatus => {
  if (event.completed) return "Completed";

  const eventDateTime = getEventDateTime(event);

  if (eventDateTime.getTime() < now.getTime()) {
    return "Past Due";
  }

  if (event.date === getLocalDate(now)) {
    return "Due Today";
  }

  return "Upcoming";
};

const getStatusStyle = (status: EventStatus) => {
  switch (status) {
    case "Upcoming":
      return "bg-blue-500/10 text-blue-400";
    case "Due Today":
      return "bg-yellow-500/10 text-yellow-400";
    case "Past Due":
      return "bg-red-500/10 text-red-400";
    case "Completed":
      return "bg-green-500/10 text-green-400";
  }
};

export default function CalendarSchedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(
    getLocalDate(new Date())
  );

  const [events, setEvents] = useState<EventItem[]>(loadSavedEvents);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(
    getLocalDate(new Date())
  );
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [reminderMinutes, setReminderMinutes] =
    useState<ReminderMinutes>(15);

  const [currentTime, setCurrentTime] = useState(new Date());

  const notifiedReminderIds = useRef(new Set<string>());

  const today = getLocalDate(currentTime);

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // SAVE EVENTS TO LOCAL STORAGE
  useEffect(() => {
    try {
      localStorage.setItem(
        EVENTS_STORAGE_KEY,
        JSON.stringify(events)
      );
    } catch (error) {
      console.error("Failed to save calendar events:", error);
    }
  }, [events]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;

    const startDate = new Date(year, month, 1 - mondayOffset);

    return Array.from({ length: 42 }, (_, index) => {
      return new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + index
      );
    });
  }, [currentMonth]);

  const selectedEvents = events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const upcomingEvents = [...events]
    .filter(
      (event) =>
        !event.completed &&
        getEventDateTime(event).getTime() >= currentTime.getTime()
    )
    .sort(
      (a, b) =>
        getEventDateTime(a).getTime() -
        getEventDateTime(b).getTime()
    )
    .slice(0, 5);

  const completedCount = events.filter(
    (event) => event.completed
  ).length;

  const resetForm = () => {
    setTitle("");
    setEventDate(selectedDate);
    setTime("09:00");
    setLocation("");
    setDescription("");
    setReminderMinutes(15);
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditingId(null);
    setTitle("");
    setEventDate(selectedDate);
    setTime("09:00");
    setLocation("");
    setDescription("");
    setReminderMinutes(15);
    setShowForm(true);
  };

  const openEditForm = (event: EventItem) => {
    setEditingId(event.id);
    setTitle(event.title);
    setEventDate(event.date);
    setTime(event.time);
    setLocation(event.location);
    setDescription(event.description);
    setReminderMinutes(event.reminderMinutes);
    setShowForm(true);
  };

  const saveEvent = () => {
    if (!title.trim() || !eventDate || !time) return;

    const existingEvent = events.find(
      (event) => event.id === editingId
    );

    const eventData: EventItem = {
      id: editingId ?? crypto.randomUUID(),
      title: title.trim(),
      date: eventDate,
      time,
      location: location.trim(),
      description: description.trim(),
      reminderMinutes,
      reminderSent: false,
      completed: existingEvent?.completed ?? false,
    };

    if (editingId) {
      notifiedReminderIds.current.delete(editingId);

      setEvents((previous) =>
        previous.map((event) =>
          event.id === editingId ? eventData : event
        )
      );
    } else {
      setEvents((previous) => [...previous, eventData]);
    }

    setSelectedDate(eventDate);

    setCurrentMonth(
      new Date(
        Number(eventDate.slice(0, 4)),
        Number(eventDate.slice(5, 7)) - 1,
        1
      )
    );

    resetForm();
  };

  const deleteEvent = (id: string) => {
    notifiedReminderIds.current.delete(id);

    setEvents((previous) =>
      previous.filter((event) => event.id !== id)
    );
  };

  const toggleCompleted = (id: string) => {
    setEvents((previous) =>
      previous.map((event) => {
        if (event.id !== id) return event;

        const completed = !event.completed;

        if (!completed) {
          notifiedReminderIds.current.delete(event.id);
        }

        return {
          ...event,
          completed,
          reminderSent: completed ? event.reminderSent : false,
        };
      })
    );

    const event = events.find((item) => item.id === id);

    if (event && !event.completed) {
      addDashboardNotification(
        "Event Completed",
        `${event.title} has been marked as completed.`,
        "event"
      );
    }
  };

  const changeMonth = (amount: number) => {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + amount,
          1
        )
    );
  };

  const formatSelectedDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // UPDATE DISPLAYED TIME
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  // AUTOMATIC EVENT REMINDERS
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      const dueReminders = events.filter((event) => {
        if (event.completed || event.reminderSent) return false;

        if (notifiedReminderIds.current.has(event.id)) {
          return false;
        }

        const eventTime = getEventDateTime(event);

        const reminderTime = new Date(
          eventTime.getTime() -
            event.reminderMinutes * 60 * 1000
        );

        return (
          now.getTime() >= reminderTime.getTime() &&
          now.getTime() < eventTime.getTime()
        );
      });

      if (dueReminders.length === 0) return;

      dueReminders.forEach((event) => {
        notifiedReminderIds.current.add(event.id);

        addDashboardNotification(
          "Upcoming Event Reminder",
          `${event.title} starts at ${event.time} on ${formatSelectedDate(event.date)}. Reminder: ${getReminderLabel(event.reminderMinutes)}.`,
          "event"
        );
      });

      const dueIds = new Set(
        dueReminders.map((event) => event.id)
      );

      setEvents((previous) =>
        previous.map((event) =>
          dueIds.has(event.id)
            ? { ...event, reminderSent: true }
            : event
        )
      );
    };

    checkReminders();

    const timer = window.setInterval(checkReminders, 15000);

    return () => window.clearInterval(timer);
  }, [events]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* CALENDAR HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">
            Event Calendar
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Organize and manage your Car Show 2027 activities.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus size={17} />
          Add Event
        </button>
      </div>

      {/* EVENT SUMMARY */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-[#10243D] p-4">
          <p className="text-xs text-slate-400">Total Events</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {events.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#10243D] p-4">
          <p className="text-xs text-slate-400">Upcoming</p>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            {events.filter(
              (event) =>
                !event.completed &&
                getEventDateTime(event).getTime() >=
                  currentTime.getTime()
            ).length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#10243D] p-4">
          <p className="text-xs text-slate-400">Past Due</p>
          <p className="mt-2 text-2xl font-bold text-red-400">
            {events.filter(
              (event) =>
                !event.completed &&
                getEventDateTime(event).getTime() <
                  currentTime.getTime()
            ).length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#10243D] p-4">
          <p className="text-xs text-slate-400">Completed</p>
          <p className="mt-2 text-2xl font-bold text-green-400">
            {completedCount}
          </p>
        </div>
      </div>

      {/* CALENDAR AND EVENTS */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* MONTHLY CALENDAR */}
        <div className="rounded-xl border border-slate-700 bg-[#10243D] p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <CalendarDays size={21} className="text-blue-400" />
              </div>
              <h3 className="font-bold text-white">{monthName}</h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="rounded-lg border border-slate-600 p-2 text-slate-300 hover:bg-slate-700"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(today);
                }}
                className="rounded-lg border border-slate-600 px-3 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Today
              </button>

              <button
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="rounded-lg border border-slate-600 p-2 text-slate-300 hover:bg-slate-700"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-semibold text-slate-500"
                >
                  {day}
                </div>
              )
            )}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const dateString = getLocalDate(date);
              const isCurrentMonth =
                date.getMonth() === currentMonth.getMonth();
              const isToday = dateString === today;
              const isSelected = dateString === selectedDate;

              const dateEvents = events.filter(
                (event) => event.date === dateString
              );

              const hasEvent = dateEvents.length > 0;

              const hasIncompleteEvent = dateEvents.some(
                (event) => !event.completed
              );

              return (
                <button
                  key={dateString}
                  onClick={() => setSelectedDate(dateString)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition ${
                    isSelected
                      ? "bg-blue-600 font-bold text-white"
                      : isToday
                        ? "border border-blue-500/70 text-blue-400"
                        : "text-slate-300 hover:bg-slate-700"
                  } ${!isCurrentMonth ? "opacity-30" : ""}`}
                >
                  {date.getDate()}

                  {hasEvent && (
                    <span
                      className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                        isSelected
                          ? "bg-white"
                          : hasIncompleteEvent
                            ? "bg-blue-400"
                            : "bg-green-400"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-700 pt-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Selected date
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border border-blue-400" />
              Today
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Pending event
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Completed event
            </div>
          </div>
        </div>

        {/* SELECTED DATE EVENTS */}
        <div className="rounded-xl border border-slate-700 bg-[#10243D] p-4 sm:p-5">
          <div className="mb-5">
            <h3 className="font-bold text-white">Selected Date</h3>
            <p className="mt-1 text-sm text-slate-400">
              {formatSelectedDate(selectedDate)}
            </p>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <CalendarDays size={34} className="mb-3 text-slate-600" />
              <p className="font-medium text-slate-300">
                No events scheduled
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Add an event for this date.
              </p>
              <button
                onClick={openAddForm}
                className="mt-4 text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                + Create an event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event) => {
                const status = getEventStatus(event, currentTime);

                return (
                  <div
                    key={event.id}
                    className="rounded-lg border border-slate-700 bg-[#071426] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-white">
                            {event.title}
                          </h4>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusStyle(status)}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                          <Clock size={14} />
                          {event.time}
                        </div>

                        {event.location && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                            <MapPin size={14} />
                            {event.location}
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-2 text-xs text-blue-400">
                          <Bell size={14} />
                          {getReminderLabel(event.reminderMinutes)}
                          {event.reminderSent && (
                            <span className="text-green-400">
                              · Sent
                            </span>
                          )}
                        </div>

                        {event.description && (
                          <p className="mt-3 text-sm text-slate-400">
                            {event.description}
                          </p>
                        )}

                        <button
                          onClick={() => toggleCompleted(event.id)}
                          className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            event.completed
                              ? "border border-slate-600 text-slate-300 hover:bg-slate-700"
                              : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          }`}
                        >
                          {event.completed ? (
                            <>
                              <RotateCcw size={14} />
                              Mark as Incomplete
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} />
                              Mark as Completed
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => openEditForm(event)}
                          aria-label="Edit event"
                          className="rounded-lg p-2 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => deleteEvent(event.id)}
                          aria-label="Delete event"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* UPCOMING EVENTS */}
      <div className="rounded-xl border border-slate-700 bg-[#10243D] p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Upcoming Events</h3>
            <p className="mt-1 text-xs text-slate-400">
              Your next scheduled activities
            </p>
          </div>

          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            {upcomingEvents.length} events
          </span>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No upcoming events yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-700">
            {upcomingEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => {
                  setSelectedDate(event.date);
                  setCurrentMonth(
                    new Date(
                      Number(event.date.slice(0, 4)),
                      Number(event.date.slice(5, 7)) - 1,
                      1
                    )
                  );
                }}
                className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-white/[0.02]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatSelectedDate(event.date)} · {event.time}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusStyle(getEventStatus(event, currentTime))}`}
                  >
                    {getEventStatus(event, currentTime)}
                  </span>
                </div>
                <ChevronRight size={17} className="shrink-0 text-slate-500" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT EVENT FORM */}
      {showForm && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              resetForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="my-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-[#10243D] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-700 p-5">
              <div>
                <h3 className="font-bold text-white">
                  {editingId ? "Edit Event" : "Add New Event"}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Enter your event schedule and reminder details.
                </p>
              </div>

              <button
                onClick={resetForm}
                aria-label="Close event form"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Event Title *
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Vehicle Registration"
                  className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-300">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(event) => setEventDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-300">
                    Event Time *
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Reminder
                </label>
                <select
                  value={reminderMinutes}
                  onChange={(event) =>
                    setReminderMinutes(
                      Number(event.target.value) as ReminderMinutes
                    )
                  }
                  className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value={5}>5 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={1440}>1 day before</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  A notification will appear in your dashboard when this reminder is due.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Location
                </label>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Event venue"
                  className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Add event details..."
                  className="w-full resize-none rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  onClick={saveEvent}
                  disabled={!title.trim() || !eventDate || !time}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {editingId ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
