# Car Show Registration System — Backend

Integrative Programming 2 — Car Show Registration System for **Car Show 2027** (AutoVista Events,
Sorsogon City Coliseum).

This repository holds the backend API of the project. The API is the single source of truth: it
stores every registration in SQLite, applies the fee, numbering, duplicate-plate and payment rules,
and serves the data the event staff dashboard displays.

## Team

| Member          | Role              |
| --------------- | ----------------- |
| Ezekiel Haboc   | Backend Developer |
| John Rey Buergo | Frontend Developer |

Instructor: Elvin Manuel R. Luces, MIT

## Where is the backend?

Everything is inside the `backend/` folder.

| Path                                         | What it holds                                                        |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `backend/Api`                                | Minimal API endpoints, DI setup, validation filter, ProblemDetails   |
| `backend/Application/Features/Registrations` | The four slices: Create, GetRegistrations, GetRegistrationById, GetRegistrationSummary |
| `backend/Domain`                             | `Registration` entity, enums and the fee table                       |
| `backend/Infrastructure/Persistence`         | EF Core `AppDbContext`, SQLite database, seeder and migrations       |
| `backend/docs`                               | Written documentation (`CarShow-Backend-Documentation-Haboc.docx`)  |

## Run the API

Requirements: .NET 10 SDK.

```bash
cd backend
dotnet restore
dotnet run --project Api
```

- API documentation (Scalar): http://localhost:5205/scalar/v1
- The SQLite file is created at `backend/Infrastructure/Persistence/carshow.db` on the first run and
  25 sample registrations are seeded once.
- Migrations are applied automatically at start-up.

## Endpoints

| Method | Endpoint                       | Purpose                                    |
| ------ | ------------------------------ | ------------------------------------------ |
| POST   | `/api/registrations`           | Create a registration (201, 400, 409)      |
| GET    | `/api/registrations`           | Paged list with `type`, `status`, `participantName`, `page`, `pageSize` (200, 400) |
| GET    | `/api/registrations/{id}`      | One registration by id (200, 404)          |
| GET    | `/api/registrations/summary`   | KPI totals for the dashboard (200)         |

Fees: Exhibitor ₱1,500 · Competitor ₱2,500 · VIP ₱5,000. The server generates the registration
number (`CS27-0001`, …), the UTC date, the fee and the `Pending` status, and it computes
`paymentStatus` from `amountPaid`. Registrations are sorted by date, newest first.

The React dashboard calls this API on http://localhost:5205, the origin allowed by the CORS policy.

## Documentation

`backend/docs/CarShow-Backend-Documentation-Haboc.docx` holds the solution structure, the API
screenshots, the completed test scenarios and the reflection answers.
