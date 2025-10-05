# Developer Setup Guide

**Version**: 1.0.0  
**Created**: 2025-10-04  
**Target**: Development Team Onboarding

---

## Prerequisites

### Required Software
- **Node.js**: v18.17+ or v20+ (LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **Docker**: v24+ with Docker Compose
- **Git**: v2.34+
- **VS Code**: Latest (recommended IDE)

### Development Tools
```bash
# Verify installations
node --version          # Should be v18.17+ or v20+
npm --version           # Should be v9+
docker --version        # Should be v24+
docker-compose --version # Should be v2.20+
git --version           # Should be v2.34+
```

### VS Code Extensions (Recommended)
- **Prisma** (Prisma.prisma)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **TypeScript Importer** (pmneo.tsimporter)
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **GitLens** (eamodio.gitlens)
- **Docker** (ms-azuretools.vscode-docker)

---

## Quick Start (10-Minute Setup)

### Step 1: Repository Setup (2 minutes)
```bash
# Clone the repository
git clone https://github.com/yourusername/quizbowlhub.git
cd quizbowlhub

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Step 2: Environment Configuration (3 minutes)
Edit `.env` file with local settings:
```env
# Database Configuration
DATABASE_URL="postgresql://quizbowl:devpassword@localhost:5432/quizbowlhub_dev"
REDIS_URL="redis://localhost:6379"

# Authentication Secrets (generate new ones for production)
JWT_SECRET="dev-jwt-secret-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
NEXTAUTH_SECRET="dev-nextauth-secret-change-in-production"

# Development Settings
NODE_ENV="development"
LOG_LEVEL="debug"

# Feature Flags
FEATURE_AI_QUESTIONS="false"
FEATURE_TOURNAMENTS="true"
FEATURE_ANALYTICS="true"
```

### Step 3: Start Development Services (2 minutes)
```bash
# Start database and Redis services
docker-compose up -d

# Verify services are running
docker-compose ps
```

Expected output:
```
NAME                COMMAND                  SERVICE     STATUS
quizbowlhub-db-1    "docker-entrypoint.s…"   db          Up 30 seconds
quizbowlhub-redis-1 "docker-entrypoint.s…"   redis       Up 30 seconds
```

### Step 4: Database Setup (2 minutes)
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

### Step 5: Start Development Servers (1 minute)
```bash
# Start all applications
npm run dev
```

This will start:
- **Web App**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Database**: postgresql://localhost:5432
- **Redis**: redis://localhost:6379

---

## Project Structure Deep Dive

### Monorepo Architecture
```
quizbowlhub/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── lib/              # Utility functions
│   │   └── public/           # Static assets
│   └── api/                   # Express.js backend
│       ├── src/
│       │   ├── routes/       # API endpoints
│       │   ├── middleware/   # Express middleware
│       │   ├── services/     # Business logic
│       │   └── utils/        # Helper functions
│       └── tests/            # API tests
├── packages/
│   ├── types/                 # Shared TypeScript types
│   ├── database/             # Prisma schema and client
│   ├── ui/                   # Shared UI components
│   └── config/               # Shared configuration
├── docs/                     # Documentation
└── docker-compose.yml       # Development services
```

### Package Dependencies
```json
{
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  }
}
```

---

## Development Workflow

### Daily Development Routine
1. **Pull latest changes**: `git pull origin main`
2. **Install new dependencies**: `npm install`
3. **Start services**: `docker-compose up -d`
4. **Start development**: `npm run dev`
5. **Run tests**: `npm run test`

### Making Changes
```bash
# Create feature branch
git checkout -b feature/user-authentication

# Make changes and test
npm run test
npm run lint
npm run type-check

# Commit with conventional format
git commit -m "feat: add user registration endpoint"

# Push and create PR
git push origin feature/user-authentication
```

### Database Changes
```bash
# Create new migration
npx prisma migrate dev --name add_team_model

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

---

## Environment Variables Reference

### Required for Development
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for JWT token signing | `your-secure-secret` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | `another-secure-secret` |

### Optional Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `PORT` | API server port | `3001` |
| `FEATURE_AI_QUESTIONS` | Enable AI question generation | `false` |

---

## Testing Strategy

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm run test -- --testPathPattern=auth
```

### Test Categories
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints with database
- **E2E Tests**: Full user workflows
- **Component Tests**: React component interactions

### Writing Tests
```typescript
// Example API test
describe('POST /api/auth/register', () => {
  it('should create new user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.password).toBeUndefined();
  });
});
```

---

## Common Development Tasks

### Adding a New API Endpoint
1. **Define route** in `apps/api/src/routes/`
2. **Add validation schema** using Zod
3. **Implement business logic** in service layer
4. **Write tests** for endpoint
5. **Update API documentation**

Example:
```typescript
// apps/api/src/routes/teams.ts
import { z } from 'zod';
import { Router } from 'express';

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  school: z.string().min(1).max(200),
  description: z.string().optional()
});

router.post('/teams', authenticate, async (req, res) => {
  const data = createTeamSchema.parse(req.body);
  const team = await teamService.createTeam(data, req.user.id);
  res.status(201).json(team);
});
```

### Adding a New Database Model
1. **Update Prisma schema** in `packages/database/prisma/schema.prisma`
2. **Create migration** with `npx prisma migrate dev`
3. **Update seed script** if needed
4. **Generate TypeScript types** with `npx prisma generate`

Example:
```prisma
model Tournament {
  id          String   @id @default(cuid())
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime
  isPublic    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  matches     Match[]
  teams       TournamentTeam[]
  
  @@map("tournaments")
}
```

### Adding a New Frontend Component
1. **Create component** in `apps/web/components/`
2. **Add TypeScript types** for props
3. **Implement with Tailwind styling**
4. **Write component tests**
5. **Add to Storybook** (if applicable)

Example:
```tsx
// apps/web/components/ui/team-card.tsx
interface TeamCardProps {
  team: {
    id: string;
    name: string;
    school: string;
    memberCount: number;
  };
  onJoin?: () => void;
}

export function TeamCard({ team, onJoin }: TeamCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg">{team.name}</h3>
      <p className="text-muted-foreground">{team.school}</p>
      <p className="text-sm">{team.memberCount} members</p>
      {onJoin && (
        <Button onClick={onJoin} className="mt-2">
          Join Team
        </Button>
      )}
    </div>
  );
}
```

---

## Troubleshooting Guide

### Common Issues

#### "Database connection failed"
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database service
docker-compose restart db

# Check database logs
docker-compose logs db
```

#### "Port already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

#### "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Turbo cache
npx turbo clean
```

#### "Prisma client out of sync"
```bash
# Regenerate Prisma client
npx prisma generate

# Reset if needed (development only)
npx prisma migrate reset
```

### Getting Help
1. **Check documentation** in `docs/` directory
2. **Search existing issues** in GitHub repository
3. **Ask in team chat** with error details and steps to reproduce
4. **Create detailed issue** if problem persists

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# API debug only
DEBUG=api:* npm run dev

# Database debug
DEBUG=prisma:* npm run dev
```

---

## Production Considerations

### Environment Differences
- **Secrets**: Use proper secret management (not .env files)
- **Database**: Use managed PostgreSQL with connection pooling
- **Redis**: Use managed Redis with persistence
- **Logging**: Structured logging with proper levels
- **Monitoring**: Add health checks and metrics

### Security Checklist
- [ ] All secrets properly managed
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Dependency vulnerability scanning

---

This comprehensive setup guide ensures any developer can be productive within 10 minutes of cloning the repository, with detailed explanations for understanding the codebase architecture and development workflow.