import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React, { createRef } from 'react'
import { VirtualList, type VirtualListHandle } from './virtual-list'

const ITEM_HEIGHT = 50
const CONTAINER_HEIGHT = 200

const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`)
const renderItem = (item: string) => <div>{item}</div>

function makeResizeObserverClass(onObserve?: (cb: ResizeObserverCallback) => void) {
  return class MockResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      onObserve?.(callback)
    }
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', makeResizeObserverClass())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('VirtualList', () => {
  describe('renders correct items for scroll position', () => {
    it('renders visible items at scrollTop=0', () => {
      render(
        <VirtualList
          items={items}
          renderItem={renderItem}
          itemHeight={ITEM_HEIGHT}
          height={CONTAINER_HEIGHT}
          overscan={1}
        />,
      )
      // height=200, itemHeight=50: 4 visible items (0-3) + overscan 1 below = items 0-4
      expect(screen.getByText('Item 0')).toBeDefined()
      expect(screen.getByText('Item 4')).toBeDefined()
      // Item far below should not be rendered
      expect(screen.queryByText('Item 20')).toBeNull()
    })

    it('renders correct items after scroll', () => {
      render(
        <VirtualList
          items={items}
          renderItem={renderItem}
          itemHeight={ITEM_HEIGHT}
          height={CONTAINER_HEIGHT}
          overscan={1}
        />,
      )
      const container = screen.getByTestId('virtual-list')

      // Simulate scroll to index 20 (scrollTop = 1000)
      Object.defineProperty(container, 'scrollTop', {
        value: 1000,
        writable: true,
        configurable: true,
      })
      fireEvent.scroll(container)

      // startIdx = max(0, floor(1000/50) - 1) = 19
      // endIdx = min(99, floor((1000+200)/50) + 1) = min(99, 25) = 25
      expect(screen.getByText('Item 19')).toBeDefined()
      expect(screen.getByText('Item 25')).toBeDefined()
      // Items far above should no longer be rendered
      expect(screen.queryByText('Item 0')).toBeNull()
    })

    it('uses overscan to buffer items above and below', () => {
      render(
        <VirtualList
          items={items}
          renderItem={renderItem}
          itemHeight={ITEM_HEIGHT}
          height={CONTAINER_HEIGHT}
          overscan={3}
        />,
      )
      const container = screen.getByTestId('virtual-list')

      Object.defineProperty(container, 'scrollTop', {
        value: 500,
        writable: true,
        configurable: true,
      })
      fireEvent.scroll(container)

      // scrollTop=500, visible items 10-13, overscan 3 each side: items 7-16
      expect(screen.getByText('Item 7')).toBeDefined()
      expect(screen.getByText('Item 16')).toBeDefined()
      expect(screen.queryByText('Item 6')).toBeNull()
    })
  })

  describe('scrollToIndex', () => {
    it('sets correct scrollTop for fixed item height', () => {
      const ref = createRef<VirtualListHandle>()
      render(
        <VirtualList
          ref={ref}
          items={items}
          renderItem={renderItem}
          itemHeight={ITEM_HEIGHT}
          height={CONTAINER_HEIGHT}
        />,
      )
      const container = screen.getByTestId('virtual-list')

      act(() => {
        ref.current?.scrollToIndex(10)
      })

      expect(container.scrollTop).toBe(10 * ITEM_HEIGHT)
    })

    it('clamps scrollToIndex to valid range', () => {
      const ref = createRef<VirtualListHandle>()
      render(
        <VirtualList
          ref={ref}
          items={items}
          renderItem={renderItem}
          itemHeight={ITEM_HEIGHT}
          height={CONTAINER_HEIGHT}
        />,
      )
      const container = screen.getByTestId('virtual-list')

      act(() => {
        ref.current?.scrollToIndex(9999)
      })
      expect(container.scrollTop).toBe(99 * ITEM_HEIGHT)

      act(() => {
        ref.current?.scrollToIndex(-5)
      })
      expect(container.scrollTop).toBe(0)
    })

    it('scrolls to correct position with variable item heights', () => {
      const variableItems = Array.from({ length: 20 }, (_, i) => `Item ${i}`)
      const measureItem = (_item: string, index: number) => (index % 2 === 0 ? 40 : 80)
      const ref = createRef<VirtualListHandle>()

      render(
        <VirtualList
          ref={ref}
          items={variableItems}
          renderItem={(item) => <div>{item}</div>}
          itemHeight={40}
          height={200}
          measureItem={measureItem}
        />,
      )
      const container = screen.getByTestId('virtual-list')

      // offsets: 0, 40, 120, 160, 240 ...
      // item 2 offset = 40 + 80 = 120
      act(() => {
        ref.current?.scrollToIndex(2)
      })
      expect(container.scrollTop).toBe(120)
    })
  })

  describe('handles empty list', () => {
    it('renders container without errors', () => {
      render(
        <VirtualList
          items={[]}
          renderItem={renderItem}
          itemHeight={ITEM_HEIGHT}
          height={CONTAINER_HEIGHT}
        />,
      )
      const container = screen.getByTestId('virtual-list')
      expect(container).toBeDefined()
    })

    it('renders no item elements for empty list', () => {
      render(
        <VirtualList
          items={[]}
          renderItem={renderItem}
          itemHeight={ITEM_HEIGHT}
          height={CONTAINER_HEIGHT}
        />,
      )
      // Only the spacer div inside the container, no item wrappers
      const container = screen.getByTestId('virtual-list')
      const spacer = container.firstElementChild as HTMLElement
      expect(spacer.children).toHaveLength(0)
    })

    it('sets total height to 0 for empty list', () => {
      render(
        <VirtualList
          items={[]}
          renderItem={renderItem}
          itemHeight={ITEM_HEIGHT}
          height={CONTAINER_HEIGHT}
        />,
      )
      const container = screen.getByTestId('virtual-list')
      const spacer = container.firstElementChild as HTMLElement
      expect(spacer.style.height).toBe('0px')
    })
  })

  describe('handles resize', () => {
    it('updates visible window when container grows', () => {
      let resizeCallback: ResizeObserverCallback | undefined
      vi.stubGlobal(
        'ResizeObserver',
        makeResizeObserverClass((cb) => {
          resizeCallback = cb
        }),
      )

      render(
        <VirtualList
          items={items}
          renderItem={renderItem}
          itemHeight={ITEM_HEIGHT}
          height={CONTAINER_HEIGHT}
          overscan={1}
        />,
      )

      // Initially with height=200 and overscan=1: items 0-4
      expect(screen.queryByText('Item 9')).toBeNull()

      // Simulate container resize to 400px
      act(() => {
        resizeCallback?.(
          [{ contentRect: { height: 400 } } as ResizeObserverEntry],
          {} as ResizeObserver,
        )
      })

      // With height=400 and overscan=1: floor((400)/50) + 1 = 9, endIdx = 9
      expect(screen.getByText('Item 9')).toBeDefined()
    })
  })

  describe('variable item heights', () => {
    it('renders items at correct positions with measureItem', () => {
      const varItems = Array.from({ length: 10 }, (_, i) => `Item ${i}`)
      const measureItem = (_item: string, index: number) => (index % 2 === 0 ? 40 : 80)

      render(
        <VirtualList
          items={varItems}
          renderItem={(item) => <div>{item}</div>}
          itemHeight={40}
          height={200}
          overscan={0}
          measureItem={measureItem}
        />,
      )

      // All 10 items visible (total height = 5*40 + 5*80 = 600, container=200, but overscan=0)
      // offsets: 0,40,120,160,240,280,360,400,480,520,600
      // scrollTop=0, containerHeight=200: items 0-3 visible (offsets[4]=240 > 200)
      expect(screen.getByText('Item 0')).toBeDefined()
      expect(screen.getByText('Item 3')).toBeDefined()
      expect(screen.queryByText('Item 5')).toBeNull()
    })
  })
})
