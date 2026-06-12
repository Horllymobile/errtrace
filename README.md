# ErrTrace

Open-source error tracking for modern applications.  
A lightweight SDK to capture errors + a self-hosted dashboard to view and manage them.

[![npm version](https://img.shields.io/npm/v/errtrace)](https://www.npmjs.com/package/errtrace)
[![license](https://img.shields.io/npm/l/errtrace)](LICENSE)

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
│       │   ├── api/           # API routes
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/        # UI components
│       ├── lib/               # database & utilities
│       ├── public/
│       └── package.json
├── pnpm-workspace.yaml
├── package.json
└── README.md                  # 👈 you are here
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

Errors are stored in `apps/dashboard/data/errors.json` (auto-created).

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
  dsn: 'https://your-err-trace-dashboard.com', // or '/api/errors' for local dev
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

#### `captureError(error: Error, options?: CaptureOptions): Promise<string | null>`

Send an error. Returns the error ID (UUID) or `null`.

#### `captureMessage(message: string, level?: LogLevel, options?: CaptureOptions): Promise<string | null>`

Send a message with a custom level (`'error'` | `'warning'` | `'info'` | `'debug'`).

#### `setUser(user: User | null): void`

Attach user information (`id`, `email`, etc.) to all subsequent events.

#### `addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void`

Record a breadcrumb (a step that led to the error).

#### `setTags(tags: string[]): void`

#### `setRelease(release: string): void`

### Framework Integrations

#### React / Next.js

```tsx
import { ErrTraceErrorBoundary, useErrTrace } from 'errtrace/react'

// Wrap your app
<ErrTraceErrorBoundary errtrace={errtrace}>
  <App />
</ErrTraceErrorBoundary>

// Or use the hook inside a component
function MyComponent() {
  const { captureError } = useErrTrace(errtrace)
}
```

#### Express

```ts
import { errTraceMiddleware } from 'errtrace/express'
app.use(errTraceMiddleware(errtrace))
```

#### Next.js API Routes

```ts
import { withErrTrace } from 'errtrace/nextjs'
export default withErrTrace(async (req, res) => { … })
```

### Subpath Exports

| Import path | Description |
|---|---|
| `errtrace` | Core client + transports |
| `errtrace/react` | React error boundary + hook |
| `errtrace/express` | Express error-handling middleware |
| `errtrace/nextjs` | Next.js API route wrapper |

> **Note:** React, Express, and Next.js are optional peer dependencies. They are only required when using the corresponding subpath.

---

## 🖥️ Dashboard

A full-featured Next.js app to view, search, filter, and manage errors.

### Features

- 📊 Real-time error statistics
- 🔍 Search & filter (by level, status, text)
- 📋 Error details (stack trace, metadata, breadcrumbs)
- ✅ Mark errors as resolved
- 🗑️ Delete errors
- 📱 Responsive dark UI
- 🔗 API ready to receive errors from any source

### Running Locally

```bash
pnpm dev
```

### Environment Variables

Create `apps/dashboard/.env.local`:

<!-- ```env
# Not required – by default it uses a local JSON file.
# To use Upstash Redis (optional), uncomment and set:
# UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your_token
``` -->

If no Redis variables are provided, the dashboard automatically falls back to a JSON file store (`data/errors.json`) inside the dashboard folder.

### API Endpoints

The dashboard exposes REST endpoints that can be used by any application (including the SDK):

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/errors` | Log a new error |
| `GET` | `/api/errors` | List errors |
| `GET` | `/api/errors/[id]` | Get error details |
| `PATCH` | `/api/errors/[id]` | Update an error |
| `DELETE` | `/api/errors/[id]` | Delete an error |
| `GET` | `/api/stats` | Dashboard statistics |

**Example POST body:**

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