import { TimelineEvent, CATEGORY_LABELS } from '@/types'

export function exportJSON(events: TimelineEvent[]) {
  const data = JSON.stringify(events, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `timeline-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportPDF(events: TimelineEvent[]) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))

  const rows = sorted.map(e => `
    <div class="event">
      <div class="event-date">${new Date(e.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="event-category">${CATEGORY_LABELS[e.category]}</div>
      <div class="event-title">${e.title}</div>
      ${e.description ? `<div class="event-desc">${e.description}</div>` : ''}
    </div>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Ma Timeline</title>
  <style>
    body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; color: #111; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 40px; font-size: 14px; }
    .event { border-left: 3px solid #333; padding: 12px 0 12px 20px; margin-bottom: 20px; }
    .event-date { font-size: 12px; color: #888; margin-bottom: 2px; }
    .event-category { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-bottom: 4px; }
    .event-title { font-size: 17px; font-weight: 600; margin-bottom: 4px; }
    .event-desc { font-size: 14px; color: #444; line-height: 1.5; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>Ma Timeline</h1>
  <div class="subtitle">Exporté le ${new Date().toLocaleDateString('fr-FR')} — ${events.length} événements</div>
  ${rows}
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
