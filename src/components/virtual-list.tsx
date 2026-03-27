'use client'

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from 'react'

export interface VirtualListHandle {
  scrollToIndex: (index: number) => void
}

export interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  height: number
  overscan?: number
  measureItem?: (item: T, index: number) => number
}

function VirtualListInner<T>(
  { items, renderItem, itemHeight, height, overscan = 5, measureItem }: VirtualListProps<T>,
  ref: React.Ref<VirtualListHandle>,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(height)

  // Cumulative offsets for variable height: offsets[i] = top of item i, offsets[n] = total height
  const offsets = useMemo<number[] | null>(() => {
    if (!measureItem) return null
    const result: number[] = [0]
    for (let i = 0; i < items.length; i++) {
      result.push(result[i] + measureItem(items[i], i))
    }
    return result
  }, [items, measureItem])

  const totalHeight = offsets ? offsets[items.length] : items.length * itemHeight

  const { startIdx, endIdx } = useMemo(() => {
    if (items.length === 0) return { startIdx: 0, endIdx: -1 }

    if (offsets) {
      // Binary search: find first item whose bottom > scrollTop
      let lo = 0
      let hi = items.length - 1
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2)
        if (offsets[mid + 1] <= scrollTop) lo = mid + 1
        else hi = mid
      }
      const firstVisible = lo
      const start = Math.max(0, firstVisible - overscan)

      let last = firstVisible
      while (last < items.length && offsets[last] < scrollTop + containerHeight) {
        last++
      }
      const end = Math.min(items.length - 1, last - 1 + overscan)

      return { startIdx: start, endIdx: end }
    } else {
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
      const end = Math.min(
        items.length - 1,
        Math.floor((scrollTop + containerHeight) / itemHeight) + overscan,
      )
      return { startIdx: start, endIdx: end }
    }
  }, [scrollTop, containerHeight, items.length, itemHeight, overscan, offsets])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Track container height changes via ResizeObserver
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex(index: number) {
        const el = containerRef.current
        if (!el) return
        const clamped = Math.max(0, Math.min(index, items.length - 1))
        el.scrollTop = offsets ? offsets[clamped] : clamped * itemHeight
      },
    }),
    [items.length, itemHeight, offsets],
  )

  const renderedItems: React.ReactNode[] = []
  for (let i = startIdx; i <= endIdx; i++) {
    const top = offsets ? offsets[i] : i * itemHeight
    const h = offsets ? offsets[i + 1] - offsets[i] : itemHeight
    renderedItems.push(
      <div key={i} style={{ position: 'absolute', top, left: 0, right: 0, height: h }}>
        {renderItem(items[i], i)}
      </div>,
    )
  }

  return (
    <div
      ref={containerRef}
      style={{ height, overflow: 'auto', position: 'relative' }}
      onScroll={handleScroll}
      data-testid="virtual-list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>{renderedItems}</div>
    </div>
  )
}

export const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<VirtualListHandle> },
) => React.ReactElement | null
