import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { BREAKPOINTS } from '@/utils/breakpoints'
import styles from './Backdrop.module.scss'

const CLOSE_OFFSET_PX = 120
const CLOSE_VELOCITY_PX = 500

const SHEET_MOTION = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { type: 'spring', damping: 32, stiffness: 300 },
} as const

const DIALOG_MOTION = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: 'easeOut' },
} as const

interface BackdropProps {
  isOpen: boolean
  onClose: () => void
  content: ReactNode
  footer?: ReactNode
}

export const Backdrop = ({ isOpen, onClose, content, footer }: BackdropProps) => {
  const dragControls = useDragControls()
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.backdrop__sheet}
            onClick={(event) => event.stopPropagation()}
            {...(isDesktop ? DIALOG_MOTION : SHEET_MOTION)}
            drag={isDesktop ? false : 'y'}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > CLOSE_OFFSET_PX || info.velocity.y > CLOSE_VELOCITY_PX) {
                onClose()
              }
            }}
          >
            <div
              className={styles.backdrop__draggable}
              onPointerDown={(event) => !isDesktop && dragControls.start(event)}
            />

            <div className={styles.backdrop__content}>{content}</div>

            {footer && <div className={styles.backdrop__footer}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
