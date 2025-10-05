# Telemetry & Observability Specification

Version: 0.1.0 (Draft)

## Metrics Catalog
| Name | Type | Labels | Description | Related SLO |
|------|------|--------|-------------|-------------|
| buzz_latency_ms | Histogram | env, region | Time from tossup reveal to accepted buzz | Buzz latency |
| buzz_collisions_total | Counter | env | Number of multi-buzz windows (<50ms) | Monitoring only |
| question_serve_latency_ms | Histogram | env, source | Time to fetch + deliver question to client | Question serve |
| scrimmage_active_rooms | Gauge | env | Current active scrimmage rooms | Capacity |
| scrimmage_reconnects_total | Counter | env | Count of reconnect events | Stability |
| transcript_checkpoint_latency_ms | Histogram | env | Time to persist checkpoint | Recovery |
| ai_generation_latency_ms | Histogram | env, model | Time per generated question | AI latency |
| ai_generation_duplicates_total | Counter | env | Count flagged duplicates | Quality |
| dashboard_load_latency_ms | Histogram | env | Server processing time for team dashboard | Dashboard SLO |
| tournament_generation_latency_ms | Histogram | env, format | Schedule/bracket generation time | Tournament generation |
| api_request_total | Counter | env, route, status | API call counts by status | Error rate |
| api_request_duration_ms | Histogram | env, route | API latency | API latency |
| websocket_connected_clients | Gauge | env | Active socket connections | Capacity |
| auth_login_failures_total | Counter | env | Failed login attempts | Security |
| rate_limit_block_total | Counter | env, key | Requests blocked by rate limiter | Security |

## Log Field Dictionary (Structured JSON)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ts | ISO8601 | Yes | Event timestamp |
| level | string | Yes | log level (info,warn,error) |
| msg | string | Yes | Human-readable summary |
| traceId | string | Yes | Correlates across services |
| spanId | string | No | Sub-span id |
| userId | string | No | Authenticated user id if available |
| teamId | string | No | Team context |
| gameId | string | No | Scrimmage/game id |
| tournamentId | string | No | Tournament context |
| event | string | Yes | Canonical event keyword |
| latencyMs | number | No | For timing events |
| outcome | string | No | success|error|timeout|denied |
| errorCode | string | No | Domain-specific code |

## Tracing
- Core spans: practice_question_fetch, scrimmage_buzz_cycle, ai_generation_batch, tournament_bracket_generate, dashboard_aggregate_compute.
- All spans propagate W3C trace context headers; socket events include traceId in payload envelope.

## Alert Thresholds (Initial)
| Metric | Condition | Severity | Action |
|--------|-----------|----------|--------|
| buzz_latency_ms P95 | > 180ms for 10m | High | Page on-call real-time engineer |
| dashboard_load_latency_ms P95 | > 2500ms for 15m | Medium | Create perf ticket |
| api_request_total error_rate | > 2% 5xx over 5m | High | Page backend on-call |
| ai_generation_duplicates_total ratio | > 40% duplicates / batch | Low | Review model config |
| auth_login_failures_total | Sudden spike > 3x baseline | Medium | Investigate possible attack |

## Retention
- Metrics: 30d high-resolution, 400d down-sampled.
- Logs: 30d hot, 365d cold archive (configurable pending compliance clarifications).
- Traces: 7d full, 30d sampled summaries.

## Governance
Changes require: dev lead + SRE sign-off; update version; add migration notes if renaming metrics.
