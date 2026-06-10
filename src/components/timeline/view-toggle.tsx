'use client'

type View = 'list' | 'graph'

interface ViewToggleProps {
  view: View
  onChange: (view: View) => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
      <button
        onClick={() => onChange('list')}
        className={`px-3 py-1 rounded text-xs transition-colors ${
          view === 'list' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        Liste
      </button>
      <button
        onClick={() => onChange('graph')}
        className={`px-3 py-1 rounded text-xs transition-colors ${
          view === 'graph' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        Graphique
      </button>
    </div>
  )
}
