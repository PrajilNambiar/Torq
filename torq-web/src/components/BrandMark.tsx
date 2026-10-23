import sharkIcon from '../Images/Icons/shark-favicon-64x64.png'

type BrandMarkProps = {
  size?: number
  className?: string
}

/**
 * TORQ shark brand mark used in nav, auth, and footer.
 */
export function BrandMark({ size = 18, className }: BrandMarkProps) {
  return (
    <img
      src={sharkIcon}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      draggable={false}
    />
  )
}
