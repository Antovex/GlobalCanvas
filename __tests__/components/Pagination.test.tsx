import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import Pagination from '@/components/Pagination'

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock window location
const mockLocation = {
  pathname: '/test',
  search: ''
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('Pagination Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.search = ''
    // Mock window.innerWidth for responsive behavior
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  test('renders pagination with correct page numbers', () => {
    render(<Pagination page={1} count={50} />)
    
    // Should show pages 1-7 for 50 items (7 pages total with ITEM_PER_PAGE = 8)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument() // Last page
  })

  test('disables previous button on first page', () => {
    render(<Pagination page={1} count={50} />)
    
    const prevButton = screen.getByText('Prev')
    expect(prevButton.closest('button')).toBeDisabled()
  })

  test('disables next button on last page', () => {
    render(<Pagination page={7} count={50} />)
    
    const nextButton = screen.getByText('Next')
    expect(nextButton.closest('button')).toBeDisabled()
  })

  test('enables navigation buttons on middle pages', () => {
    render(<Pagination page={3} count={50} />)
    
    const prevButton = screen.getByText('Prev')
    const nextButton = screen.getByText('Next')
    
    expect(prevButton.closest('button')).not.toBeDisabled()
    expect(nextButton.closest('button')).not.toBeDisabled()
  })

  test('navigates to previous page when prev button clicked', async () => {
    const user = userEvent.setup()
    render(<Pagination page={3} count={50} />)
    
    const prevButton = screen.getByText('Prev')
    await user.click(prevButton)
    
    expect(mockPush).toHaveBeenCalledWith('/test?page=2')
  })

  test('navigates to next page when next button clicked', async () => {
    const user = userEvent.setup()
    render(<Pagination page={3} count={50} />)
    
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    expect(mockPush).toHaveBeenCalledWith('/test?page=4')
  })

  test('navigates to specific page when page number clicked', async () => {
    const user = userEvent.setup()
    render(<Pagination page={1} count={50} />)
    
    const pageButton = screen.getByText('5')
    await user.click(pageButton)
    
    expect(mockPush).toHaveBeenCalledWith('/test?page=5')
  })

  test('highlights current page', () => {
    render(<Pagination page={3} count={50} />)
    
    const currentPageButton = screen.getByText('3').closest('button')
    expect(currentPageButton).toHaveClass('bg-lamaSkyLight')
  })

  test('handles edge case with zero count', () => {
    render(<Pagination page={1} count={0} />)
    
    // Should still show at least page 1
    expect(screen.getByText('1')).toBeInTheDocument()
    
    // Both navigation buttons should be disabled
    const prevButton = screen.getByText('Prev')
    const nextButton = screen.getByText('Next')
    expect(prevButton.closest('button')).toBeDisabled()
    expect(nextButton.closest('button')).toBeDisabled()
  })

  test('shows ellipses for large page counts', () => {
    render(<Pagination page={10} count={200} />)
    
    // Should show ellipses for large page ranges
    const ellipses = screen.getAllByText('...')
    expect(ellipses.length).toBeGreaterThan(0)
  })

  test('preserves existing query parameters', async () => {
    const user = userEvent.setup()
    mockLocation.search = '?filter=active&sort=name'
    
    render(<Pagination page={1} count={50} />)
    
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    expect(mockPush).toHaveBeenCalledWith('/test?filter=active&sort=name&page=2')
  })

  test('handles mobile responsive behavior', () => {
    // Simulate mobile screen width
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      writable: true,
    })

    render(<Pagination page={5} count={100} />)
    
    // Component should render but behavior may differ for mobile
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  test('calculates total pages correctly', () => {
    // With ITEM_PER_PAGE = 8
    render(<Pagination page={1} count={25} />)
    
    // 25 items / 8 per page = 4 pages (rounded up)
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })
})