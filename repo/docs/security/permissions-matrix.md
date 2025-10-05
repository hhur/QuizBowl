# Permissions & Roles Matrix

| Action / Capability | PLAYER | COACH | CAPTAIN | MODERATOR | ORGANIZER | ADMIN |
|---------------------|:------:|:-----:|:-------:|:---------:|:---------:|:-----:|
| Register / Login | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Edit Own Profile | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| View Team Dashboard (full detail) | ✖ | ✔ | ✔ | ✖ | ✖ | ✔ |
| View Team Dashboard (anonymized) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Create Practice Session | ✖ | ✔ | ✔ | ✖ | ✖ | ✔ |
| Join Scrimmage | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Host Scrimmage | ✖ | ✔ | ✔ | ✔ | ✖ | ✔ |
| Override Scoring (Scrimmage) | ✖ | ✔ | ✔* | ✔ | ✖ | ✔ |
| Generate AI Questions | ✖ | ✔ | ✖ | ✔ | ✖ | ✔ |
| Approve / Reject Questions | ✖ | ✔ | ✖ | ✔ | ✖ | ✔ |
| Moderate Content (Flag / Retire) | ✖ | ✔ | ✖ | ✔ | ✖ | ✔ |
| Create Tournament | ✖ | ✖ | ✖ | ✖ | ✔ | ✔ |
| Edit Tournament Schedule | ✖ | ✖ | ✖ | ✖ | ✔ | ✔ |
| Publish / Lock Tournament | ✖ | ✖ | ✖ | ✖ | ✔ | ✔ |
| Enter Match Results (Tournament) | ✖ | ✖ | ✖ | ✖ | ✔ | ✔ |
| Manage Users / Roles | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |
| View Player Full Analytics (non-team) | ✖ | ✔ | ✔ | ✔ | ✖ | ✔ |
| Access System Metrics / Telemetry | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |
| Configure Feature Flags | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |

Legend:
- ✔ Allowed
- ✖ Not permitted
- ✔* Captain override requires configuration flag `allow_captain_override` and coach presence or explicit delegation.

Deferred / Future Roles: SPECTATOR (implicit limited view), CONTENT_REVIEWER (subset of moderator).
