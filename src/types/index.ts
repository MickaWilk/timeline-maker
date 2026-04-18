export type Category =
  | 'pro'
  | 'personnel'
  | 'formation'
  | 'famille'
  | 'voyage'
  | 'créatif'
  | 'intime'

export interface TimelineEvent {
  id: string
  user_id: string
  date: string // ISO date string
  title: string
  description: string | null
  category: Category
  created_at: string
  updated_at: string
}

export type TimelineEventInsert = Omit<TimelineEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type TimelineEventUpdate = Partial<TimelineEventInsert>

export const CATEGORY_LABELS: Record<Category, string> = {
  pro: 'Pro',
  personnel: 'Personnel',
  formation: 'Formation',
  famille: 'Famille',
  voyage: 'Voyage',
  créatif: 'Créatif',
  intime: 'Intime',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  pro: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  personnel: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  formation: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  famille: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  voyage: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  créatif: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  intime: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
}
