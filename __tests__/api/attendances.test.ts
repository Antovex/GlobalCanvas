import { createRequest, createResponse } from 'node-mocks-http'
import type { NextRequest } from 'next/server'
import { POST } from '@/app/api/attendances/route'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId, getUserRole } from '@/lib/util'

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

// Type assertions for mocked functions
const mockGetCurrentUserId = getCurrentUserId as jest.MockedFunction<typeof getCurrentUserId>
const mockGetUserRole = getUserRole as jest.MockedFunction<typeof getUserRole>
const mockFindFirst = prisma.attendance.findFirst as jest.MockedFunction<typeof prisma.attendance.findFirst>
const mockCreate = prisma.attendance.create as jest.MockedFunction<typeof prisma.attendance.create>
const mockUpdate = prisma.attendance.update as jest.MockedFunction<typeof prisma.attendance.update>

describe('/api/attendances POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns 401 when user is not authenticated', async () => {
    mockGetCurrentUserId.mockResolvedValue(null)

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
    mockGetCurrentUserId.mockResolvedValue('user-123')
    mockGetUserRole.mockResolvedValue('student')

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

  test('returns 400 when required fields are missing', async () => {
    mockGetCurrentUserId.mockResolvedValue('user-123')
    mockGetUserRole.mockResolvedValue('teacher')

    const req = new Request('http://localhost:3000/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student-123',
        // Missing lessonId and status
      })
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('missing fields')
  })

  test('returns 400 when lessonId is invalid', async () => {
    mockGetCurrentUserId.mockResolvedValue('user-123')
    mockGetUserRole.mockResolvedValue('teacher')

    const req = new Request('http://localhost:3000/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student-123',
        lessonId: 'invalid',
        status: 'PRESENT'
      })
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('invalid lessonId')
  })

  test('returns 400 when status is invalid', async () => {
    mockGetCurrentUserId.mockResolvedValue('user-123')
    mockGetUserRole.mockResolvedValue('teacher')

    const req = new Request('http://localhost:3000/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student-123',
        lessonId: 1,
        status: 'INVALID_STATUS'
      })
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('invalid status')
  })

  test('creates new attendance record when none exists', async () => {
    mockGetCurrentUserId.mockResolvedValue('user-123')
    mockGetUserRole.mockResolvedValue('teacher')
    mockFindFirst.mockResolvedValue(null)
    
    const mockAttendance = {
      id: 1,
      studentId: 'student-123',
      lessonId: 1,
      status: 'PRESENT',
      date: new Date('2025-09-12T00:00:00.000Z')
    }
    mockCreate.mockResolvedValue(mockAttendance)

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
    expect(data.data).toEqual(mockAttendance)
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        studentId: 'student-123',
        lessonId: 1,
        status: 'PRESENT',
        date: expect.any(Date)
      }
    })
  })

  test('updates existing attendance record', async () => {
    mockGetCurrentUserId.mockResolvedValue('user-123')
    mockGetUserRole.mockResolvedValue('admin')
    
    const existingAttendance = {
      id: 1,
      studentId: 'student-123',
      lessonId: 1,
      status: 'ABSENT',
      date: new Date('2025-09-12T08:00:00.000Z')
    }
    mockFindFirst.mockResolvedValue(existingAttendance)
    
    const updatedAttendance = {
      ...existingAttendance,
      status: 'PRESENT'
    }
    mockUpdate.mockResolvedValue(updatedAttendance)

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

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.action).toBe('updated')
    expect(data.data.status).toBe('PRESENT')
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: 'PRESENT',
        date: expect.any(Date)
      }
    })
  })

  test('handles invalid date format', async () => {
    mockGetCurrentUserId.mockResolvedValue('user-123')
    mockGetUserRole.mockResolvedValue('teacher')

    const req = new Request('http://localhost:3000/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student-123',
        lessonId: 1,
        status: 'PRESENT',
        date: 'invalid-date'
      })
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('invalid date')
  })

  test('handles database errors gracefully', async () => {
    mockGetCurrentUserId.mockResolvedValue('user-123')
    mockGetUserRole.mockResolvedValue('teacher')
    mockFindFirst.mockRejectedValue(new Error('Database connection failed'))

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

    expect(response.status).toBe(500)
    expect(data.error).toBe('Database connection failed')
  })

  test('accepts valid attendance statuses', async () => {
    mockGetCurrentUserId.mockResolvedValue('user-123')
    mockGetUserRole.mockResolvedValue('teacher')
    mockFindFirst.mockResolvedValue(null)
    mockCreate.mockResolvedValue({
      id: 1,
      studentId: 'student-123',
      lessonId: 1,
      status: 'COMPENSATION',
      date: new Date()
    })

    const validStatuses = ['PRESENT', 'ABSENT', 'COMPENSATION']
    
    for (const status of validStatuses) {
      const req = new Request('http://localhost:3000/api/attendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'student-123',
          lessonId: 1,
          status: status
        })
      })

      const response = await POST(req)
      expect(response.status).toBe(201)
      
      jest.clearAllMocks()
      mockGetCurrentUserId.mockResolvedValue('user-123')
      mockGetUserRole.mockResolvedValue('teacher')
      mockFindFirst.mockResolvedValue(null)
      mockCreate.mockResolvedValue({
        id: 1,
        studentId: 'student-123',
        lessonId: 1,
        status: status as any,
        date: new Date()
      })
    }
  })
})