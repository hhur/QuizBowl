# Feature Specification: Tournament Creator & Manager Module

**Feature Branch**: `004-tournament-creator`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: User description: "I need a module to create and manage quiz bowl tournaments. Inputs are number of teams, format (round-robin or knockout), and schedule. The output should be a bracket generator and match scheduler."

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A tournament organizer wants to quickly configure a quiz bowl tournament by entering the number of teams, selecting a format (round-robin or knockout), optionally defining time slots / rooms, and generating an initial schedule and bracket layout. The organizer can adjust constraints (e.g., avoid repeat matchups in early rounds, prevent same-school pairings in round 1) before publishing the schedule to participating teams.

### Acceptance Scenarios
1. **Given** an organizer specifies 12 teams and format = Round-Robin, **When** they generate a schedule, **Then** the system produces a set of rounds where every team plays every other team exactly once, with balanced distribution of byes (if needed) and no time slot collisions.
2. **Given** an organizer specifies 16 teams and format = Knockout, **When** they generate a bracket, **Then** the system produces a single-elimination bracket with correctly seeded positions, auto-advancement placeholders, and unique match identifiers.
3. **Given** a published tournament schedule, **When** the organizer edits the start time of one round, **Then** all dependent match start times and resource conflicts are revalidated and affected participants are flagged/notified. [NEEDS CLARIFICATION: notification scope]
4. **Given** a team withdraws before the tournament starts, **When** the organizer regenerates or adjusts the schedule, **Then** the system updates bracket/schedule (inserting BYE or reflowing seeding) with a change log entry.
5. **Given** a knockout bracket match concludes with a winner, **When** the result is recorded, **Then** the next round slot is automatically populated with the advancing team.
6. **Given** an organizer sets a constraint to avoid same-school first-round matchups, **When** the initial bracket is generated, **Then** no opening match pairs teams from the same school unless constraints are impossible. [NEEDS CLARIFICATION: fallback policy]
7. **Given** multiple rooms and overlapping time slots, **When** the schedule is generated, **Then** no team has two matches in the same time slot and no room double-booking occurs.
8. **Given** an organizer selects format = Round-Robin + Knockout Finals (hybrid), **When** generation runs, **Then** the system produces group stage schedules plus an elimination bracket seeded by group standings. [NEEDS CLARIFICATION: seeding tie-breakers]

### Edge Cases
- Odd number of teams in round-robin → automatic BYE assignment each round.
- Team withdrawal mid-round-robin stage → retroactively treat future matches as BYE or re-seed? [NEEDS CLARIFICATION]
- Knockout bracket with non-power-of-two teams (e.g., 10) → system creates preliminary/play-in matches or allocates byes to highest seeds.
- Schedule exceeding available time slots → system flags unschedulable state with reasons.
- Room capacity constraints (future) not yet modeled → out-of-scope for MVP.
- Hybrid format final bracket tie for seeding (e.g., identical record + point differential) → tie-breaker algorithm required. [NEEDS CLARIFICATION]
- Overlapping resource update race (two admins editing schedule simultaneously) → conflict resolution needed. [NEEDS CLARIFICATION: concurrency policy]

---

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST allow creation of a tournament specifying: name, numberOfTeams, format (ROUND_ROBIN | KNOCKOUT | HYBRID), optional startDate, optional timeSlot definitions.
- **FR-002**: System MUST support manual entry or bulk import of team list (team name, optional seed, school affiliation).
- **FR-003**: System MUST validate that numberOfTeams matches the imported team list count before generation.
- **FR-004**: System MUST generate a full round-robin schedule where each pair of teams plays exactly once (or designated configuration) for ROUND_ROBIN format.
- **FR-005**: System MUST generate a valid single-elimination bracket for KNOCKOUT format supporting 2^n and non-2^n team counts (inserting byes where necessary).
- **FR-006**: System MUST generate a group stage (pool play) + knockout finals when format = HYBRID. [NEEDS CLARIFICATION: default pool size]
- **FR-007**: System MUST allow seeding input to influence bracket placement (e.g., 1 vs 16 pattern) for knockout.
- **FR-008**: System MUST assign match identifiers (e.g., R1-M3, QF2, SF1, F1) that persist across edits.
- **FR-009**: System MUST produce a conflict-free schedule mapping matches → (timeSlot, room) when such resources are defined.
- **FR-010**: System MUST detect and report scheduling conflicts (team double-booked, room double-booked, insufficient slots) with actionable error messages.
- **FR-011**: System MUST permit constraints: avoidSameSchoolFirstRound (boolean), balancedEarlySeeding (boolean), maxMatchesPerSlot (int=1 fixed for MVP), allowBackToBackMatches (boolean). [NEEDS CLARIFICATION: support set]
- **FR-012**: System MUST maintain a revision history for schedule/regeneration actions (who, when, summary of changes).
- **FR-013**: System MUST allow manual adjustment of an individual match’s timeSlot or room followed by revalidation.
- **FR-014**: System MUST allow marking a match as completed with result (teamA score, teamB score, winnerId) and propagate winner advancement in knockout/hybrid.
- **FR-015**: System MUST expose an API or internal method to retrieve current bracket state including pending, completed, and upcoming matches.
- **FR-016**: System MUST handle team withdrawal pre-start by reflowing schedule or inserting BYE placeholders. [NEEDS CLARIFICATION: reflow vs BYE rule]
- **FR-017**: System MUST present a summary dashboard: total rounds, matches per round, matches remaining, average turnaround per round (if time data present).
- **FR-018**: System MUST support lock/publish state—once published, only authorized roles can modify schedule; edits logged.
- **FR-019**: System MUST provide export of bracket & schedule (JSON + optionally printable bracket layout). [NEEDS CLARIFICATION: export formats]
- **FR-020**: System MUST enforce authorization (only organizer/admin modify; read for participants).
- **FR-021**: System MUST allow insertion of an unscheduled tiebreaker match (manual) with proper identifier.
- **FR-022**: System MUST validate that knockout progression cannot skip unresolved prerequisite matches.
- **FR-023**: System MUST handle partial hybrid completion (group stage done, knockout pending) and freeze group standings after lock. [NEEDS CLARIFICATION: manual override allowed?]
- **FR-024**: System MUST compute and expose standings for round-robin / group phases including wins, losses, pointsFor, pointsAgainst, pointDifferential, headToHead results (if needed for tiebreak). [NEEDS CLARIFICATION: tiebreak priority hierarchy]
- **FR-025**: System MUST allow regeneration of schedule prior to publish; after publish, regeneration requires explicit confirmation (destructive warning) and logs a major change event.
- **FR-026**: System MUST prevent duplicate team names within the same tournament.
- **FR-027**: System MUST allow marking a match as forfeited and treat advancement accordingly (for knockout). [NEEDS CLARIFICATION: score handling]
- **FR-028**: System MUST display bracket progression visually (tree or list representation) including BYE placements.
- **FR-029**: System SHOULD estimate earliest possible completion time based on duration assumptions. [NEEDS CLARIFICATION: default match duration]
- **FR-030**: System MUST provide integrity check endpoints/logic verifying bracket completeness and schedule consistency before publish.

### Key Entities
- **TournamentConfig**: (id, name, format, numberOfTeams, startDate, status, constraints[], createdAt, updatedAt).
- **TournamentTeam**: (id, tournamentId, teamName, seed, school, withdrewFlag, createdAt).
- **TimeSlot**: (id, tournamentId, startTime, endTime, label, roomId?).
- **Match**: (id, tournamentId, roundNumber, bracketPhase, teamAId?, teamBId?, scheduledTimeSlotId?, roomId?, status, scoreA?, scoreB?, winnerId?, parentMatchAId?, parentMatchBId?).
- **BracketNode**: (matchId, position, depth, childRefs[]).
- **ScheduleRevision**: (id, tournamentId, actorId, changeType, diffSummary, createdAt).
- **Standing**: (teamId, tournamentId, wins, losses, pointsFor, pointsAgainst, differential, headToHeadMap JSON, rank, tiebreakNotes).

### Non-Functional Requirements
- **NFR-001**: Round-robin schedule generation for ≤ 32 teams completes in < 3s (P95) under nominal load. [NEEDS CLARIFICATION: performance target]
- **NFR-002**: Single-elimination bracket generation for ≤ 64 teams completes in < 1s average.
- **NFR-003**: Concurrency: schedule edits use optimistic locking to prevent silent overwrites. [NEEDS CLARIFICATION: version field semantics]
- **NFR-004**: Observability: log events for generation (timeMs, numberTeams, format, constraintsApplied, outcome=success|error).
- **NFR-005**: Integrity: bracket graph must remain acyclic; validation rejects cycles.
- **NFR-006**: Scalability: design should allow future pool play expansions (multiple pools) without data model replacement.
- **NFR-007**: Reliability: regeneration errors surface atomic rollback (no half-applied schedule state).
- **NFR-008**: Security: only authorized roles invoke regeneration/destructive actions.

### Out-of-Scope (MVP)
- Double-elimination or Swiss formats.
- Automatic room capacity optimization.
- Live streaming integration.
- Real-time spectator bracket auto-refresh (manual refresh acceptable).
- Automated fairness analysis (e.g., rest time equity metrics) — future enhancement.

---

## Review & Acceptance Checklist

### Content Quality
- [ ] No concrete implementation technology references
- [ ] User-value and outcome oriented
- [ ] Mandatory sections present

### Requirement Completeness
- [ ] All [NEEDS CLARIFICATION] resolved or tracked
- [ ] Entities align with global data model
- [ ] Testability of FRs confirmed

---

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarifications)

---

## Open Clarification Items Summary
1. Notification scope for schedule edits (who is informed and channel?).
2. Fallback policy if same-school avoidance impossible.
3. Default pool size (HYBRID) and grouping method (balanced by seed vs random).
4. Tie-breaker hierarchy for group standings (e.g., head-to-head, point differential, points for, strength of schedule).
5. Team withdrawal handling mid-stage (reschedule vs BYE marking).
6. Constraint set finalization (additional constraints like maxBackToBack?).
7. Reflow vs BYE rule on pre-start withdrawal.
8. Seeding tie-break logic when seeds not provided (random vs rating?).
9. Tiebreak priority explicit ordering for standings.
10. Score handling for forfeits (record as 1–0? configured default?).
11. Notification & publishing workflow (who can publish / unpublish?).
12. Manual override permissions for hybrid stage freezing.
13. Export formats (JSON, CSV, printable PDF?).
14. Match duration default for completion time estimates.
15. Performance targets final numbers (P50/P95) for generation.
16. Optimistic locking version field semantics (increment on every change?).
17. BYE placement algorithm (seed-based or random?).
18. Handling of partial bracket edits (guard rails?).
19. Regeneration destructive warning wording & required confirmations.
20. Advance logic if both parent matches incomplete due to delay (soft locking?).

---

## Acceptance Preconditions
All clarification items addressed; bracket & schedule algorithms documented; validation rules and tie-break hierarchy approved; performance targets ratified.

---

## Next Suggested Steps
1. Clarification workshop with organizers for tie-breakers & constraints.
2. Author algorithm design doc (round-robin generator, knockout seeding, hybrid pipeline).
3. Define JSON schemas for `TournamentConfig`, `Match`, `Standing`.
4. Establish test dataset & property-based tests for generator correctness.
5. Plan incremental delivery: (a) CRUD + config, (b) round-robin engine, (c) knockout engine, (d) hybrid, (e) revision history & locks.
6. Draft user-facing publish/change log UI spec.

---

*End of Specification*