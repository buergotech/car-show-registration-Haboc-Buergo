
import { useState } from "react";
import { X, User, Car, ClipboardList, CreditCard, Save } from "lucide-react";

import type {
  Registration,
  RegistrationType,
  RegistrationStatus,
  PaymentStatus,
} from "../types/registration";

interface Props {
  existingRegistrations: Registration[];
  onClose: () => void;
  onAdd: (registration: Registration) => void;
}

const inputClass =
  "w-full rounded-lg border border-slate-600 bg-[#071426] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500";

const labelClass = "mb-1.5 block text-xs font-medium text-slate-400";

export default function AddRegistrationModal({
  existingRegistrations,
  onClose,
  onAdd,
}: Props) {
  const [participantName, setParticipantName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [carMakeModel, setCarMakeModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [registrationType, setRegistrationType] =
    useState<RegistrationType>("Exhibitor");
  const [status, setStatus] =
    useState<RegistrationStatus>("Pending");
  const [registrationFee, setRegistrationFee] = useState("0");
  const [amountPaid, setAmountPaid] = useState("0");

  const fee = Math.max(0, Number(registrationFee) || 0);
  const paid = Math.max(0, Number(amountPaid) || 0);

  const remainingBalance = Math.max(0, fee - paid);

  let paymentStatus: PaymentStatus = "Unpaid";

  if (paid >= fee && fee > 0) {
    paymentStatus = "Paid";
  } else if (paid > 0) {
    paymentStatus = "Partial";
  }

  const generateRegistrationNumber = () => {
    let number = existingRegistrations.length + 1;
    let registrationNumber = "";

    do {
      registrationNumber = `REG-2027-${String(number).padStart(3, "0")}`;
      number++;
    } while (
      existingRegistrations.some(
        (registration) =>
          registration.registrationNumber === registrationNumber
      )
    );

    return registrationNumber;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newRegistration: Registration = {
      id: `registration-${Date.now()}`,
      registrationNumber: generateRegistrationNumber(),
      registrationDate: new Date().toISOString(),
      participantName: participantName.trim(),
      contactNumber: contactNumber.trim(),
      email: email.trim(),
      carMakeModel: carMakeModel.trim(),
      plateNumber: plateNumber.trim(),
      registrationType,
      status,
      registrationFee: fee,
      amountPaid: paid,
      paymentStatus,
    };

    onAdd(newRegistration);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-registration-title"
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-[#10243D] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-700 bg-[#142B46] p-5">
          <div>
            <h2
              id="add-registration-title"
              className="text-lg font-bold text-white"
            >
              Add New Registration
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Enter the participant and vehicle details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-6 overflow-y-auto p-5">

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
                    required
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Enter full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Contact Number</label>
                  <input
                    required
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter contact number"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className={inputClass}
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
                    required
                    value={carMakeModel}
                    onChange={(e) => setCarMakeModel(e.target.value)}
                    placeholder="e.g. Toyota Supra"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Plate Number</label>
                  <input
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="Enter plate number"
                    className={inputClass}
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
                    value={registrationType}
                    onChange={(e) =>
                      setRegistrationType(e.target.value as RegistrationType)
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
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as RegistrationStatus)
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
                  <label className={labelClass}>
                    Registration Fee (₱)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Amount Paid (₱)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-slate-700 bg-[#071426] p-3">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-400">Remaining Balance</span>
                  <span className="font-semibold text-white">
                    ₱{remainingBalance.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="mt-2 flex justify-between gap-3 text-sm">
                  <span className="text-slate-400">Payment Status</span>
                  <span className="font-semibold text-blue-400">
                    {paymentStatus}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-700 bg-[#142B46] p-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Save size={16} />
              Add Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
