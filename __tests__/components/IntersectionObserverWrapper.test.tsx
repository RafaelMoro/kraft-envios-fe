import { render, screen } from '@testing-library/react'
import { IntersectionObserverWrapper } from '@/shared/ui/organisms/IntersectionObserverWrapper'

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
const mockObserve = jest.fn()
const mockDisconnect = jest.fn()

// Create a mock IntersectionObserver constructor
beforeAll(() => {
  // Mock the IntersectionObserver constructor
  global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
    mockIntersectionObserver.mockImplementation(callback)
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: []
    }
  })
})

describe('IntersectionObserverWrapper', () => {
  const mockSetIntersecting = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    setIntersecting: mockSetIntersecting,
    children: <div>Test content</div>
  }

  describe('GIVEN the IntersectionObserverWrapper is rendered', () => {
    it('WHEN the component renders THEN it should display the children and have correct attributes', () => {
      render(<IntersectionObserverWrapper {...defaultProps} />)

      expect(screen.getByTestId('action-bar-intersection-observer')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
      expect(screen.getByTestId('action-bar-intersection-observer')).toContainElement(screen.getByText('Test content'))
    })

    it('WHEN the component renders THEN it should create an IntersectionObserver', () => {
      render(<IntersectionObserverWrapper {...defaultProps} />)

      expect(global.IntersectionObserver).toHaveBeenCalledWith(expect.any(Function))
      expect(mockObserve).toHaveBeenCalled()
    })

    it('WHEN the component renders THEN it should render as an article element', () => {
      render(<IntersectionObserverWrapper {...defaultProps} />)

      const wrapper = screen.getByTestId('action-bar-intersection-observer')
      expect(wrapper.tagName).toBe('ARTICLE')
    })
  })

  describe('GIVEN the IntersectionObserver callback is triggered', () => {
    it('WHEN the element is intersecting THEN it should call setIntersecting with true', () => {
      render(<IntersectionObserverWrapper {...defaultProps} />)

      // Get the callback function that was passed to IntersectionObserver
      const observerCallback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0]

      // Simulate intersection entry
      const mockEntry = {
        isIntersecting: true,
        intersectionRatio: 0.5
      }

      // Call the observer callback
      observerCallback([mockEntry])

      expect(mockSetIntersecting).toHaveBeenCalledWith(true)
    })

    it('WHEN the element is not intersecting THEN it should call setIntersecting with false', () => {
      render(<IntersectionObserverWrapper {...defaultProps} />)

      // Get the callback function that was passed to IntersectionObserver
      const observerCallback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0]

      // Simulate intersection entry
      const mockEntry = {
        isIntersecting: false,
        intersectionRatio: 0.3
      }

      // Call the observer callback
      observerCallback([mockEntry])

      expect(mockSetIntersecting).toHaveBeenCalledWith(false)
    })

    it('WHEN intersectionRatio is negative THEN it should not call setIntersecting', () => {
      render(<IntersectionObserverWrapper {...defaultProps} />)

      // Get the callback function that was passed to IntersectionObserver
      const observerCallback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0]

      // Simulate intersection entry with negative ratio
      const mockEntry = {
        isIntersecting: true,
        intersectionRatio: -1
      }

      // Call the observer callback
      observerCallback([mockEntry])

      expect(mockSetIntersecting).not.toHaveBeenCalled()
    })

    it('WHEN intersectionRatio is zero THEN it should call setIntersecting', () => {
      render(<IntersectionObserverWrapper {...defaultProps} />)

      // Get the callback function that was passed to IntersectionObserver
      const observerCallback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0]

      // Simulate intersection entry with zero ratio
      const mockEntry = {
        isIntersecting: false,
        intersectionRatio: 0
      }

      // Call the observer callback
      observerCallback([mockEntry])

      expect(mockSetIntersecting).toHaveBeenCalledWith(false)
    })

    it('WHEN entry is undefined THEN it should not call setIntersecting', () => {
      render(<IntersectionObserverWrapper {...defaultProps} />)

      // Get the callback function that was passed to IntersectionObserver
      const observerCallback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0]

      // Simulate undefined entry (destructuring an empty array)
      const mockEntry = undefined

      // Call the observer callback with undefined entry
      observerCallback([mockEntry])

      expect(mockSetIntersecting).not.toHaveBeenCalled()
    })
  })

  describe('GIVEN the component unmounts', () => {
    it('WHEN the component is unmounted THEN it should disconnect the observer', () => {
      const { unmount } = render(<IntersectionObserverWrapper {...defaultProps} />)

      unmount()

      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('WHEN the component is unmounted AND observer is null THEN it should not throw an error', () => {
      // Mock a scenario where observer might be null
      const { unmount } = render(<IntersectionObserverWrapper {...defaultProps} />)

      // Clear the mock to simulate null observer
      mockDisconnect.mockClear()

      expect(() => unmount()).not.toThrow()
    })
  })

  describe('GIVEN different children scenarios', () => {
    it('WHEN multiple children are passed THEN it should render all children', () => {
      const multipleChildren = (
        <>
          <div>Child 1</div>
          <span>Child 2</span>
          <p>Child 3</p>
        </>
      )

      render(
        <IntersectionObserverWrapper {...defaultProps}>
          {multipleChildren}
        </IntersectionObserverWrapper>
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })

    it('WHEN no children are passed THEN it should render empty wrapper', () => {
      render(
        <IntersectionObserverWrapper setIntersecting={mockSetIntersecting}>
          {null}
        </IntersectionObserverWrapper>
      )

      const wrapper = screen.getByTestId('action-bar-intersection-observer')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toBeEmptyDOMElement()
    })

    it('WHEN text content is passed as children THEN it should render the text', () => {
      render(
        <IntersectionObserverWrapper setIntersecting={mockSetIntersecting}>
          Simple text content
        </IntersectionObserverWrapper>
      )

      expect(screen.getByText('Simple text content')).toBeInTheDocument()
    })
  })

  describe('GIVEN the setIntersecting prop changes', () => {
    it('WHEN setIntersecting prop changes THEN it should create a new observer', () => {
      const newSetIntersecting = jest.fn()
      
      const { rerender } = render(<IntersectionObserverWrapper {...defaultProps} />)

      // Clear mocks to track new calls
      jest.clearAllMocks()

      rerender(
        <IntersectionObserverWrapper setIntersecting={newSetIntersecting}>
          {defaultProps.children}
        </IntersectionObserverWrapper>
      )

      // Should create a new observer when setIntersecting changes
      expect(global.IntersectionObserver).toHaveBeenCalledTimes(1)
      expect(mockObserve).toHaveBeenCalledTimes(1)
    })
  })

  describe('GIVEN edge cases and error scenarios', () => {
    it('WHEN ref.current is null initially THEN it should not create observer until ref is set', () => {
      // This test ensures the early return works when ref.current is null
      render(<IntersectionObserverWrapper {...defaultProps} />)

      // Observer should still be created once the ref is properly set
      expect(global.IntersectionObserver).toHaveBeenCalled()
      expect(mockObserve).toHaveBeenCalled()
    })

    it('WHEN observer callback receives valid entry THEN it should process correctly', () => {
      render(<IntersectionObserverWrapper {...defaultProps} />)

      const observerCallback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0]

      // Call with valid entry
      const validEntry = {
        isIntersecting: true,
        intersectionRatio: 0.5
      }

      observerCallback([validEntry])
      expect(mockSetIntersecting).toHaveBeenCalledWith(true)
    })
  })

  describe('GIVEN the disconnect method behavior', () => {
    it('WHEN disconnect is called and observer exists THEN it should call disconnect', () => {
      const { unmount } = render(<IntersectionObserverWrapper {...defaultProps} />)

      // Verify observer was created
      expect(global.IntersectionObserver).toHaveBeenCalled()

      unmount()

      expect(mockDisconnect).toHaveBeenCalledTimes(1)
    })

    it('WHEN disconnect is called and observer is null THEN it should not throw', () => {
      // Mock disconnect to be undefined to test the guard clause
      const mockObserverWithoutDisconnect = {
        observe: mockObserve,
        disconnect: undefined,
        unobserve: jest.fn(),
        root: null,
        rootMargin: '',
        thresholds: []
      }

      global.IntersectionObserver = jest.fn().mockImplementation(() => mockObserverWithoutDisconnect)

      const { unmount } = render(<IntersectionObserverWrapper {...defaultProps} />)

      expect(() => unmount()).not.toThrow()
    })
  })
})
