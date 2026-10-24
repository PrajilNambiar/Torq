import type { ReactNode } from 'react'
import { SERVICE_CATEGORIES } from '../../types/enums'
import type { SelectOption } from './Select'

function CatIcon({ children }: { children: ReactNode }) {
  return (
    <span className="cat-select-icon" aria-hidden>
      {children}
    </span>
  )
}

const icons: Record<(typeof SERVICE_CATEGORIES)[number], ReactNode> = {
  'Influencer marketing': (
    <CatIcon>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4 20a8 8 0 0 1 16 0" strokeLinecap="round" />
        <path d="M17 4h3M18.5 2.5v3" strokeLinecap="round" />
      </svg>
    </CatIcon>
  ),
  'UGC / content creation': (
    <CatIcon>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="14" height="12" rx="2" />
        <path d="m17 10 4-2v8l-4-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </CatIcon>
  ),
  'Social media management': (
    <CatIcon>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 10h8M8 14h5" strokeLinecap="round" />
      </svg>
    </CatIcon>
  ),
  'Paid advertising': (
    <CatIcon>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12h3l3-7 4 14 3-7h3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </CatIcon>
  ),
}

const descriptions: Record<(typeof SERVICE_CATEGORIES)[number], string> = {
  'Influencer marketing': 'Creators who reach your audience',
  'UGC / content creation': 'Reels, shorts, product shoots',
  'Social media management': 'Calendars, posting, community',
  'Paid advertising': 'Meta, Google and paid media',
}

/** Ready-to-use options for marketing / service category selects. */
export function serviceCategoryOptions(): SelectOption<string>[] {
  return SERVICE_CATEGORIES.map((c) => ({
    value: c,
    label: c,
    description: descriptions[c],
    icon: icons[c],
  }))
}
