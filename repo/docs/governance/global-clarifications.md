# Global Clarifications Tracker

Status legend: OPEN | ASSUMED | RESOLVED | DEFERRED

| ID | Source Module | Description | Current Status | Proposed Default / Notes | Owner |
|----|---------------|-------------|----------------|---------------------------|-------|
| CL-001 | Scrimmage | Rebound policy after incorrect/timeout | OPEN | Likely: allow remaining players to buzz unless dead tossup rule enabled | Rules WG |
| CL-002 | Scrimmage | Neg + rebound interplay | OPEN | Neg does not end tossup unless configured variant NEG_ENDS enabled | Rules WG |
| CL-003 | Scrimmage | Undo skip grace window length | OPEN | 30s or before next tossup reveal | Real-Time Eng |
| CL-004 | Scrimmage | Late join visibility of active tossup | OPEN | View text but cannot buzz | Product |
| CL-005 | Scrimmage | Power threshold definition | OPEN | Token-based (space-delimited) count | Rules WG |
| CL-006 | Scrimmage | Power scoring values | OPEN | +15 power, +10 regular, -5 neg | Rules WG |
| CL-007 | Scrimmage | Buzz throttle threshold | OPEN | Ignore >1 buzz / 120ms per player | Real-Time Eng |
| CL-008 | Scrimmage | Checkpoint cadence | OPEN | Every question end + every 5 buzz events | Real-Time Eng |
| CL-009 | Tournament | Tie-breaker hierarchy | OPEN | Wins > Head-to-head > Point Differential > Points For > Coin Flip | Tournament Ops |
| CL-010 | Tournament | Hybrid pool default size | OPEN | 4 teams per pool | Tournament Ops |
| CL-011 | Tournament | Same-school avoidance fallback | OPEN | Relax constraint after 3 failed permutations | Tournament Ops |
| CL-012 | Tournament | Pre-start withdrawal handling | OPEN | Insert BYE; no reseed unless >10% teams withdraw | Tournament Ops |
| CL-013 | Tournament | Forfeit score handling | OPEN | Record 1–0 plus advancement; exclude from averages | Tournament Ops |
| CL-014 | Tournament | Match duration assumption | OPEN | 20 min per round baseline | Tournament Ops |
| CL-015 | Question Gen | Duplicate similarity threshold | OPEN | Cosine ≥ 0.88 with embedding model | AI WG |
| CL-016 | Question Gen | Quality scoring rubric factors | OPEN | Clarity, clue gradient, answer uniqueness, length bounds | AI WG |
| CL-017 | Question Gen | Daily quota values | OPEN | Coach 100/day, Moderator 250/day, Admin unlimited | Product |
| CL-018 | Question Gen | Style normalization rules | OPEN | Standard punctuation, American English, no smart quotes | AI WG |
| CL-019 | Team Dashboard | Category sample size min threshold | OPEN | 5 attempts | Analytics |
| CL-020 | Team Dashboard | Improvement delta calculation | OPEN | Current window avg vs previous equal-length window | Analytics |
| CL-021 | Team Dashboard | Staleness threshold | OPEN | >10m since last aggregate recompute | Analytics |
| CL-022 | Team Dashboard | Participation low threshold | OPEN | <40% of matches in window | Analytics |
| CL-023 | Platform | Audit log retention period | OPEN | 365 days | Compliance |
| CL-024 | Platform | Password complexity | OPEN | Min 10 chars; at least 1 letter + 1 number | Security |
| CL-025 | Platform | Data retention (practice transcripts) | OPEN | 2 academic years then aggregate/anonymize | Compliance |
| CL-026 | Platform | Transcript schema finalization cadence | OPEN | Quarterly review; version bump on breaking change | Product |
| CL-027 | Platform | Production buzz latency SLO P95 | OPEN | <180ms global | SRE |
| CL-028 | Platform | Shared state store for scrimmage | OPEN | Redis (cluster-ready) | SRE |
| CL-029 | Platform | Accessibility target | OPEN | WCAG 2.1 AA | UX |
| CL-030 | Platform | Feature flag kill-switch latency | OPEN | <60s propagation | DevOps |

Additions require incrementing table and creating associated issue.
