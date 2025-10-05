# Feature Specification: Question Generator Module

**Feature Branch**: `002-question-generator`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: User description: "A module that generates quiz bowl questions based on subject, difficulty level, and format (toss-up or bonus). Questions should be stored in JSON format with metadata like category, subcategory, and source."

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A coach notices gaps in the existing question bank for a specific subcategory (e.g., High School Biology – Cell Processes, Medium difficulty) and requests newly generated toss-up and bonus questions. The system produces draft questions enriched with metadata and flags them for review before they become available in practice sets or competitions.

### Acceptance Scenarios
1. **Given** a coach provides subject = "Biology", difficulty = "Medium", format = "Toss-Up", **When** they submit a generation request for 5 questions, **Then** the system returns 5 draft questions each with required metadata fields (category, subcategory (if derived), difficulty, format, provisional source = "AI Generated", status = DRAFT).
2. **Given** a requested count exceeds the system’s maximum per request (e.g., limit 20), **When** the coach submits 50, **Then** the system rejects with a descriptive error listing allowed maximum and does not partially process.
3. **Given** an AI-generated question closely duplicates an existing approved question (based on similarity threshold), **When** the generation run finishes, **Then** that question is flagged with a duplication warning and excluded from auto-approval candidate list.
4. **Given** a moderator opens a draft question flagged for low quality (e.g., missing pronoun, ambiguous answer line), **When** they reject it with a reason, **Then** the question is marked REJECTED and is not served anywhere.
5. **Given** a coach edits and approves a draft bonus question composed of a lead-in + three parts with point values, **When** they save changes, **Then** the question transitions to APPROVED state and is available to practice filters immediately.
6. **Given** a generation request is submitted while a previous large batch is still processing, **When** the user triggers a new request, **Then** the system either queues it or returns a rate/throughput message (per configured concurrency policy).

### Edge Cases
- All generated responses are below minimum quality score (e.g., classifier scores < threshold) → system returns zero accepted drafts with explanation.
- Subject provided but subcategory omitted → system auto-classifies subcategory with confidence score; low confidence < threshold triggers [NEEDS CLARIFICATION: required human classification?].
- Mixed-format batch request not supported (toss-up + bonus together) → system rejects or splits? [NEEDS CLARIFICATION].
- Bonus question generation requested without specifying desired part count → default? [NEEDS CLARIFICATION].
- Difficulty distribution requested (e.g., 10 Mixed) → not in scope for MVP unless specified. [NEEDS CLARIFICATION].
- Offensive or disallowed content produced → automatically quarantined, not shown to requester, audit logged. [NEEDS CLARIFICATION: handling transparency].

---

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST accept generation parameters: subject (string), difficulty (enum), format (enum: TOSSUP | BONUS), count (int).
- **FR-002**: System MUST validate parameters (non-empty subject, difficulty in allowed set, format valid, count within min/max).
- **FR-003**: System MUST produce each question with metadata: id (temp), category, subcategory (optional/derived), difficulty, format, source (e.g., "AI"), status (DRAFT), createdAt.
- **FR-004**: System MUST include answer line separate from question text.
- **FR-005**: System MUST support BONUS format structured as: lead-in + one or more parts; each part includes prompt and point value (default 10 unless specified).
- **FR-006**: System MUST assign a quality score (0–1) or categorical rating (e.g., HIGH / MEDIUM / LOW) for each generated question.
- **FR-007**: System MUST flag draft questions failing baseline validation rules (length bounds, answer present, no banned terms list match).
- **FR-008**: System MUST perform duplicate detection against existing approved questions using similarity heuristic. [NEEDS CLARIFICATION: algorithm specifics].
- **FR-009**: System MUST mark potential duplicates with a duplication flag and exclude them from auto-promotion workflows.
- **FR-010**: System MUST allow moderators/coaches to view, edit (text, answer, subcategory), approve, or reject draft questions.
- **FR-011**: System MUST transition question status: DRAFT → APPROVED | REJECTED; optionally DRAFT → REVISED (edited) → APPROVED.
- **FR-012**: System MUST prevent usage of DRAFT or REJECTED questions in standard practice or competition queries.
- **FR-013**: System MUST enforce per-user daily generation quota and per-request size limit. [NEEDS CLARIFICATION: numeric values].
- **FR-014**: System MUST provide a structured JSON export representation for each generated question (fields documented) for downstream indexing.
- **FR-015**: System MUST log generation events with correlation id, requester id, count requested, count successful, count flagged duplicates.
- **FR-016**: System MUST allow filtering the draft queue by: subject, difficulty, quality rating, status flags (duplicate, flagged low quality).
- **FR-017**: System MUST permit bulk approval or rejection (with shared reason) for selected draft questions. [NEEDS CLARIFICATION: max batch size].
- **FR-018**: System MUST maintain an audit trail for question edits (original text, edited text, editor id, timestamp).
- **FR-019**: System MUST sanitize/normalize whitespace and standardize punctuation conventions (e.g., em dash vs hyphen) during generation. [NEEDS CLARIFICATION: style guide].
- **FR-020**: System SHOULD optionally supply curriculum alignment tags if model can infer them (e.g., "NGSS: HS-LS1-3"). [NEEDS CLARIFICATION: standard sets].
- **FR-021**: System MUST return user-friendly error messages for parameter validation failures and quota exceedances.
- **FR-022**: System MUST provide reason codes for rejection (INACCURATE, AMBIGUOUS, OFFENSIVE, LOW_QUALITY, DUPLICATE, OTHER).
- **FR-023**: System MUST allow re-generation (retry) for a single draft slot if moderator marks REGENERATE. [NEEDS CLARIFICATION: reuse original parameters?].
- **FR-024**: System MUST support pagination for listing draft questions.
- **FR-025**: System MUST prevent simultaneous conflicting edits on the same draft (reject with conflict notice). [NEEDS CLARIFICATION: concurrency policy].
- **FR-026**: System MUST store and expose parameter provenance (original request inputs + model version used).
- **FR-027**: System MUST allow soft deletion of draft questions (hidden but retained for audit) distinct from explicit rejection. [NEEDS CLARIFICATION: retention period].
- **FR-028**: System MUST ensure bonus question parts cannot exceed configured max parts. [NEEDS CLARIFICATION: max value].
- **FR-029**: System MUST support specifying desired number of bonus parts if format=BONUS; otherwise use default.
- **FR-030**: System MUST restrict generation access to authorized roles (coach, moderator, admin). Players excluded.

### Key Entities
- **GenerationRequest**: Parameters (subject, difficulty, format, count, timestamp, requesterId, modelVersion, status, metrics).
- **DraftQuestion**: Text, answer, metadata (category, subcategory, difficulty, format, source, status, qualityScore, flags[], createdAt, updatedAt, provenance pointer).
- **BonusPart**: (parentQuestionId, index, text, points).
- **QuestionFlag**: (questionId, type: DUPLICATE|QUALITY|CONTENT, details, createdAt, resolvedAt, resolverId).
- **QuestionAudit**: (questionId, version, editorId, diff summary, timestamp).

### Non-Functional Requirements
- **NFR-001**: Average generation time per question ≤ 2.5s (batch parallelization allowed) under nominal load. [NEEDS CLARIFICATION: latency threshold acceptance].
- **NFR-002**: Duplicate detection must achieve ≥ 90% recall on internal curated test set. [NEEDS CLARIFICATION: evaluation protocol].
- **NFR-003**: PII-safe: No personal data in generated content (validated via forbidden term list). [NEEDS CLARIFICATION: list scope].
- **NFR-004**: Observability: generation pipeline emits metrics: total_generated, duplicates_flagged, avg_latency_ms, quality_distribution.
- **NFR-005**: Reliability: partial failure of some question generations returns successful subset with clear counts; does not silently drop failures.
- **NFR-006**: All persisted JSON conforms to published schema version (semantic versioned). [NEEDS CLARIFICATION: schema version bump rules].
- **NFR-007**: Access control enforced at request boundary (no client-side only restriction).
- **NFR-008**: Quality scoring algorithm deterministic for identical inputs & model version (for test reproducibility).

### Out-of-Scope (for this feature)
- Multi-lingual question generation.
- Adaptive reinforcement learning loops adjusting generation strategy.
- Real-time streaming partial question generation.
- Automatic factual verification beyond heuristic checks.

---

## Review & Acceptance Checklist

### Content Quality
- [ ] No implementation details (framework code specifics) leaked
- [ ] User-value oriented language maintained
- [ ] Mandatory sections complete

### Requirement Completeness
- [ ] All core FRs mapped to test cases
- [ ] Clarification items resolved (no remaining [NEEDS CLARIFICATION])
- [ ] Entities align with existing domain model

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
1. Subcategory auto-classification fallback policy & confidence threshold.
2. Mixed-format batch behavior (reject vs split).
3. Default bonus part count & maximum allowed parts.
4. Difficulty mixing support (single request multi-difficulty?).
5. Offensive content handling transparency (show placeholder vs silent).
6. Duplicate detection algorithm & similarity threshold (e.g., semantic embedding cosine ≥ ?).
7. Daily quota numbers & per-request limits (role-based tiers?).
8. Quality scoring rubric (features: length, clue density, uniqueness, style conformity?).
9. Style guide specifics (capitalization, punctuation normalization rules).
10. Curriculum alignment tag sets (standards frameworks included?).
11. Re-generation semantics (carry original parameters? new seed?).
12. Concurrency conflict resolution strategy (optimistic locking vs last write wins).
13. Draft soft deletion retention window.
14. Maximum batch size for bulk approval/rejection.
15. PII forbidden term list scope & maintenance owner.
16. Schema versioning policy for persisted JSON.
17. Evaluation protocol for duplicate detection recall metric.
18. Latency SLO acceptance thresholds (P50/P95).

---

## Acceptance Preconditions
Feature is ready for planning once clarification items are resolved or explicitly assumed with rationale, and test matrix derived from FR/NFR set is approved.

---

## Next Suggested Steps
1. Clarification workshop with content leads & compliance.
2. Draft JSON schema v1 for DraftQuestion & GenerationRequest.
3. Define duplication detection approach & benchmark dataset.
4. Write quality scoring rubric document + sample annotated questions.
5. Produce quota & rate limit matrix by role.
6. Establish style guide + normalization rules.

---

*End of Specification*