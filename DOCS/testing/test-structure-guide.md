# Test Structure Guidelines

## Directory Structure
```
src/
├── components/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   └── ComponentName.test.tsx
├── lib/
│   ├── util.ts
│   └── util.test.ts
├── app/
│   └── __tests__/
│       └── route.test.ts
└── __tests__/
    ├── integration/
    │   └── features/
    └── e2e/
```

## Naming Conventions
- Unit tests: `*.test.ts(x)`
- Integration tests: `*.integration.test.ts(x)`
- E2E tests: `*.e2e.test.ts(x)`

## Test Categories
1. **Unit Tests**: Place next to source files
2. **Integration Tests**: Place in `__tests__/integration`
3. **E2E Tests**: Place in `__tests__/e2e`