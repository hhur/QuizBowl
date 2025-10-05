# QuizBowlHub Constitution

Authoritative principles and operating rules governing architecture, quality, and evolution of the Quiz Bowl Practice & Competition Platform.

## Core Principles

### 1. Real‑Time First
All competitive flows (buzzing, scoring, leaderboards) are designed around low-latency propagation (<150ms target round‑trip locally). Architectural decisions (Socket.IO namespaces, Redis pub/sub, optimistic UI patterns) must not compromise this budget.

### 2. Type Integrity End‑to‑End
Shared schemas (Zod + Prisma + generated TypeScript types) are the single source of truth. No untyped JSON crossing boundaries. Breaking shape changes require version notes and a migration plan.

### 3. Test & Trace Before Scale
Every new module ships with: (a) unit tests (logic), (b) contract tests (API / socket events), (c) structured logging fields. Performance tuning is deferred until correctness & observability are in place.

### 4. Secure by Default
Least privilege, explicit allowlists (CORS, file uploads, roles), rate limiting at edges, input validation everywhere (Zod), encrypted secrets, no plaintext sensitive logs. New feature PRs must state threat considerations in the description.

### 5. Progressive Simplicity
Prefer composable primitives over premature abstraction. Delete or consolidate when accidental complexity appears. Any abstraction must document: intent, constraints, and anti‑patterns.

### 6. Deterministic Builds & Reproducibility
Monorepo tasks must be cacheable (Turborepo). A fresh clone + documented commands produce a green build and seeded dev database in <10 minutes.

### 7. Observability & Feedback Loops
Every real‑time operation logs: correlation id, user id, game id, latency ms, outcome. Metrics emitted (counter/timer) for: buzz latency, question serve latency, auth attempts, error rate, active sockets.

## Architecture Constraints

1. Boundaries:
	- Web (Next.js App Router) – presentation & real‑time client.
	- API (Express) – REST + Socket.IO gateway.
	- Database (PostgreSQL via Prisma) – relational source of truth.
	- Cache / ephemeral (Redis) – presence, rate limiting counters, transient game state.
2. Shared Packages: `@quizbowlhub/types`, future `@quizbowlhub/utils`, `@quizbowlhub/ui` (to be added) must remain free of framework runtime assumptions (e.g., no direct DOM or Express imports).
3. Real‑Time Protocol: Single Socket.IO connection per browser tab; logical segmentation via namespaces/rooms (`game:{id}`, `tournament:{id}`, `presence:global`).
4. Migrations: All schema changes via Prisma migrations—no direct SQL drift commits. Emergency hotfix SQL requires a retrospective migration within 24h.
5. Media Handling: Large media (audio) offloaded to object storage adapter layer (stub initially) – no binary blobs in PostgreSQL.

## Quality & Delivery Workflow

1. Branch Strategy: `main` (release), `develop` (integration), feature branches `feat/<scope>`, fix branches `fix/<scope>`.
2. Pull Requests MUST include:
	- Linked issue / objective statement
	- Screenshots (UI) or cURL examples (API)
	- Test coverage delta summary
	- Risk & rollback notes
3. Gates (CI):
	- Lint (ESLint) – no warnings escalate to errors
	- Type check – zero `any` leakage introduced
	- Unit tests – 95% critical logic lines (auth, scoring) / 80% overall baseline
	- Contract tests – all changed API routes & socket events
	- Build & Prisma migrate dry run
4. Definition of Done:
	- Observability fields present
	- Docs updated (endpoint, event, or domain model)
	- No TODOs without linked issue ids

## Security Requirements

1. Authentication: JWT (access) + optional refresh path (future). Tokens 7d max; rotation on sensitive changes.
2. Authorization: Role + contextual ownership checks (e.g., user is game participant). Central policy helpers only.
3. Rate Limits: Tiered – auth (5/min), general API (100/15min), buzzing (server enforces fairness queue not rate-limits), admin endpoints tighter.
4. Input Validation: All POST/PATCH bodies through Zod schemas; reject on first error with consistent problem detail structure.
5. Logging Hygiene: Never log passwords, raw tokens, or full PII. Use hashing/truncation.

## Performance Standards (Initial Targets)

| Operation | P50 | P95 | Notes |
|-----------|-----|-----|-------|
| REST read (cached) | <80ms | <180ms | Local dev baseline |
| Buzz round trip | <120ms | <180ms | Excludes user think time |
| Question serve (DB→socket emit) | <70ms | <140ms | Warm cache |
| Concurrent sockets per node (dev) | 2k | 5k | Future horizontal scale |

Exceeding P95 by >15% for 24h triggers performance review.

## Documentation Expectations

1. Each domain has a living spec: domain model, invariants, edge cases.
2. Socket events documented with: name, payload schema, ack pattern, error codes.
3. Changelog curated manually per release (semantic versioning MAJOR.MINOR.PATCH).

## Amendment Process

1. Proposal via `docs/amendments/<date>-<slug>.md` containing: rationale, impacted principles, migration steps.
2. Review by at least one maintainer not authoring the change.
3. On approval: increment constitution version (PATCH for clarifications, MINOR for new sections, MAJOR for principle change).

## Governance

This constitution supersedes ad hoc decisions. Non‑compliant code may be rejected regardless of short‑term urgency unless it directly fixes a production outage (post‑incident compliance required in 48h). Architectural debt must be tracked as explicit issues with owner + review date.

**Version**: 1.0.0 | **Ratified**: 2025-10-04 | **Last Amended**: 2025-10-04