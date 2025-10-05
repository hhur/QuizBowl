# Immediate Next Steps

1. Fix Prisma Schema Relation Issues
   - `TeamMember` currently has swapped relation targets (user ↔ team). Correct to:
     user User @relation(fields: [userId], references: [id])
     team Team @relation(fields: [teamId], references: [id])

2. Add Remaining Shared Type Modules
   - `game.ts`, `question.ts`, `team.ts`, `tournament.ts`, `user.ts`, `api.ts`, `socket.ts` inside `@quizbowlhub/types`.

3. Implement API Route Skeletons
   - auth: POST /register, POST /login, GET /me
   - questions: GET /random, GET /:id
   - games: POST /, POST /:id/start, POST /:id/buzz, POST /:id/answer

4. Socket Handlers
   - Namespace `/game` joins room `game:{id}`; events mapped to schemas.

5. Frontend UI Primitives
   - Add `components/ui` (button, card, badge, toaster) and base config for Tailwind.

6. Tooling & CI
   - Add ESLint root config, Prettier config, GitHub Actions workflow for lint/test/build.

7. Seed Script
   - Basic question set (5–10 sample questions) + demo user.

8. Developer Onboarding Doc
   - Outline environment setup, seeding, running dev stack with Docker.

# Stretch (Soon)
- Auth email verification flow.
- Tournament bracket generation algorithm.
- Live presence indicators.
- Spectator read-only game view.
