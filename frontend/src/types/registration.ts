
export type RegistrationType =
  | "Exhibitor"
  | "Competitor"
  | "VIP";

export type RegistrationStatus =
  | "Pending"
  | "Confirmed"
  | "Checked In"
  | "Cancelled";

export type PaymentStatus =
  | "Unpaid"
  | "Partial"
  | "Paid";

export interface Registration {
  id: string;
  registrationNumber: string;
  registrationDate: string;
  participantName: string;
  contactNumber: string;
  email: string;
  carMakeModel: string;
  plateNumber: string;
  registrationType: RegistrationType;
  status: RegistrationStatus;
  registrationFee: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
}

export interface DashboardSummary {
  totalRegistrations: number;
  confirmed: number;
  checkedIn: number;
  pending: number;
  cancelled: number;
  totalFees: number;
  totalPayments: number;
  uncollectedPayments: number;
}
