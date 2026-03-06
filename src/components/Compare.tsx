import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, CheckSquare, Square, Trophy } from 'lucide-react'
import { projects } from '../data/projects'
import type { Project } from '../data/types'

function formatPrice(n: number) {
  return `€${n.toLocaleString('nl-BE')}`
}

interface Row {
  label: string
  getValue: (p: Project) => string | number | null
  betterIsLower?: boolean
  format?: (v: string | number | null) => string
}

const rows: Row[] = [
  {
    label: 'Instapprijs',
    getValue: p => p.prijs.min,
    betterIsLower: true,
    format: v => (v ? formatPrice(v as number) : '—'),
  },
  {
    label: 'Max prijs',
    getValue: p => p.prijs.max ?? null,
    betterIsLower: true,
    format: v => (v ? formatPrice(v as number) : '—'),
  },
  {
    label: 'Fiscaal regime',
    getValue: p => p.fiscaalRegime,
    format: v => String(v ?? '—'),
  },
  {
    label: 'Totaal units',
    getValue: p => p.units.totaal,
    betterIsLower: false,
    format: v => String(v ?? '—'),
  },
  {
    label: 'Opp. min',
    getValue: p => p.units.oppervlakteMin,
    format: v => (v ? `${v}m²` : '—'),
  },
  {
    label: 'Oplevering',
    getValue: p => p.oplevering,
    format: v => String(v ?? '—'),
  },
  {
    label: 'Bruto rendement',
    getValue: p => p.rendement.bruto ?? null,
    format: v => String(v ?? '—'),
  },
  {
    label: 'Huurgarantie',
    getValue: p => (p.rendement.garantie === true ? 'Ja' : p.rendement.garantie === false ? 'Nee' : String(p.rendement.garantie)),
    format: v => String(v ?? '—'),
  },
  {
    label: 'Beheerder',
    getValue: p => p.beheer.partner,
    format: v => String(v ?? '—'),
  },
  {
    label: 'Pooling',
    getValue: p => (p.beheer.pooling === true ? 'Ja' : p.beheer.pooling === false ? 'Nee' : '—'),
    format: v => String(v ?? '—'),
  },
  {
    label: 'Locatie score',
    getValue: p => p.competitieveScore,
    betterIsLower: false,
    format: v => `${v}/5`,
  },
  {
    label: 'Locatie',
    getValue: p => `${p.locatie.wijk ?? p.locatie.stad}`,
    format: v => String(v ?? '—'),
  },
  {
    label: 'Ontwikkelaar',
    getValue: p => p.ontwikkelaar.naam,
    format: v => String(v ?? '—'),
  },
  {
    label: 'Ervaring',
    getValue: p => p.ontwikkelaar.ervaring,
    format: v => String(v ?? '—'),
  },
  {
    label: 'Verkoop status',
    getValue: p => p.verkoopStatus,
    format: v => String(v ?? '—'),
  },
]

function findWinner(row: Row, selected: Project[]): string | null {
  if (row.betterIsLower === undefined) return null
  const values = selected.map(p => ({ id: p.id, val: row.getValue(p) }))
  const numericVals = values.filter(v => typeof v.val === 'number') as { id: string; val: number }[]
  if (numericVals.length < 2) return null
  const winner = numericVals.reduce((best, cur) =>
    row.betterIsLower ? (cur.val < best.val ? cur : best) : (cur.val > best.val ? cur : best)
  )
  return winner.id
}

export default function Compare() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  function toggleProject(id: string) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    )
  }

  // Candor altijd eerst in vergelijking
  const selected = [
    ...projects.filter(p => p.isCandor && selectedIds.includes(p.id)),
    ...projects.filter(p => !p.isCandor && selectedIds.includes(p.id)),
  ]

  return (
    <div className="px-4 pt-2 pb-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={22} className="text-candor-teal" />
          <h1 className="text-xl font-bold text-white">Vergelijken</h1>
        </div>
        <p className="text-white/50 text-sm">Kies 2–4 projecten om te vergelijken</p>
      </div>

      {/* Project selector */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {projects.map(p => {
          const isSelected = selectedIds.includes(p.id)
          return (
            <button
              key={p.id}
              onClick={() => toggleProject(p.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-colors ${
                isSelected
                  ? 'bg-candor-teal/15 border-candor-teal text-candor-teal'
                  : 'bg-white/5 border-candor-border text-white/60'
              }`}
            >
              {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{p.naam}</div>
                {p.isCandor && <div className="text-xs text-candor-teal/70">Candor</div>}
              </div>
            </button>
          )
        })}
      </div>

      {selected.length < 2 && (
        <div className="text-center py-12 text-white/30">
          <BarChart2 size={40} className="mx-auto mb-2 opacity-30" />
          <p>Selecteer minstens 2 projecten om te vergelijken</p>
        </div>
      )}

      {/* Comparison table */}
      {selected.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          {/* Header row */}
          <div className="flex border-b border-candor-border">
            <div className="w-28 shrink-0 p-3 text-xs text-white/40 font-semibold uppercase">
              Kenmerk
            </div>
            {selected.map(p => (
              <div
                key={p.id}
                className={`flex-1 p-3 min-w-0 border-l ${
                  p.isCandor ? 'border-l-candor-teal/50 bg-candor-teal/5' : 'border-candor-border'
                }`}
              >
                <div className="font-bold text-white text-sm truncate">{p.naam}</div>
                {p.isCandor && <div className="text-xs text-candor-teal">Candor</div>}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {rows.map((row, ri) => {
            const winnerId = findWinner(row, selected)
            return (
              <div
                key={row.label}
                className={`flex border-b border-candor-border/50 ${ri % 2 === 0 ? 'bg-white/2' : ''}`}
              >
                <div className="w-28 shrink-0 p-3 text-xs text-white/40 self-center leading-tight">
                  {row.label}
                </div>
                {selected.map(p => {
                  const val = row.getValue(p)
                  const formatted = row.format ? row.format(val) : String(val ?? '—')
                  const isWinner = winnerId === p.id
                  return (
                    <div
                      key={p.id}
                      className={`flex-1 p-3 min-w-0 border-l text-sm font-medium ${
                        p.isCandor ? 'border-l-candor-teal/30' : 'border-candor-border/50'
                      } ${isWinner ? 'text-candor-green' : 'text-white/75'}`}
                    >
                      <div className="flex items-center gap-1">
                        {isWinner && <Trophy size={10} className="text-candor-green shrink-0" />}
                        <span className="num leading-tight">{formatted}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
