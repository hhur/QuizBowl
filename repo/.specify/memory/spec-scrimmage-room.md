# Feature Specification: Real-Time Scrimmage Room

**Feature Branch**: `005-scrimmage-room`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: User description: "Build a real-time quiz interface for scrimmages. Inputs include team names, question set, and timer settings. The output should be a live interface with buzzers, scoring, and question display."

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
Two high school quiz bowl teams want to conduct an online scrimmage using a predefined question set. A host launches a scrimmage room, invites both teams, starts the match, reads (or reveals) each tossup sequentially, and the system adjudicates buzzer presses in real time, tracks scoring (including neg penalties if enabled), and handles optional bonus sequences.

### Acceptance Scenarios
1. **Given** a host creates a scrimmage with Team A and Team B and a selected question set, **When** both teams have at least one player connected, **Then** the host can press “Start Match” and Question #1 is prepared (hidden until reveal) with timer initialized.
2. **Given** a tossup is revealed and multiple players buzz nearly simultaneously, **When** their buzz events arrive within a narrow (<50ms) window, **Then** the system deterministically assigns first buzz to exactly one player (stable ordering) and notifies all clients of the locked-in player.
3. **Given** a player buzzes first, **When** they fail to answer within the configured answer timeout, **Then** the system marks it as no-answer (or incorrect) and re-enables buzzing per rules (or advances if rule configured). [NEEDS CLARIFICATION: rebound policy]
4. **Given** neg penalties are enabled and a player interrupts with an incorrect answer before power/regular threshold, **When** adjudicated, **Then** the system applies the neg score and disables further buzzing if the rule ends the tossup. [NEEDS CLARIFICATION: rebound rule variant]
5. **Given** a correct tossup answer, **When** bonuses are enabled, **Then** the system automatically transitions to a bonus sequence with up to three parts and tracks part-by-part scoring.
6. **Given** network latency causes a client to reconnect, **When** they rejoin the room, **Then** they receive the current match state (active question, timer value, scores, player lock) within one state sync payload.
7. **Given** the host pauses the scrimmage, **When** pause is broadcast, **Then** timers halt and no buzzing is accepted until resume.
8. **Given** a host ends the match early, **When** they click “End Match,” **Then** partial stats are finalized and flagged as incomplete in transcript.

### Edge Cases
- Player disconnects while holding the buzz lock → system revokes lock after answer timeout expires.
- No players buzz within tossup time limit → question marked dead, proceed to next.
- Bonus part unanswered (timeout) → zero points recorded and proceed to next part or next tossup.
- Duplicate buzz events from same client due to retry → server deduplicates via per-question buzz token.
- Host accidentally skips a question → needs “Undo skip” within a grace window. [NEEDS CLARIFICATION: undo window length]
- Late joiner during active tossup → can see question text but cannot buzz (policy) or cannot see until next. [NEEDS CLARIFICATION]
- Power scoring (early answer bonus) optional. [NEEDS CLARIFICATION: scoring scheme]

---

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST allow creation of a scrimmage room with settings: questionSetId, enableBonuses (bool), negPenalty (int, default -5 optional), tossupTime (seconds), answerTime (seconds), bonusPartTime (seconds), powerEnabled (bool), powerThreshold (token count or char index) [NEEDS CLARIFICATION: threshold definition].
- **FR-002**: System MUST allow host to invite teams (teamIds) or individual players (ad-hoc) before match start.
- **FR-003**: System MUST maintain a real-time roster: connected players, roles (host, moderator, player, spectator), team association.
- **FR-004**: System MUST provide a state synchronization event containing: currentPhase (WAITING | TOSSUP | BONUS | PAUSED | ENDED), activeQuestionIndex, questionMetadata (no answer until revealed), timer state, scores.
- **FR-005**: System MUST restrict question answer text from being sent to clients until reveal event.
- **FR-006**: System MUST broadcast a `tossup_reveal` event that unlocks buzzing and starts tossup timer.
- **FR-007**: System MUST accept `buzz` events from eligible players only when phase = TOSSUP and no current buzzLock.
- **FR-008**: System MUST adjudicate the first valid buzz and broadcast `buzz_lock` with (playerId, timestamp, latencyMs from reveal).
- **FR-009**: System MUST enforce answerTime countdown for the locked player; expiration triggers `answer_timeout` and continues according to configured rebound rule. [NEEDS CLARIFICATION: rebound rule]
- **FR-010**: System MUST allow the host or moderator to manually mark an answer correct/incorrect or override timing mid-answer.
- **FR-011**: System MUST update scores applying: tossup points (e.g., +10, +15 power if enabled), neg penalties, bonus part values.
- **FR-012**: System MUST transition automatically to BONUS phase after correct tossup if bonuses enabled; else move to next tossup setup.
- **FR-013**: System MUST handle bonus parts sequentially with their own timers and accept team (or designated players’) answers; scoring recorded per part.
- **FR-014**: System MUST provide `score_update` events after each scoring decision with cumulative team scores and per-player tallies (tossup points, neg count, powers if used).
- **FR-015**: System MUST store a transcript: per question: buzz order with timestamps, answers, correctness, points, and bonus breakdown.
- **FR-016**: System MUST allow `pause` and `resume` controlling timers and disabling buzzing.
- **FR-017**: System MUST allow `skip_question` (host/mod only) which advances to next tossup and marks prior as skipped; undo available within a configured window. [NEEDS CLARIFICATION: undo duration]
- **FR-018**: System MUST end match via `end_match` producing finalized summary statistics and marking incomplete if not all questions used.
- **FR-019**: System MUST prevent reuse of already served questions from the selected set in the same match.
- **FR-020**: System MUST differentiate spectator role: can view live state but cannot buzz or see answer early.
- **FR-021**: System MUST throttle buzz attempts per player (e.g., ignore >1 per 100ms) to mitigate network spam. [NEEDS CLARIFICATION: threshold]
- **FR-022**: System MUST reconcile late-arriving buzz events (post-lock) with a rejection event to originating player only.
- **FR-023**: System MUST persist incremental state so a server restart can restore active match within <5s from last checkpoint. [NEEDS CLARIFICATION: checkpoint cadence]
- **FR-024**: System MUST handle optional power scoring (extra points for early correct answer) based on configured threshold definition.
- **FR-025**: System MUST expose REST endpoints or GraphQL queries for fetching historical scrimmage transcripts.
- **FR-026**: System MUST allow host to configure anonymity mode (hide player names to opposing team). [NEEDS CLARIFICATION: data fields hidden]
- **FR-027**: System MUST optionally announce category or difficulty before reveal if enabled. [NEEDS CLARIFICATION: toggle name]
- **FR-028**: System MUST track latency metrics per player (buzz latency distribution) for later analytics.
- **FR-029**: System MUST support reconnect logic: on reconnect client requests a full state snapshot and gets delta since last event sequence number.
- **FR-030**: System SHOULD enable chat or minimal message log (optional future; not core scoring) — excluded from MVP scoreboard logic.

### Key Entities
- **ScrimmageConfig**: (id, questionSetId, negPenalty, tossupTime, answerTime, bonusPartTime, powerEnabled, powerThreshold, enableBonuses, reboundRule, anonymityMode, createdAt).
- **Scrimmage**: (id, status, currentPhase, activeQuestionIndex, startedAt, endedAt, hostId, teamAId, teamBId, settingsRef, transcriptStoredFlag).
- **ScrimmageParticipant**: (id, scrimmageId, userId, teamId, role, connectedAt, lastSeenAt, statsRef?).
- **ScrimmageQuestionState**: (scrimmageId, questionIndex, revealedAt, buzzLockPlayerId?, firstBuzzLatencyMs?, result (DEAD|ANSWERED|SKIPPED), tossupPointsAwarded, powerAwarded, negsGiven, bonusSequenceId?).
- **BonusSequence**: (id, scrimmageId, questionIndex, partCount, partsJSON, totalPointsEarned, completedAt).
- **BuzzEvent**: (id, scrimmageId, questionIndex, playerId, ts, acceptedFlag, latencyMs, orderingRank).
- **ScoreSnapshot**: (id, scrimmageId, capturedAt, teamScoresJSON, playerScoresJSON, sequenceNumber).
- **Transcript**: (scrimmageId, serializedJSON, finalizedAt, version).

### Non-Functional Requirements
- **NFR-001**: Buzz adjudication P95 latency (socket receive → broadcast lock) < 120ms (local baseline). [NEEDS CLARIFICATION: production target]
- **NFR-002**: State sync after reconnect must complete < 1s server processing.
- **NFR-003**: Scaling: support at least 300 concurrent scrimmage rooms with average 12 participants each on a single node (baseline). [NEEDS CLARIFICATION: official load target]
- **NFR-004**: Fault tolerance: losing one stateless socket node should not terminate active scrimmage (sticky session or shared state store required). [NEEDS CLARIFICATION: store type]
- **NFR-005**: Persistence checkpoint cadence ensures max 2 questions of potential transcript loss on crash. [NEEDS CLARIFICATION: cadence seconds/questions]
- **NFR-006**: Security: events validated (no tampering with scoring from clients). Only server assigns points.
- **NFR-007**: Observability: metrics for buzz_count, buzz_collisions, average_latency, reconnect_count, state_resync_ms, skip_events, undo_usage.
- **NFR-008**: Accessibility: timers and buzz states have ARIA announcements / textual equivalents. [NEEDS CLARIFICATION: specific guidelines]
- **NFR-009**: Privacy: anonymized mode hides player names from opposing roster if enabled; logs still retain mapping internally.

### Out-of-Scope (MVP)
- Voice chat / audio streaming integration.
- Automatic speech recognition for real-time answer adjudication.
- Machine learning anti-cheat beyond basic rate limiting.
- Multiple simultaneous buzz lock tiers (only single winner per tossup).

---

## Review & Acceptance Checklist

### Content Quality
- [ ] No framework-specific implementation details included
- [ ] User scenarios map to requirements
- [ ] All mandatory sections present

### Requirement Completeness
- [ ] All [NEEDS CLARIFICATION] resolved
- [ ] Entities align with broader domain model
- [ ] NFR targets ratified

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
1. Rebound policy after incorrect/timeout (do others get to buzz again?).
2. Neg penalty rules interplay with rebound (continue vs dead tossup).
3. Undo skip grace window length.
4. Late join visibility policy (see active tossup or wait?).
5. Power threshold definition (tokens, characters, syllables?).
6. Power scoring values (e.g., +15 vs +10 standard?).
7. Rebound rule after first incorrect (immediate continue vs lockout?).
8. Buzz throttle threshold (events per ms cap).
9. Checkpoint cadence (every N events vs time interval).
10. Reconnect state delivery method: full snapshot vs patch sequence.
11. Anonymity mode specifics (hide names, avatars, stats?).
12. Category/difficulty pre-reveal toggle naming & default.
13. Power + neg combination compatibility (allowed simultaneously?).
14. Production P95 latency target (global vs regional?).
15. Target concurrency baseline (final number for capacity testing).
16. Shared state storage choice (Redis pub/sub? database?).
17. Accessibility requirements (WCAG level, ARIA specifics).
18. Persistence strategy for transcript partial flush.
19. Reconnect maximum allowed stale sequence window.
20. Bonus sequence answer format (team consensus vs designated speaker?).
21. Rebound policy for bonus parts (none typical) confirm.
22. When to finalize transcript (on each question vs end only). 
23. Allowed manual overrides logged fields.
24. Timer drift handling (sync interval?).
25. Score change audit record policy.

---

## Acceptance Preconditions
Clarifications resolved; scoring + timing rules documented; state synchronization + fault tolerance approach approved; NFR targets validated with load test plan.

---

## Next Suggested Steps
1. Clarify rules (rebound, power/neg interplay, anonymity) with stakeholders.
2. Draft event protocol spec (socket event names, payload schemas, ack patterns).
3. Prototype deterministic buzz ordering algorithm & collision test harness.
4. Design state persistence & recovery strategy (Redis structures + schema).
5. Establish transcript JSON schema version v1.
6. Create test matrix (unit + simulation + latency regression).

---

*End of Specification*