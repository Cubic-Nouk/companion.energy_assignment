import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

import { TEST_ELEMENT_WIDTH } from './constants'

/** jsdom has no ResizeObserver: report a fixed width once, when an element starts being observed. */
class ResizeObserverStub implements ResizeObserver {
  private readonly callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    const entry = { target, contentRect: { width: TEST_ELEMENT_WIDTH } } as ResizeObserverEntry
    this.callback([entry], this)
  }

  unobserve() {
    // Nothing to stop: the stub never reports again.
  }

  disconnect() {
    // Nothing to stop: the stub never reports again.
  }
}

globalThis.ResizeObserver = ResizeObserverStub

/**
 * React Flow reads the viewport scale from a DOMMatrix, which jsdom lacks; this stub parses the
 * scale from the transform, as React Flow's testing guide suggests.
 */
class DOMMatrixReadOnlyStub {
  readonly m22: number

  constructor(transform?: string) {
    const scale = /scale\(([\d.]+)\)/.exec(transform ?? '')?.[1]
    this.m22 = scale === undefined ? 1 : Number(scale)
  }
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'DOMMatrixReadOnly', { value: DOMMatrixReadOnlyStub })
}

// Radix Select calls these pointer and scroll APIs, which jsdom does not implement. Guarded: the
// generator tests run in plain Node, with no DOM at all.
if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => undefined
  Element.prototype.scrollIntoView = () => undefined
}

// A full page (six charts, lazy chunks) can take over the 1 s default to settle when every test
// file runs in parallel, as on CI. Waits still end as soon as the element appears.
configure({ asyncUtilTimeout: 3000 })

// Testing Library only auto-unmounts when Vitest globals are enabled; they are not here.
afterEach(() => {
  cleanup()
})
