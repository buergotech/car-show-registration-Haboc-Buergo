import { useEffect, useState } from "react";
import {
  ClipboardList,
  Wallet,
  CircleDollarSign,
  CheckCircle2,
  LogIn,
} from "lucide-react";

import KpiCard from "./KpiCard";
import { getRegistrationSummary } from "../api/registrationsApi";
import type { DashboardSummary } from "../types/registration";

export default function KpiCards() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getRegistrationSummary();

        if (isMounted) {
          setSummary(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load registration summary."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (amount: number) =>
    `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const cards = [
    {
      title: "Total Registrations",
      value: summary?.totalRegistrations.toLocaleString() ?? "—",
      description: "All registered participants",
      icon: <ClipboardList size={20} />,
      accent: "bg-blue-500/15 text-blue-400",
    },
    {
      title: "Total Payments",
      value: summary ? formatCurrency(summary.totalPayments) : "—",
      description: "Payments collected",
      icon: <Wallet size={20} />,
      accent: "bg-emerald-500/15 text-emerald-400",
    },
    {
      title: "Uncollected Payments",
      value: summary ? formatCurrency(summary.uncollectedPayments) : "—",
      description: "Remaining balance",
      icon: <CircleDollarSign size={20} />,
      accent: "bg-red-500/15 text-red-400",
    },
    {
      title: "Confirmed",
      value: summary?.confirmed.toLocaleString() ?? "—",
      description: "Confirmed registrations",
      icon: <CheckCircle2 size={20} />,
      accent: "bg-green-500/15 text-green-400",
    },
    {
      title: "Checked In",
      value: summary?.checkedIn.toLocaleString() ?? "—",
      description: "Participants checked in",
      icon: <LogIn size={20} />,
      accent: "bg-purple-500/15 text-purple-400",
    },
  ];

  return (
    <section>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="mb-3 text-sm text-slate-400">
          Loading registration summary...
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}