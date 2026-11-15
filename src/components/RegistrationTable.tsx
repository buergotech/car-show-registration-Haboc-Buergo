
import { useEffect, useState } from "react";
import {
  X,
  User,
  Car,
  ClipboardList,
  CreditCard,
  Eye,
  Pencil,
  Save,
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import type {
  Registration,
  RegistrationType,
  RegistrationStatus,
  PaymentStatus,
} from "../types/registration";

import StatusBadge from "./StatusBadge";
import PaymentBadge from "./PaymentBadge";

interface Props {
  registrations: Registration[];
  onUpdateRegistration: (registration: Registration) => void;
  onDeleteRegistration: (id: string) => void;
}

const formatCurrency = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date || "Not provided";
  }

  return parsedDate.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const inputClass =
  "w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500";

const labelClass = "mb-1.5 block text-xs font-medium text-slate-400";

export default function RegistrationTable({
  registrations,
  onUpdateRegistration,
  onDeleteRegistration,
}: Props) {
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);

  const [editingRegistration, setEditingRegistration] =
    useState<Registration | null>(null);

  const [deletingRegistration, setDeletingRegistration] =
    useState<Registration | null>(null);

  const [showSavedMessage, setShowSavedMessage] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedRegistration(null);
        setEditingRegistration(null);
        setDeletingRegistration(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!showSavedMessage) return;

    const timer = setTimeout(() => {
      setShowSavedMessage(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [showSavedMessage]);

  const DetailItem = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <div className="rounded-lg border border-slate-700/70 bg-[#071426] p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-white">
        {value || "Not provided"}
      </p>
    </div>
  );

  const openDetails = (registration: Registration) => {
    setSelectedRegistration(registration);
    setEditingRegistration(null);
    setShowSavedMessage(false);
  };

  const startEditing = () => {
    if (!selectedRegistration) return;
    setEditingRegistration({ ...selectedRegistration });
  };

  const cancelEditing = () => {
    setEditingRegistration(null);
  };

  const updateEditingField = <K extends keyof Registration>(
    field: K,
    value: Registration[K]
  ) => {
    setEditingRegistration((current) => {
      if (!current) return current;

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const saveChanges = () => {
    if (!editingRegistration) return;

    const registrationFee = Math.max(
      0,
      Number(editingRegistration.registrationFee) || 0
    );

    const amountPaid = Math.max(
      0,
      Number(editingRegistration.amountPaid) || 0
    );

    let paymentStatus: PaymentStatus = "Unpaid";

    if (amountPaid >= registrationFee && registrationFee > 0) {
      paymentStatus = "Paid";
    } else if (amountPaid > 0) {
      paymentStatus = "Partial";
    }

    const updatedRegistration: Registration = {
      ...editingRegistration,
      registrationFee,
      amountPaid,
      paymentStatus,
    };

    onUpdateRegistration(updatedRegistration);
    setSelectedRegistration(updatedRegistration);
    setEditingRegistration(null);
    setShowSavedMessage(true);
  };

  const confirmDelete = () => {
    if (!deletingRegistration) return;

    onDeleteRegistration(deletingRegistration.id);

    if (selectedRegistration?.id === deletingRegistration.id) {
      setSelectedRegistration(null);
      setEditingRegistration(null);
    }

    setDeletingRegistration(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] text-left text-sm">
          <thead className="border-b border-slate-700 bg-[#142B46] text-slate-300">
            <tr>
              <th className="px-5 py-4 font-semibold">Reg. No.</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Participant</th>
              <th className="px-5 py-4 font-semibold">Car</th>
              <th className="px-5 py-4 font-semibold">Type</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Fee / Paid</th>
              <th className="px-5 py-4 font-semibold">Payment</th>
              <th className="px-5 py-4 text-center font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-700/70">
            {registrations.map((registration) => (
              <tr
                key={registration.id}
                className="transition hover:bg-[#183451]"
              >
                <td className="px-5 py-4 font-medium text-blue-400">
                  {registration.registrationNumber}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                  {formatDate(registration.registrationDate)}
                </td>

                <td className="px-5 py-4">
                  <button
                    onClick={() => openDetails(registration)}
                    className="group text-left"
                    title="View registration details"
                  >
                    <span className="font-medium text-white transition group-hover:text-blue-400">
                      {registration.participantName}
                    </span>

                    <span className="mt-1 flex items-center gap-1 text-xs text-blue-400 opacity-80 group-hover:opacity-100">
                      <Eye size={12} />
                      View details
                    </span>
                  </button>

                  <p className="mt-1 text-xs text-slate-400">
                    {registration.contactNumber}
                  </p>

                  <p className="text-xs text-slate-500">
                    {registration.email}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-slate-200">
                    {registration.carMakeModel}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {registration.plateNumber}
                  </p>
                </td>

                <td className="px-5 py-4 text-slate-300">
                  {registration.registrationType}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={registration.status} />
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <p className="text-slate-200">
                    {formatCurrency(registration.registrationFee)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Paid: {formatCurrency(registration.amountPaid)}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <PaymentBadge status={registration.paymentStatus} />
                </td>

                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => setDeletingRegistration(registration)}
                    title="Delete registration"
                    aria-label={`Delete ${registration.participantName}`}
                    className="inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {registrations.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-10 text-center text-slate-400"
                >
                  No registrations to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deletingRegistration && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setDeletingRegistration(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-[#10243D] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-700 bg-[#142B46] p-5">
              <h2
                id="delete-modal-title"
                className="text-lg font-bold text-white"
              >
                Delete Registration
              </h2>

              <button
                onClick={() => setDeletingRegistration(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                aria-label="Close confirmation"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle size={32} className="text-red-400" />
              </div>

              <h3 className="text-lg font-bold text-white">
                Are you sure?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                You are about to delete this registration. This action
                cannot be undone.
              </p>

              <div className="mt-5 rounded-lg border border-slate-700 bg-[#071426] p-4 text-left">
                <p className="text-xs text-slate-400">
                  Participant
                </p>

                <p className="mt-1 font-semibold text-white">
                  {deletingRegistration.participantName}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Registration Number
                </p>

                <p className="mt-1 font-medium text-blue-400">
                  {deletingRegistration.registrationNumber}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-700 bg-[#142B46] p-4">
              <button
                onClick={() => setDeletingRegistration(null)}
                className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRegistration && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            setSelectedRegistration(null);
            setEditingRegistration(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-[#10243D] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-700 bg-[#142B46] p-5">
              <div>
                <h2
                  id="registration-modal-title"
                  className="text-lg font-bold text-white"
                >
                  {editingRegistration
                    ? "Edit Registration"
                    : "Registration Details"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedRegistration.registrationNumber}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedRegistration(null);
                  setEditingRegistration(null);
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                aria-label="Close modal"
              >
                <X size={22} />
              </button>
            </div>

            {showSavedMessage && (
              <div
                role="status"
                className="mx-5 mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
              >
                Registration updated successfully!
              </div>
            )}

            <div className="max-h-[75vh] space-y-6 overflow-y-auto p-5">
              {editingRegistration ? (
                <>
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <User size={18} className="text-blue-400" />
                      <h3 className="font-semibold text-white">
                        Participant Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Full Name</label>
                        <input
                          type="text"
                          value={editingRegistration.participantName}
                          onChange={(e) =>
                            updateEditingField("participantName", e.target.value)
                          }
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Contact Number</label>
                        <input
                          type="tel"
                          value={editingRegistration.contactNumber}
                          onChange={(e) =>
                            updateEditingField("contactNumber", e.target.value)
                          }
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input
                          type="email"
                          value={editingRegistration.email}
                          onChange={(e) =>
                            updateEditingField("email", e.target.value)
                          }
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <Car size={18} className="text-blue-400" />
                      <h3 className="font-semibold text-white">
                        Vehicle Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Car Make and Model</label>
                        <input
                          type="text"
                          value={editingRegistration.carMakeModel}
                          onChange={(e) =>
                            updateEditingField("carMakeModel", e.target.value)
                          }
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Plate Number</label>
                        <input
                          type="text"
                          value={editingRegistration.plateNumber}
                          onChange={(e) =>
                            updateEditingField("plateNumber", e.target.value)
                          }
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <ClipboardList size={18} className="text-blue-400" />
                      <h3 className="font-semibold text-white">
                        Registration Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Registration Type</label>
                        <select
                          value={editingRegistration.registrationType}
                          onChange={(e) =>
                            updateEditingField(
                              "registrationType",
                              e.target.value as RegistrationType
                            )
                          }
                          className={inputClass}
                        >
                          <option value="Exhibitor">Exhibitor</option>
                          <option value="Competitor">Competitor</option>
                          <option value="VIP">VIP</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Registration Status</label>
                        <select
                          value={editingRegistration.status}
                          onChange={(e) =>
                            updateEditingField(
                              "status",
                              e.target.value as RegistrationStatus
                            )
                          }
                          className={inputClass}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Checked In">Checked In</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      Registration number and date are read-only.
                    </p>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <CreditCard size={18} className="text-blue-400" />
                      <h3 className="font-semibold text-white">
                        Payment Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Registration Fee (₱)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingRegistration.registrationFee}
                          onChange={(e) =>
                            updateEditingField(
                              "registrationFee",
                              Number(e.target.value)
                            )
                          }
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Amount Paid (₱)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingRegistration.amountPaid}
                          onChange={(e) =>
                            updateEditingField(
                              "amountPaid",
                              Number(e.target.value)
                            )
                          }
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-slate-700 bg-[#071426] p-3">
                      <p className="text-xs text-slate-400">
                        Payment status will be calculated automatically when you save.
                      </p>

                      <p className="mt-2 text-sm font-semibold text-white">
                        Remaining Balance:{" "}
                        {formatCurrency(
                          Math.max(
                            0,
                            (Number(editingRegistration.registrationFee) || 0) -
                              (Number(editingRegistration.amountPaid) || 0)
                          )
                        )}
                      </p>
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <User size={18} className="text-blue-400" />
                      <h3 className="font-semibold text-white">
                        Participant Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <DetailItem
                        label="Full Name"
                        value={selectedRegistration.participantName}
                      />
                      <DetailItem
                        label="Contact Number"
                        value={selectedRegistration.contactNumber}
                      />
                      <div className="sm:col-span-2">
                        <DetailItem
                          label="Email Address"
                          value={selectedRegistration.email}
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <Car size={18} className="text-blue-400" />
                      <h3 className="font-semibold text-white">
                        Vehicle Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <DetailItem
                        label="Car Make and Model"
                        value={selectedRegistration.carMakeModel}
                      />
                      <DetailItem
                        label="Plate Number"
                        value={selectedRegistration.plateNumber}
                      />
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <ClipboardList size={18} className="text-blue-400" />
                      <h3 className="font-semibold text-white">
                        Registration Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <DetailItem
                        label="Registration Number"
                        value={selectedRegistration.registrationNumber}
                      />
                      <DetailItem
                        label="Registration Date"
                        value={formatDate(selectedRegistration.registrationDate)}
                      />
                      <DetailItem
                        label="Registration Type"
                        value={selectedRegistration.registrationType}
                      />
                      <div className="rounded-lg border border-slate-700/70 bg-[#071426] p-3">
                        <p className="mb-2 text-xs text-slate-400">
                          Registration Status
                        </p>
                        <StatusBadge status={selectedRegistration.status} />
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <CreditCard size={18} className="text-blue-400" />
                      <h3 className="font-semibold text-white">
                        Payment Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <DetailItem
                        label="Registration Fee"
                        value={formatCurrency(selectedRegistration.registrationFee)}
                      />
                      <DetailItem
                        label="Amount Paid"
                        value={formatCurrency(selectedRegistration.amountPaid)}
                      />
                      <div className="rounded-lg border border-slate-700/70 bg-[#071426] p-3">
                        <p className="mb-2 text-xs text-slate-400">
                          Payment Status
                        </p>
                        <PaymentBadge status={selectedRegistration.paymentStatus} />
                      </div>
                      <DetailItem
                        label="Remaining Balance"
                        value={formatCurrency(
                          Math.max(
                            0,
                            selectedRegistration.registrationFee -
                              selectedRegistration.amountPaid
                          )
                        )}
                      />
                    </div>
                  </section>
                </>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-700 bg-[#142B46] p-4">
              {editingRegistration ? (
                <>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    Cancel
                  </button>

                  <button
                    onClick={saveChanges}
                    disabled={
                      !editingRegistration.participantName.trim() ||
                      !editingRegistration.contactNumber.trim() ||
                      !editingRegistration.email.trim() ||
                      !editingRegistration.carMakeModel.trim() ||
                      !editingRegistration.plateNumber.trim() ||
                      !Number.isFinite(editingRegistration.registrationFee) ||
                      !Number.isFinite(editingRegistration.amountPaid) ||
                      editingRegistration.registrationFee < 0 ||
                      editingRegistration.amountPaid < 0
                    }
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedRegistration(null)}
                    className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                  >
                    Close
                  </button>

                  <button
                    onClick={startEditing}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    <Pencil size={16} />
                    Edit Registration
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
