
import { useMemo, useState } from "react";
import {
  FileBarChart,
  Download,
  CalendarDays,
  Users,
  Car,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  TrendingUp,
} from "lucide-react";

import type { Registration } from "../types/registration";

interface RegistrationReportsProps {
  registrations: Registration[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(amount);

const escapeCsv = (value: string | number) => {
  let text = String(value ?? "");

  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

export default function RegistrationReports({
  registrations,
}: RegistrationReportsProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const reportRegistrations = useMemo(() => {
    return registrations.filter((registration) => {
      const registrationDate = new Date(
        `${registration.registrationDate}T00:00:00`
      );

      if (Number.isNaN(registrationDate.getTime())) {
        return !startDate && !endDate;
      }

      const afterStart =
        !startDate ||
        registrationDate >= new Date(`${startDate}T00:00:00`);

      const beforeEnd =
        !endDate ||
        registrationDate <= new Date(`${endDate}T23:59:59`);

      return afterStart && beforeEnd;
    });
  }, [registrations, startDate, endDate]);

  const total = reportRegistrations.length;

  const confirmed = reportRegistrations.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const checkedIn = reportRegistrations.filter(
    (item) => item.status === "Checked In"
  ).length;

  const pending = reportRegistrations.filter(
    (item) => item.status === "Pending"
  ).length;

  const cancelled = reportRegistrations.filter(
    (item) => item.status === "Cancelled"
  ).length;

  const totalFees = reportRegistrations.reduce(
    (sum, item) => sum + Number(item.registrationFee || 0),
    0
  );

  const totalCollected = reportRegistrations.reduce(
    (sum, item) => sum + Number(item.amountPaid || 0),
    0
  );

  const outstanding = reportRegistrations.reduce(
    (sum, item) =>
      sum +
      Math.max(
        0,
        Number(item.registrationFee || 0) -
          Number(item.amountPaid || 0)
      ),
    0
  );

  const exhibitorCount = reportRegistrations.filter(
    (item) => item.registrationType === "Exhibitor"
  ).length;

  const competitorCount = reportRegistrations.filter(
    (item) => item.registrationType === "Competitor"
  ).length;

  const vipCount = reportRegistrations.filter(
    (item) => item.registrationType === "VIP"
  ).length;

  const attendanceRate =
    total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  const exportReport = () => {
    if (reportRegistrations.length === 0) return;

    const headers = [
      "Registration Number",
      "Registration Date",
      "Participant Name",
      "Registration Type",
      "Registration Status",
      "Registration Fee",
      "Amount Paid",
      "Outstanding Balance",
      "Payment Status",
    ];

    const rows = reportRegistrations.map((item) => [
      item.registrationNumber,
      item.registrationDate,
      item.participantName,
      item.registrationType,
      item.status,
      item.registrationFee,
      item.amountPaid,
      Math.max(0, item.registrationFee - item.amountPaid),
      item.paymentStatus,
    ]);

    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(","))
        .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "CarShow2027_Registration_Report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
  }: {
    label: string;
    value: number;
    icon: typeof Users;
    color: string;
  }) => (
    <div className="rounded-xl border border-slate-700 bg-[#071426] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">{label}</p>
        <Icon size={19} className={color} />
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  );

  const BreakdownRow = ({
    label,
    count,
    color,
  }: {
    label: string;
    count: number;
    color: string;
  }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">{label}</span>
          <span className="font-semibold text-white">
            {count} ({Math.round(percentage)}%)
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <section className="border-b border-slate-700 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2.5">
            <FileBarChart className="text-blue-400" size={22} />
          </div>
          <div>
            <h2 className="font-bold text-white">Registration Reports</h2>
            <p className="text-xs text-slate-400">
              Registration, attendance, and payment summary
            </p>
          </div>
        </div>

        <button
          onClick={exportReport}
          disabled={total === 0}
          className="flex items-center justify-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-slate-700 bg-[#0B1C31] p-4">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={17} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">
            Report Date Range
          </h3>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs text-slate-400">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-xs text-slate-400">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={clearDates}
            className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
          >
            Clear Dates
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Showing {total} registration record(s) for the selected date range.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Registrations"
          value={total}
          icon={Users}
          color="text-blue-400"
        />
        <StatCard
          label="Confirmed"
          value={confirmed}
          icon={CheckCircle2}
          color="text-green-400"
        />
        <StatCard
          label="Checked In"
          value={checkedIn}
          icon={Car}
          color="text-cyan-400"
        />
        <StatCard
          label="Pending"
          value={pending}
          icon={Clock}
          color="text-yellow-400"
        />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-[#0B1C31] p-4">
          <h3 className="mb-4 text-sm font-bold text-white">
            Registration Type Breakdown
          </h3>
          <div className="space-y-4">
            <BreakdownRow
              label="Exhibitors"
              count={exhibitorCount}
              color="bg-blue-500"
            />
            <BreakdownRow
              label="Competitors"
              count={competitorCount}
              color="bg-purple-500"
            />
            <BreakdownRow
              label="VIP"
              count={vipCount}
              color="bg-yellow-500"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#0B1C31] p-4">
          <h3 className="mb-4 text-sm font-bold text-white">
            Registration Status Breakdown
          </h3>
          <div className="space-y-4">
            <BreakdownRow
              label="Confirmed"
              count={confirmed}
              color="bg-green-500"
            />
            <BreakdownRow
              label="Checked In"
              count={checkedIn}
              color="bg-cyan-500"
            />
            <BreakdownRow
              label="Pending"
              count={pending}
              color="bg-yellow-500"
            />
            <BreakdownRow
              label="Cancelled"
              count={cancelled}
              color="bg-red-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-[#0B1C31] p-4">
        <div className="mb-4 flex items-center gap-2">
          <Wallet size={18} className="text-green-400" />
          <h3 className="text-sm font-bold text-white">
            Payment Collection Summary
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Total Registration Fees</p>
            <p className="mt-1 text-lg font-bold text-white">
              {formatCurrency(totalFees)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Total Collected</p>
            <p className="mt-1 text-lg font-bold text-green-400">
              {formatCurrency(totalCollected)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Outstanding Balance</p>
            <p className="mt-1 text-lg font-bold text-red-400">
              {formatCurrency(outstanding)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">Payment Collection Progress</span>
            <span className="font-semibold text-white">
              {totalFees > 0
                ? Math.min(100, Math.round((totalCollected / totalFees) * 100))
                : 0}
              %
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{
                width: `${
                  totalFees > 0
                    ? Math.min(100, (totalCollected / totalFees) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-700 bg-[#0B1C31] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-cyan-400" size={21} />
          <div>
            <h3 className="text-sm font-bold text-white">
              Attendance Rate
            </h3>
            <p className="text-xs text-slate-400">
              Checked-in registrations compared with all registrations
            </p>
          </div>
        </div>

        <p className="text-2xl font-bold text-cyan-400">
          {attendanceRate}%
        </p>
      </div>

      {total === 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-slate-700 py-5 text-sm text-slate-400">
          <XCircle size={17} />
          No registration records found for this date range.
        </div>
      )}
    </section>
  );
}
