
import { useState } from "react";
import { Settings, X, CalendarDays } from "lucide-react";

import DashboardHeader from "./components/DashboardHeader";
import KpiCards from "./components/KpiCards";
import RegistrationsSection from "./components/RegistrationsSection";
import UserProfileSettings from "./components/UserProfileSettings";
import NotificationCenter from "./components/NotificationCenter";
import CalendarSchedule from "./components/CalendarSchedule";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <main className="min-h-screen bg-[#071426] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* DASHBOARD HEADER */}
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <DashboardHeader />
          </div>

          {/* CALENDAR */}
          <button
            onClick={() => setShowCalendar(true)}
            aria-label="Open calendar"
            title="Event Calendar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-[#10243D] text-slate-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
          >
            <CalendarDays size={21} />
          </button>

          {/* NOTIFICATIONS */}
          <NotificationCenter />

          {/* SETTINGS */}
          <button
            onClick={() => setShowSettings(true)}
            aria-label="Open settings"
            title="Settings"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-[#10243D] text-slate-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
          >
            <Settings size={21} />
          </button>
        </div>

      
        {/* REGISTRATIONS */}
               {/* KPI SUMMARY */}
        <KpiCards />

        {/* REGISTRATIONS */}
        <RegistrationsSection />
      </div> 

      {/* CALENDAR MODAL */}
      {showCalendar && (
        <div
          className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCalendar(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-modal-title"
            className="relative max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#071426] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-[#10243D] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <CalendarDays
                    size={20}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <h2
                    id="calendar-modal-title"
                    className="font-bold text-white"
                  >
                    Calendar & Event Schedule
                  </h2>
                  <p className="text-xs text-slate-400">
                    Manage your Car Show 2027 activities
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCalendar(false)}
                aria-label="Close calendar"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <CalendarSchedule />
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowSettings(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#071426] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-[#10243D] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Settings size={20} className="text-blue-400" />
                </div>

                <div>
                  <h2
                    id="settings-modal-title"
                    className="font-bold text-white"
                  >
                    User Profile & Settings
                  </h2>
                  <p className="text-xs text-slate-400">
                    Manage your account and preferences
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-2 sm:p-4">
              <UserProfileSettings />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
