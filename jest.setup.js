import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_ZKBIO_API_URL = 'https://test-api.example.com'
process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN = 'test-token'

// Global test setup
beforeAll(() => {
  // Add any global setup here
})

afterEach(() => {
  jest.clearAllMocks()
})