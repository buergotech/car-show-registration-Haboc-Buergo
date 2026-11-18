# Car Show Registration API

C# Vertical Slice API for the Car Show Registration System (Car Show 2027). Built with .NET 10,
EF Core 10, SQLite, FluentValidation, the `Result<T>` pattern and Scalar.

## Solution structure

```
CarShow_Haboc_Ezekiel_Backend.slnx
├── Domain/                          entity, enums, fee table, Result<T>
│   ├── Common/                      BaseEntity, Result<T>, Error
│   ├── Entities/Registration.cs     12 columns, PaymentStatus is computed
│   ├── Enums/                       RegistrationType, RegistrationStatus, PaymentStatus
│   └── Pricing/                     fee per registration type
├── Application/                     commands, queries, handlers, validators
│   ├── Abstractions/Data/           IAppDbContext
│   ├── Abstractions/Messaging/      ICommand, IQuery and their handlers
│   └── Features/Registrations/      one folder per slice
│       ├── CreateRegistration/      command, handler, FluentValidation validator
│       ├── GetRegistrations/        query, handler, validator
│       ├── GetRegistrationById/     query, handler
│       └── GetRegistrationSummary/  query, handler
├── Infrastructure/
│   └── Persistence/                 AppDbContext, SQLite, seeder, migrations, carshow.db
└── Api/
    ├── Features/Registrations/      RegistrationEndpoints (route group)
    ├── Common/Filters/              ValidationFilter<T>
    ├── Common/Extensions/           ResultExtensions (Result to ProblemDetails)
    └── Program.cs                   DI, CORS, OpenAPI, migration and seed on start-up
```

## Run

```bash
dotnet restore
dotnet run --project Api
```

Scalar: http://localhost:5205/scalar/v1

The first run creates `Infrastructure/Persistence/carshow.db`, applies the `InitialCreate`
migration and seeds 25 registrations. Later runs keep the existing data.

## Endpoints

| Method | Route                        | Success | Errors |
| ------ | ---------------------------- | ------- | ------ |
| POST   | `/api/registrations`         | 201     | 400, 409 |
| GET    | `/api/registrations`         | 200     | 400 |
| GET    | `/api/registrations/summary` | 200     | — |
| GET    | `/api/registrations/{id}`    | 200     | 404 |

`GET /api/registrations` accepts `type`, `status`, `participantName`, `page` (default 1) and
`pageSize` (default 10, maximum 50).

## Business rules

- Fee by type: Exhibitor ₱1,500, Competitor ₱2,500, VIP ₱5,000. The client never sends the fee.
- Registration number is sequential: `CS27-0001`, `CS27-0002`, …
- Registration date is UTC and is set by the server, and new registrations start as `Pending`.
- An existing plate number returns `409 Conflict` (`Registration.Conflict`).
- `amountPaid` must be between 0 and the fee; `paymentStatus` is computed (Unpaid, Partial, Paid).
- `GET /api/registrations/summary` leaves cancelled registrations out of the money totals.

## Requests

`Api/Api.http` holds one request per scenario from section 3G of the task, separated by `###`.
