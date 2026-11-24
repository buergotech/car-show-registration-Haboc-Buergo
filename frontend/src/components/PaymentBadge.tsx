
import type { PaymentStatus } from "../types/registration";

interface Props {
  status: PaymentStatus;
}

const styles: Record<PaymentStatus, string> = {
  Unpaid: "bg-red-500/15 text-red-400 border-red-500/30",
  Partial: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function PaymentBadge({ status }: Props) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
