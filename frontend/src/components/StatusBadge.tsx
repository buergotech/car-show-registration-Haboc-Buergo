
import type { RegistrationStatus } from "../types/registration";

interface Props {
  status: RegistrationStatus;
}

const styles: Record<RegistrationStatus, string> = {
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Checked In": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
