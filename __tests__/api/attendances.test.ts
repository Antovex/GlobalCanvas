import { POST } from '@/app/api/attendances/route'

// Mock external dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    attendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/util', () => ({
  getCurrentUserId: jest.fn(),
  getUserRole: jest.fn(),
}))

// Import after mocking
const { getCurrentUserId, getUserRole } = require('@/lib/util')
const { prisma } = require('@/lib/prisma')

describe('/api/attendances POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns 401 when user is not authenticated', async () => {
    getCurrentUserId.mockResolvedValue(null)

    const req = new Request('http://localhost:3000/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student-123',
        lessonId: 1,
        status: 'PRESENT'
      })
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  test('returns 403 when user role is not teacher or admin', async () => {
    getCurrentUserId.mockResolvedValue('user-123')
    getUserRole.mockResolvedValue('student')

    const req = new Request('http://localhost:3000/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student-123',
        lessonId: 1,
        status: 'PRESENT'
      })
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  test('creates new attendance record when none exists', async () => {
    getCurrentUserId.mockResolvedValue('user-123')
    getUserRole.mockResolvedValue('teacher')
    prisma.attendance.findFirst.mockResolvedValue(null)
    
    const mockAttendance = {
      id: 1,
      studentId: 'student-123',
      lessonId: 1,
      status: 'PRESENT',
      date: new Date('2025-09-12T00:00:00.000Z')
    }
    prisma.attendance.create.mockResolvedValue(mockAttendance)

    const req = new Request('http://localhost:3000/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student-123',
        lessonId: 1,
        status: 'PRESENT',
        date: '2025-09-12'
      })
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.ok).toBe(true)
    expect(data.action).toBe('created')
    expect(prisma.attendance.create).toHaveBeenCalled()
  })
})