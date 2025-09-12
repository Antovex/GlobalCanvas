import { getUserRole, getCurrentUserId, getLatestSunday, adjustScheduleToCurrentWeek } from '@/lib/util'
import { auth } from '@clerk/nextjs/server'

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

const mockAuth = auth as jest.MockedFunction<typeof auth>

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserRole', () => {
    test('returns valid role when user has role metadata', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          metadata: { role: 'admin' }
        }
      } as any)

      const role = await getUserRole()
      expect(role).toBe('admin')
    })

    test('returns norole when user has invalid role', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          metadata: { role: 'invalid_role' }
        }
      } as any)

      const role = await getUserRole()
      expect(role).toBe('norole')
    })

    test('returns norole when no role metadata exists', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          metadata: {}
        }
      } as any)

      const role = await getUserRole()
      expect(role).toBe('norole')
    })

    test('returns norole when no metadata exists', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {}
      } as any)

      const role = await getUserRole()
      expect(role).toBe('norole')
    })

    test('validates all allowed roles', async () => {
      const allowedRoles = ['admin', 'teacher', 'student', 'parent']
      
      for (const role of allowedRoles) {
        mockAuth.mockResolvedValue({
          sessionClaims: {
            metadata: { role }
          }
        } as any)

        const result = await getUserRole()
        expect(result).toBe(role)
      }
    })
  })

  describe('getCurrentUserId', () => {
    test('returns userId when user is authenticated', async () => {
      mockAuth.mockResolvedValue({
        userId: 'user-123'
      } as any)

      const userId = await getCurrentUserId()
      expect(userId).toBe('user-123')
    })

    test('throws error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({
        userId: null
      } as any)

      await expect(getCurrentUserId()).rejects.toThrow(
        'User is not authenticated or user ID could not be retrieved from Clerk.'
      )
    })

    test('throws error when userId is undefined', async () => {
      mockAuth.mockResolvedValue({} as any)

      await expect(getCurrentUserId()).rejects.toThrow(
        'User is not authenticated or user ID could not be retrieved from Clerk.'
      )
    })
  })

  describe('getLatestSunday', () => {
    test('returns current Sunday when today is Sunday', () => {
      // Mock a Sunday (2025-09-07 is a Sunday)
      const sunday = new Date('2025-09-07T15:30:00')
      jest.spyOn(global, 'Date').mockImplementation((...args) => {
        if (args.length === 0) return sunday
        return new (jest.requireActual('Date'))(...args)
      })

      const latestSunday = getLatestSunday()
      expect(latestSunday.getDay()).toBe(0) // Sunday
      expect(latestSunday.getHours()).toBe(0)
      expect(latestSunday.getMinutes()).toBe(0)
      expect(latestSunday.getSeconds()).toBe(0)
      expect(latestSunday.getMilliseconds()).toBe(0)
    })

    test('returns previous Sunday when today is Wednesday', () => {
      // Mock a Wednesday (2025-09-10 is a Wednesday)
      const wednesday = new Date('2025-09-10T15:30:00')
      jest.spyOn(global, 'Date').mockImplementation((...args) => {
        if (args.length === 0) return wednesday
        return new (jest.requireActual('Date'))(...args)
      })

      const latestSunday = getLatestSunday()
      expect(latestSunday.getDay()).toBe(0) // Sunday
      expect(latestSunday.getDate()).toBe(7) // 2025-09-07
      expect(latestSunday.getHours()).toBe(0)
      expect(latestSunday.getMinutes()).toBe(0)
    })

    test('returns previous Sunday when today is Saturday', () => {
      // Mock a Saturday (2025-09-13 is a Saturday)
      const saturday = new Date('2025-09-13T23:59:59')
      jest.spyOn(global, 'Date').mockImplementation((...args) => {
        if (args.length === 0) return saturday
        return new (jest.requireActual('Date'))(...args)
      })

      const latestSunday = getLatestSunday()
      expect(latestSunday.getDay()).toBe(0) // Sunday
      expect(latestSunday.getDate()).toBe(7) // 2025-09-07
      expect(latestSunday.getHours()).toBe(0)
    })
  })

  describe('adjustScheduleToCurrentWeek', () => {
    beforeEach(() => {
      // Mock current date to a known Wednesday (2025-09-10)
      const mockDate = new Date('2025-09-10T12:00:00')
      jest.spyOn(global, 'Date').mockImplementation((...args) => {
        if (args.length === 0) return mockDate
        return new (jest.requireActual('Date'))(...args)
      })
    })

    test('adjusts Monday lesson to current week', () => {
      const lessons = [
        {
          title: 'Math Class',
          start: new Date('2025-01-06T09:00:00'), // Monday 9 AM (any date)
          end: new Date('2025-01-06T10:00:00')     // Monday 10 AM
        }
      ]

      const adjusted = adjustScheduleToCurrentWeek(lessons)
      
      expect(adjusted).toHaveLength(1)
      expect(adjusted[0].title).toBe('Math Class')
      expect(adjusted[0].start.getDay()).toBe(1) // Monday
      expect(adjusted[0].start.getDate()).toBe(8) // 2025-09-08 (Monday of current week)
      expect(adjusted[0].start.getHours()).toBe(9) // Preserve time
      expect(adjusted[0].end.getHours()).toBe(10)
    })

    test('adjusts multiple lessons across different days', () => {
      const lessons = [
        {
          title: 'Monday Math',
          start: new Date('2025-01-06T09:00:00'), // Monday
          end: new Date('2025-01-06T10:00:00')
        },
        {
          title: 'Wednesday Science',
          start: new Date('2025-01-08T14:00:00'), // Wednesday
          end: new Date('2025-01-08T15:30:00')
        },
        {
          title: 'Friday English',
          start: new Date('2025-01-10T11:00:00'), // Friday
          end: new Date('2025-01-10T12:00:00')
        }
      ]

      const adjusted = adjustScheduleToCurrentWeek(lessons)
      
      expect(adjusted).toHaveLength(3)
      
      // Monday lesson
      expect(adjusted[0].start.getDay()).toBe(1)
      expect(adjusted[0].start.getDate()).toBe(8) // 2025-09-08
      
      // Wednesday lesson  
      expect(adjusted[1].start.getDay()).toBe(3)
      expect(adjusted[1].start.getDate()).toBe(10) // 2025-09-10
      
      // Friday lesson
      expect(adjusted[2].start.getDay()).toBe(5)
      expect(adjusted[2].start.getDate()).toBe(12) // 2025-09-12
    })

    test('preserves time components correctly', () => {
      const lessons = [
        {
          title: 'Early Morning Class',
          start: new Date('2025-01-06T07:15:30'), // Monday 7:15:30 AM
          end: new Date('2025-01-06T08:45:00')    // Monday 8:45 AM
        }
      ]

      const adjusted = adjustScheduleToCurrentWeek(lessons)
      
      expect(adjusted[0].start.getHours()).toBe(7)
      expect(adjusted[0].start.getMinutes()).toBe(15)
      expect(adjusted[0].start.getSeconds()).toBe(30)
      expect(adjusted[0].end.getHours()).toBe(8)
      expect(adjusted[0].end.getMinutes()).toBe(45)
    })

    test('handles Sunday lessons correctly', () => {
      const lessons = [
        {
          title: 'Sunday Study',
          start: new Date('2025-01-05T16:00:00'), // Sunday
          end: new Date('2025-01-05T17:00:00')
        }
      ]

      const adjusted = adjustScheduleToCurrentWeek(lessons)
      
      expect(adjusted[0].start.getDay()).toBe(0) // Sunday
      expect(adjusted[0].start.getDate()).toBe(7) // 2025-09-07 (Sunday of current week)
    })

    test('handles empty lesson array', () => {
      const adjusted = adjustScheduleToCurrentWeek([])
      expect(adjusted).toEqual([])
    })
  })
})

// Restore Date implementation after each test
afterEach(() => {
  jest.restoreAllMocks()
})