'use client'

import { useState, useRef, useEffect } from 'react'
import { TimelineEvent } from '@/types'
import { exportJSON, exportPDF } from '@/lib/export'

interface ExportMenuProps {
  events: TimelineEvent[]
}

export function ExportMenu({ events }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
      >
        Exporter
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-lg z-10 min-w-[140px]">
          <button
            onClick={() => { exportJSON(events); setOpen(false) }}
            className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            JSON
          </button>
          <button
            onClick={() => { exportPDF(events); setOpen(false) }}
            className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors border-t border-zinc-800"
          >
            PDF
          </button>
        </div>
      )}
    </div>
  )
}
