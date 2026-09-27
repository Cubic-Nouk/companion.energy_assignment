import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
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

// Radix Select calls these pointer and scroll APIs, which jsdom does not implement. Guarded: the
// generator tests run in plain Node, with no DOM at all.
if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => undefined
  Element.prototype.scrollIntoView = () => undefined
}

// Testing Library only auto-unmounts when Vitest globals are enabled; they are not here.
afterEach(() => {
  cleanup()
})
