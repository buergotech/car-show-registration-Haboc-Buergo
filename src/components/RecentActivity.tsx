
import {
  Activity,
  UserPlus,
  Pencil,
  Trash2,
  Download,
  Clock,
} from "lucide-react";

export type ActivityAction =
  | "Added"
  | "Updated"
  | "Deleted"
  | "Exported";

export interface ActivityRecord {
  id: string;
  action: ActivityAction;
  description: string;
  timestamp: Date;
}

interface RecentActivityProps {
  activities: ActivityRecord[];
}

const actionStyles = {
  Added: {
    icon: UserPlus,
    color: "text-green-400",
    background: "bg-green-500/10",
    label: "Registration Added",
  },
  Updated: {
    icon: Pencil,
    color: "text-blue-400",
    background: "bg-blue-500/10",
    label: "Registration Updated",
  },
  Deleted: {
    icon: Trash2,
    color: "text-red-400",
    background: "bg-red-500/10",
    label: "Registration Deleted",
  },
  Exported: {
    icon: Download,
    color: "text-purple-400",
    background: "bg-purple-500/10",
    label: "CSV Exported",
  },
};

export default function RecentActivity({
  activities,
}: RecentActivityProps) {
  const sortedActivities = [...activities].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime()
  );

  const formatDate = (date: Date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(parsedDate);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-700 bg-[#10243D] shadow-xl">
      {/* HEADER */}
      <div className="flex flex-col gap-3 border-b border-slate-700 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/10 p-2">
            <Activity size={21} className="text-purple-400" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Recent Activity
            </h2>

            <p className="text-xs text-slate-400">
              Latest actions performed in the dashboard
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full border border-slate-600 bg-[#071426] px-3 py-1 text-xs text-slate-400">
          {activities.length} activities
        </span>
      </div>

      {/* ACTIVITY LIST */}
      <div className="max-h-[calc(100vh-250px)] overflow-y-auto p-5">
        {sortedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-full bg-slate-700/50 p-4">
              <Clock size={28} className="text-slate-400" />
            </div>

            <h3 className="font-semibold text-white">
              No recent activity
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Dashboard activities will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedActivities.map((activity, index) => {
              const style = actionStyles[activity.action];
              const Icon = style.icon;

              return (
                <div
                  key={activity.id}
                  className="relative flex gap-4"
                >
                  {/* TIMELINE ICON */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`z-10 rounded-full p-2.5 ${style.background}`}
                    >
                      <Icon size={17} className={style.color} />
                    </div>

                    {index !== sortedActivities.length - 1 && (
                      <div className="absolute top-11 h-full w-px bg-slate-700" />
                    )}
                  </div>

                  {/* ACTIVITY DETAILS */}
                  <div className="min-w-0 flex-1 border-b border-slate-700/50 pb-5 last:border-0">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <p className={`text-sm font-semibold ${style.color}`}>
                        {style.label}
                      </p>

                      <span className="text-xs text-slate-500">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>

                    <p className="mt-1 break-words text-sm leading-relaxed text-slate-300">
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {activities.length > 0 && (
        <div className="border-t border-slate-700 bg-[#071426]/50 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing {activities.length} activity record(s), newest first.
          </p>
        </div>
      )}
    </section>
  );
}
