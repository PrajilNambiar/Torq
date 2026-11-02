type IconProps = {
  size?: number
  className?: string
}

function baseProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
    className,
  }
}

export function IconHome({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  )
}

export function IconSearch({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function IconBriefcase({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  )
}

export function IconMegaphone({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M3 11v2a2 2 0 0 0 2 2h1l4 4V5L6 9H5a2 2 0 0 0-2 2Z" />
      <path d="M15 9.5a4.5 4.5 0 0 1 0 5" />
      <path d="M17.5 7a8 8 0 0 1 0 10" />
    </svg>
  )
}

export function IconUser({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

export function IconLayers({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  )
}

export function IconImage({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m21 16-5-5-8 8" />
    </svg>
  )
}

export function IconShare({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4" />
      <path d="m15.4 6.5-6.8 4" />
    </svg>
  )
}

export function IconFilePlus({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M12 11v6" />
      <path d="M9 14h6" />
    </svg>
  )
}

export function IconClipboard({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  )
}

export function IconCheckCircle({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  )
}

export function IconCurrency({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M9.5 9.5c.6-1 1.6-1.5 2.5-1.5 1.4 0 2.5.8 2.5 2s-1.1 2-2.5 2h-1c-1.4 0-2.5.8-2.5 2s1.1 2 2.5 2c.9 0 1.9-.5 2.5-1.5" />
    </svg>
  )
}

export function IconInbox({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M4 14 6.5 5h11L20 14" />
      <path d="M4 14h4l2 3h4l2-3h4v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" />
    </svg>
  )
}

export function IconShield({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function IconSpark({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="m6 6 2.5 2.5" />
      <path d="m15.5 15.5 2.5 2.5" />
      <path d="m18 6-2.5 2.5" />
      <path d="m8.5 15.5-2.5 2.5" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

export function IconAlert({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 4.3 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0Z" />
    </svg>
  )
}

export function IconQueue({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
    </svg>
  )
}

export function IconUsers({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 20a5 5 0 0 0 5.5-4.8" />
    </svg>
  )
}

export function IconFlag({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M5 21V4" />
      <path d="M5 4h11l-1.5 3.5L16 11H5" />
    </svg>
  )
}
