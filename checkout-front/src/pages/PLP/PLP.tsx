import { useEffect } from 'react'
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProducts } from '@/store/slices/productsSlice'
import styles from './PLP.module.scss'

const SKELETON_COUNT = 6

export const PLP = () => {
  const dispatch = useAppDispatch()
  const { items: products, listStatus, listError } = useAppSelector((state) => state.products)
  const loading = listStatus === 'loading' || listStatus === 'idle'

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  return (
    <div className={styles.plp}>
      <header className={styles.plp__header}>
        <h1 className={styles.plp__title}>Tienda</h1>
        <p className={styles.plp__subtitle}>
          {loading ? 'Cargando productos…' : `${products.length} productos disponibles`}
        </p>
      </header>

      {listError && <p className={styles.plp__error}>No pudimos cargar los productos. Intenta de nuevo.</p>}

      <div className={styles.plp__grid}>
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => <ProductCardSkeleton key={index} />)
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  )
}
