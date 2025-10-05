# Glossary (Canonical Terms)

| Term | Definition | Notes |
|------|------------|-------|
| Tossup | A standalone question where first correct buzz earns points | May trigger bonus |
| Bonus | Set of follow-up parts awarded after a correct tossup | Up to 3 parts, team answered |
| Neg | Negative penalty for incorrect early buzz (interrupt) | Optional mode |
| Power | Higher point value for very early correct buzz | Token threshold based |
| Scrimmage | Real-time informal or practice match between teams | Not an official tournament match |
| Match | Generic competitive unit (tournament or scrimmage) | Tournament matches recorded in bracket context |
| Game | Legacy/umbrella term; prefer Scrimmage or Match | To be phased out where ambiguous |
| Transcript | Structured record of all question cycles & scoring | JSON schema versioned |
| Draft Question | AI or human proposed question pending approval | Status DRAFT until approved |
| Approved Question | Question available for official use | Immutable text except retire flag |
| Tournament | Structured multi-match event with formal formats | Round-robin, knockout, hybrid |
| Pool | Group stage subdivision in hybrid tournaments | Equal or seed-balanced groups |
| Rebound | Allow continued buzzing after incorrect answer | Policy variant |
| Power Threshold | Token index cutoff for awarding power points | Configurable per scrimmage |
| Latency (Buzz) | Time from reveal to accepted buzz | Key SLO |
| Aggregate (Dashboard) | Precomputed stats snapshot for a time window | Cached with TTL |
| Standing | Team rank row in tournament group phase | Includes tie-break fields |
| Clarification Item | Open specification decision tracked globally | See global clarifications tracker |
| Feature Flag | Runtime toggle controlling feature exposure | Stored central config |
| Checkpoint | Persisted partial state for recovery | Scrimmage & transcript durability |
| Similarity Threshold | Cosine or other metric boundary for duplication | AI evaluation |
