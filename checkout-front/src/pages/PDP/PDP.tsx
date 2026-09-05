import { useState } from 'react'
import { Header } from '@/components/Header'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductInfo } from '@/components/ProductInfo'
import { PurchaseButton } from '@/components/PurchaseButton'
import type { Product } from '@/types/product'
import styles from './PDP.module.scss'

const product: Product = {
  id: '1',
  title: 'Wireless Earbuds Pro',
  description:
    'Audífonos inalámbricos de última generación con cancelación activa de ruido (ANC) de doble micrófono, que bloquea el ruido ambiental para una experiencia de audio inmersiva. Su estuche de carga compacto ofrece hasta 30 horas de batería total (6 horas en los audífonos + 24 horas adicionales en el estuche), con carga rápida que te da 1 hora de uso con solo 10 minutos de carga. Resistencia al agua y sudor certificada IPX5, controles táctiles intuitivos, y conexión Bluetooth 5.3 de baja latencia, perfecta para llamadas, música y hasta gaming móvil sin retrasos perceptibles.',
  price: 189000,
  currency: 'COP',
  stock: 8,
  images: [
    'https://images.unsplash.com/photo-1783890848515-c0dc28b25ef2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHdpcmVsZXNzJTIwZWFyYnVkc3xlbnwwfDJ8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1783890848512-f5fa2dba2d5d?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  ],
}

export const PDP = () => {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className={styles.pdp}>
      <ProductGallery
        images={product.images}
        alt={product.title}
        overlay={
          <Header
            isFavorite={isFavorite}
            onToggleFavorite={() => setIsFavorite((prev) => !prev)}
          />
        }
      />

      <div className={styles.pdp__body}>
        <ProductInfo
          title={product.title}
          description={product.description}
          price={product.price}
          currency={product.currency}
          stock={product.stock}
        />

        <div className={styles.pdp__purchase}>
          <PurchaseButton>Pagar con tarjeta de crédito</PurchaseButton>
        </div>
      </div>
    </div>
  )
}
