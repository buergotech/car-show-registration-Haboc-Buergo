
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CreditCard,
  Wallet,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  X,
  Receipt,
  Eye,
  Printer,
  Activity,
  History,
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";

import type { Registration } from "../types/registration";
import RecentActivity, {
  type ActivityRecord,
} from "./RecentActivity";

export type PaymentMethod = "Cash" | "GCash" | "Bank Transfer";

export interface PaymentTransaction {
  id: string;
  registrationId: string;
  registrationNumber: string;
  participantName: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  date: string;
}

interface PaymentManagementProps {
  registrations: Registration[];
  transactions: PaymentTransaction[];
  activities: ActivityRecord[];
  onRecordPayment: (
    registrationId: string,
    amount: number,
    method: PaymentMethod,
    reference: string
  ) => void;
}

type ActivePanel = "payments" | "activity" | null;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

const formatDate = (date: string | Date) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function PaymentManagement({
  registrations,
  transactions,
  activities,
  onRecordPayment,
}: PaymentManagementProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentTransaction | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  const [selectedRegistration, setSelectedRegistration] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Cash");
  const [reference, setReference] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const totalCollected = registrations.reduce(
    (sum, registration) => sum + registration.amountPaid,
    0
  );

  const totalFees = registrations.reduce(
    (sum, registration) => sum + registration.registrationFee,
    0
  );

  const outstandingBalance = Math.max(0, totalFees - totalCollected);

  const paidCount = registrations.filter(
    (registration) => registration.paymentStatus === "Paid"
  ).length;

  const partialCount = registrations.filter(
    (registration) => registration.paymentStatus === "Partial"
  ).length;

  const unpaidCount = registrations.filter(
    (registration) => registration.paymentStatus === "Unpaid"
  ).length;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = [
        transaction.participantName,
        transaction.registrationNumber,
        transaction.reference ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesMethod =
        methodFilter === "All" || transaction.method === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [transactions, searchTerm, methodFilter]);

  const availableRegistrations = registrations.filter(
    (registration) =>
      registration.status !== "Cancelled" &&
      registration.amountPaid < registration.registrationFee
  );

  const selectedRegistrationData = registrations.find(
    (registration) => registration.id === selectedRegistration
  );

  const resetPaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedRegistration("");
    setPaymentAmount("");
    setPaymentMethod("Cash");
    setReference("");
    setPaymentError("");
  };

  const handleRecordPayment = () => {
    const amount = Number(paymentAmount);

    if (!selectedRegistration) {
      setPaymentError("Please select a participant.");
      return;
    }

    if (!paymentAmount || !Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Enter a valid payment amount.");
      return;
    }

    if (
      selectedRegistrationData &&
      amount >
        selectedRegistrationData.registrationFee -
          selectedRegistrationData.amountPaid
    ) {
      setPaymentError("Payment cannot exceed the remaining balance.");
      return;
    }

    onRecordPayment(
      selectedRegistration,
      amount,
      paymentMethod,
      reference.trim()
    );

    resetPaymentModal();
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (selectedTransaction) {
        setSelectedTransaction(null);
      } else if (showPaymentModal) {
        resetPaymentModal();
      } else if (activePanel) {
        setActivePanel(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [activePanel, selectedTransaction, showPaymentModal]);

  const panelContent = activePanel && (
    <div
      className="fixed inset-0 z-[500] flex flex-col overflow-hidden bg-[#071426] text-white"
      role="dialog"
      aria-modal="true"
      aria-label={
        activePanel === "payments"
          ? "Payment transaction history"
          : "Recent activity"
      }
    >
      <header className="flex shrink-0 items-center justify-between border-b border-slate-700 bg-[#10243D] px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActivePanel(null)}
            className="rounded-lg border border-slate-600 p-2 transition hover:bg-slate-700"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h2 className="text-lg font-bold sm:text-xl">
              {activePanel === "payments"
                ? "Payment Transaction History"
                : "Recent Activity"}
            </h2>
            <p className="text-xs text-slate-400">
              {activePanel === "payments"
                ? "View and manage recorded payments"
                : "Review recent dashboard actions"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActivePanel(null)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
          aria-label="Close full-screen panel"
        >
          <X size={22} />
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="mx-auto max-w-[1500px] space-y-6">
          {activePanel === "payments" ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                  title="Total Transactions"
                  value={transactions.length.toString()}
                  icon={<Receipt size={22} />}
                  color="text-blue-400"
                />
                <SummaryCard
                  title="Total Collected"
                  value={formatCurrency(totalCollected)}
                  icon={<Wallet size={22} />}
                  color="text-emerald-400"
                />
                <SummaryCard
                  title="Outstanding Balance"
                  value={formatCurrency(outstandingBalance)}
                  icon={<Clock size={22} />}
                  color="text-amber-400"
                />
              </div>

              <section className="rounded-xl border border-slate-700 bg-[#10243D] p-4 sm:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      Transaction Records
                    </h3>
                    <p className="text-sm text-slate-400">
                      Search and filter payment records.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                      <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={searchTerm}
                        onChange={(event) =>
                          setSearchTerm(event.target.value)
                        }
                        placeholder="Search transactions..."
                        className="w-full rounded-lg border border-slate-600 bg-[#071426] py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-64"
                      />
                    </div>

                    <select
                      value={methodFilter}
                      onChange={(event) =>
                        setMethodFilter(event.target.value)
                      }
                      className="rounded-lg border border-slate-600 bg-[#071426] px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="All">All Methods</option>
                      <option value="Cash">Cash</option>
                      <option value="GCash">GCash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="border-b border-slate-700 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Participant</th>
                        <th className="px-4 py-3">Registration No.</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-700">
                      {filteredTransactions.length > 0 ? (
                        (showAllTransactions
                          ? filteredTransactions
                          : filteredTransactions.slice(0, 10)
                        ).map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="transition hover:bg-slate-800/50"
                          >
                            <td className="px-4 py-4 font-medium">
                              {transaction.participantName}
                            </td>
                            <td className="px-4 py-4 text-slate-300">
                              {transaction.registrationNumber}
                            </td>
                            <td className="px-4 py-4 font-semibold text-emerald-400">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-4 py-4 text-slate-300">
                              {transaction.method}
                            </td>
                            <td className="px-4 py-4 text-slate-400">
                              {transaction.reference || "—"}
                            </td>
                            <td className="px-4 py-4 text-slate-400">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedTransaction(transaction)
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 px-3 py-2 text-xs text-blue-400 transition hover:bg-blue-500/10"
                              >
                                <Eye size={14} />
                                Receipt
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-12 text-center text-slate-400"
                          >
                            No payment transactions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredTransactions.length > 10 && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowAllTransactions(!showAllTransactions)
                    }
                    className="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    {showAllTransactions
                      ? "Show Less"
                      : `Show All ${filteredTransactions.length} Transactions`}
                  </button>
                )}
              </section>
            </>
          ) : (
            <div className="mx-auto max-w-5xl">
              <RecentActivity activities={activities} />
            </div>
          )}
        </div>
      </main>
    </div>
  );

  const receiptContent = selectedTransaction && (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#10243D] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="text-blue-400" />
            <h3 className="text-lg font-bold">Payment Receipt</h3>
          </div>
          <button
            type="button"
            onClick={() => setSelectedTransaction(null)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="Close receipt"
          >
            <X size={20} />
          </button>
        </div>

        <div id="payment-receipt" className="space-y-4 rounded-xl bg-[#071426] p-5">
          <div className="border-b border-dashed border-slate-600 pb-4 text-center">
            <h4 className="text-xl font-bold">CAR SHOW 2027</h4>
            <p className="mt-1 text-xs text-slate-400">
              Official Payment Receipt
            </p>
          </div>

          <ReceiptRow
            label="Participant"
            value={selectedTransaction.participantName}
          />
          <ReceiptRow
            label="Registration No."
            value={selectedTransaction.registrationNumber}
          />
          <ReceiptRow
            label="Transaction ID"
            value={selectedTransaction.id}
          />
          <ReceiptRow
            label="Payment Method"
            value={selectedTransaction.method}
          />
          <ReceiptRow
            label="Reference"
            value={selectedTransaction.reference || "—"}
          />
          <ReceiptRow
            label="Date"
            value={formatDate(selectedTransaction.date)}
          />

          <div className="border-t border-dashed border-slate-600 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Amount Paid</span>
              <span className="text-xl font-bold text-emerald-400">
                {formatCurrency(selectedTransaction.amount)}
              </span>
            </div>
          </div>

          <p className="pt-2 text-center text-xs text-slate-500">
            Thank you for your payment!
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-500"
        >
          <Printer size={18} />
          Print Receipt
        </button>
      </div>
    </div>
  );

  return (
    <>
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">Payment Management</h2>
          <p className="mt-1 text-sm text-slate-400">
            Monitor collections, balances, and participant payments.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Collected"
            value={formatCurrency(totalCollected)}
            icon={<Wallet size={22} />}
            color="text-emerald-400"
          />
          <SummaryCard
            title="Outstanding Balance"
            value={formatCurrency(outstandingBalance)}
            icon={<Clock size={22} />}
            color="text-amber-400"
          />
          <SummaryCard
            title="Fully Paid"
            value={paidCount.toString()}
            icon={<CheckCircle2 size={22} />}
            color="text-emerald-400"
          />
          <SummaryCard
            title="Transactions"
            value={transactions.length.toString()}
            icon={<CreditCard size={22} />}
            color="text-blue-400"
          />
        </div>

        <section className="rounded-xl border border-slate-700 bg-[#10243D] p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">Payment Status Overview</h3>
              <p className="text-sm text-slate-400">
                Current payment status of registrations
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500"
            >
              <Plus size={17} />
              Record Payment
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatusOverview
              label="Paid"
              count={paidCount}
              color="bg-emerald-500"
            />
            <StatusOverview
              label="Partial"
              count={partialCount}
              color="bg-amber-500"
            />
            <StatusOverview
              label="Unpaid"
              count={unpaidCount}
              color="bg-red-500"
            />
          </div>
        </section>

        {/* LARGE PAYMENT HISTORY AND RECENT ACTIVITY CARDS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setMethodFilter("All");
              setShowAllTransactions(false);
              setActivePanel("payments");
            }}
            className="group relative flex min-h-[190px] items-center gap-6 overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-[#142F50] to-[#10243D] p-7 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-950/30 sm:min-h-[220px] sm:p-9"
          >
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-500/5 transition duration-300 group-hover:scale-125 group-hover:bg-blue-500/10" />

            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/15 text-blue-400 transition duration-300 group-hover:scale-110 group-hover:bg-blue-500/25 sm:h-24 sm:w-24">
              <Wallet size={40} strokeWidth={1.8} />
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                  Payments
                </span>
                <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-300">
                  {transactions.length} Records
                </span>
              </div>

              <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl">
                Payment Transaction History
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400 sm:text-base">
                View, search, review, and print all recorded payment transactions.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition group-hover:gap-3">
                Open Payment History
                <ArrowUpRight size={18} />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel("activity")}
            className="group relative flex min-h-[190px] items-center gap-6 overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-[#292348] to-[#10243D] p-7 text-left transition duration-300 hover:-translate-y-1 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-950/30 sm:min-h-[220px] sm:p-9"
          >
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-purple-500/5 transition duration-300 group-hover:scale-125 group-hover:bg-purple-500/10" />

            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/15 text-purple-400 transition duration-300 group-hover:scale-110 group-hover:bg-purple-500/25 sm:h-24 sm:w-24">
              <Activity size={40} strokeWidth={1.8} />
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-purple-400">
                  Dashboard Logs
                </span>
                <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-xs font-semibold text-purple-300">
                  {activities.length} Activities
                </span>
              </div>

              <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl">
                Recent Activity
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400 sm:text-base">
                Review the complete timeline of registration, payment, and dashboard actions.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-purple-400 transition group-hover:gap-3">
                Open Activity History
                <ArrowUpRight size={18} />
              </div>
            </div>
          </button>
        </div>
      </section>

      {showPaymentModal && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) resetPaymentModal();
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#10243D] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Record Payment</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Add a participant payment transaction.
                </p>
              </div>
              <button
                type="button"
                onClick={resetPaymentModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                aria-label="Close payment form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <FormField label="Participant">
                <select
                  value={selectedRegistration}
                  onChange={(event) =>
                    setSelectedRegistration(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select participant</option>
                  {availableRegistrations.map((registration) => (
                    <option
                      key={registration.id}
                      value={registration.id}
                    >
                      {registration.participantName} —{" "}
                      {registration.registrationNumber}
                    </option>
                  ))}
                </select>
              </FormField>

              {selectedRegistrationData && (
                <div className="rounded-lg border border-slate-700 bg-[#071426] p-3 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Registration Fee</span>
                    <span>
                      {formatCurrency(
                        selectedRegistrationData.registrationFee
                      )}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-slate-400">
                    <span>Already Paid</span>
                    <span>
                      {formatCurrency(
                        selectedRegistrationData.amountPaid
                      )}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between font-semibold text-amber-400">
                    <span>Remaining Balance</span>
                    <span>
                      {formatCurrency(
                        selectedRegistrationData.registrationFee -
                          selectedRegistrationData.amountPaid
                      )}
                    </span>
                  </div>
                </div>
              )}

              <FormField label="Payment Amount (₱)">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(event) =>
                    setPaymentAmount(event.target.value)
                  }
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </FormField>

              <FormField label="Payment Method">
                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value as PaymentMethod)
                  }
                  className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </FormField>

              <FormField label="Reference Number (Optional)">
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Enter transaction reference"
                  className="w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </FormField>

              {paymentError && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {paymentError}
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={resetPaymentModal}
                className="flex-1 rounded-lg border border-slate-600 py-3 text-sm font-semibold transition hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold transition hover:bg-blue-500"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {createPortal(
        <>
          {panelContent}
          {receiptContent}
        </>,
        document.body
      )}
    </>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#10243D] p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        <span className={color}>{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusOverview({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-700 bg-[#071426] p-4">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{count}</p>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="break-all text-right font-medium">{value}</span>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export default PaymentManagement;
