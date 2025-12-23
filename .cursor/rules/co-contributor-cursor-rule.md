# Co-Contributor Cursor Rule

Always align work with the onboarding plan (`.cursor/plans/co-contributor_onboarding_plan_4e121374.plan.md`). Update plan/task statuses as progress is made.

- Read the plan before starting work; mirror TODOs with Cursor todos.
- Follow domain patterns: `domains/{name}/dto|entities|controller|service|module`, `/v1/{domain}/search` for search, `PaginatedDto`, `@AuditLog()`, Swagger tags/bearer auth.
- Security: CSRF headers (`x-session-id`, `x-csrf-token`), JWT via `JwtOrApiKeyGuard`, `@UnauthenticatedRoute()` for public routes, prefer config over hardcoded values.
- DTO/Entity conventions: extend BaseDto/BaseEntity, use `@SetDto()`, class-validator, Unix timestamp fields.
- Testing: use `test/setup/app.ts` helpers for CSRF/login, follow E2E patterns, cover happy + error paths.
- Tooling: Node 22 + pnpm, prefer Makefile (`make quick-start`, `make test`, `make migrate`, `make seed`).

Keep this rule current as new decisions emerge.

