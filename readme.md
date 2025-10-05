# QuizBowlHub

A comprehensive Quiz Bowl practice and competition platform built with modern web technologies.

## Features

- **Practice Engine**: Customizable question sessions with analytics
- **Real-time Competition**: Live scrimmages with buzz adjudication
- **Tournament Management**: Bracket generation and match tracking
- **Team Analytics**: Performance insights and trend analysis
- **AI Question Generation**: Automated content creation with approval workflow

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL with Redis for caching
- **Real-time**: Socket.IO for live competitions
- **Infrastructure**: Docker, Turborepo monorepo

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- npm 9+

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd quizbowlhub

# Install dependencies (or use our script)
npm install
# OR
.\scripts\install-deps.ps1

# Start development server
.\scripts\start-dev.ps1
# OR
npm run dev
```

The application will be available at:
- Main application: http://localhost:3001
- Real-time test client: http://localhost:3001/realtime-test-client.html
- Health check: http://localhost:3001/api/health

### Developer Scripts

QuizBowlHub includes a comprehensive set of PowerShell scripts for common development tasks:

```bash
# Start development server with enhanced logging
.\scripts\start-dev.ps1

# Test all API endpoints
.\scripts\test-api.ps1 -Verbose

# Test real-time features with automatic browser opening
.\scripts\test-realtime.ps1 -AutoOpen

# Install dependencies with stability checks
.\scripts\install-deps.ps1

# Build production deployment package
.\scripts\build-prod.ps1

# View application logs
.\scripts\logs.ps1 follow

# Format code and run quality checks
.\scripts\format-code.ps1 all

# Manage question database and backups
.\scripts\db-manage.ps1 status

# Project information and utilities
.\scripts\project-utils.ps1 info
```

See [`scripts/README.md`](scripts/README.md) for complete documentation.

## Project Structure

```
quizbowlhub/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Express.js backend API
├── packages/
│   ├── types/        # Shared TypeScript type definitions
│   ├── database/     # Prisma schema and database utilities
│   ├── ui/           # Shared React components
│   └── config/       # Shared configuration (ESLint, TypeScript)
├── scripts/          # Developer utility scripts (PowerShell)
│   ├── start-dev.ps1      # Development server startup
│   ├── test-api.ps1       # API endpoint testing
│   ├── test-realtime.ps1  # Real-time feature testing
│   ├── build-prod.ps1     # Production build creation
│   ├── install-deps.ps1   # Dependency management
│   ├── logs.ps1           # Log management
│   ├── db-manage.ps1      # Database utilities
│   ├── format-code.ps1    # Code formatting and quality
│   ├── project-utils.ps1  # Project information and tools
│   └── README.md          # Script documentation
├── docs/             # Documentation and specifications
├── simple-server-phase3.js  # Current Phase 3 real-time server
├── realtime-test-client.html # Real-time testing interface
└── docker-compose.yml
```

## Development

### Available Scripts

**NPM Scripts:**
- `npm run dev` - Start development server (or use `.\scripts\start-dev.ps1`)
- `npm run build` - Build for production
- `npm run test` - Run test suites
- `npm run lint` - Lint code

**PowerShell Developer Scripts:**
- `.\scripts\start-dev.ps1` - Enhanced development server with logging
- `.\scripts\test-api.ps1` - Comprehensive API testing
- `.\scripts\test-realtime.ps1` - Real-time feature validation
- `.\scripts\build-prod.ps1` - Production deployment package
- `.\scripts\install-deps.ps1` - Clean dependency installation
- `.\scripts\logs.ps1` - Log management and monitoring
- `.\scripts\db-manage.ps1` - Database backup and management
- `.\scripts\format-code.ps1` - Code formatting and quality checks
- `.\scripts\project-utils.ps1` - Project information and utilities

See [`scripts/README.md`](scripts/README.md) for complete script documentation.

### Workspace Packages

- **@quizbowlhub/web** - Next.js frontend application
- **@quizbowlhub/api** - Express.js backend API
- **@quizbowlhub/types** - Shared TypeScript types
- **@quizbowlhub/database** - Prisma schema and database client
- **@quizbowlhub/ui** - Shared React component library
- **@quizbowlhub/config** - Shared tooling configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.