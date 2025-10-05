# Scoring & Rules Specification

Version: 0.1.0 (Draft)

## Tossup Scoring Modes
| Mode | Correct (Regular) | Power (if enabled) | Neg (Interrupt Incorrect) | Notes |
|------|-------------------|--------------------|---------------------------|-------|
| STANDARD | +10 | N/A | 0 | No power, no neg |
| POWER_NEG | +10 | +15 | -5 | Power window defined by token threshold |
| POWER_OPTIONAL_NEG | +10 | +15 | Configurable (-5 or 0) | Neg toggle at match config |

Default: POWER_NEG disabled for Alpha (STANDARD).

## Bonus Scoring
- Up to 3 parts.
- Default part value: 10 points each.
- Bonus total range: 0–30.
- No bouncebacks between teams (MVP).

## Rebound Policy (Proposed Defaults)
| Scenario | Policy |
|----------|--------|
| Incorrect early buzz (no neg mode) | Continue; others may buzz |
| Incorrect early buzz (neg mode) | Apply neg; continue (tossup live) |
| Answer timeout (locked player) | Continue; others may buzz |
| Correct answer | Lock tossup; proceed to bonus or next tossup |
| Dead tossup (time expired) | Proceed to next |

## Power Window Definition
- If enabled, any correct answer submitted before token index T (config: `powerThresholdTokens`) yields power points.
- Tokenization: simple whitespace split; punctuation stripped.

## Neg Application Timing
- Neg applied only if answer judged incorrect AND buzz occurred before full question read completion (or before `readingComplete` flag for live read scenario).

## Transcript Data Elements (Per Tossup)
| Field | Description |
|-------|-------------|
| questionIndex | Sequence number |
| revealTs | ISO timestamp |
| buzzEvents[] | Ordered buzz attempts with latencyMs |
| firstAcceptedBuzz.playerId | Player with lock |
| answerText | Final accepted answer (if any) |
| correctness | CORRECT | INCORRECT | DEAD |
| powerAwarded | boolean |
| negApplied | boolean |
| pointsAwarded | net points from tossup |
| bonusSequenceId | foreign key if bonus followed |

## Bonus Sequence Data
| Field | Description |
|-------|-------------|
| parts[] | Each: { index, text, pointsPossible, pointsEarned } |
| totalEarned | Sum pointsEarned |
| concludedTs | ISO timestamp |

## Latency Metrics Definitions
| Metric | Formula |
|--------|---------|
| buzz_latency_ms | timestamp(buzzAccepted) - timestamp(tossupReveal) |
| answer_response_ms | timestamp(answerSubmit) - timestamp(buzzAccepted) |
| tossup_cycle_ms | timestamp(tossupEnd) - timestamp(tossupReveal) |

## Edge Rule Variants (Deferred)
- Bouncebacks on missed bonus parts.
- Variable neg values by phase.
- Power mark reveal for spectators only.

## Governance
Scoring changes require: product approval + rules working group sign-off + version bump.
