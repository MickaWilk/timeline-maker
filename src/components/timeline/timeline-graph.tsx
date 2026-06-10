'use client'

import { useState } from 'react'
import { TimelineEvent, Category } from '@/types'

const CATEGORY_HEX: Record<Category, string> = {
  pro: '#3b82f6',
  personnel: '#10b981',
  formation: '#8b5cf6',
  famille: '#f59e0b',
  voyage: '#06b6d4',
  créatif: '#ec4899',
  intime: '#6b7280',
}

interface TimelineGraphProps {
  events: TimelineEvent[]
  activeCategory: Category | 'all'
}

function formatDateFR(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function TimelineGraph({ events, activeCategory }: TimelineGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; event: TimelineEvent } | null>(null)

  const filtered = activeCategory === 'all'
    ? events
    : events.filter(e => e.category === activeCategory)

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-500 text-sm">
        Aucun événement dans cette catégorie.
      </div>
    )
  }

  // Temporal range: min date - 6 months, max date + 6 months
  const dates = filtered.map(e => new Date(e.date).getTime())
  const minTime = Math.min(...dates)
  const maxTime = Math.max(...dates)
  const margin = 6 * 30 * 24 * 60 * 60 * 1000 // 6 months in ms
  const startTime = minTime - margin
  const endTime = maxTime + margin
  const totalTimespan = endTime - startTime

  const padding = 48
  const svgHeight = 160
  const axisY = 80

  // Compute a responsive width: use a minimum of 800px, or 120px per event
  const minWidth = Math.max(800, filtered.length * 120)
  const totalWidth = minWidth

  function timeToX(time: number): number {
    return padding + ((time - startTime) / totalTimespan) * (totalWidth - 2 * padding)
  }

  // Generate year markers
  const startYear = new Date(startTime).getFullYear()
  const endYear = new Date(endTime).getFullYear()
  const years: number[] = []
  for (let y = startYear; y <= endYear; y++) {
    years.push(y)
  }

  function handleMouseEnter(e: React.MouseEvent<SVGCircleElement>, event: TimelineEvent) {
    const svgRect = e.currentTarget.closest('svg')!.getBoundingClientRect()
    const containerRect = e.currentTarget.closest('.timeline-graph-container')!.getBoundingClientRect()
    const circleX = e.currentTarget.cx.baseVal.value
    const circleY = e.currentTarget.cy.baseVal.value

    // Get scroll offset of the container
    const scrollLeft = (e.currentTarget.closest('.timeline-graph-container') as HTMLElement)
      .querySelector('.overflow-x-auto')
      ?.scrollLeft ?? 0

    setHoveredId(event.id)
    setTooltip({
      x: circleX - scrollLeft,
      y: circleY,
      event,
    })
  }

  function handleMouseLeave() {
    setHoveredId(null)
    setTooltip(null)
  }

  return (
    <div className="timeline-graph-container relative w-full">
      <div className="overflow-x-auto">
        <svg
          width={totalWidth}
          height={svgHeight}
          className="min-w-full block"
          style={{ background: '#09090b' }}
        >
          {/* Main axis */}
          <line
            x1={padding}
            x2={totalWidth - padding}
            y1={axisY}
            y2={axisY}
            stroke="#3f3f46"
            strokeWidth={1.5}
          />

          {/* Year markers */}
          {years.map(year => {
            const x = timeToX(new Date(year, 0, 1).getTime())
            if (x < padding || x > totalWidth - padding) return null
            return (
              <g key={year}>
                <line
                  x1={x}
                  x2={x}
                  y1={axisY - 40}
                  y2={axisY + 20}
                  stroke="#3f3f46"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={x}
                  y={axisY + 36}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize={11}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {year}
                </text>
              </g>
            )
          })}

          {/* Event circles */}
          {filtered.map(event => {
            const x = timeToX(new Date(event.date).getTime())
            const isHovered = hoveredId === event.id
            const r = isHovered ? 12 : 8
            const color = CATEGORY_HEX[event.category]
            return (
              <circle
                key={event.id}
                cx={x}
                cy={axisY}
                r={r}
                fill={color}
                opacity={hoveredId && !isHovered ? 0.4 : 1}
                stroke={isHovered ? '#ffffff' : color}
                strokeWidth={isHovered ? 2 : 0}
                style={{ cursor: 'pointer', transition: 'r 0.15s ease, opacity 0.15s ease' }}
                onMouseEnter={e => handleMouseEnter(e, event)}
                onMouseLeave={handleMouseLeave}
              />
            )
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-10 pointer-events-none bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl text-xs"
          style={{
            left: tooltip.x,
            top: tooltip.y - axisY + 16,
            transform: 'translateX(-50%) translateY(-100%)',
            whiteSpace: 'nowrap',
          }}
        >
          <p className="font-medium text-zinc-100">{tooltip.event.title}</p>
          <p className="text-zinc-400 mt-0.5">{formatDateFR(tooltip.event.date)}</p>
        </div>
      )}
    </div>
  )
}
