# simple-crm — Build & Rebuild Guide

A contact management CRM built as a [Lakebed](https://lakebed.dev) capsule and deployed to [lakebed.app](https://lakebed.app).

## Architecture

| Layer | Technology |
|-------|-----------|
| Runtime | Lakebed (all-in-one: server, client, DB, auth, CLI) |
| Server | `lakebed/server` — schema, queries, mutations |
| Client | Preact (`lakebed/client`) |
| Styling | Tailwind CSS (built-in, no build pipeline) |
| Auth | Google Sign-In via Shoo (`SignInWithGoogle`) |
| Router | Lakebed client router (`Router`, `Route`, `Link`, `useNavigate`, `useParams`) |
| Database | Lakebed built-in DB (`contacts` table) |
| Deployment | Lakebed Cloud (`npx lakebed deploy`) |

## Project Structure

```
simple-crm/
  server/index.ts       — capsule schema, queries, mutations
  client/index.tsx      — Preact UI (4 routes)
  shared/contacts.ts    — Contact type + sanitizers
  .gitignore            — ignores .lakebed/ and .env.lakebed.server
  .lakebed/deploy.json  — deployment config (DO NOT COMMIT)
  AGENTS.md             — Lakebed development rules (for AI agents)
  CLAUDE.md             — same as AGENTS.md (for Claude)
  README.md             — starter README (outdated)
  BUILD.md              — this file
```

## Prerequisites

- Node.js (v20+)
- `npx` (ships with npm)

Nothing else. No `npm install`. No build tools. Lakebed CLI bundles everything.

## Database Schema

Single table `contacts` with fields:
- `name` (string), `email` (string), `phone` (string), `company` (string), `notes` (string), `ownerId` (string)

Contacts are ownership-gated via `ctx.auth.userId`. Each user only sees their own contacts.

## API (Server)

**File:** `server/index.ts`

- **Query `contacts`** — returns all contacts for the authenticated user, ordered by `createdAt` desc
- **Mutation `addContact`** — inserts a new contact (sanitized) owned by the caller
- **Mutation `updateContact`** — updates a contact if owned by the caller
- **Mutation `deleteContact`** — deletes a contact if owned by the caller

Input sanitization lives in `shared/contacts.ts`.

## Client (UI)

**File:** `client/index.tsx`

**Routes:**
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `ContactListPage` | Searchable list with inline delete confirmation |
| `/add` | `AddContactPage` | Form to create a contact |
| `/contacts/:id` | `EditContactPage` | Edit or delete a contact |
| `*` | `NotFoundPage` | 404 fallback |

**Features:**
- Google Sign-In via a pill button in the sticky header
- Avatar color generation from name hash
- Search/filter by name, email, or company
- Inline delete confirmation on list page
- Sticky header with backdrop blur, Apple-inspired design

## How to Rebuild (Clean)

If you need to rebuild from scratch (e.g., after a catastrophic failure):

### 1. Clone the repo

```sh
git clone git@github.com:BWS1900/simple-crm.git
cd simple-crm
```

### 2. Run locally

```sh
npx lakebed dev
```

Opens at `http://localhost:3000`. Local state resets on restart.

### 3. Deploy

```sh
npx lakebed deploy
```

Follow the CLI prompts. On first deploy you will receive a claim token. After deployment your app is live at a `*.lakebed.app` URL.

### 4. Claim the deploy (if needed for server-side fetch)

```sh
npx lakebed claim --token <claim-token>
```

### Inspect local state

```sh
npx lakebed db list --port 3000
npx lakebed db dump --port 3000
npx lakebed logs --port 3000
```

## Current Deployment

| Property | Value |
|----------|-------|
| URL | `https://rapid-orbit-a5f7fc.lakebed.app` |
| Deploy ID | `dep_ljTj1c4` |
| Git Remote | `github.com/BWS1900/simple-crm` |
| Branch | `main` |

## Key Constraints (from AGENTS.md)

- No `npm install` — use Lakebed built-in APIs only
- All client code in `client/`, server code in `server/`, shared in `shared/`
- Styling via Tailwind classes or raw CSS only (no PostCSS/CSS build pipeline)
- No file-based routing — use `Router`/`Route` from `lakebed/client`
- No Node built-ins in app code
- Auth via `ctx.auth` (server) / `useAuth()` (client)
- Environment variables: server-only via `.env.lakebed.server`, not available at build time
- Local state resets when `npx lakebed dev` restarts
- No file storage
