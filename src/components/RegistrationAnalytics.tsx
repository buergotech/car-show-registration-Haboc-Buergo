
import { useMemo } from "react";
import {
  BarChart3,
  Users,
  Wallet,
  TrendingUp,
  Car,
} from "lucide-react";

import type {
  Registration,
  RegistrationType,
  RegistrationStatus,
} from "../types/registration";

interface RegistrationAnalyticsProps {
  registrations: Registration[];
}

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const typeColors: Record<RegistrationType, string> = {
  Exhibitor: "bg-blue-500",
  Competitor: "bg-purple-500",
  VIP: "bg-amber-500",
};

const statusColors: Record<RegistrationStatus, string> = {
  Pending: "bg-yellow-500",
  Confirmed: "bg-blue-500",
  "Checked In": "bg-green-500",
  Cancelled: "bg-red-500",
};

export default function RegistrationAnalytics({
  registrations,
}: RegistrationAnalyticsProps) {
  const analytics = useMemo(() => {
    const total = registrations.length;

    const types: RegistrationType[] = [
      "Exhibitor",
      "Competitor",
      "VIP",
    ];

    const statuses: RegistrationStatus[] = [
      "Pending",
      "Confirmed",
      "Checked In",
      "Cancelled",
    ];

    const typeCounts = types.map((item) => ({
      name: item,
      count: registrations.filter(
        (registration) => registration.registrationType === item
      ).length,
    }));

    const statusCounts = statuses.map((item) => ({
      name: item,
      count: registrations.filter(
        (registration) => registration.status === item
      ).length,
    }));

    const totalFees = registrations.reduce(
      (sum, registration) => sum + Number(registration.registrationFee || 0),
      0
    );

    const totalPaid = registrations.reduce(
      (sum, registration) => sum + Number(registration.amountPaid || 0),
      0
    );

    const remainingBalance = registrations.reduce(
      (sum, registration) =>
        sum +
        Math.max(
          0,
          Number(registration.registrationFee || 0) -
            Number(registration.amountPaid || 0)
        ),
      0
    );

    const paymentProgress =
      totalFees > 0
        ? Math.min((totalPaid / totalFees) * 100, 100)
        : 0;

    return {
      total,
      typeCounts,
      statusCounts,
      totalFees,
      totalPaid,
      remainingBalance,
      paymentProgress,
    };
  }, [registrations]);

  const getPercentage = (count: number) => {
    return analytics.total > 0
      ? (count / analytics.total) * 100
      : 0;
  };

  return (
    <div className="space-y-5 border-b border-slate-700 p-5">

      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/10 p-2">
          <BarChart3 size={21} className="text-blue-400" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">
            Dashboard Analytics
          </h2>

          <p className="text-xs text-slate-400">
            Registration and payment performance overview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-slate-700 bg-[#071426] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Total Registrations
            </p>
            <Users size={19} className="text-blue-400" />
          </div>

          <h3 className="mt-3 text-2xl font-bold text-white">
            {analytics.total}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            All registration records
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#071426] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Total Registration Fees
            </p>
            <Car size={19} className="text-purple-400" />
          </div>

          <h3 className="mt-3 text-2xl font-bold text-white">
            {currency.format(analytics.totalFees)}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Across all records
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#071426] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Amount Collected
            </p>
            <Wallet size={19} className="text-green-400" />
          </div>

          <h3 className="mt-3 text-2xl font-bold text-green-400">
            {currency.format(analytics.totalPaid)}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Total payments received
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#071426] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Remaining Balance
            </p>
            <TrendingUp size={19} className="text-amber-400" />
          </div>

          <h3 className="mt-3 text-2xl font-bold text-amber-400">
            {currency.format(analytics.remainingBalance)}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Unpaid registration balances
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        <div className="rounded-xl border border-slate-700 bg-[#071426] p-5">
          <div className="mb-5">
            <h3 className="font-bold text-white">
              Registration Type Distribution
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Participants grouped by registration type
            </p>
          </div>

          <div className="space-y-5">
            {analytics.typeCounts.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-300">
                    {item.name}
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {item.count}
                    <span className="ml-2 text-xs text-slate-500">
                      ({getPercentage(item.count).toFixed(1)}%)
                    </span>
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${typeColors[item.name]}`}
                    style={{
                      width: `${getPercentage(item.count)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-700 pt-4">
            {analytics.typeCounts.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${typeColors[item.name]}`}
                />
                <span className="text-xs text-slate-400">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-[#071426] p-5">
          <div className="mb-5">
            <h3 className="font-bold text-white">
              Registration Status
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Current status of all participants
            </p>
          </div>

          <div className="space-y-5">
            {analytics.statusCounts.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-300">
                    {item.name}
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {item.count}
                    <span className="ml-2 text-xs text-slate-500">
                      ({getPercentage(item.count).toFixed(1)}%)
                    </span>
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${statusColors[item.name]}`}
                    style={{
                      width: `${getPercentage(item.count)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-700 pt-4">
            {analytics.statusCounts.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${statusColors[item.name]}`}
                />
                <span className="text-xs text-slate-400">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-[#071426] p-5">
        <div className="mb-5">
          <h3 className="font-bold text-white">
            Payment Collection Progress
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Total payments received compared with registration fees
          </p>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-400">
            Collection progress
          </span>

          <span className="text-lg font-bold text-green-400">
            {analytics.paymentProgress.toFixed(1)}%
          </span>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{
              width: `${analytics.paymentProgress}%`,
            }}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">
              Total Fees
            </p>
            <p className="mt-1 font-bold text-white">
              {currency.format(analytics.totalFees)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Collected
            </p>
            <p className="mt-1 font-bold text-green-400">
              {currency.format(analytics.totalPaid)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Remaining
            </p>
            <p className="mt-1 font-bold text-amber-400">
              {currency.format(analytics.remainingBalance)}
            </p>
          </div>
        </div>

        {analytics.total === 0 && (
          <p className="mt-5 text-center text-sm text-slate-500">
            Add registrations to display analytics.
          </p>
        )}
      </div>
    </div>
  );
}
