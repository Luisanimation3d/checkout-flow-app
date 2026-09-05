import { FaArrowLeft, FaHeart, FaRegHeart } from 'react-icons/fa'
import { GlassIconButton } from '@/components/GlassIconButton'
import styles from './Header.module.scss'

interface HeaderProps {
  isFavorite: boolean
  onBack?: () => void
  onToggleFavorite: () => void
}

export const Header = ({ isFavorite, onBack, onToggleFavorite }: HeaderProps) => (
  <div className={styles.header}>
    <GlassIconButton icon={<FaArrowLeft />} aria-label="Volver" onClick={onBack} />
    <GlassIconButton
      icon={isFavorite ? <FaHeart /> : <FaRegHeart />}
      active={isFavorite}
      aria-label="Guardar en favoritos"
      onClick={onToggleFavorite}
    />
  </div>
)
