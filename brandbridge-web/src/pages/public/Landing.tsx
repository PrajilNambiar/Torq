import { useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { homeFor } from '../../auth/homeFor'

const steps = [
  ['Post', 'Describe your marketing need once.'],
  ['Discover', 'Verified providers see relevant briefs.'],
  ['Propose', 'Providers send structured proposals.'],
  ['Select', 'Compare side by side and choose.'],
  ['Deliver', 'Work runs through funded milestones.'],
  ['Close', 'Approve, pay and review.'],
]

const categories = [
  ['📣', 'Influencer marketing', 'Creators whose audience matches your city, language and niche.'],
  ['🎬', 'UGC & content creation', 'Reels, shorts, product shoots and scroll-stopping stories.'],
  ['📱', 'Social media management', 'Calendars, posting, community replies and monthly reports.'],
  ['🎯', 'Paid advertising', 'Meta and Google ads specialists who manage spend with care.'],
]

const pains = [
  ['DMing ten creators one by one', 'Publish one structured brief and let the right people come to you.'],
  ['Quotes you can’t compare', 'Every proposal uses the same fields: price, scope, timeline, revisions.'],
  ['Follower counts that prove nothing', 'Verification, portfolio evidence and reviews from real completed work.'],
  ['Paying up front and hoping', 'Milestone payments are released only when you approve the work.'],
  ['Chaos across WhatsApp and email', 'Messages, files, approvals and deadlines live in one campaign workspace.'],
]

const brandPerks = [
  'Post for free, compare for free',
  'Receive multiple proposals on one brief',
  'Pay only when you choose a provider',
  'Approve every milestone before money moves',
]

const providerPerks = [
  'Real, paid briefs matched to your skills',
  'No cold outreach — clients come to you',
  'Get paid milestone by milestone',
  'Build a verified reputation that wins future work',
]

const trust = [
  ['🛡️', 'Verified profiles', 'Badges say exactly what we checked — identity, portfolio or social ownership.'],
  ['💳', 'Milestone payments', 'Funds are committed up front and released per approved milestone.'],
  ['💬', 'On-platform chat', 'Phone numbers and emails stay private. Every conversation is on record.'],
  ['⚖️', 'Fair disputes', 'A clear evidence trail and a real team to resolve disagreements.'],
]

const faqs = [
  [
    'How much does BrandBridge cost?',
    'Posting a requirement and comparing proposals is free. A transparent platform fee applies only when you select a provider and the project goes ahead.',
  ],
  [
    'Who can offer services?',
    'Freelance marketers, creators, influencers, specialists and agencies. Every provider is reviewed by our team before they can send proposals.',
  ],
  [
    'How are payments protected?',
    'You fund the campaign when you accept a proposal. Money is released to the provider milestone by milestone, only after you approve the work.',
  ],
  [
    'Can I talk to providers before choosing?',
    'All communication happens inside BrandBridge so there’s always a record. Personal contact details are never shared.',
  ],
  [
    'What if something goes wrong?',
    'Either side can open a dispute from the campaign workspace. Our team reviews the brief, messages, deliverables and approvals before deciding.',
  ],
  [
    'Which categories are available?',
    'We’re starting with influencer marketing, UGC and content creation, social media management and paid advertising — with SEO, email, design and video coming next.',
  ],
]

const YEAR = new Date().getFullYear()

/** Adds `.in` to `.reveal` elements as they scroll into view. */
function useReveal() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const nodes = root.current?.querySelectorAll('.reveal') ?? []
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((n) => n.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
  return root
}

export function Landing() {
  const { user } = useAuth()
  const root = useReveal()
  if (user) return <Navigate to={homeFor(user.role)} replace />

  return (
    <div className="lp" ref={root}>
      <header className="landing-nav">
        <div className="brand">
          <span className="brand-mark">BB</span>
          <span>BrandBridge</span>
        </div>
        <nav className="lp-links" aria-label="Sections">
          <a href="#how">How it works</a>
          <a href="#brands">For brands</a>
          <a href="#providers">For providers</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="actions">
          <Link to="/login" className="btn ghost">
            Log in
          </Link>
          <Link to="/register" className="btn primary">
            Get started
          </Link>
        </div>
      </header>

      <section className="hero">
        <span className="eyebrow">✨ The marketing marketplace for growing brands</span>
        <h1>
          Post your marketing need once. Compare proposals. <span className="hl">Choose the right specialist.</span>
        </h1>
        <p className="muted">
          The bridge between brands that need marketing and the creators, marketers and agencies who can deliver it.
        </p>
        <div className="actions">
          <Link to="/register?role=business" className="btn primary large">
            I need marketing
          </Link>
          <Link to="/register?role=provider" className="btn ghost large">
            I offer marketing services
          </Link>
        </div>
        <ul className="hero-points">
          <li>✔ Free to post</li>
          <li>✔ Verified providers</li>
          <li>✔ Milestone-protected payments</li>
        </ul>
      </section>

      <section className="hero-preview reveal" aria-label="Example proposals">
        <div className="preview-head">
          <div>
            <strong>Create 5 Instagram reels for café launch</strong>
            <span className="muted small">₹50,000 – ₹80,000 · 4 weeks · Kochi</span>
          </div>
          <span className="badge info">3 proposals</span>
        </div>
        <div className="preview-cols">
          {[
            ['Food creator, Kochi', '₹60,000', '21 days', '2 revisions', false],
            ['Social agency', '₹75,000', '28 days', '3 revisions', true],
            ['UGC studio', '₹52,000', '18 days', '1 revision', false],
          ].map(([name, price, days, rev, star]) => (
            <div key={name as string} className={`preview-card ${star ? 'star' : ''}`}>
              <div className="preview-name">
                {name} <span className="badge success">✔ Verified</span>
              </div>
              <div className="preview-price">{price}</div>
              <div className="muted small">
                {days} · {rev}
              </div>
              <span className={`btn small ${star ? 'primary' : 'ghost'}`}>{star ? '★ Shortlisted' : '☆ Shortlist'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section reveal" id="how">
        <div className="lp-head">
          <span className="eyebrow">How it works</span>
          <h2>From brief to results in six simple steps</h2>
          <p className="muted">Every step is built around one loop: a clear need, serious options, a confident choice.</p>
        </div>
        <div className="steps">
          {steps.map(([title, text], i) => (
            <div key={title} className="step">
              <span className="step-no">{i + 1}</span>
              <strong>{title}</strong>
              <span className="muted">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section reveal">
        <div className="lp-head">
          <span className="eyebrow">What you can get done</span>
          <h2>The marketing help growing brands actually need</h2>
        </div>
        <div className="cat-grid">
          {categories.map(([icon, title, text]) => (
            <article key={title} className="cat">
              <span className="cat-icon" aria-hidden>
                {icon}
              </span>
              <strong>{title}</strong>
              <span className="muted small">{text}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section reveal">
        <div className="lp-head">
          <span className="eyebrow">Why BrandBridge</span>
          <h2>Marketing shouldn’t feel like a second job</h2>
          <p className="muted">We fixed the parts that make hiring marketing help slow, risky and confusing.</p>
        </div>
        <div className="pain-list">
          {pains.map(([before, after]) => (
            <div key={before} className="pain">
              <span className="pain-before">✕ {before}</span>
              <span className="pain-arrow" aria-hidden>
                →
              </span>
              <span className="pain-after">✔ {after}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section reveal">
        <div className="audience">
          <article className="aud brands" id="brands">
            <span className="eyebrow">For brands</span>
            <h3>Hire marketing talent without the guesswork</h3>
            <p className="muted">
              Shops, cafés, startups and D2C brands — tell us what you need in plain words and get comparable offers from
              people who’ve done it before.
            </p>
            <ul className="perks">
              {brandPerks.map((p) => (
                <li key={p}>✔ {p}</li>
              ))}
            </ul>
            <Link to="/register?role=business" className="btn primary">
              Post your first brief
            </Link>
          </article>
          <article className="aud providers" id="providers">
            <span className="eyebrow">For creators, marketers & agencies</span>
            <h3>Win work with your skills, not your cold emails</h3>
            <p className="muted">
              See real opportunities that match your categories, send a structured proposal, and build a reputation that
              brings the next client to you.
            </p>
            <ul className="perks">
              {providerPerks.map((p) => (
                <li key={p}>✔ {p}</li>
              ))}
            </ul>
            <Link to="/register?role=provider" className="btn ghost">
              Join as a provider
            </Link>
          </article>
        </div>
      </section>

      <section className="lp-section reveal">
        <div className="brief-wrap">
          <div>
            <span className="eyebrow">Simple for a shop owner</span>
            <h2>A brief anyone can write</h2>
            <p className="muted">
              No marketing jargon needed. Our guided form turns “I need some reels for my new menu” into a brief that
              providers can price accurately.
            </p>
            <Link to="/register?role=business" className="btn primary">
              Try the brief builder
            </Link>
          </div>
          <dl className="brief-card">
            {[
              ['Campaign', 'Create 5 Instagram reels for new café launch'],
              ['Goal', 'Reach local customers and increase store visits'],
              ['Audience', 'Age 18–35, within 15 km, food & lifestyle'],
              ['Language', 'Malayalam + English'],
              ['Deliverables', '5 reels, 10 stories, 1 collaboration post'],
              ['Budget', '₹50,000 – ₹80,000'],
              ['Timeline', '4 weeks'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="lp-section reveal">
        <div className="lp-head">
          <span className="eyebrow">Trust & safety</span>
          <h2>Built for trust before scale</h2>
          <p className="muted">Both sides are protected from the first message to the final payout.</p>
        </div>
        <div className="cat-grid">
          {trust.map(([icon, title, text]) => (
            <article key={title} className="cat">
              <span className="cat-icon" aria-hidden>
                {icon}
              </span>
              <strong>{title}</strong>
              <span className="muted small">{text}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section reveal" id="faq">
        <div className="lp-head">
          <span className="eyebrow">FAQ</span>
          <h2>Questions, answered</h2>
        </div>
        <div className="faq">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p className="muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta-band reveal">
        <h2>Post the need. Compare the talent. Build the brand.</h2>
        <p>Your next campaign is one brief away.</p>
        <div className="actions">
          <Link to="/register?role=business" className="btn light large">
            I need marketing
          </Link>
          <Link to="/register?role=provider" className="btn outline-light large">
            I offer marketing services
          </Link>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="brand">
          <span className="brand-mark">BB</span>
          <span>BrandBridge</span>
        </div>
        <span className="muted small">Where brands meet marketing talent.</span>
        <span className="muted small">© {YEAR} BrandBridge</span>
      </footer>
    </div>
  )
}
