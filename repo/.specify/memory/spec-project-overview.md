# Project Overview Spec: QuizBowlHub

## Vision
Provide the definitive digital platform for quiz bowl players and teams to practice, compete, analyze performance, and manage tournaments—bridging informal study sessions and formal competitive play in a single cohesive experience.

## Target Users
- Individual Players (students, independent learners)
- Team Captains & Coaches
- Tournament Organizers
- Spectators (future phase)
- Administrators / Moderators

## Core Value Propositions
1. Unified Practice & Competition: Seamless shift from solo drills to structured multiplayer matches.
2. Real-Time Integrity: Low-latency buzzing & adjudication reflecting in-person experience.
3. Actionable Analytics: Category proficiency, speed metrics, improvement trajectories.
4. Scalable Tournament Framework: Registration → Seeding → Brackets → Results.
5. Sustainable Content Management: Question ingestion, categorization, curation workflows.

## High-Level Functional Modules
| Module | Description | Primary Actors |
|--------|-------------|----------------|
| Authentication | Secure user access & session lifecycle | Player, Coach, Admin |
| User Profiles | Basic identity & performance snapshot | Player, Coach |
| Teams | Membership, roles, practice scheduling | Player, Captain, Coach |
| Questions | Repository of categorized questions | Moderator, Admin |
| Practice Engine | Randomized / filtered question serving | Player |
| Live Games | Buzzing, scoring, adjudication | Player, Host |
| Tournaments | Registration, bracket generation, results | Organizer, Player |
| Analytics | Aggregated performance insights | Player, Coach |
| Administration | Content moderation, abuse handling | Admin |

## Out-of-Scope (Initial Release)
- Payment processing / monetization
- Native mobile offline applications
- SSO / external enterprise auth providers
- Live audio / video streaming
- Predictive ML rankings (post-MVP)
- Advanced anti-cheat ML (heuristics only for MVP)

NOTE: AI-assisted question generation has its own spec and is targeted for post-Alpha (separate rollout flag). Spectator streaming remains deferred; a lightweight read-only scoreboard view may appear earlier.

## Success Metrics (Initial Targets & Measurement Sources)
| Metric | Target | Measurement Source | Collection Frequency |
|--------|--------|--------------------|----------------------|
| D1 Retention (registered players) | ≥ 40% | Auth events + user activity heartbeat | Daily batch |
| Median Buzz Latency (round trip) | < 130ms (P50), < 180ms (P95) | Socket instrumentation (emit→broadcast) | Real-time (aggregated 5m) |
| Question Serving Error Rate | < 0.5% | API 5xx + validation rejects / total serves | Hourly |
| Tournament Setup Time (10-team RR) | < 5 min | Time between create→publish events | Per tournament |
| Practice Session Completion Rate | ≥ 70% | Sessions with last question reached / started | Daily |
| AI Draft Approval Rate (post-intro) | 50–70% (baseline learning) | Draft status transitions | Weekly |
| Dashboard Load Latency (warm) | < 1.2s (P75) | Web timing + server span | Real-time sample |

Instrumentation alignment: See `docs/ops/telemetry.md` (to be created) for canonical metric names and label schema.

## Risks & Mitigations (Tracked)
| Risk | Impact | Mitigation | Owner | Status |
|------|--------|-----------|-------|--------|
| Latency spikes under load | Competitive fairness degradation | Redis caching, room partitioning, autoscale triggers | Eng Perf | Open |
| Question copyright / IP issues | Legal & takedown risk | Attribution metadata, moderator review queue | Content Ops | Open |
| Data model churn | Migration instability | Versioned Prisma migrations + contract tests | Backend Lead | Open |
| Cheating / automation (scripted buzzing) | Integrity erosion | Buzz throttle + anomaly scoring + manual review hooks | Real-Time Eng | Open |
| Low early content volume | User churn | Seed packs, import pipeline, AI generation (flagged rollout) | Content Ops | In Progress |
| Duplicate AI drafts flooding reviewers | Review fatigue | Similarity pre-filter + quality scoring thresholds | AI WG | Planned |
| Privacy / student data compliance gaps | Regulatory risk | Data classification + retention policy | Compliance | Planned |
| Operational observability gaps | Slow incident response | Unified telemetry spec & alert thresholds | SRE | Planned |

## Release Phasing (Feature Flagged Rollout)
1. Alpha (Internal / Limited): Auth, Practice Mode, Manual Question Entry, Basic Team Management.
2. Beta 1: Real-Time Scrimmage (buzzing), Core Analytics (player accuracy & latency), Content Moderation Lite.
3. Beta 2: Tournament Creator (round-robin + knockout), Team Dashboard v1, AI Draft Generation (Behind Flag `ai_generation`), Export APIs.
4. GA: Reliability Hardening (SLO-backed), Enhanced Analytics (category trends, readiness index), Scoring Variants (power), Observability Maturity.
5. Post-GA: Hybrid tournament formats, Advanced AI features (curriculum tagging), Spectator Real-Time Channels, Anti-Cheat ML Phase 1.

## Assumptions
| Area | Assumption | Risk if False | Contingency |
|------|------------|--------------|-------------|
| Platform Modality | Web-first is acceptable | Mobile-only users churn | Responsive optimization + future PWA |
| Data Volume | < 500K question records first 12 months | Index tuning needed | Early partitioning strategy |
| Real-Time Transport | WebSockets stable for concurrency targets | Fallback to polling for some clients | Graceful degrade controller |
| AI Cost Envelope | Generation volume within budget | Feature throttling | Dynamic quota scaling |
| School Privacy Requirements | Baseline FERPA-like only | Additional compliance scope | Add anonymization layer |

## Open Questions (Moved to Global Clarifications Tracker)
Maintained in `docs/governance/global-clarifications.md` (to be created). Legacy items:
- Captain override of adjudication mid-match.
- Audit log retention period.
- Password complexity (entropy requirements?).
- Tournament tie-break hierarchy details.
- Scrimmage rebound & power rule variants.

This section will be pruned once tracker file is active.

## Approval Criteria (Updated)
Project Overview considered stable when:
1. All domain specs exist (DONE: core, generator, tournaments, scrimmage, team dashboard).
2. Global Clarifications Tracker established & < 25% unresolved for current phase.
3. Permissions Matrix & Scoring Rules specs merged.
4. Telemetry Spec published with metric names for every success metric.
5. Draft JSON Schemas versioned (v1) for: Transcript, DraftQuestion, TournamentSchedule, TeamAggregate.
6. SLO table ratified & referenced in observability alerts.

Post-stability changes require change log entry + version bump of this spec document header (future addition).
