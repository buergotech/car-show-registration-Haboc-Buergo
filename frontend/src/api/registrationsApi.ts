import type {
  Registration,
  RegistrationStatus,
  RegistrationType,
} from "../types/registration";

const API_BASE_URL = "http://localhost:5205/api/registrations";

export interface RegistrationsResponse {
  items: Registration[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface RegistrationsFilters {
  participantName?: string;
  type?: RegistrationType | "All";
  status?: RegistrationStatus | "All";
  page: number;
  pageSize: number;
}

function normalizeStatus(status: string): RegistrationStatus {
  if (status === "CheckedIn" || status === "Checked In") {
    return "Checked In";
  }

  return status as RegistrationStatus;
}

function normalizeRegistration(
  registration: Registration
): Registration {
  return {
    ...registration,
    status: normalizeStatus(registration.status),
  };
}

export async function getRegistrations(
  filters: RegistrationsFilters
): Promise<RegistrationsResponse> {
  const params = new URLSearchParams();

  if (filters.participantName?.trim()) {
    params.set("participantName", filters.participantName.trim());
  }

  if (filters.type && filters.type !== "All") {
    params.set("type", filters.type);
  }

  if (filters.status && filters.status !== "All") {
    params.set(
      "status",
      filters.status === "Checked In" ? "CheckedIn" : filters.status
    );
  }

  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));

  const response = await fetch(`${API_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Failed to load registrations. API returned ${response.status}.`
    );
  }

  const data = (await response.json()) as RegistrationsResponse;

  return {
    ...data,
    items: data.items.map(normalizeRegistration),
  };
}
import type { DashboardSummary } from "../types/registration";

export async function getRegistrationSummary(): Promise<DashboardSummary> {
  const response = await fetch(
    "http://localhost:5205/api/registrations/summary"
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load registration summary. API returned ${response.status}.`
    );
  }

  return (await response.json()) as DashboardSummary;
}