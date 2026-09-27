import { Card } from '../../components/Card/Card'
import { FuturesSmallMultiples } from '../../features/futures/chart/FuturesSmallMultiples'
import { queryFutures } from '../../api/futures'
import { MARKETS } from '../../features/futures/domain/catalogue'
import { FuturesFilterBar } from '../../features/futures/filters/FuturesFilterBar'
import { useFuturesFilters } from '../../features/futures/filters/useFuturesFilters'
import styles from './FuturesSection.module.css'

export function FuturesSection() {
  const [filters, setFilters] = useFuturesFilters()
  const products = queryFutures(filters)
  const hasQuotes = products.some((product) => product.quotes.length > 0)
  const marketLabel = MARKETS.find((market) => market.id === filters.market)?.label

  return (
    <>
      <FuturesFilterBar filters={filters} onChange={setFilters} />
      <Card title="Futures Market Data">
        {products.length === 0 ? (
          <p className={styles.empty}>No futures data for {marketLabel}.</p>
        ) : filters.profiles.size === 0 ? (
          <p className={styles.empty}>Select at least one profile to see prices.</p>
        ) : !hasQuotes ? (
          <p className={styles.empty}>No trading days in this period. Markets close at weekends.</p>
        ) : (
          // Keyed on the product set: a new granularity or market starts with no hovered day.
          <FuturesSmallMultiples
            key={`${filters.market}:${filters.granularity}`}
            products={products}
            profiles={filters.profiles}
          />
        )}
      </Card>
    </>
  )
}
