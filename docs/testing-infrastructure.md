# Testing Infrastructure Guide

## Overview

The Banking Access Control System includes a comprehensive testing infrastructure designed for enterprise-grade quality assurance. This guide covers the testing setup, execution, and best practices.

## Testing Architecture

### Test Types

#### 1. Unit Tests
- **Framework**: Jest + React Testing Library
- **Coverage**: Component logic, utilities, and isolated functions
- **Location**: `components/__tests__/*.test.tsx`

#### 2. Integration Tests
- **Framework**: Jest with MSW (Mock Service Worker)
- **Coverage**: API routes and external service integration
- **Location**: `app/api/__tests__/*.test.ts`

#### 3. End-to-End Tests
- **Framework**: Playwright
- **Coverage**: Complete user workflows and browser interactions
- **Location**: `e2e/*.spec.ts`

### Test Infrastructure

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70
    }
  }
}
```

#### Test Setup
```javascript
// jest.setup.js
import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Mock external dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}))

// MSW server for API mocking
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Running Tests

### Development Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run CI tests (no watch, with coverage)
npm run test:ci

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Test Scripts

#### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Component Testing

### Testing Patterns

#### Basic Component Test
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

#### Form Component Test
```tsx
describe('RegistrationForm', () => {
  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<RegistrationForm />)

    // Fill form with invalid data
    await user.type(screen.getByLabelText('Name'), 'John')
    // Submit without required fields
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(screen.getByText('Account number is required')).toBeInTheDocument()
  })

  it('submits successfully with valid data', async () => {
    const mockSubmit = jest.fn()
    const user = userEvent.setup()

    render(<RegistrationForm onSubmit={mockSubmit} />)

    // Fill all required fields
    await user.type(screen.getByLabelText('Account Number'), '123456789')
    await user.type(screen.getByLabelText('Name'), 'John Doe')
    await user.selectOptions(screen.getByLabelText('Branch'), '001')

    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        accountNumber: '123456789',
        name: 'John Doe',
        branch: '001'
      })
    })
  })
})
```

### Mocking Strategies

#### API Service Mocking
```tsx
// Mock external API calls
jest.mock('../../services/personService', () => ({
  createPerson: jest.fn(),
  getPersons: jest.fn()
}))

describe('PersonForm', () => {
  beforeEach(() => {
    const mockCreatePerson = require('../../services/personService').createPerson
    mockCreatePerson.mockResolvedValue({ id: '123', name: 'John Doe' })
  })

  it('creates person successfully', async () => {
    // Test implementation
  })
})
```

#### MSW for API Integration
```javascript
// mocks/server.js
import { setupServer } from 'msw/node'
import { rest } from 'msw'

const handlers = [
  rest.post('/api/persons', (req, res, ctx) => {
    return res(ctx.json({
      code: 0,
      message: 'Person created successfully',
      data: { id: '123' }
    }))
  })
]

export const server = setupServer(...handlers)
```

## API Route Testing

### Route Handler Testing
```typescript
// app/api/persons/__tests__/route.test.ts
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock dependencies
jest.mock('axios')
const mockAxios = require('axios')

describe('/api/persons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/persons', () => {
    it('proxies request to ZK API', async () => {
      const mockResponse = {
        data: { code: 0, message: 'Success', data: [] },
        status: 200
      }

      const mockAxiosInstance = {
        post: jest.fn().mockResolvedValue(mockResponse)
      }
      mockAxios.create.mockReturnValue(mockAxiosInstance)

      const request = new NextRequest('http://localhost:3000/api/persons')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockAxiosInstance.post).toHaveBeenCalled()
    })
  })
})
```

### Error Handling Tests
```typescript
describe('error handling', () => {
  it('handles API errors gracefully', async () => {
    const mockError = {
      response: { status: 500, data: { error: 'API Error' } },
      isAxiosError: true
    }

    const mockAxiosInstance = {
      post: jest.fn().mockRejectedValue(mockError)
    }
    mockAxios.create.mockReturnValue(mockAxiosInstance)

    const request = new NextRequest('http://localhost:3000/api/persons')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('API request failed')
  })
})
```

## E2E Testing with Playwright

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples
```typescript
// e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Registration', () => {
  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/')

    // Navigate to registration form
    await page.click('text=User Registration')

    // Fill registration form
    await page.fill('[placeholder="Enter account number"]', '123456789')
    await page.fill('[placeholder="Enter first name"]', 'John')
    await page.fill('[placeholder="Enter last name"]', 'Doe')
    await page.selectOption('select[name="branch"]', '001')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator('text=Registration successful')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Check validation messages
    await expect(page.locator('text=Account number is required')).toBeVisible()
    await expect(page.locator('text=Name is required')).toBeVisible()
  })
})
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run tests
      run: npm run test:ci

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright browsers
      run: npx playwright install

    - name: Run E2E tests
      run: npm run test:e2e
```

## Test Coverage Analysis

### Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70
    },
    'components/': {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  },
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ]
}
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

## Best Practices

### Test Organization
1. **Group related tests** in describe blocks
2. **Use descriptive test names** that explain the behavior
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests isolated** and independent
5. **Use page objects** for complex E2E tests

### Mocking Guidelines
1. **Mock external dependencies** (APIs, databases)
2. **Use realistic test data** that matches production
3. **Reset mocks between tests** to avoid interference
4. **Mock at the right level** (unit vs integration tests)

### Performance Testing
1. **Monitor test execution time**
2. **Use parallel test execution** when possible
3. **Optimize slow tests** or mark them as integration tests
4. **Set up test timeouts** appropriately

### Debugging Tests
```bash
# Debug specific test
npm test -- --testNamePattern="should register user"

# Run tests in debug mode
npm test -- --inspect-brk

# View test coverage for specific file
npm run test:coverage -- components/MyComponent.test.tsx
```

## Troubleshooting

### Common Issues

#### Tests Failing Randomly
- **Cause**: Shared state between tests
- **Solution**: Reset state in `beforeEach`, use unique test data

#### Slow Test Execution
- **Cause**: Heavy mocking or large test data
- **Solution**: Optimize mocks, use smaller datasets, parallel execution

#### Flaky E2E Tests
- **Cause**: Timing issues, network delays
- **Solution**: Use proper waits, retry logic, stable selectors

#### Coverage Issues
- **Cause**: Untested code paths
- **Solution**: Add missing test cases, review coverage reports

### Test Maintenance

1. **Regular Review**: Update tests when code changes
2. **Remove Obsolete Tests**: Clean up tests for removed features
3. **Refactor Tests**: Improve test readability and maintainability
4. **Documentation**: Keep test documentation current

## Integration with Development Workflow

### Pre-commit Hooks
```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:ci
```

### IDE Integration
- **VS Code**: Jest extension for test running and debugging
- **WebStorm**: Built-in test runner integration
- **Extensions**: Test coverage display, test exploration

### Continuous Integration
- **GitHub Actions**: Automated testing on PRs and pushes
- **Codecov**: Coverage reporting and tracking
- **Test Analytics**: Performance tracking and flaky test detection

## Next Steps

1. **Expand Test Coverage**: Add tests for remaining components
2. **Performance Testing**: Implement performance regression tests
3. **Visual Testing**: Add visual regression tests with Playwright
4. **API Contract Testing**: Test API contracts and schemas
5. **Load Testing**: Implement basic load testing for critical paths

For additional support or questions about the testing infrastructure, refer to the main project documentation or contact the development team.