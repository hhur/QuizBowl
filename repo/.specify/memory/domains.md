# Domain Catalog

## Auth
- Concerns: registration, login, JWT issuance, password reset (future), email verification.
- Invariants: unique email & username; passwords hashed (bcrypt, cost ≥ 12 in prod).
- Edge Cases: duplicate registration attempts, token replay, expired tokens.

## Users
- Profile management, avatar metadata, role transitions (PLAYER → COACH/Admin restricted).
- Invariants: role changes audited; deletion soft (future) or hard only if no foreign key dependencies.

## Teams
- Creation, membership invites, roles (CAPTAIN, MEMBER, COACH).
- Invariants: a user cannot join same team twice; captain required if team has ≥1 member.

## Questions
- CRUD (admin/moderator), query by category/difficulty, random selection for games.
- Invariants: active questions only served; answer text immutable after game usage (versioning future).

## Games
- Lifecycle: WAITING → IN_PROGRESS → (PAUSED optional) → COMPLETED/CANCELLED.
- Invariants: scoring rules fixed once IN_PROGRESS; participants locked after first question served unless team-based substitution (future).

## Real-Time (Sockets)
Events (initial set):
- client → server: `buzz`, `join_game`, `leave_game`, `submit_answer`.
- server → client: `game_state`, `question`, `buzz_result`, `score_update`, `error`.

## Tournaments
- Registration, bracket generation, match progression.
- Invariants: bracket immutable once first match starts; seeding algorithm deterministic given seed input.

## Analytics
- Aggregation of responses, accuracy, latency metrics.
- Invariants: derived metrics recomputed idempotently; no double-count of responses.

## Security
- Rate limiting, input validation, audit logging hooks.

## Observability
- Structured log fields: `traceId`, `userId`, `gameId`, `event`, `latencyMs`, `outcome`.
