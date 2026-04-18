'use client'

import { useEffect, useState } from 'react'
import { TimelineEvent, Category, CATEGORY_LABELS } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: TimelineEvent | null
  onSave: (data: Omit<TimelineEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
}

const DEFAULT_CATEGORY: Category = 'personnel'

export function EventDialog({ open, onOpenChange, event, onSave }: EventDialogProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDate(event.date)
      setDescription(event.description ?? '')
      setCategory(event.category)
    } else {
      setTitle('')
      setDate(new Date().toISOString().split('T')[0])
      setDescription('')
      setCategory(DEFAULT_CATEGORY)
    }
  }, [event, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date) return
    onSave({ title: title.trim(), date, description: description.trim() || null, category })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? 'Modifier' : 'Nouvel événement'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Date</label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Titre</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Début chez Onepoint"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Catégorie</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    category === cat
                      ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Description (optionnel)</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Contexte, détails..."
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400">
              Annuler
            </Button>
            <Button type="submit">
              {event ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
