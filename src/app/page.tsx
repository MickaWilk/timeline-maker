import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TimelinePage } from '@/components/timeline/timeline-page'
import { TimelineEvent } from '@/types'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: events } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return <TimelinePage initialEvents={(events ?? []) as TimelineEvent[]} userId={user.id} />
}
