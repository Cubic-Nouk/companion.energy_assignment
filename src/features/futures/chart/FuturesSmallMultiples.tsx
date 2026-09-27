import { useState } from 'react'

import { isBandShown, PROFILE_LABELS, type Profile } from '../domain/profiles'
import { sharedPriceDomain } from '../domain/scale'
import type { FuturesProduct, FuturesQuote } from '../domain/types'
import { formatPrice, formatTradingDay } from '../format'
import { FuturesMiniChart } from './FuturesMiniChart'
import styles from './FuturesSmallMultiples.module.css'
import { PROFILE_DASH } from './profileStyles'
import { seriesColor } from './seriesColors'

interface FuturesSmallMultiplesProps {
  products: readonly FuturesProduct[]
  profiles: ReadonlySet<Profile>
}

/**
 * One chart per delivery product on a shared price scale. Hovering any chart moves the crosshair
 * in all of them; the hovered date is shown once, above the grid, not in every chart.
 */
export function FuturesSmallMultiples({ products, profiles }: FuturesSmallMultiplesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const domain = sharedPriceDomain(products, profiles)
  const dayCount = products[0]?.quotes.length ?? 0
  // A hovered day from a longer range no longer exists once the range shrinks.
  const shownIndex = hoveredIndex !== null && hoveredIndex < dayCount ? hoveredIndex : dayCount - 1
  const shownDay = products[0]?.quotes[shownIndex]?.tradingDay

  return (
    <div className={styles.root}>
      <div className={styles.context}>
        {/* Not a live region: it changes on every pointer move. Each chart's label carries the day. */}
        <p className={styles.day}>
          {shownDay ? formatTradingDay(shownDay) : 'No trading days'}
          {hoveredIndex === null && <span className={styles.dayHint}>Latest trading day</span>}
        </p>
        <ChartKey profiles={profiles} />
      </div>

      <ul className={styles.grid}>
        {products.map((product, index) => {
          const quote = product.quotes[shownIndex]
          const color = seriesColor(index)
          return (
            <li key={product.id} className={styles.cell}>
              <figure className={styles.figure}>
                <figcaption className={styles.caption}>
                  <span className={styles.productLabel}>
                    <span
                      className={styles.swatch}
                      style={{ background: color }}
                      aria-hidden="true"
                    />
                    {product.label}
                  </span>
                  {quote && <QuoteSummary quote={quote} profiles={profiles} />}
                </figcaption>
                <FuturesMiniChart
                  product={product}
                  domain={domain}
                  profiles={profiles}
                  hoveredIndex={hoveredIndex}
                  onHoverIndexChange={setHoveredIndex}
                  label={chartLabel(product, quote, profiles)}
                  color={color}
                />
              </figure>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

interface QuoteSummaryProps {
  quote: FuturesQuote
  profiles: ReadonlySet<Profile>
}

function QuoteSummary({ quote, profiles }: QuoteSummaryProps) {
  const showBand = isBandShown(profiles)
  const low = Math.min(quote.peak, quote.offPeak)
  const high = Math.max(quote.peak, quote.offPeak)
  const lines = (['offPeak', 'peak'] as const).filter((profile) => profiles.has(profile))

  return (
    <span className={styles.summary}>
      {showBand && (
        <span className={styles.muted}>
          {formatPrice(low)}–{formatPrice(high)}
        </span>
      )}
      {!showBand &&
        lines.map((profile) => (
          <span key={profile} className={styles.muted}>
            {PROFILE_LABELS[profile]} {formatPrice(quote[profile])}
          </span>
        ))}
      {profiles.has('base') && <strong className={styles.value}>{formatPrice(quote.base)}</strong>}
    </span>
  )
}

function ChartKey({ profiles }: { profiles: ReadonlySet<Profile> }) {
  const showBand = isBandShown(profiles)

  return (
    <ul className={styles.key} aria-label="Chart key">
      {profiles.has('base') && (
        <li>
          <svg className={styles.keyGlyph} viewBox="0 0 20 10" aria-hidden="true">
            <line x1="1" x2="19" y1="5" y2="5" className={styles.keyLine} />
          </svg>
          Base
        </li>
      )}
      {showBand ? (
        <li>
          <svg className={styles.keyGlyph} viewBox="0 0 20 10" aria-hidden="true">
            <rect x="1" y="1" width="18" height="8" rx="2" className={styles.keyBand} />
          </svg>
          Off-Peak to Peak
        </li>
      ) : (
        (['peak', 'offPeak'] as const)
          .filter((profile) => profiles.has(profile))
          .map((profile) => (
            <li key={profile}>
              <svg className={styles.keyGlyph} viewBox="0 0 20 10" aria-hidden="true">
                <line
                  x1="1"
                  x2="19"
                  y1="5"
                  y2="5"
                  className={styles.keyLine}
                  strokeDasharray={PROFILE_DASH[profile]}
                />
              </svg>
              {PROFILE_LABELS[profile]}
            </li>
          ))
      )}
      <li className={styles.unit}>€/MWh</li>
    </ul>
  )
}

function chartLabel(
  product: FuturesProduct,
  quote: FuturesQuote | undefined,
  profiles: ReadonlySet<Profile>,
): string {
  if (!quote) return `${product.label}: no quotes`
  const values = (['offPeak', 'base', 'peak'] as const)
    .filter((profile) => profiles.has(profile))
    .map((profile) => `${PROFILE_LABELS[profile]} ${formatPrice(quote[profile])}`)
    .join(', ')
  return `${product.label} on ${formatTradingDay(quote.tradingDay)}: ${values} €/MWh`
}
