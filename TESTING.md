# Testing Strategy for GlobalCanvas

## Overview
This document outlines the comprehensive testing strategy implemented for the GlobalCanvas school management system.

## Test Framework Setup
- **Jest**: Main testing framework with TypeScript support
- **React Testing Library**: For React component testing
- **@testing-library/user-event**: For user interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

## Test Categories

### 1. Unit Tests
Located in `__tests__/` directory, mirroring the `src/` structure.

#### Component Tests
- `InputField.test.tsx`: Form input component validation
- `Pagination.test.tsx`: Pagination component navigation and state

#### Utility Tests  
- `util.test.ts`: Authentication helpers, date utilities, schedule functions

### 2. API Tests
Located in `__tests__/api/`

#### Attendance API Tests
- `attendances.test.ts`: Student attendance endpoint validation
- Authentication and authorization testing
- Input validation and error handling
- Database interaction mocking

### 3. Integration Tests
Located in `__tests__/integration/`

#### Workflow Tests
- End-to-end user flows
- Component interaction testing
- State management validation

## Test Coverage Goals
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70% 
- **Statements**: 70%

## Key Testing Features

### Mocking Strategy
- **Clerk Authentication**: Mocked for consistent test user states
- **Prisma Database**: Mocked to avoid database dependencies
- **Next.js Router**: Mocked for navigation testing
- **External APIs**: Mocked Cloudinary and toast notifications

### Test Data
- Standardized mock data for students, teachers, lessons
- Consistent user roles and authentication states
- Realistic date/time scenarios for scheduling tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Examples

### Component Testing Pattern
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InputField from '@/components/InputField'

test('renders input field with label', () => {
  render(
    <TestWrapper>
      {(methods) => (
        <InputField
          label="Test Label"
          name="testField"
          register={methods.register}
        />
      )}
    </TestWrapper>
  )
  
  expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
})
```

### API Testing Pattern
```typescript
import { POST } from '@/app/api/attendances/route'

test('creates new attendance record', async () => {
  mockGetCurrentUserId.mockResolvedValue('user-123')
  mockGetUserRole.mockResolvedValue('teacher')
  
  const req = new Request('http://localhost/api/attendances', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: 'student-123',
      lessonId: 1,
      status: 'PRESENT'
    })
  })
  
  const response = await POST(req)
  expect(response.status).toBe(201)
})
```

## Continuous Integration
Tests are designed to run in CI/CD environments with:
- Node.js 18+ compatibility
- No external database dependencies
- Consistent mock data and timing
- Cross-platform compatibility

## Best Practices
- Keep tests focused and isolated
- Use descriptive test names
- Mock external dependencies consistently
- Maintain realistic test data
- Test both happy paths and error scenarios
- Include accessibility testing where applicable

## Future Enhancements
- Add E2E tests with Playwright
- Implement visual regression testing
- Add performance testing for critical paths
- Expand integration test coverage
- Add API contract testing