// jest.setup.js
import '@testing-library/jest-dom'

// Mock Next.js Web API globals
global.Request = jest.fn().mockImplementation((url, options) => ({
  url,
  method: options?.method || 'GET',
  headers: new Map(Object.entries(options?.headers || {})),
  json: async () => options?.body ? JSON.parse(options.body) : {},
}))

global.Response = {
  json: jest.fn().mockImplementation((data, init) => ({
    ok: true,
    status: init?.status || 200,
    json: async () => data,
  })),
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
  }),
  useUser: () => ({
    isLoaded: true,
    user: {
      id: 'test-user-id',
      publicMetadata: { role: 'admin' },
      firstName: 'Test',
      lastName: 'User',
    },
  }),
  SignedIn: ({ children }) => children,
  SignedOut: () => null,
  ClerkProvider: ({ children }) => children,
}))

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: () => null,
}))

// Suppress console warnings during tests
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
})