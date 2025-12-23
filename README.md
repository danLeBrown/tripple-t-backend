# Tripple T Royal Ventures

A NestJS-based application.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22.x recommended)
- [pnpm](https://pnpm.io/) (installed globally)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- (Optional) [Adminer](https://www.adminer.org/) for DB management

## Local Setup (Recommended)

### 1. Quick Start

For new developers, run:

```sh
make quick-start
```

This will:

- Set up your `.env` file (if missing)
- Build containers
- Start all services
- Run migrations and seeds

Your app will be running at `http://localhost:3000` and Adminer at `http://localhost:8080`.

### 2. Common Makefile Commands

- `make setup` – Initial setup (copies `.env`, builds containers)
- `make up` – Start all services
- `make down` – Stop all services
- `make logs` – View logs
- `make shell` – Access app container shell
- `make test` – Run tests
- `make migrate` – Run DB migrations
- `make seed` – Seed the database
- `make backup` – Backup the database
- `make restore file=backup.sql` – Restore DB from backup

Run `make help` to see all available commands.

### 3. Manual Steps (if not using Makefile)

You can still use Docker Compose and pnpm commands directly as described below, but the Makefile is the recommended approach:

#### Clone the Repository

```sh
git clone https://github.com/danLeBrown/tripple-t-backend.git
cd tripple-t-backend
```

#### Install Dependencies

```sh
pnpm install
```

#### Configure Environment Variables

Create a `.env` file in the root directory and set the following variables:

```
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name
DB_PORT=5432
APP_PORT=3000
```

#### Start Services with Docker Compose

```sh
docker-compose up --build
```

#### Database Migrations & Seeding

```sh
pnpm run migration:run
pnpm run seed:run
```

#### Running the App (Without Docker)

```sh
pnpm run start:dev
```

Ensure PostgreSQL and Redis are running and environment variables are set.

#### Running Tests

```sh
pnpm run test
pnpm run test:e2e
```

## Project Structure

- `src/` - Main application code
- `test/` - Test suites and setup
- `docker-compose.yml` - Service orchestration
- `dockerfile` - Multi-stage build for dev/prod

## Useful Commands

- `pnpm run build` - Build the app
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code
- `pnpm run migration:create` - Create a new migration

## Contributor Onboarding (Cursor)

- Cursor rule: `.cursor/rules/co-contributor-cursor-rule.md`
- Onboarding plan: `.cursor/plans/co-contributor_onboarding_plan_4e121374.plan.md`
- Review the plan/rule before changes, keep TODOs in sync, and follow the documented domain, security, and testing patterns when contributing.

## Contributing (quick checklist)

- Read the Cursor rule and onboarding plan (paths above) before starting.
- Follow domain conventions: `domains/{name}/` with dto/entity/controller/service/module, `/v1/{domain}/search`, `PaginatedDto`, `@AuditLog()`, Swagger tags/bearer auth.
- Security: include CSRF headers for non-GET calls in tests; use `JwtOrApiKeyGuard` unless route is `@UnauthenticatedRoute()`.
- DTOs/entities: extend BaseDto/BaseEntity, add `@SetDto()`, and use class-validator.
- Tests: add/extend E2E using `test/setup/app.ts` helpers; cover happy and error paths.
- Tooling: Node 22 + pnpm; prefer Makefile commands (`make quick-start`, `make test`, `make migrate`, `make seed`).

## Troubleshooting

- Ensure Docker containers are running and healthy.
- Check `.env` configuration for DB credentials.
- For hot reload, source code is mounted in the container.
