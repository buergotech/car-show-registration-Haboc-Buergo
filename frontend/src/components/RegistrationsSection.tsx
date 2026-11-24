import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  CheckCircle2,
  X,
  Plus,
  Download,
} from "lucide-react";

import type {
  Registration,
  RegistrationType,
  RegistrationStatus,
  PaymentStatus,
} from "../types/registration";
import { getRegistrations } from "../api/registrationsApi";
import useDebounce from "../hooks/useDebounce";
import RegistrationTable from "./RegistrationTable";
import AddRegistrationModal from "./AddRegistrationModal";
import RegistrationAnalytics from "./RegistrationAnalytics";
import {
  type ActivityRecord,
  type ActivityAction,
} from "./RecentActivity";
import RegistrationReports from "./RegistrationReports";
import PaymentManagement, {
  type PaymentTransaction,
  type PaymentMethod,
} from "./PaymentManagement";
import CheckInManagement from "./CheckInManagement";
import { addDashboardNotification } from "../utils/notifications";

type TypeFilter = "All" | RegistrationType;
type StatusFilter = "All" | RegistrationStatus;

const REGISTRATIONS_STORAGE_KEY = "carshow2027_registrations";
const ACTIVITIES_STORAGE_KEY = "carshow2027_activities";
const PAYMENTS_STORAGE_KEY = "carshow2027_payment_transactions";

// LOAD SAVED ACTIVITIES
const loadActivities = (): ActivityRecord[] => {
  try {
    const saved = localStorage.getItem(ACTIVITIES_STORAGE_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.description === "string" &&
          typeof item.timestamp === "string" &&
          ["Added", "Updated", "Deleted", "Exported"].includes(item.action)
      )
      .map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }))
      .filter((item) => !Number.isNaN(item.timestamp.getTime()))
      .slice(0, 20) as ActivityRecord[];
  } catch {
    return [];
  }
};

// LOAD SAVED PAYMENT TRANSACTIONS
const loadPaymentTransactions = (): PaymentTransaction[] => {
  try {
    const saved = localStorage.getItem(PAYMENTS_STORAGE_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.registrationId === "string" &&
        typeof item.registrationNumber === "string" &&
        typeof item.participantName === "string" &&
        typeof item.amount === "number" &&
        typeof item.method === "string" &&
        typeof item.reference === "string" &&
        typeof item.date === "string"
    ) as PaymentTransaction[];
  } catch {
    return [];
  }
};

export default function RegistrationsSection() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [activities, setActivities] =
    useState<ActivityRecord[]>(loadActivities);

  const [paymentTransactions, setPaymentTransactions] =
    useState<PaymentTransaction[]>(loadPaymentTransactions);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [showAddModal, setShowAddModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "The new registration has been added to your records."
  );

  const debouncedSearch = useDebounce(search, 400);

  // LOAD REGISTRATIONS FROM THE API
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getRegistrations({
          participantName: debouncedSearch.trim() || undefined,
          type,
          status,
          page,
          pageSize,
        });

        if (cancelled) return;

        setRegistrations(response.items);
        setTotalCount(response.totalCount);
        setTotalPages(Math.max(1, response.totalPages));
      } catch (error) {
        if (cancelled) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load registrations."
        );

        setRegistrations([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, type, status, page, pageSize, reloadKey]);

  // SAVE REGISTRATIONS LOCALLY
  useEffect(() => {
    try {
      localStorage.setItem(
        REGISTRATIONS_STORAGE_KEY,
        JSON.stringify(registrations)
      );
    } catch (error) {
      console.error("Failed to save registrations:", error);
    }
  }, [registrations]);

  // SAVE ACTIVITIES
  useEffect(() => {
    try {
      localStorage.setItem(
        ACTIVITIES_STORAGE_KEY,
        JSON.stringify(activities)
      );
    } catch (error) {
      console.error("Failed to save activities:", error);
    }
  }, [activities]);

  // SAVE PAYMENT TRANSACTIONS
  useEffect(() => {
    try {
      localStorage.setItem(
        PAYMENTS_STORAGE_KEY,
        JSON.stringify(paymentTransactions)
      );
    } catch (error) {
      console.error("Failed to save payment transactions:", error);
    }
  }, [paymentTransactions]);

  const logActivity = (
    action: ActivityAction,
    description: string
  ) => {
    const newActivity: ActivityRecord = {
      id: crypto.randomUUID(),
      action,
      description,
      timestamp: new Date(),
    };

    setActivities((previous) =>
      [newActivity, ...previous].slice(0, 20)
    );
  };

  // AUTO-HIDE SUCCESS TOAST
  useEffect(() => {
    if (!showSuccessToast) return;

    const timer = setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showSuccessToast]);

  // UPDATE REGISTRATION
  const updateRegistration = (updated: Registration) => {
    setRegistrations((previous) =>
      previous.map((item) =>
        item.id === updated.id ? updated : item
      )
    );

    logActivity(
      "Updated",
      `${updated.participantName}'s registration (${updated.registrationNumber}) was updated.`
    );

    addDashboardNotification(
      "Registration Updated",
      `${updated.participantName}'s registration (${updated.registrationNumber}) was updated.`,
      "registration"
    );
  };

  // ADD REGISTRATION
  const addRegistration = (registration: Registration) => {
    setRegistrations((previous) => [
      registration,
      ...previous,
    ]);

    setPage(1);
    setSearch("");
    setType("All");
    setStatus("All");
    setShowAddModal(false);

    logActivity(
      "Added",
      `${registration.participantName} was added with registration number ${registration.registrationNumber}.`
    );

    addDashboardNotification(
      "New Registration",
      `${registration.participantName} was registered with number ${registration.registrationNumber}.`,
      "registration"
    );

    setSuccessMessage(
      "The new registration has been added to your records."
    );
    setShowSuccessToast(true);
  };

  // DELETE REGISTRATION
  const deleteRegistration = (id: string) => {
    const deleted = registrations.find(
      (item) => item.id === id
    );

    setRegistrations((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (deleted) {
      logActivity(
        "Deleted",
        `${deleted.participantName}'s registration (${deleted.registrationNumber}) was deleted.`
      );

      addDashboardNotification(
        "Registration Deleted",
        `${deleted.participantName}'s registration (${deleted.registrationNumber}) was deleted.`,
        "registration"
      );
    }

    setSuccessMessage(
      "The registration has been deleted successfully."
    );
    setShowSuccessToast(true);
  };

  // PARTICIPANT CHECK-IN
  const checkInParticipant = (registrationId: string) => {
    const registration = registrations.find(
      (item) => item.id === registrationId
    );

    if (!registration || registration.status !== "Confirmed") {
      return;
    }

    const updatedRegistration: Registration = {
      ...registration,
      status: "Checked In",
    };

    setRegistrations((previous) =>
      previous.map((item) =>
        item.id === registrationId ? updatedRegistration : item
      )
    );

    logActivity(
      "Updated",
      `${registration.participantName} (${registration.registrationNumber}) checked in successfully.`
    );

    addDashboardNotification(
      "Participant Checked In",
      `${registration.participantName} (${registration.registrationNumber}) successfully checked in.`,
      "checkin"
    );

    setSuccessMessage(
      `${registration.participantName} has been checked in successfully.`
    );
    setShowSuccessToast(true);
  };

  // RECORD PAYMENT
  const recordPayment = (
    registrationId: string,
    amount: number,
    method: PaymentMethod,
    reference: string
  ) => {
    const registration = registrations.find(
      (item) => item.id === registrationId
    );

    if (!registration) return;

    const remainingBalance =
      registration.registrationFee - registration.amountPaid;

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > remainingBalance
    ) {
      return;
    }

    const updatedAmountPaid =
      Math.round((registration.amountPaid + amount) * 100) / 100;

    let paymentStatus: PaymentStatus = "Unpaid";

    if (updatedAmountPaid >= registration.registrationFee) {
      paymentStatus = "Paid";
    } else if (updatedAmountPaid > 0) {
      paymentStatus = "Partial";
    }

    const updatedRegistration: Registration = {
      ...registration,
      amountPaid: updatedAmountPaid,
      paymentStatus,
    };

    setRegistrations((previous) =>
      previous.map((item) =>
        item.id === registrationId ? updatedRegistration : item
      )
    );

    const transaction: PaymentTransaction = {
      id: crypto.randomUUID(),
      registrationId: registration.id,
      registrationNumber: registration.registrationNumber,
      participantName: registration.participantName,
      amount,
      method,
      reference,
      date: new Date().toISOString(),
    };

    setPaymentTransactions((previous) => [
      transaction,
      ...previous,
    ]);

    logActivity(
      "Updated",
      `A payment of ₱${amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} was recorded for ${registration.participantName} through ${method}.`
    );

    addDashboardNotification(
      "Payment Received",
      `₱${amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} was received from ${registration.participantName} through ${method}.`,
      "payment"
    );

    setSuccessMessage(
      `Payment of ₱${amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} recorded successfully for ${registration.participantName}.`
    );
    setShowSuccessToast(true);
  };

  // CSV ESCAPING
  const escapeCsvValue = (value: string | number) => {
    let text = String(value ?? "");

    if (typeof value === "string" && /^[=+\-@]/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  // EXPORT REGISTRATIONS CURRENTLY LOADED FROM THE API
  const exportRegistrations = () => {
    if (registrations.length === 0) return;

    const headers = [
      "Registration Number",
      "Registration Date",
      "Participant Name",
      "Contact Number",
      "Email Address",
      "Car Make and Model",
      "Plate Number",
      "Registration Type",
      "Registration Status",
      "Registration Fee (PHP)",
      "Amount Paid (PHP)",
      "Payment Status",
    ];

    const rows = registrations.map((item) => [
      item.registrationNumber,
      item.registrationDate,
      item.participantName,
      item.contactNumber,
      item.email,
      item.carMakeModel,
      item.plateNumber,
      item.registrationType,
      item.status,
      item.registrationFee,
      item.amountPaid,
      item.paymentStatus,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map(escapeCsvValue).join(","))
        .join("\r\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "CarShow2027_Registrations.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logActivity(
      "Exported",
      `${registrations.length} registration record(s) were exported to CSV.`
    );

    addDashboardNotification(
      "Registration Export Completed",
      `${registrations.length} registration record(s) were exported to CSV.`,
      "export"
    );

    setSuccessMessage(
      `${registrations.length} registration record(s) exported successfully.`
    );
    setShowSuccessToast(true);
  };

  // API RESULTS ARE ALREADY FILTERED AND PAGINATED
  const currentPage = page;
  const currentRegistrations = registrations;
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  // CLEAR FILTERS
  const clearFilters = () => {
    setSearch("");
    setType("All");
    setStatus("All");
    setPage(1);
  };

  // CHANGE PAGE SIZE
  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-700 bg-[#10243D] shadow-xl">
      {/* SUCCESS TOAST */}
      {showSuccessToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 top-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 rounded-xl border border-green-500/30 bg-[#10243D] p-4 shadow-2xl shadow-black/30 animate-in slide-in-from-top-3 fade-in duration-300"
        >
          <CheckCircle2
            size={23}
            className="mt-0.5 shrink-0 text-green-400"
          />

          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">
              {successMessage.includes("exported successfully")
                ? "Export completed!"
                : successMessage.includes("deleted successfully")
                  ? "Registration deleted!"
                  : successMessage.includes("Payment of")
                    ? "Payment recorded!"
                    : successMessage.includes("checked in successfully")
                      ? "Participant checked in!"
                      : "Registration saved successfully!"}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {successMessage}
            </p>
          </div>

          <button
            onClick={() => setShowSuccessToast(false)}
            className="text-slate-400 transition hover:text-white"
            aria-label="Close notification"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* SECTION HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-700 p-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-blue-400" size={20} />

          <div>
            <h2 className="text-lg font-bold text-white">
              Registrations
            </h2>
            <p className="text-xs text-slate-400">
              Manage and monitor event participants
            </p>
          </div>
        </div>

        {/* FILTERS AND ACTIONS */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search participant name..."
              className="w-full rounded-lg border border-slate-600 bg-[#071426] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 sm:w-60"
            />
          </div>

          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as TypeFilter);
              setPage(1);
            }}
            className="rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Exhibitor">Exhibitor</option>
            <option value="Competitor">Competitor</option>
            <option value="VIP">VIP</option>
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm text-slate-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-white"
          >
            <RotateCcw size={15} />
            Clear
          </button>

          <button
            onClick={exportRegistrations}
            disabled={registrations.length === 0}
            className="flex items-center justify-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-2.5 text-sm font-semibold text-green-400 transition hover:border-green-500 hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus size={17} />
            Add Registration
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {isLoading ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center px-5 py-16 text-center">
          <div className="mb-5 rounded-full border border-blue-400/20 bg-blue-500/10 p-5">
            <LoaderCircle
              size={42}
              className="animate-spin text-blue-400"
            />
          </div>

          <h3 className="text-lg font-bold text-white">
            Loading registrations...
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Please wait while we load the registration records.
          </p>

          <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
          </div>
        </div>
      ) : loadError ? (
        <div className="border-t border-slate-700 px-5 py-10 text-center">
          <h3 className="font-semibold text-white">
            Unable to load registrations
          </h3>

          <p className="mt-2 text-sm text-red-300">
            {loadError}
          </p>

          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-4 text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* REGISTRATION ANALYTICS */}
          <RegistrationAnalytics registrations={registrations} />

          {/* REGISTRATION REPORTS */}
          <RegistrationReports registrations={registrations} />

          {/* PARTICIPANT CHECK-IN */}
          <CheckInManagement
            registrations={registrations}
            onCheckIn={checkInParticipant}
          />

          {/* PAYMENT MANAGEMENT */}
          <PaymentManagement
            registrations={registrations}
            transactions={paymentTransactions}
            activities={activities}
            onRecordPayment={recordPayment}
          />

          {/* REGISTRATION TABLE */}
          <RegistrationTable
            registrations={currentRegistrations}
            onUpdateRegistration={updateRegistration}
            onDeleteRegistration={deleteRegistration}
          />

          {/* PAGINATION */}
          <div className="flex flex-col gap-4 border-t border-slate-700 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Showing{" "}
              <span className="font-semibold text-white">
                {startIndex}
              </span>
              {" "}–{" "}
              <span className="font-semibold text-white">
                {endIndex}
              </span>
              {" "}of{" "}
              <span className="font-semibold text-white">
                {totalCount}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                className="rounded-lg border border-slate-600 p-2 text-slate-300 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              {pages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition ${
                    currentPage === pageNumber
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1)
                  )
                }
                className="rounded-lg border border-slate-600 p-2 text-slate-300 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>

              <select
                value={pageSize}
                onChange={(event) =>
                  changePageSize(Number(event.target.value))
                }
                className="ml-2 rounded-lg border border-slate-600 bg-[#071426] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                aria-label="Rows per page"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
              </select>
            </div>
          </div>

          {/* EMPTY STATE */}
          {totalCount === 0 && (
            <div className="border-t border-slate-700 px-5 py-10 text-center">
              <Search
                className="mx-auto mb-3 text-slate-500"
                size={32}
              />

              <h3 className="font-semibold text-white">
                No registrations found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                No registrations match your filters.
              </p>

              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}

      {/* ADD REGISTRATION MODAL */}
      {showAddModal && (
        <AddRegistrationModal
          existingRegistrations={registrations}
          onClose={() => setShowAddModal(false)}
          onAdd={addRegistration}
        />
      )}
    </section>
  );
}