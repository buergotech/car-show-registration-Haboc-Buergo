# Car Show Registration System

Integrative Programming 2 — Car Show Registration System project.

## Start here

The written documentation is in this package:

```
docs/CarShow-Backend-Documentation-Haboc.docx
```

Open that file first. It contains the solution structure, the API screenshots,
the test scenario results and the reflection answers.

## Requirements

- Node.js 18 or newer
- npm (installed with Node.js)

## Run the project

```bash
npm install
npm run dev
```

The development server starts on http://localhost:5173.

To produce a production build:

```bash
npm run build
```

The output is written to `dist/`.

## Folders

```
docs/                  written documentation
public/                icons and static files
src/components/        dashboard sections, tables, modals and forms
src/data/              sample registrations used by the dashboard
src/hooks/             shared hooks
src/types/             registration, payment and activity types
src/utils/             notification helpers
Screenshot/             application screenshot
```

Registrations, payments and activities are stored in the browser's local
storage, so the dashboard keeps its state after a reload.

## Repository

https://github.com/buergotech/car-show-registration-Haboc-Buergo
