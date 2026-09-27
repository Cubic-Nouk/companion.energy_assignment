/**
 * Writes data/futures.json from the seeded generator. Run with `npm run data:generate`.
 * The output is deterministic: running it twice gives the same file.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { generateFuturesFixture, serializeFixture } from './lib/futuresGenerator.ts'

const FIXTURE_PATH = fileURLToPath(new URL('../data/futures.json', import.meta.url))

const fixture = generateFuturesFixture()
writeFileSync(FIXTURE_PATH, serializeFixture(fixture))
process.stdout.write(
  `Wrote ${String(fixture.products.length)} products × ${String(fixture.tradingDays.length)} trading days to data/futures.json\n`,
)
