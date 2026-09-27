/** Width the ResizeObserver stub reports for every element; jsdom does no layout of its own. */
export const TEST_ELEMENT_WIDTH = 400

/** A lazy route compiles on first import in a test run, which can outlast the 1s default wait. */
export const LAZY_ROUTE_TIMEOUT = { timeout: 5000 }
