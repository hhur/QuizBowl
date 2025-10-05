# Feature Specification: Team Dashboard

**Feature Branch**: `003-team-dashboard`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: User description: "Create a dashboard for quiz bowl teams. Inputs include team name, player profiles, and match history. The output should be a web dashboard showing team stats, player performance graphs, and match summaries."

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A coach wants a single view to assess overall team health: recent match outcomes, player contribution balance, category strengths/weaknesses, and improvement trends—so they can plan targeted practice.

### Acceptance Scenarios
1. **Given** a team with at least 3 completed matches, **When** the coach opens the Team Dashboard, **Then** they see aggregated team stats (win/loss record, average points per match, average tossup conversion rate, category distribution chart) and recent match summaries.
2. **Given** a player has participated in multiple matches, **When** the dashboard loads player performance charts, **Then** each chart displays accuracy%, points per match trend, and average buzz time (if available) for that player.
3. **Given** a user without coach or captain permissions attempts to access the dashboard, **When** they navigate to the URL, **Then** they either see a restricted (read-only) version or an authorization error based on policy. [NEEDS CLARIFICATION]
4. **Given** the team has newly completed a match, **When** the coach refreshes the dashboard, **Then** the new match appears in the “Recent Matches” list with computed stats (no manual recalculation required).
5. **Given** a player was absent from recent matches, **When** the dashboard loads participation metrics, **Then** they are shown with zero recent stats but historical baseline still accessible.
6. **Given** the match history includes both practice scrimmages and official tournament matches, **When** the coach filters match type = “Tournament”, **Then** only tournament matches remain with recalculated aggregates.
7. **Given** a category has insufficient data (e.g., < 5 questions attempted), **When** the category performance panel renders, **Then** it visually indicates low sample size (e.g., asterisk or disclaimer). [NEEDS CLARIFICATION: representation]

### Edge Cases
- Team with zero matches: show onboarding state + instructions to schedule first practice.
- New player with no recorded stats: show placeholder card ("No data yet").
- Historical data gap (e.g., missing match transcript) → panel shows partial badge & link to data integrity notice. [NEEDS CLARIFICATION: remediation flow]
- Player transferred from another team: stats segmentation pre-/post-transfer? [NEEDS CLARIFICATION]
- Very large team (> 25 members) pagination or grouping of player cards. [NEEDS CLARIFICATION: threshold]
- Match in-progress should not appear in finalized stats until status=COMPLETED.

---

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST display core team aggregate metrics: total matches, wins, losses, win rate, average points per match, average opponent points.
- **FR-002**: System MUST compute category performance: accuracy% per category (numerator = correct answers, denominator = attempted). Minimum sample threshold flagged. [NEEDS CLARIFICATION: threshold value]
- **FR-003**: System MUST provide recent matches list (default: last 5) including opponent, date, result (W/L), team score, opponent score, and link to detailed match transcript.
- **FR-004**: System MUST allow filtering matches by type (scrimmage, tournament, practice) and time window (last week, month, season, custom). [NEEDS CLARIFICATION: available windows]
- **FR-005**: System MUST present player performance cards: accuracy%, total points, average points per match, matches played, buzz speed metrics (if collected).
- **FR-006**: System MUST provide at least one time-series visualization (e.g., points per match over time) for the team and each player with sufficient data (≥ 3 matches). [NEEDS CLARIFICATION: min data threshold]
- **FR-007**: System MUST distinguish between tossup and bonus contributions (e.g., separate point tallies or ratios).
- **FR-008**: System MUST show a contribution breakdown (percentage of total team points by player) for the selected time window.
- **FR-009**: System MUST allow sorting player list by accuracy, total points, matches played, or improvement delta (if computed). [NEEDS CLARIFICATION: improvement formula]
- **FR-010**: System MUST restrict edit or configuration actions (e.g., changing filters persistence) to authorized roles (coach, captain). [NEEDS CLARIFICATION: captain permissions]
- **FR-011**: System MUST update aggregates automatically when new match data is persisted (no manual rebuild step).
- **FR-012**: System MUST visually indicate stale data if underlying recalculation failed (error state surfaced). [NEEDS CLARIFICATION: max acceptable staleness]
- **FR-013**: System MUST support mobile-friendly layout (responsive design) preserving core metrics.
- **FR-014**: System MUST respect privacy rules: players should only see detailed metrics of teammates if policy allows; else anonymized rank-style view. [NEEDS CLARIFICATION: privacy policy]
- **FR-015**: System MUST provide an export of team aggregate stats and player summary metrics (e.g., CSV or JSON). [NEEDS CLARIFICATION: export format]
- **FR-016**: System MUST allow drill-down from a match summary into the full transcript view (existing or future feature).
- **FR-017**: System MUST display trend indicators (up/down/no change) for selected metrics based on previous equivalent window (e.g., last 5 matches vs prior 5). [NEEDS CLARIFICATION: comparison window]
- **FR-018**: System MUST handle time zone normalization for match timestamps (display team default time zone). [NEEDS CLARIFICATION: timezone source]
- **FR-019**: System MUST cache or reuse previously computed aggregates for performance to avoid recomputing on every dashboard load. [NEEDS CLARIFICATION: cache TTL]
- **FR-020**: System MUST allow manual refresh override bypassing cache (authorized users only).
- **FR-021**: System MUST link each player card to a deeper individual performance view (existing or future route).
- **FR-022**: System MUST expose a flag if any player’s participation rate (matches played / total matches in window) is below a configurable threshold. [NEEDS CLARIFICATION: threshold]
- **FR-023**: System MUST display roster metadata: captain(s), coaches, active roster count.
- **FR-024**: System MUST exclude forfeited/cancelled matches from performance aggregates unless explicitly included by filter. [NEEDS CLARIFICATION]
- **FR-025**: System MUST allow toggling inclusion of practice sessions in aggregate stats. [NEEDS CLARIFICATION: default state]
- **FR-026**: System MUST record dashboard view events (for analytics) including teamId, userId, timestamp.
- **FR-027**: System MUST identify and label outlier matches (e.g., > 2 standard deviations above average score) for coaching review. [NEEDS CLARIFICATION: exact criteria]
- **FR-028**: System SHOULD present a readiness indicator (e.g., composite score combining recent accuracy trend + participation stability). [NEEDS CLARIFICATION: formula]
- **FR-029**: System MUST gracefully degrade visualizations if underlying chart data fetch fails (fallback text summary).
- **FR-030**: System MUST paginate player list if exceeding maximum visible cards (page size TBD). [NEEDS CLARIFICATION: page size]

### Key Entities
- **TeamAggregate**: Derived metrics snapshot (teamId, window, wins, losses, avgPointsFor, avgPointsAgainst, winRate, updatedAt, sourceWindowRange).
- **PlayerPerformanceSummary**: (playerId, teamId, window, accuracy, totalPoints, tossupPoints, bonusContribution, avgBuzzTime, matchesPlayed, trendDeltas, computedAt).
- **MatchSummary**: (matchId, opponentName, teamScore, opponentScore, date, type, result, flags[]).
- **CategoryPerformance**: (teamId, category, correct, attempted, accuracy, sampleSizeFlag, window, updatedAt).
- **DashboardViewEvent**: (id, teamId, userId, viewedAt, context, filtersHash).
- **OutlierMatchFlag**: (matchId, reason, zScore, createdAt).

### Non-Functional Requirements
- **NFR-001**: Dashboard initial load (warm cache) target < 1.2s server processing; cold recomputation < 3s. [NEEDS CLARIFICATION: acceptance thresholds]
- **NFR-002**: Aggregate recalculation triggered by new match ingest must complete within 10s of match finalization for it to appear “fresh”. [NEEDS CLARIFICATION: SLO]
- **NFR-003**: Data accuracy: aggregate values must reconcile to raw match logs with ±0 tolerance.
- **NFR-004**: Concurrency safety: simultaneous recalculations for same team must serialize or merge safely (no partial overwrites).
- **NFR-005**: Privacy: access control enforced server-side; no sensitive metrics delivered if client not authorized.
- **NFR-006**: Observability: metrics emitted—dashboard_load_latency_ms, aggregates_recalc_latency_ms, cache_hit_ratio.
- **NFR-007**: Availability goal for dashboard endpoint matches platform baseline (≥ 99%).
- **NFR-008**: Visualization components degrade to text on accessibility mode toggle. [NEEDS CLARIFICATION: accessibility mode activation]

### Out-of-Scope (for this feature)
- Live in-dashboard real-time updating (use manual refresh for MVP).
- Predictive analytics / machine learning performance projections.
- Cross-team comparison benchmarking.
- Player wellness or attendance tracking features.

---

## Review & Acceptance Checklist

### Content Quality
- [ ] No specific implementation library details (charts, cache tech) included
- [ ] User-value focused language
- [ ] Mandatory sections filled

### Requirement Completeness
- [ ] All [NEEDS CLARIFICATION] resolved or converted to assumptions
- [ ] Testable metrics & behaviors defined
- [ ] Entities align with domain model

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
1. Authorization model for non-coach viewing (read-only vs restricted).
2. Category sample size threshold value.
3. Match time window filter enumeration (preset ranges).
4. Minimum data threshold for chart rendering.
5. Improvement delta calculation formula (rolling window? baseline?).
6. Captain permissions scope.
7. Staleness threshold before flagging data.
8. Privacy policy specifics for viewing teammate details.
9. Export format(s) (CSV, JSON; include which fields?).
10. Comparison window used for trend arrows.
11. Timezone source (team setting vs user preference).
12. Cache TTL for aggregates.
13. Participation rate low threshold.
14. Inclusion/exclusion rules for forfeited/cancelled matches.
15. Default inclusion of practice sessions in aggregates.
16. Outlier detection criteria (std dev threshold & minimum sample size).
17. Readiness indicator formula components.
18. Pagination page size default.
19. Accessibility mode activation mechanism.
20. Recalculation SLO / latency acceptance thresholds.

---

## Acceptance Preconditions
All clarification items addressed; FR/NFR mapped to test cases; data derivation formulas documented; privacy constraints approved.

---

## Next Suggested Steps
1. Clarification session (coaches + product) to resolve policy-related items.
2. Draft aggregation formulas & readiness indicator spec.
3. Define caching + invalidation strategy doc.
4. Prepare test matrix (unit + integration + data reconciliation tests).
5. Create wireframe / UX artifact for dashboard layout (not in this spec scope).
6. Plan incremental delivery: (a) aggregates API, (b) basic UI, (c) charts, (d) filters, (e) export.

---

*End of Specification*