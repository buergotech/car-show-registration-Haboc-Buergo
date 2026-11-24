
import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  accent: string;
}

export default function KpiCard({
  title,
  value,
  description,
  icon,
  accent,
}: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-[#10243D] p-5 shadow-lg transition hover:border-blue-500/60">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">
          {title}
        </p>

        <div className={`rounded-lg p-2 ${accent}`}>
          {icon}
        </div>
      </div>

      <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
        {value}
      </h2>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}
