
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Search,
  UserCheck,
  Clock,
  CheckCircle2,
  Users,
  XCircle,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type { Registration } from "../types/registration";

interface Props {
  registrations: Registration[];
  onCheckIn: (registrationId: string) => void;
}

type CheckInFilter = "All" | "Waiting" | "Checked In";

const INITIAL_VISIBLE_COUNT = 5;

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function CheckInManagement({
  registrations,
  onCheckIn,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CheckInFilter>("All");
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [checkInTimes, setCheckInTimes] = useState<
    Record<string, string>
  >({});

  const checkedIn = registrations.filter(
    (item) => item.status === "Checked In"
  );

  const waiting = registrations.filter(
    (item) => item.status === "Confirmed"
  );

  const notEligible = registrations.filter(
    (item) =>
      item.status === "Pending" ||
      item.status === "Cancelled"
  );

  const checkInProgress =
    registrations.length > 0
      ? Math.round(
          (checkedIn.length / registrations.length) * 100
        )
      : 0;

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.participantName.toLowerCase().includes(searchValue) ||
        item.registrationNumber.toLowerCase().includes(searchValue) ||
        item.carMakeModel.toLowerCase().includes(searchValue);

      const matchesFilter =
        filter === "All" ||
        (filter === "Waiting" && item.status === "Confirmed") ||
        (filter === "Checked In" && item.status === "Checked In");

      return matchesSearch && matchesFilter;
    });
  }, [registrations, search, filter]);

  const visibleRegistrations = showAllParticipants
    ? filteredRegistrations
    : filteredRegistrations.slice(0, INITIAL_VISIBLE_COUNT);

  const handleCheckIn = (registration: Registration) => {
    if (registration.status !== "Confirmed") return;

    setCheckInTimes((previous) => ({
      ...previous,
      [registration.id]: new Date().toISOString(),
    }));

    onCheckIn(registration.id);
  };

  return (
    <section className="border-t border-slate-700 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-500/10 p-2.5">
            <ClipboardCheck className="text-green-400" size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Participant Check-in
            </h2>
            <p className="text-xs text-slate-400">
              Manage event attendance and participant arrivals
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
          {checkedIn.length} Checked In
        </span>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CheckInCard
          title="Total Registrations"
          value={registrations.length}
          icon={<Users size={20} />}
          color="text-blue-400"
        />

        <CheckInCard
          title="Checked In"
          value={checkedIn.length}
          icon={<CheckCircle2 size={20} />}
          color="text-green-400"
        />

        <CheckInCard
          title="Awaiting Check-in"
          value={waiting.length}
          icon={<Clock size={20} />}
          color="text-orange-400"
        />

        <CheckInCard
          title="Not Eligible"
          value={notEligible.length}
          icon={<XCircle size={20} />}
          color="text-red-400"
        />
      </div>

      <div className="mb-6 rounded-xl border border-slate-700 bg-[#071426] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Check-in Progress
          </h3>

          <span className="text-sm font-bold text-green-400">
            {checkInProgress}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${checkInProgress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-400">
          {checkedIn.length} of {registrations.length} registered participants checked in
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowAllParticipants(false);
            }}
            placeholder="Search name, registration number, or car..."
            className="w-full rounded-lg border border-slate-600 bg-[#071426] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>

        <select
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value as CheckInFilter);
            setShowAllParticipants(false);
          }}
          className="rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
        >
          <option value="All">All Participants</option>
          <option value="Waiting">Awaiting Check-in</option>
          <option value="Checked In">Checked In</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700">
        <div className="flex flex-col gap-2 border-b border-slate-700 bg-[#142B46] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Participant Attendance
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Only confirmed registrations are eligible for check-in.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {filteredRegistrations.length} participant
            {filteredRegistrations.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#10243D] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Participant</th>
                <th className="px-4 py-3 font-medium">Registration No.</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Check-in Time</th>
                <th className="px-4 py-3 text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/70">
              {visibleRegistrations.map((registration) => {
                const isCheckedIn =
                  registration.status === "Checked In";

                const isConfirmed =
                  registration.status === "Confirmed";

                return (
                  <tr
                    key={registration.id}
                    className="transition hover:bg-[#183451]"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">
                        {registration.participantName}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {registration.registrationType}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-medium text-blue-400">
                      {registration.registrationNumber}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {registration.carMakeModel}
                    </td>

                    <td className="px-4 py-4">
                      {isCheckedIn ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                          <CheckCircle2 size={13} />
                          Checked In
                        </span>
                      ) : isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                          <Clock size={13} />
                          Waiting
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-700/50 px-3 py-1 text-xs font-semibold text-slate-400">
                          <XCircle size={13} />
                          {registration.status}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-400">
                      {isCheckedIn
                        ? checkInTimes[registration.id]
                          ? formatDate(checkInTimes[registration.id])
                          : "Previously checked in"
                        : "—"}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {isConfirmed ? (
                        <button
                          onClick={() => handleCheckIn(registration)}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-500"
                        >
                          <UserCheck size={14} />
                          Check In
                        </button>
                      ) : isCheckedIn ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">
                          <CheckCircle2 size={15} />
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Not eligible
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredRegistrations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Search
                      size={30}
                      className="mx-auto mb-3 text-slate-500"
                    />
                    <p className="font-semibold text-slate-300">
                      No participants found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try another search or change the filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length > INITIAL_VISIBLE_COUNT && (
          <div className="border-t border-slate-700 bg-[#10243D] px-4 py-3">
            <button
              onClick={() =>
                setShowAllParticipants((current) => !current)
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300"
            >
              {showAllParticipants ? (
                <>
                  <ChevronUp size={18} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={18} />
                  Show All {filteredRegistrations.length} Participants
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        <CheckCircle2 size={13} className="mr-1 inline text-green-400" />
        Duplicate check-ins are prevented by the registration status.
      </p>
    </section>
  );
}

function CheckInCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#142B46] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{title}</p>
        <span className={color}>{icon}</span>
      </div>

      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
