# Sprint 1: Foundation Setup (Weeks 1-2)

**Sprint Goal**: Establish functional development environment with authentication and basic team management

**Capacity**: 38 Story Points (48 SP team capacity - 20% buffer)  
**Commitment**: 32 Story Points from Epic 1  

---

## Sprint 1 Backlog

### INFRA-001: Turborepo Monorepo Setup (3 SP)
**Priority**: P0 (Blocker for all other work)

**Tasks**:
- [ ] Initialize Turborepo workspace with `npx create-turbo@latest`
- [ ] Configure workspace structure:
  ```
  apps/
    web/          # Next.js frontend
    api/          # Express API server
  packages/
    types/        # Shared TypeScript types
    database/     # Prisma schema and client
    ui/           # Shared UI components
    config/       # Shared config (ESLint, TypeScript)
  ```
- [ ] Set up package.json scripts for dev, build, test, lint
- [ ] Configure Turborepo pipeline in `turbo.json`
- [ ] Create workspace-level .gitignore and README

**Acceptance Criteria**:
- [ ] `npm run dev` starts all applications
- [ ] `npm run build` builds all packages
- [ ] `npm run lint` runs across all workspaces
- [ ] All packages properly reference shared dependencies

**Definition of Done**:
- [ ] Code review completed
- [ ] Documentation updated in README
- [ ] Local setup verified by 2+ team members

---

### INFRA-002: Docker Development Environment (2 SP)
**Priority**: P0 (Required for database and Redis)

**Tasks**:
- [ ] Create `docker-compose.yml` with services:
  - PostgreSQL 15 with persistent volume
  - Redis 7 for caching and sessions
  - Optional: pgAdmin for database management
- [ ] Configure environment variables in `.env.example`
- [ ] Create database initialization scripts
- [ ] Add health checks for all services
- [ ] Document startup and teardown procedures

**Acceptance Criteria**:
- [ ] `docker-compose up -d` starts all services successfully
- [ ] Database accessible on localhost:5432
- [ ] Redis accessible on localhost:6379
- [ ] Services restart automatically on system reboot
- [ ] Data persists between container restarts

**Environment Variables Required**:
```env
DATABASE_URL="postgresql://quizbowl:password@localhost:5432/quizbowlhub"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
```

---

### DB-001: Prisma Schema Implementation (5 SP)
**Priority**: P0 (Foundation for all features)

**Tasks**:
- [ ] Initialize Prisma in `packages/database`
- [ ] Design and implement core schema models:
  - User (id, email, username, role, profile data)
  - Team (id, name, school, coach, settings)
  - TeamMember (user-team relationship with role)
  - Question (id, text, answer, category, difficulty, metadata)
  - PracticeSession (tracking individual practice)
  - PracticeResponse (user responses to questions)
- [ ] Add proper indexes for performance
- [ ] Configure Prisma client generation
- [ ] Set up migration system

**Schema Preview**:
```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  username      String         @unique
  role          UserRole       @default(PLAYER)
  firstName     String
  lastName      String
  school        String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  teamMemberships TeamMember[]
  practicesSessions PracticeSession[]
  practiceResponses PracticeResponse[]
}

enum UserRole {
  PLAYER
  COACH
  MODERATOR
  ADMIN
}
```

**Acceptance Criteria**:
- [ ] Schema generates valid TypeScript types
- [ ] All relationships properly defined with cascading deletes
- [ ] Migration runs successfully against fresh database
- [ ] Prisma Studio can browse all models
- [ ] Seeds run without errors

---

### AUTH-001: User Registration API (3 SP)
**Priority**: P1 (Required for user management)

**Tasks**:
- [ ] Set up Express server in `apps/api`
- [ ] Install dependencies (express, prisma, zod, bcrypt, jsonwebtoken)
- [ ] Create Zod validation schemas for user input
- [ ] Implement `/api/auth/register` endpoint
- [ ] Add password hashing with bcrypt
- [ ] Implement email uniqueness validation
- [ ] Add input sanitization and rate limiting
- [ ] Create comprehensive error handling

**API Contract**:
```typescript
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "school": "University Example"
}

Response 201:
{
  "success": true,
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "PLAYER"
  }
}
```

**Acceptance Criteria**:
- [ ] Valid registration creates user in database
- [ ] Duplicate email returns 409 error
- [ ] Invalid input returns 400 with validation details
- [ ] Passwords are properly hashed (never stored plain text)
- [ ] Rate limiting prevents abuse (5 requests/minute)

---

### AUTH-002: JWT Authentication System (3 SP)
**Priority**: P1 (Required for secure access)

**Tasks**:
- [ ] Implement `/api/auth/login` endpoint
- [ ] Create JWT token generation with refresh strategy
- [ ] Implement `/api/auth/logout` endpoint
- [ ] Add authentication middleware for protected routes
- [ ] Create token refresh mechanism
- [ ] Add session management with Redis
- [ ] Implement password validation

**API Contracts**:
```typescript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response 200:
{
  "success": true,
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": { /* user object */ }
}

POST /api/auth/refresh
{
  "refreshToken": "jwt-refresh-token"
}

POST /api/auth/logout
Headers: Authorization: Bearer {accessToken}
```

**Acceptance Criteria**:
- [ ] Valid credentials return access and refresh tokens
- [ ] Invalid credentials return 401 error
- [ ] Access tokens expire in 15 minutes
- [ ] Refresh tokens expire in 7 days
- [ ] Logout invalidates both tokens
- [ ] Middleware properly validates and extracts user context

---

### FE-001: Next.js Frontend Foundation (3 SP)
**Priority**: P1 (User interface foundation)

**Tasks**:
- [ ] Initialize Next.js 14 with App Router in `apps/web`
- [ ] Configure Tailwind CSS with custom theme
- [ ] Install and configure shadcn/ui components
- [ ] Set up TypeScript configuration
- [ ] Create basic layout components (Header, Navigation, Footer)
- [ ] Implement responsive design system
- [ ] Add dark/light theme support

**Component Structure**:
```
app/
  layout.tsx          # Root layout with providers
  page.tsx            # Landing page
  (auth)/
    login/page.tsx    # Login page
    register/page.tsx # Registration page
  dashboard/
    page.tsx          # User dashboard
components/
  ui/                 # shadcn/ui components
  layout/
    header.tsx
    navigation.tsx
    footer.tsx
```

**Acceptance Criteria**:
- [ ] App renders without errors in development mode
- [ ] Responsive design works on mobile and desktop
- [ ] Navigation shows appropriate items based on auth state
- [ ] Theme switching works correctly
- [ ] TypeScript compilation succeeds without errors

---

### FE-002: Authentication Flow UI (3 SP)
**Priority**: P1 (User can access the system)

**Tasks**:
- [ ] Create registration form with validation
- [ ] Create login form with error handling
- [ ] Implement client-side form validation with Zod
- [ ] Add loading states and user feedback
- [ ] Implement redirect logic after authentication
- [ ] Create password strength indicator
- [ ] Add "Remember me" functionality

**Forms Required**:
```typescript
// Registration Form Fields
- Email (required, email validation)
- Username (required, 3-20 chars, alphanumeric)
- Password (required, 8+ chars, complexity rules)
- Confirm Password (required, must match)
- First Name (required)
- Last Name (required)
- School (optional)

// Login Form Fields
- Email (required)
- Password (required)
- Remember Me (checkbox)
```

**Acceptance Criteria**:
- [ ] Form validation prevents invalid submissions
- [ ] Loading states shown during API calls
- [ ] Success redirects to appropriate dashboard
- [ ] Error messages are user-friendly
- [ ] Forms are accessible (proper labels, keyboard navigation)
- [ ] Password visibility toggle works

---

### AUTH-003: Role-Based Authorization (2 SP)
**Priority**: P2 (Required for team management)

**Tasks**:
- [ ] Create authorization middleware for different roles
- [ ] Implement role checking utilities
- [ ] Add role-based route protection
- [ ] Create permission constants and helper functions
- [ ] Implement frontend route guards
- [ ] Add role-based UI component rendering

**Permission Matrix**:
```typescript
enum Permission {
  PRACTICE_ACCESS = 'practice:access',
  TEAM_MANAGE = 'team:manage',
  QUESTION_MODERATE = 'question:moderate',
  TOURNAMENT_CREATE = 'tournament:create',
  SYSTEM_ADMIN = 'system:admin'
}

const ROLE_PERMISSIONS = {
  PLAYER: [Permission.PRACTICE_ACCESS],
  COACH: [Permission.PRACTICE_ACCESS, Permission.TEAM_MANAGE],
  MODERATOR: [Permission.PRACTICE_ACCESS, Permission.QUESTION_MODERATE, Permission.TOURNAMENT_CREATE],
  ADMIN: Object.values(Permission)
}
```

**Acceptance Criteria**:
- [ ] API endpoints properly check user permissions
- [ ] Frontend hides unauthorized UI elements
- [ ] Unauthorized access returns 403 error
- [ ] Role changes take effect immediately
- [ ] Permission checks are consistent across app

---

## Sprint 1 Testing Strategy

### Unit Tests Required
- [ ] Authentication utilities (JWT, password hashing)
- [ ] Validation schemas (Zod)
- [ ] Database models (Prisma)
- [ ] Authorization middleware
- [ ] React components (auth forms)

### Integration Tests Required
- [ ] User registration flow (API + Database)
- [ ] Login/logout flow (API + Redis)
- [ ] Role-based access control
- [ ] Form submission and validation

### Manual Testing Checklist
- [ ] New user can register and login
- [ ] Invalid inputs show appropriate errors
- [ ] Role-based navigation works correctly
- [ ] Responsive design on mobile/desktop
- [ ] Theme switching persists across sessions

---

## Sprint 1 Definition of Done

### Technical Requirements
- [ ] All code has unit tests with >80% coverage
- [ ] All APIs documented with OpenAPI/Swagger
- [ ] TypeScript compilation with strict mode
- [ ] ESLint and Prettier configurations applied
- [ ] All commits follow conventional commit format

### Product Requirements
- [ ] New user can register, login, and access dashboard
- [ ] Role-based permissions enforced
- [ ] Development environment documented and reproducible
- [ ] Basic error handling and user feedback implemented

### Documentation Requirements
- [ ] API documentation generated
- [ ] Component library documentation
- [ ] Database schema documentation
- [ ] Development setup guide updated

---

## Sprint 1 Risks and Mitigation

### High Risk Items
1. **Docker Environment Complexity** 
   - *Mitigation*: Start early, document all steps, test on multiple OS
   
2. **Prisma Schema Design**
   - *Mitigation*: Review schema with team, plan for migrations
   
3. **Authentication Security**
   - *Mitigation*: Use established patterns, security review before production

### Dependencies
- Team has Docker and Node.js installed
- Access to PostgreSQL and Redis services
- Basic familiarity with Next.js and Prisma

### Success Metrics
- All team members can run development environment in <10 minutes
- Registration/login flow has <2% error rate in testing
- All automated tests pass consistently

---

This detailed Sprint 1 breakdown provides concrete, actionable tasks that can be assigned to individual developers and tracked daily. Each task includes acceptance criteria and technical specifications needed for successful implementation.