# Optimization Gatekeeper Scripts

Comprehensive shell script system for enforcing optimization principles and blocking code generation violations with specific guidance.

## Overview

The Optimization Gatekeeper is a multi-layered security system that:

- **Analyzes** all code generation attempts against optimization principles
- **Blocks** violations with specific, actionable guidance  
- **Integrates** with git hooks, CI/CD, and development workflows
- **Provides** real-time feedback and detailed violation reports
- **Enforces** performance, security, maintainability, and cost optimization standards

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Optimization Gatekeeper                    │
├─────────────────┬───────────────────┬───────────────────────┤
│   Shell Layer   │  Integration      │   TypeScript Layer    │
│                 │  Bridge           │                       │
│ • File Analysis │ • Config Sync     │ • Hook System         │
│ • Git Hooks     │ • Rule Migration  │ • Real-time Feedback  │
│ • CI/CD Checks  │ • Hybrid Analysis │ • Metrics Collection  │
│ • Violation     │ • Status Monitoring│ • Advanced Rules     │
│   Blocking      │                   │                       │
└─────────────────┴───────────────────┴───────────────────────┘
```

## Scripts Overview

### 1. `optimization-gatekeeper.sh` - Main Gatekeeper

The primary shell script that enforces optimization principles.

**Key Features:**
- Real-time file analysis against optimization principles
- Violation detection with severity levels (Error, Warning, Info)
- Specific guidance for each violation type
- Git hook integration for automatic enforcement
- Project-wide validation and reporting

**Commands:**
```bash
# Analyze a single file
./optimization-gatekeeper.sh analyze src/components/Button.tsx

# Check staged files before commit
./optimization-gatekeeper.sh check-commit

# Watch directory for changes
./optimization-gatekeeper.sh watch src/

# Validate entire project
./optimization-gatekeeper.sh validate-project

# Install git hooks
./optimization-gatekeeper.sh install-hooks

# Setup and configuration
./optimization-gatekeeper.sh setup
./optimization-gatekeeper.sh status
./optimization-gatekeeper.sh config
```

### 2. `gatekeeper-integration.sh` - System Integration

Bridges the shell gatekeeper with the TypeScript hook system for comprehensive analysis.

**Key Features:**
- Configuration synchronization between systems
- Hybrid analysis using both shell and TypeScript validators
- Rule migration between systems
- Integrated git hooks for dual validation

**Commands:**
```bash
# Sync configurations
./gatekeeper-integration.sh sync-config

# Run hybrid analysis
./gatekeeper-integration.sh hybrid-check src/api/route.ts

# Validate both systems
./gatekeeper-integration.sh validate-setup

# Migrate rules between systems
./gatekeeper-integration.sh migrate-rules bidirectional

# Install integrated hooks
./gatekeeper-integration.sh install-hooks
```

## Quick Start

### 1. Initial Setup

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run initial setup
./scripts/optimization-gatekeeper.sh setup

# Validate system setup
./scripts/gatekeeper-integration.sh validate-setup
```

### 2. Install Git Hooks

```bash
# Install standard hooks
./scripts/optimization-gatekeeper.sh install-hooks

# Or install integrated hooks (recommended)
./scripts/gatekeeper-integration.sh install-hooks
```

### 3. Test the System

```bash
# Test on a single file
./scripts/optimization-gatekeeper.sh analyze src/components/ui/button.tsx

# Run project validation
./scripts/optimization-gatekeeper.sh validate-project --dry-run
```

## Configuration

### Configuration File: `.optimization-gatekeeper.conf`

```bash
# Thresholds (0-100)
PERFORMANCE_THRESHOLD=70
SECURITY_THRESHOLD=80
MAINTAINABILITY_THRESHOLD=70
COST_THRESHOLD=75
OVERALL_THRESHOLD=70

# Behavior
STRICT_MODE=false
AUTOFIX=false
BLOCK_ON_WARNINGS=false
VERBOSE=false

# File patterns
INCLUDE_PATTERNS="*.ts *.tsx *.js *.jsx *.py *.java *.cpp *.c"
EXCLUDE_PATTERNS="node_modules/* .git/* dist/* build/* *.min.js"

# Integration settings
ENABLE_GIT_HOOKS=true
ENABLE_REALTIME_WATCH=false
ENABLE_CI_INTEGRATION=true
```

### Configuration Management

```bash
# View current configuration
./scripts/optimization-gatekeeper.sh config show

# Edit configuration
./scripts/optimization-gatekeeper.sh config edit

# Set specific values
./scripts/optimization-gatekeeper.sh config set STRICT_MODE true
./scripts/optimization-gatekeeper.sh config set PERFORMANCE_THRESHOLD 80
```

## Optimization Principles

The gatekeeper enforces principles defined in `optimization-principles.md`:

### Performance Principles
- **N+1 Query Prevention**: Detects and blocks inefficient database query patterns
- **React Optimization**: Ensures proper use of useCallback, useMemo, and key props
- **Bundle Size Control**: Prevents large library imports and promotes tree-shaking
- **Memory Management**: Detects potential memory leaks and inefficient allocations

### Security Principles  
- **Input Validation**: Requires schema validation for all API endpoints
- **Authentication**: Enforces authentication checks on protected routes
- **SQL Injection Prevention**: Blocks raw query string interpolation
- **XSS Protection**: Prevents dangerous HTML injection patterns

### Maintainability Principles
- **Complexity Management**: Limits cyclomatic complexity to 10 or less
- **Type Safety**: Discourages `any` type usage in TypeScript
- **Code Reusability**: Detects and suggests fixes for code duplication
- **Error Handling**: Ensures proper async error handling

### Cost Optimization Principles
- **Resource Efficiency**: Optimizes database queries and API calls
- **Scalability**: Promotes pagination and lazy loading patterns
- **Monitoring**: Tracks performance metrics and resource usage

## Violation Types and Guidance

### Error Level (Blocking)
These violations will **block** code generation/commits:

**🔴 N+1 Query Pattern**
```bash
# Detected pattern
users.forEach(async user => {
  const posts = await db.post.findMany({ where: { userId: user.id } });
});

# Suggested fix  
const userIds = users.map(u => u.id);
const posts = await db.post.findMany({ 
  where: { userId: { in: userIds } },
  include: { user: true }
});
```

**🔒 Missing Input Validation**
```bash
# Detected pattern
export async function POST(req: Request) {
  const data = await req.json();
  return await db.user.create({ data });
}

# Suggested fix
const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
});

export async function POST(req: Request) {
  const body = await req.json();
  const data = userSchema.parse(body);
  return await db.user.create({ data });
}
```

### Warning Level (Non-blocking)
These violations generate warnings but don't block:

**🟡 React Re-renders**
- Inline object/function creation in JSX
- Missing useCallback for event handlers
- Missing useMemo for expensive calculations

**🟡 Bundle Size Issues**  
- Large library imports without tree-shaking
- Missing Next.js Image optimization
- Inefficient import patterns

### Info Level (Suggestions)
These provide optimization suggestions:

**🔵 Code Quality**
- Magic number usage
- Missing error handling
- Code duplication opportunities

## Integration Workflows

### Git Hook Integration

**Pre-commit Hook:**
```bash
#!/bin/bash
cd "$(git rev-parse --show-toplevel)"
exec "./scripts/optimization-gatekeeper.sh" check-commit
```

**Pre-push Hook:**
```bash
#!/bin/bash
cd "$(git rev-parse --show-toplevel)"
exec "./scripts/optimization-gatekeeper.sh" validate-project
```

### CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Optimization Check
on: [push, pull_request]

jobs:
  optimization:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Optimization Gatekeeper
        run: |
          chmod +x scripts/*.sh
          ./scripts/optimization-gatekeeper.sh validate-project
```

**GitLab CI Example:**
```yaml
optimization_check:
  stage: test
  script:
    - chmod +x scripts/*.sh
    - ./scripts/optimization-gatekeeper.sh validate-project
  only:
    - merge_requests
    - main
```

### VS Code Integration

Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Analyze Current File",
      "type": "shell",
      "command": "./scripts/optimization-gatekeeper.sh",
      "args": ["analyze", "${file}"],
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

## Advanced Usage

### Strict Mode
Enable strict mode for higher standards:
```bash
./scripts/optimization-gatekeeper.sh analyze file.ts --strict
# or
./scripts/optimization-gatekeeper.sh config set STRICT_MODE true
```

**Strict Mode Changes:**
- Performance threshold: 70 → 80
- Security threshold: 80 → 90  
- Maintainability threshold: 70 → 80
- Cost threshold: 75 → 80
- Overall threshold: 70 → 80

### Autofix Mode
Attempt automatic fixes for violations:
```bash
./scripts/optimization-gatekeeper.sh analyze file.ts --autofix
```

**Autofix Capabilities:**
- Convert N+1 patterns to batch operations
- Add missing TypeScript types
- Fix simple performance anti-patterns
- Add basic error handling structures

### Watch Mode
Real-time analysis during development:
```bash
# Watch entire project
./scripts/optimization-gatekeeper.sh watch

# Watch specific directory
./scripts/optimization-gatekeeper.sh watch src/components
```

### Hybrid Analysis
Use both shell and TypeScript analyzers:
```bash
./scripts/gatekeeper-integration.sh hybrid-check src/api/route.ts
```

## Troubleshooting

### Common Issues

**1. Permission Denied**
```bash
chmod +x scripts/*.sh
```

**2. Git Hooks Not Working**
```bash
# Reinstall hooks
./scripts/optimization-gatekeeper.sh install-hooks

# Check hook permissions
ls -la .git/hooks/
```

**3. Node.js/TypeScript Integration Issues**
```bash
# Validate setup
./scripts/gatekeeper-integration.sh validate-setup

# Sync configurations
./scripts/gatekeeper-integration.sh sync-config
```

**4. High False Positive Rate**
```bash
# Adjust thresholds
./scripts/optimization-gatekeeper.sh config set PERFORMANCE_THRESHOLD 60

# Disable warnings from blocking
./scripts/optimization-gatekeeper.sh config set BLOCK_ON_WARNINGS false
```

### Debug Mode

Enable verbose logging:
```bash
./scripts/optimization-gatekeeper.sh analyze file.ts --verbose
```

Check logs:
```bash
tail -f .optimization-gatekeeper.log
```

### Performance Tuning

**For Large Projects:**
```bash
# Exclude more patterns
./scripts/optimization-gatekeeper.sh config set EXCLUDE_PATTERNS "node_modules/* .git/* dist/* build/* *.min.js tests/* __tests__/*"

# Reduce verbosity
./scripts/optimization-gatekeeper.sh config set VERBOSE false
```

**For Fast Feedback:**
```bash
# Enable autofix
./scripts/optimization-gatekeeper.sh config set AUTOFIX true

# Focus on errors only
./scripts/optimization-gatekeeper.sh config set BLOCK_ON_WARNINGS false
```

## Dependencies

### Required
- `bash` (4.0+)
- `git`
- `jq` (for JSON processing)
- `node` (for TypeScript integration)

### Optional (Recommended)
- `rg` (ripgrep) - faster file searching
- `fd` - faster file finding
- `fswatch` - real-time file watching

### Installation
```bash
# macOS
brew install jq ripgrep fd fswatch

# Ubuntu/Debian  
apt-get install jq ripgrep fd-find

# CentOS/RHEL
yum install jq ripgrep fd-find
```

## Exit Codes

- `0` - Success, no violations found
- `1` - Violations found and blocked
- `2` - Configuration or setup error  
- `3` - File not found or permission error

## Contributing

### Adding New Rules

1. **Add to Shell Gatekeeper:**
   ```bash
   # Edit optimization-gatekeeper.sh
   # Add new check function in appropriate section
   ```

2. **Add to TypeScript Hooks:**
   ```typescript
   // Edit src/lib/hooks/optimization-rules.ts
   // Add new OptimizationRule
   ```

3. **Update Documentation:**
   ```bash
   # Update optimization-principles.md
   # Update this README.md
   ```

### Testing

```bash
# Test individual components
./scripts/optimization-gatekeeper.sh analyze test-file.ts
./scripts/gatekeeper-integration.sh validate-setup

# Test git hooks
git add test-file.ts
git commit -m "test commit"  # Should trigger hooks
```

## License

MIT License - see LICENSE file for details.