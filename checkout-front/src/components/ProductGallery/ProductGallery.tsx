import { useRef, useState } from 'react'
import type { ReactNode, TouchEvent } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { GlassIconButton } from '@/components/GlassIconButton'
import styles from './ProductGallery.module.scss'

const SWIPE_THRESHOLD_PX = 40

interface ProductGalleryProps {
  images: string[]
  alt: string
  overlay?: ReactNode
}

export const ProductGallery = ({ images, alt, overlay }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const goTo = (index: number) => {
    setActiveIndex((index + images.length) % images.length)
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    const deltaX = event.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) {
      goTo(activeIndex + (deltaX < 0 ? 1 : -1))
    }
    touchStartX.current = null
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.gallery__viewport}>
        {overlay && <div className={styles.gallery__overlay}>{overlay}</div>}

        <div
          className={styles.gallery__frame}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            key={images[activeIndex]}
            src={images[activeIndex]}
            alt={`${alt} - imagen ${activeIndex + 1}`}
            className={styles.gallery__image}
          />
        </div>

        {images.length > 1 && (
          <div className={styles.gallery__arrows}>
            <GlassIconButton
              icon={<FaChevronLeft />}
              aria-label="Imagen anterior"
              onClick={() => goTo(activeIndex - 1)}
            />
            <GlassIconButton
              icon={<FaChevronRight />}
              aria-label="Imagen siguiente"
              onClick={() => goTo(activeIndex + 1)}
            />
          </div>
        )}

        {images.length > 1 && (
          <div className={styles.gallery__thumbs}>
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                className={[
                  styles.gallery__thumb,
                  index === activeIndex && styles['gallery__thumb--active'],
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => goTo(index)}
                aria-label={`Ver imagen ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
