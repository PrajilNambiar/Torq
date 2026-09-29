export function StatusChip({
  label,
  tone = 'default',
}: {
  label: string
  tone?: 'default' | 'teal' | 'amber' | 'danger'
}) {
  const cls =
    tone === 'teal'
      ? 'chip chip-teal'
      : tone === 'amber'
        ? 'chip chip-amber'
        : tone === 'danger'
          ? 'chip chip-danger'
          : 'chip'
  return <span className={cls}>{label}</span>
}
