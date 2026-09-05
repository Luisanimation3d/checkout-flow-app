import { ProductCard } from '@/components/ProductCard'
import { PRODUCTS } from '@/utils/products'
import styles from './PLP.module.scss'

export const PLP = () => (
  <div className={styles.plp}>
    <header className={styles.plp__header}>
      <h1 className={styles.plp__title}>Tienda</h1>
      <p className={styles.plp__subtitle}>{PRODUCTS.length} productos disponibles</p>
    </header>

    <div className={styles.plp__grid}>
      {PRODUCTS.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
)
