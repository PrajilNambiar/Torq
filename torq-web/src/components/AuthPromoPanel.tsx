import { useEffect, useState } from 'react'
import { BrandMark } from './BrandMark'

type Slide = {
  title: string
  body: string
  cards: {
    tone: 'a' | 'b' | 'c'
    eyebrow: string
    dot?: 'cyan' | 'green'
    heading: string
    detail: string
    kind: 'bars' | 'milestones' | 'meter' | 'list'
  }[]
}

const slides: Slide[] = [
  {
    title: 'Where brands meet marketing talent',
    body: 'Post once, compare structured proposals, and run delivery through funded milestones — all in one workspace.',
    cards: [
      {
        tone: 'a',
        eyebrow: 'Open opportunities',
        heading: '24 matching briefs',
        detail: 'Influencer · UGC · Paid ads in your categories',
        kind: 'bars',
      },
      {
        tone: 'b',
        eyebrow: 'Active campaign',
        dot: 'cyan',
        heading: 'Café launch reels',
        detail: 'Milestones with approvals',
        kind: 'milestones',
      },
      {
        tone: 'c',
        eyebrow: 'Verification',
        dot: 'green',
        heading: 'Provider trust score',
        detail: 'Portfolio · services · social verified',
        kind: 'meter',
      },
    ],
  },
  {
    title: 'Compare proposals side by side',
    body: 'Every provider answers the same fields — price, scope, timeline, and revisions — so you can choose with confidence.',
    cards: [
      {
        tone: 'a',
        eyebrow: 'Proposal A',
        heading: '₹62,000 · 18 days',
        detail: '5 reels + 10 stories · 2 revisions',
        kind: 'list',
      },
      {
        tone: 'b',
        eyebrow: 'Proposal B',
        dot: 'cyan',
        heading: '₹48,500 · 21 days',
        detail: 'UGC pack · audience match 92%',
        kind: 'list',
      },
      {
        tone: 'c',
        eyebrow: 'Shortlist',
        dot: 'green',
        heading: '3 providers ready',
        detail: 'Verified · portfolio reviewed',
        kind: 'meter',
      },
    ],
  },
  {
    title: 'Funded milestones, not blind pay',
    body: 'Release payment only when you approve the work. Messages, files, and deadlines stay in one campaign space.',
    cards: [
      {
        tone: 'a',
        eyebrow: 'Escrow',
        heading: '₹80,000 secured',
        detail: 'Released on milestone approval',
        kind: 'bars',
      },
      {
        tone: 'b',
        eyebrow: 'Delivery',
        dot: 'cyan',
        heading: 'Week 2 assets',
        detail: 'Drafts uploaded · awaiting feedback',
        kind: 'milestones',
      },
      {
        tone: 'c',
        eyebrow: 'Status',
        dot: 'green',
        heading: 'On track',
        detail: 'Next review in 2 days',
        kind: 'meter',
      },
    ],
  },
  {
    title: 'Built for brands and providers',
    body: 'Businesses post structured briefs. Creators and agencies get matched work, clear scope, and reliable payouts.',
    cards: [
      {
        tone: 'a',
        eyebrow: 'For brands',
        heading: 'One brief, many offers',
        detail: 'Stop chasing DMs one by one',
        kind: 'list',
      },
      {
        tone: 'b',
        eyebrow: 'For providers',
        dot: 'cyan',
        heading: 'Relevant opportunities',
        detail: 'Matched to your categories',
        kind: 'bars',
      },
      {
        tone: 'c',
        eyebrow: 'Trust',
        dot: 'green',
        heading: 'Verified profiles',
        detail: 'Reviewed before you go live',
        kind: 'meter',
      },
    ],
  },
  {
    title: 'From brief to campaign close',
    body: 'Torq covers discovery, selection, delivery, and review — so marketing work doesn’t scatter across WhatsApp and email.',
    cards: [
      {
        tone: 'a',
        eyebrow: 'Pipeline',
        heading: 'Post → Propose → Select',
        detail: 'Clear stages for every campaign',
        kind: 'bars',
      },
      {
        tone: 'b',
        eyebrow: 'Workspace',
        dot: 'cyan',
        heading: 'Files & messages',
        detail: 'Everything tied to the campaign',
        kind: 'list',
      },
      {
        tone: 'c',
        eyebrow: 'Close',
        dot: 'green',
        heading: 'Approve & pay',
        detail: 'Then leave a review',
        kind: 'milestones',
      },
    ],
  },
]

function SlideCards({ cards }: { cards: Slide['cards'] }) {
  return (
    <div className="auth-promo-cards">
      {cards.map((card) => (
        <div key={`${card.tone}-${card.heading}`} className={`auth-float-card auth-float-card--${card.tone}`}>
          <div className="auth-float-card-head">
            <span className={`auth-float-dot ${card.dot ?? ''}`.trim()} />
            <span>{card.eyebrow}</span>
          </div>
          <strong>{card.heading}</strong>
          {card.kind === 'bars' && (
            <>
              <p>{card.detail}</p>
              <div className="auth-float-bars">
                <span style={{ width: '72%' }} />
                <span style={{ width: '48%' }} />
                <span style={{ width: '61%' }} />
              </div>
            </>
          )}
          {card.kind === 'milestones' && (
            <ul>
              <li>
                <span>Milestone 1</span>
                <em>Approved</em>
              </li>
              <li>
                <span>Milestone 2</span>
                <em className="pending">In review</em>
              </li>
            </ul>
          )}
          {card.kind === 'meter' && (
            <>
              <div className="auth-float-meter">
                <div style={{ width: '86%' }} />
              </div>
              <p>{card.detail}</p>
            </>
          )}
          {card.kind === 'list' && <p>{card.detail}</p>}
        </div>
      ))}
    </div>
  )
}

/** Right-hand marketing panel with auto-rotating carousel. */
export function AuthPromoPanel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = slides[index]

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 4500)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <aside
      className="auth-promo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Torq highlights"
    >
      <div className="auth-promo-glow" />
      <div className="auth-promo-grid" />

      <div className="auth-promo-stage" key={index}>
        <SlideCards cards={slide.cards} />
      </div>

      <div className="auth-promo-copy">
        <span className="auth-promo-mark">
          <BrandMark size={28} />
        </span>
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
        <div className="auth-promo-dots" role="tablist" aria-label="Carousel slides">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}: ${s.title}`}
              className={i === index ? 'active' : ''}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
