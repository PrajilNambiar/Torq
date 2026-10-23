type TickIconProps = {
  size?: number
  stroke?: string
  strokeWidth?: number
  className?: string
}

/**
 * Reusable tick / checkmark icon used throughout the project.
 * Defaults to inheriting the current text colour so it blends naturally
 * inside badges, lists and checklist items.
 */
export function TickIcon({ size = 16, stroke = 'currentColor', strokeWidth = 1.5, className }: TickIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      className={className}
    >
      <polyline points="2.75 8.75,6.25 12.25,13.25 4.75" />
    </svg>
  )
}
