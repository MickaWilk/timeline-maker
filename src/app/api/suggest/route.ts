import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { title, description } = await request.json()

  if (!title?.trim()) {
    return NextResponse.json({ category: null, sensitive: false })
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const prompt = `Tu analyses un événement de timeline de vie.
Titre : "${title}"
${description ? `Description : "${description}"` : ''}

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de texte autour) :
{
  "category": "<une de : pro, personnel, formation, famille, voyage, créatif, intime>",
  "confidence": <0.0 à 1.0>,
  "sensitive": <true si l'info est potentiellement sensible/intime/traumatique, false sinon>
}`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    // Haiku peut enrober le JSON en fences markdown - extraire le premier objet JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : text)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ category: null, sensitive: false })
  }
}
