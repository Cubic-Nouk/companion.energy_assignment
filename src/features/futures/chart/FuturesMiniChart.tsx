import type { CSSProperties, PointerEvent } from 'react'

import { useElementWidth } from '../../../lib/useElementWidth'
import { isBandShown, PROFILES, type Profile } from '../domain/profiles'
import type { PriceDomain } from '../domain/scale'
import type { FuturesProduct } from '../domain/types'
import { formatShortDay } from '../format'
import styles from './FuturesMiniChart.module.css'
import {
  dayColumnX,
  dayIndexAt,
  priceY,
  stepBandPath,
  stepLinePath,
  type PlotArea,
} from './geometry'
import { PROFILE_DASH } from './profileStyles'

/** Inline style carrying the series colour to the CSS module as a custom property. */
type SeriesStyle = CSSProperties & { '--series-color': string }

const HEIGHT = 140
const PADDING = { top: 8, right: 8, bottom: 22, left: 32 }

interface FuturesMiniChartProps {
  product: FuturesProduct
  domain: PriceDomain
  profiles: ReadonlySet<Profile>
  hoveredIndex: number | null
  onHoverIndexChange: (index: number | null) => void
  label: string
  /** CSS colour of this product's marks. */
  color: string
}

export function FuturesMiniChart({
  product,
  domain,
  profiles,
  hoveredIndex,
  onHoverIndexChange,
  label,
  color,
}: FuturesMiniChartProps) {
  const [containerRef, width] = useElementWidth()
  const dayCount = product.quotes.length
  const area: PlotArea = {
    left: PADDING.left,
    top: PADDING.top,
    width: Math.max(0, width - PADDING.left - PADDING.right),
    height: HEIGHT - PADDING.top - PADDING.bottom,
  }
  const x = dayColumnX(area, dayCount)
  const y = priceY(area, domain)
  const series = (profile: Profile) => product.quotes.map((quote) => quote[profile])
  const showBand = isBandShown(profiles)

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const left = event.currentTarget.getBoundingClientRect().left
    onHoverIndexChange(dayIndexAt(event.clientX - left, area, dayCount))
  }

  const xLabelIndexes = [0, Math.floor((dayCount - 1) / 2), dayCount - 1]

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ height: HEIGHT, '--series-color': color } as SeriesStyle}
    >
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={label}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            onHoverIndexChange(null)
          }}
        >
          <g className={styles.grid}>
            {domain.ticks.map((tick) => (
              <line
                key={tick}
                x1={area.left}
                x2={area.left + area.width}
                y1={y(tick)}
                y2={y(tick)}
              />
            ))}
          </g>
          <g className={styles.axis}>
            {domain.ticks.map((tick) => (
              <text key={tick} x={area.left - 6} y={y(tick)} dy="0.32em" textAnchor="end">
                {tick}
              </text>
            ))}
            {xLabelIndexes.map((index) => {
              const quote = product.quotes[index]
              return quote ? (
                <text
                  key={index}
                  x={x.centre(index)}
                  y={HEIGHT - 6}
                  textAnchor={index === 0 ? 'start' : index === dayCount - 1 ? 'end' : 'middle'}
                >
                  {formatShortDay(quote.tradingDay)}
                </text>
              ) : null
            })}
          </g>

          {showBand && (
            <path
              className={styles.band}
              d={stepBandPath(
                product.quotes.map((q) => Math.min(q.peak, q.offPeak)),
                product.quotes.map((q) => Math.max(q.peak, q.offPeak)),
                x.start,
                y,
              )}
            />
          )}
          {PROFILES.filter((profile) => profiles.has(profile)).map((profile) => {
            // Inside a band, peak and off-peak are its edges rather than lines of their own.
            const isBandEdge = showBand && profile !== 'base'
            return (
              <path
                key={profile}
                className={isBandEdge ? styles.bandEdge : styles.line}
                d={stepLinePath(series(profile), x.start, y)}
                strokeDasharray={isBandEdge ? undefined : PROFILE_DASH[profile]}
              />
            )
          })}

          {hoveredIndex !== null && (
            <line
              className={styles.crosshair}
              x1={x.centre(hoveredIndex)}
              x2={x.centre(hoveredIndex)}
              y1={area.top}
              y2={area.top + area.height}
            />
          )}
        </svg>
      )}
    </div>
  )
}
