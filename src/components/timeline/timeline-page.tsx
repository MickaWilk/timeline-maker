'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TimelineEvent, TimelineEventInsert, CATEGORY_LABELS, CATEGORY_COLORS, Category } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EventDialog } from './event-dialog'
import { ExportMenu } from './export-menu'
import { ViewToggle } from './view-toggle'
import { TimelineGraph } from './timeline-graph'
import { createClient } from '@/lib/supabase/client'

interface TimelinePageProps {
  initialEvents: TimelineEvent[]
  userId: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function TimelinePage({ initialEvents, userId }: TimelinePageProps) {
  const router = useRouter()
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [view, setView] = useState<'list' | 'graph'>('list')

  const filtered = activeCategory === 'all'
    ? events
    : events.filter(e => e.category === activeCategory)

  function sortByDate(list: TimelineEvent[]) {
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }

  async function handleSave(data: TimelineEventInsert) {
    const supabase = createClient()
    if (editingEvent) {
      setEvents(prev => sortByDate(prev.map(e =>
        e.id === editingEvent.id ? { ...e, ...data, updated_at: new Date().toISOString() } : e
      )))
      await supabase.from('timeline_events').update(data).eq('id', editingEvent.id)
    } else {
      const newEvent: TimelineEvent = {
        id: crypto.randomUUID(),
        user_id: userId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setEvents(prev => sortByDate([...prev, newEvent]))
      await supabase.from('timeline_events').insert({ ...data, user_id: userId })
    }
    setDialogOpen(false)
    setEditingEvent(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    setEvents(prev => prev.filter(e => e.id !== id))
    await supabase.from('timeline_events').delete().eq('id', id)
    router.refresh()
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ma timeline</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-zinc-400 text-sm">{events.length} événements</p>
              <button
                onClick={handleSignOut}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportMenu events={events} />
            <div className="hidden sm:block">
              <ViewToggle view={view} onChange={setView} />
            </div>
            <Button onClick={() => { setEditingEvent(null); setDialogOpen(true) }}>
              + Ajouter
            </Button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeCategory === 'all'
                ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            Tout
          </button>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {view === 'graph' ? (
          <TimelineGraph events={filtered} activeCategory={activeCategory} />
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-zinc-800" />

            <div className="space-y-6">
              {filtered.map(event => (
                <div key={event.id} className="relative pl-10">
                  {/* Dot */}
                  <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-zinc-400" />
                  </div>

                  {/* Card */}
                  <div className="group bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-500 mb-1">{formatDate(event.date)}</p>
                        <h3 className="font-medium text-zinc-100 leading-snug">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{event.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-xs ${CATEGORY_COLORS[event.category]}`}>
                        {CATEGORY_LABELS[event.category]}
                      </Badge>
                    </div>

                    {/* Actions (visible on hover) */}
                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingEvent(event); setDialogOpen(true) }}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="pl-10 text-zinc-500 text-sm py-8">
                  Aucun événement dans cette catégorie.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        onSave={handleSave}
      />
    </div>
  )
}
