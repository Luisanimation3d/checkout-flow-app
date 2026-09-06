import { useEffect } from 'react'
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { useFetch } from '@/hooks/useFetch'
import type { Product } from '@/types/product'
import { API_URL } from '@/utils/apiUrl'
import styles from './PLP.module.scss'

const SKELETON_COUNT = 6

export const PLP = () => {
  const { data: products, loading, error, get } = useFetch<Product[]>(API_URL)

  useEffect(() => {
    get('/products').catch(() => {})
  }, [get])

  return (
    <div className={styles.plp}>
      <header className={styles.plp__header}>
        <h1 className={styles.plp__title}>Tienda</h1>
        <p className={styles.plp__subtitle}>
          {loading ? 'Cargando productos…' : `${products?.length ?? 0} productos disponibles`}
        </p>
      </header>

      {error && <p className={styles.plp__error}>No pudimos cargar los productos. Intenta de nuevo.</p>}

      <div className={styles.plp__grid}>
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => <ProductCardSkeleton key={index} />)
          : products?.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  )
}
