# Car Show Registration System

Frontend dashboard for the Car Show 2027 registration desk. It lists the
registrations, tracks payments and check-ins, and shows the event totals.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- lucide-react icons

## Running locally

```
npm install
npm run dev
```

The dev server runs on http://localhost:5173.

## Other scripts

```
npm run build
npm run preview
npm run lint
```

## Structure

```
src/
  components/   dashboard sections, tables, modals and forms
  data/         sample registrations used by the dashboard
  hooks/        shared hooks
  types/        registration, payment and activity types
  utils/        notification helpers
```

Registrations, payments and activities are kept in local storage, so the
dashboard keeps its state after a reload.
