# ErrTrace

Open-source error & event tracking for modern applications.  
A lightweight SDK to capture errors and events + a self-hosted dashboard to view and manage them.

[![npm version](https://img.shields.io/npm/v/errtrace)](https://www.npmjs.com/package/errtrace)
[![license](https://img.shields.io/npm/l/errtrace)](LICENSE)

---

## ✨ Features

### 📦 SDK

- 🔴 **Error tracking** – Auto-capture uncaught exceptions and promise rejections
- 📊 **Event tracking** – Track custom events, page views, and user actions
- 👤 **User identification** – Attach user context to errors and events
- 🍞 **Breadcrumbs** – Record steps leading to errors
- 🏷️ **Tags & releases** – Organize errors by version and tags
- 🎯 **Sampling** – Control error/event sampling rate
- 🔌 **Framework integrations** – React, Next.js, Express
- 📝 **TypeScript** – Full type support

### 🖥️ Dashboard

- 📊 **Real-time stats** – Error rates, event counts, unique users
- 🔍 **Search & filter** – By level, status, date range, and text
- 📅 **Date filters** – Today, yesterday, last 7/30/90 days, all time
- 📋 **Error details** – Stack traces, metadata, breadcrumbs, user context
- 📈 **Event analytics** – Top events, 24-hour timeline, user tracking
- ✅ **Error management** – Resolve, delete, or clear all errors
- 🗑️ **Bulk actions** – Select multiple errors/events to resolve or delete
- 🌙 **Dark mode** – Responsive dark UI
- ☁️ **Vercel Blob storage** – Free persistent storage on Vercel
- 📱 **Mobile responsive** – Works on all devices

---

## 📁 Project Structure

```
errtrace/
├── packages/
│   └── errtrace-sdk/          # npm package (SDK)
│       ├── src/
│       │   ├── client.ts
│       │   ├── transports/
│       │   ├── integrations/
│       │   ├── types.ts
│       │   └── index.ts
│       ├── package.json
│       └── README.md
├── apps/
│   └── dashboard/             # Next.js dashboard
│       ├── app/
│       │   ├── api/
│       │   │   ├── errors/    # Error CRUD endpoints
│       │   │   ├── events/    # Event tracking endpoints
│       │   │   └── stats/     # Statistics endpoints
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/        # UI components
│       ├── lib/               # Database & utilities
│       ├── public/
│       └── package.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/) (recommended)

```bash
npm install -g pnpm
```

### Installation

```bash
git clone https://github.com/yourusername/errtrace.git
cd errtrace
pnpm install
```

### Run the Dashboard

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Errors and events are stored in `apps/dashboard/data/` (auto-created for local dev).

### Build the SDK

```bash
pnpm build:sdk
```

### Publish the SDK to npm

```bash
cd packages/errtrace-sdk
npm login
pnpm publish:sdk
```

---

## 📦 SDK – errtrace

### Installation

```bash
npm install errtrace
```

### Quick Start

```ts
import { ErrTrace } from 'errtrace'

const errtrace = new ErrTrace({
  dsn: 'https://your-errtrace-dashboard.com',
  environment: 'production',
  release: '1.0.0',
})

// Capture errors
try {
  throw new Error('Something went wrong')
} catch (error) {
  errtrace.captureError(error)
}

// Capture messages
errtrace.captureMessage('User logged in', 'info')

// Track events
errtrace.track('purchase_completed', {
  productId: 'prod_123',
  amount: 99.99,
})

// Track page views
errtrace.trackPageView('/checkout', 'Checkout Page')

// Identify users
errtrace.setUser({
  id: 'user_123',
  email: 'john@example.com',
  username: 'john_doe',
})
```

### Configuration

| Option | Type | Default | Description |
|---|---|---|---|
| `dsn` | `string` | `http://localhost:3000` | Your ErrTrace dashboard URL |
| `apiKey` | `string` | — | API key for authentication (optional) |
| `environment` | `string` | `production` | Environment name (e.g., `staging`, `development`) |
| `release` | `string` | — | App version / release identifier |
| `enabled` | `boolean` | `true` | Enable / disable error capturing |
| `sampleRate` | `number` | `1.0` | Sampling rate (0 to 1) |
| `maxBreadcrumbs` | `number` | `100` | Maximum breadcrumbs to store |
| `beforeSend` | `(event: ErrorEvent) => ErrorEvent \| null` | `(event) => event` | Modify or drop events before sending |
| `debug` | `boolean` | `false` | Enable debug logs |

### API Reference

#### Error & Event Tracking

| Method | Description |
|---|---|
| `captureError(error, options?)` | Send an error. Returns error ID or `null` |
| `captureMessage(message, level?, options?)` | Send a message with level |
| `track(name, properties?)` | Track a custom event |
| `trackPageView(path?, title?, properties?)` | Track a page view |

#### Context Methods

| Method | Description |
|---|---|
| `setUser(user \| null)` | Attach user info to all subsequent events |
| `addBreadcrumb(breadcrumb)` | Record a step leading to an error |
| `setTags(tags)` | Set global tags |
| `setRelease(release)` | Set release version |
| `setEnabled(enabled)` | Enable/disable tracking |

### Framework Integrations

#### React / Next.js Error Boundary

```tsx
import { ErrTraceErrorBoundary, useErrTrace } from 'errtrace/react'

// Wrap your app
<ErrTraceErrorBoundary errtrace={errtrace}>
  <App />
</ErrTraceErrorBoundary>

// Or use the hook
function MyComponent() {
  const { captureError } = useErrTrace(errtrace)
}
```

#### Express Middleware

```ts
import { errTraceMiddleware } from 'errtrace/express'
app.use(errTraceMiddleware(errtrace))
```

#### Next.js API Route Wrapper

```ts
import { withErrTrace } from 'errtrace/nextjs'

async function handler(req: NextRequest) {
  // Your route logic
  return NextResponse.json({ data })
}

export const GET = withErrTrace(handler)
export const POST = withErrTrace(handler)
```

### Subpath Exports

| Import path | Description |
|---|---|
| `errtrace` | Core client + transports |
| `errtrace/react` | React error boundary + hook |
| `errtrace/express` | Express error-handling middleware |
| `errtrace/nextjs` | Next.js API route wrapper |

> **Note:** React, Express, and Next.js are optional peer dependencies.

---

## 🖥️ Dashboard

A full-featured Next.js app to view, search, filter, and manage errors and events.

### Tabs

- 🔴 **Errors** – View, filter, resolve, and delete errors
- 📊 **Events** – View tracked events, page views, and analytics

### Features

- 📊 Real-time error & event statistics
- 🔍 Search & filter (by level, status, text, date range)
- 📅 Date filters (Today, Yesterday, Last 7/30/90 days, All time)
- 📋 Error details (stack trace, metadata, breadcrumbs, user)
- 📈 Event timeline (24-hour sparkline chart)
- 🏆 Top events leaderboard
- 👤 User context on errors and events
- ✅ Mark errors as resolved
- 🗑️ Delete individual or clear all errors/events
- 📱 Responsive dark UI
- 🔗 REST API ready to receive data from any source

### Running Locally

```bash
pnpm dev
```

### Deploying to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Set **Root Directory** to `apps/dashboard`
4. Add **Blob Storage** in Vercel (free)
5. Add environment variable: `BLOB_READ_WRITE_TOKEN`
6. Deploy!

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/errors` | Log a new error |
| `GET` | `/api/errors` | List errors (with filters) |
| `GET` | `/api/errors/[id]` | Get error details |
| `PATCH` | `/api/errors/[id]` | Update an error (resolve) |
| `DELETE` | `/api/errors/[id]` | Delete an error |
| `DELETE` | `/api/errors/clear` | Clear all errors |
| `POST` | `/api/events` | Track an event |
| `GET` | `/api/events` | List events |
| `DELETE` | `/api/events/clear` | Clear all events |
| `GET` | `/api/stats` | Error statistics |
| `GET` | `/api/events/stats` | Event statistics |

**Error POST body:**

```json
{
  "message": "Something went wrong",
  "stack_trace": "Error: ...",
  "level": "error",
  "environment": "production",
  "url": "https://example.com",
  "user_agent": "...",
  "metadata": { "key": "value" }
}
```

**Event POST body:**

```json
{
  "name": "purchase_completed",
  "properties": {
    "productId": "prod_123",
    "amount": 99.99
  },
  "user": {
    "id": "user_123",
    "email": "john@example.com"
  },
  "tags": ["checkout", "premium"],
  "environment": "production"
}
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `limit` | `number` | Results per page (default: `20`) |
| `offset` | `number` | Pagination offset (default: `0`) |
| `level` | `string` | Filter by level (`error`, `warning`, `info`, `debug`) |
| `resolved` | `string` | Filter by status (`0` = unresolved, `1` = resolved) |
| `search` | `string` | Search in message, URL, and stack trace |
| `dateRange` | `string` | Date filter (`today`, `yesterday`, `7d`, `30d`, `90d`, `all`) |

---

## 🧑‍💻 Contributing

Pull requests are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a pull request

For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

MIT © 2025 ErrTrace