
import { CarFront, CircleUserRound } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#10243D] px-6 py-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600">
          <CarFront size={26} className="text-white" />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-wide text-white">
            Car Show 2027
          </h1>

          <p className="text-xs text-slate-400">
            Registration Management Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-white">
            Event Administrator
          </p>
          <p className="text-xs text-slate-400">
            Admin
          </p>
        </div>

        <CircleUserRound
          size={34}
          className="text-slate-300"
        />
      </div>
    </header>
  );
}
