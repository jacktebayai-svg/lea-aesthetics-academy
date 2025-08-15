# ADR 0004: Testing Strategy

Date: 2025-08-15
Status: Proposed

## Context

The LACA platform requires comprehensive testing coverage across multiple applications (API, web, admin, worker) with complex business logic for aesthetics practice management and LMS functionality. We need a testing strategy that provides confidence in production deployments while maintaining development velocity.

## Options Considered

### Testing Frameworks
1. **Jest** - Industry standard, mature ecosystem
2. **Vitest** - Faster, modern, better ESM support
3. **Node.js Test Runner** - Native, minimal dependencies

### E2E Testing
1. **Playwright** - Modern, fast, multi-browser
2. **Cypress** - Popular, good DX, component testing
3. **Puppeteer** - Google-maintained, Chrome-focused

### Testing Architecture
1. **Traditional pyramid** - Many unit, some integration, few E2E
2. **Testing trophy** - Focus on integration tests
3. **Contract testing** - API contracts with consumer-driven tests

## Decision

### Primary Stack
- **Unit & Integration**: **Vitest** for speed and modern ESM support
- **E2E Testing**: **Playwright** for cross-browser reliability and speed
- **Architecture**: **Testing trophy** approach with emphasis on integration tests

### Coverage Targets
- **Unit Tests**: Core business logic, utilities, pure functions
- **Integration Tests**: API endpoints, database operations, service layer
- **E2E Tests**: Critical user journeys (booking flow, course enrollment, payments)
- **Contract Tests**: API consumers (web/admin apps consuming API)

## Rationale

### Vitest Benefits
- 2-10x faster than Jest for our monorepo structure
- Native ESM support (aligns with our modern build setup)
- Compatible with Jest APIs (easy migration path)
- Better watch mode and UI for development

### Playwright Benefits
- Faster and more reliable than Cypress for our use cases
- Excellent CI/CD integration with parallel execution
- Built-in test isolation and cleanup
- Screenshots/videos for debugging failures

### Testing Trophy Approach
- More valuable than unit tests for catching real bugs
- Faster to write than comprehensive unit test coverage
- Better ROI for business logic validation
- Aligns with our API-first architecture

## Implementation Plan

### Phase 1: Foundation (Week 1)
- Set up Vitest configuration for all packages
- Create test utilities and factories
- Add basic API integration tests
- Configure CI pipeline for test execution

### Phase 2: Core Coverage (Weeks 2-3)
- Unit tests for critical business logic:
  - Availability calculation algorithms
  - Payment processing logic
  - Document generation service
  - LMS progress tracking
- Integration tests for all API endpoints
- Database operation testing with test containers

### Phase 3: E2E Automation (Week 4)
- Playwright setup with test data management
- Critical user journeys:
  - Complete booking flow (service selection → payment)
  - Course enrollment and lesson completion
  - Admin appointment management
  - Document generation and signing

### Phase 4: Advanced Testing (Week 5)
- Performance testing with k6
- Load testing for availability endpoints
- Contract testing between API and frontends
- Security testing for authentication flows

## Testing Infrastructure

### Test Data Management
```typescript
// Factories for consistent test data
export const createTestTenant = (overrides?: Partial<Tenant>) => ({
  id: 'test-tenant-' + randomUUID(),
  name: 'Test Clinic',
  slug: 'test-clinic',
  ...overrides
});

// Database cleanup between tests
export const cleanupDatabase = async () => {
  await prisma.$transaction([
    prisma.appointment.deleteMany(),
    prisma.client.deleteMany(),
    prisma.tenant.deleteMany(),
  ]);
};
```

### CI Configuration
```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      test-group: [unit, integration, e2e]
  services:
    postgres:
      image: postgres:16
      env:
        POSTGRES_PASSWORD: test
  steps:
    - name: Run tests
      run: pnpm test:${{ matrix.test-group }}
```

## Coverage Requirements

### Minimum Coverage Targets
- **Overall Code Coverage**: 80%
- **Critical Business Logic**: 95%
- **API Endpoints**: 90%
- **Database Models**: 85%

### Quality Gates
- All tests must pass before merge to main
- Coverage regression blocks deployment
- E2E tests must pass in staging environment
- Performance tests validate API response times <300ms

## Test Organization

### Directory Structure
```
apps/api/
├── src/
│   ├── __tests__/           # Integration tests
│   ├── appointments/
│   │   ├── __tests__/       # Unit tests
│   │   └── appointments.service.spec.ts
├── test/
│   ├── fixtures/            # Test data
│   ├── helpers/             # Test utilities
│   └── setup.ts             # Global test setup

tests/
├── e2e/                     # Playwright E2E tests
├── performance/             # k6 performance tests
└── contracts/               # API contract tests
```

## Consequences

### Benefits
- High confidence in production deployments
- Faster development feedback with Vitest
- Reliable E2E testing with Playwright
- Focus on business value with testing trophy approach

### Costs
- Initial setup time for testing infrastructure
- Ongoing maintenance of test suites
- CI execution time increase
- Test data management complexity

### Risks
- Team adoption curve for new tools
- Test flakiness if not properly managed
- Over-testing of low-value code paths

## Success Metrics

- **Deployment Confidence**: Reduced production bugs by 90%
- **Development Velocity**: Faster feature delivery with reliable tests
- **Test Execution Time**: Full test suite completes in <10 minutes
- **Test Reliability**: <1% flaky test rate

## Review Schedule

This ADR will be reviewed after Phase 7 implementation completion (target: November 2025) to assess effectiveness and adjust strategy if needed.
