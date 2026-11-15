
import {
  ClipboardList,
  Wallet,
  CircleDollarSign,
  CheckCircle2,
  LogIn,
} from "lucide-react";

import KpiCard from "./KpiCard";
import { dashboardSummary } from "../data/sampleData";

export default function KpiCards() {
  const cards = [
    {
      title: "Total Registrations",
      value: dashboardSummary.totalRegistrations.toLocaleString(),
      description: "All registered participants",
      icon: <ClipboardList size={20} />,
      accent: "bg-blue-500/15 text-blue-400",
    },
    {
      title: "Total Payments",
      value: `₱${dashboardSummary.totalPayments.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`,
      description: "Payments collected",
      icon: <Wallet size={20} />,
      accent: "bg-emerald-500/15 text-emerald-400",
    },
    {
      title: "Uncollected Payments",
      value: `₱${dashboardSummary.uncollectedPayments.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`,
      description: "Remaining balance",
      icon: <CircleDollarSign size={20} />,
      accent: "bg-red-500/15 text-red-400",
    },
    {
      title: "Confirmed",
      value: dashboardSummary.confirmed.toLocaleString(),
      description: "Confirmed registrations",
      icon: <CheckCircle2 size={20} />,
      accent: "bg-green-500/15 text-green-400",
    },
    {
      title: "Checked In",
      value: dashboardSummary.checkedIn.toLocaleString(),
      description: "Participants checked in",
      icon: <LogIn size={20} />,
      accent: "bg-purple-500/15 text-purple-400",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </section>
  );
}
