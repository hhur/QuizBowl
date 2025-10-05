# QuizBowlHub Developer Scripts

This directory contains frequently used PowerShell scripts for QuizBowlHub development and deployment.

## 📋 Available Scripts

### Development Scripts

#### `start-dev.ps1`
**Purpose**: Start the development server with enhanced logging
```powershell
.\scripts\start-dev.ps1
```
- Starts Phase 3 real-time competition server
- Automatically installs dependencies if needed
- Provides colored console output with status indicators
- Server runs on http://localhost:3001

#### `test-api.ps1`
**Purpose**: Comprehensive API endpoint testing
```powershell
.\scripts\test-api.ps1                    # Test localhost:3001
.\scripts\test-api.ps1 -BaseUrl "http://localhost:8080"  # Test custom URL
.\scripts\test-api.ps1 -Verbose           # Show response details
```
- Tests all API endpoints (health, auth, questions)
- Validates Socket.IO connectivity
- Supports custom server URLs for staging/production testing
- Provides detailed success/failure reporting

#### `test-realtime.ps1`
**Purpose**: Test real-time competition features
```powershell
.\scripts\test-realtime.ps1               # Basic testing
.\scripts\test-realtime.ps1 -AutoOpen     # Open test client automatically
```
- Validates Socket.IO endpoint accessibility
- Tests real-time client functionality
- Provides manual testing instructions
- Performance testing guidelines
- Quick access to testing URLs

### Deployment Scripts

#### `build-prod.ps1`
**Purpose**: Build production-ready deployment package
```powershell
.\scripts\build-prod.ps1
```
- Creates optimized production build in `./dist/`
- Installs production dependencies only
- Generates production environment configuration
- Creates deployment documentation
- Includes startup scripts and health checks

#### `install-deps.ps1`
**Purpose**: Clean dependency installation with version verification
```powershell
.\scripts\install-deps.ps1
```
- Verifies Node.js and npm installation
- Performs clean dependency installation
- Installs specific stable versions for critical packages
- Runs security audit
- Provides installation verification

### Maintenance Scripts

#### `logs.ps1`
**Purpose**: Log management and monitoring
```powershell
.\scripts\logs.ps1 view                   # View recent logs
.\scripts\logs.ps1 view -Lines 100        # View more lines
.\scripts\logs.ps1 follow                 # Follow logs in real-time
.\scripts\logs.ps1 clear                  # Clear all logs
.\scripts\logs.ps1 errors                 # View error logs only
.\scripts\logs.ps1 size                   # Show log file sizes
.\scripts\logs.ps1 archive                # Archive and clear logs
```
- Centralized log management
- Real-time log following
- Log archiving and rotation
- Error-specific log viewing
- File size monitoring

## 🚀 Quick Start Workflow

### First Time Setup
```powershell
# 1. Install dependencies
.\scripts\install-deps.ps1

# 2. Start development server
.\scripts\start-dev.ps1

# 3. Test the application (in another terminal)
.\scripts\test-api.ps1 -Verbose
.\scripts\test-realtime.ps1 -AutoOpen
```

### Daily Development
```powershell
# Start server
.\scripts\start-dev.ps1

# Monitor logs (in another terminal)
.\scripts\logs.ps1 follow

# Test changes
.\scripts\test-api.ps1
```

### Production Deployment
```powershell
# Build production package
.\scripts\build-prod.ps1

# Test production build locally
cd dist
node start.js

# Deploy to server (copy dist/ folder)
# See dist/DEPLOYMENT.md for full instructions
```

## 🔧 Script Features

### Common Features
- **Colored Output**: All scripts use color-coded console output for better readability
- **Error Handling**: Comprehensive error detection and user-friendly error messages
- **Validation**: Pre-flight checks for dependencies and environment setup
- **Help Text**: Built-in usage instructions and examples
- **Cross-Platform**: PowerShell Core compatible (Windows/Linux/macOS)

### Development Features
- **Auto-Dependency Installation**: Scripts automatically install missing dependencies
- **Real-time Monitoring**: Live log following and real-time testing capabilities
- **Performance Metrics**: Built-in performance testing and latency measurement
- **Multi-Environment Support**: Easy switching between development/staging/production

### Production Features
- **Optimized Builds**: Production builds exclude development dependencies
- **Security**: Automatic security auditing and secure configuration generation
- **Documentation**: Auto-generated deployment documentation
- **Health Checks**: Built-in health check endpoints and monitoring

## 📂 Generated Files

Scripts may create the following directories and files:
- `logs/` - Application logs and archives
- `dist/` - Production build output
- `node_modules/` - Dependencies
- `.env` - Environment configuration (in dist/ for production)

## 🛠️ Customization

All scripts support common parameters:
- `-Verbose` - Show detailed output
- `-BaseUrl` - Custom server URL for testing
- `-Lines` - Number of log lines to display
- `-AutoOpen` - Automatically open browsers/clients

## 📚 Related Documentation

- [Main README](../README.md) - Project overview and setup
- [Technical Implementation Plan](../repo/docs/planning/technical-implementation-plan.md) - Architecture details
- [Phase 3 Completion](../PHASE_3_COMPLETION.md) - Real-time features documentation
- [Development Tasks](../DEVELOPMENT_TASKS.md) - Current development priorities

## 🆘 Troubleshooting

### Common Issues

1. **"node not found"** - Install Node.js 18+ from https://nodejs.org
2. **"Port already in use"** - Kill existing processes or change port in server file
3. **"Permission denied"** - Run PowerShell as Administrator
4. **"Script execution disabled"** - Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Getting Help

Run any script without parameters to see usage instructions:
```powershell
.\scripts\logs.ps1
.\scripts\test-api.ps1
```

---

*These scripts are designed to streamline QuizBowlHub development and deployment. For issues or suggestions, check the project documentation or create an issue.*