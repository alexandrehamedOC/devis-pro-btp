import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: number
  color?: string
}

export function Spinner({ size = 16, color = 'currentColor' }: SpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size, borderColor: `${color}33`, borderTopColor: color }}
      aria-hidden="true"
    />
  )
}
