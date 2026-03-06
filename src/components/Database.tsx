import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Database as DbIcon, ChevronUp, ChevronDown, Filter } from 'lucide-react'
import { projects } from '../data/projects'
import type { Project } from '../data/types'

type SortKey = 'naam' | 'prijs.min' | 'units.totaal' | 'competitieveScore' | 'oplevering'

function getValue(p: Project, key: SortKey): string | number {
  switch (key) {
    case 'naam': return p.naam
    case 'prijs.min': return p.prijs.min
    case 'units.totaal': return p.units.totaal
    case 'competitieveScore': return p.competitieveScore
    case 'oplevering': return p.oplevering
  }
}

function formatPrice(n: number) {
  return `€${n.toLocaleString('nl-BE')}`
}

const columns: { key: SortKey; label: string }[] = [
  { key: 'naam', label: 'Project' },
  { key: 'prijs.min', label: 'Instapprijs' },
  { key: 'units.totaal', label: 'Units' },
  { key: 'competitieveScore', label: 'Score' },
  { key: 'oplevering', label: 'Oplevering' },
]

export default function Database() {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState<SortKey>('competitieveScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterCandor, setFilterCandor] = useState<'alle' | 'candor' | 'concurrent'>('alle')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = projects.filter(p => {
    if (filterCandor === 'candor') return p.isCandor
    if (filterCandor === 'concurrent') return !p.isCandor
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const av = getValue(a, sortKey)
    const bv = getValue(b, sortKey)
    const cmp = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv), 'nl')
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div className="px-4 pt-2 pb-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <DbIcon size={22} className="text-candor-teal" />
          <h1 className="text-xl font-bold text-white">Database</h1>
        </div>
        <p className="text-white/50 text-sm">{projects.length} projecten — Gent studentenvastgoed</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter size={14} className="text-white/40" />
        {(['alle', 'candor', 'concurrent'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterCandor(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterCandor === f
                ? 'bg-candor-teal text-white'
                : 'bg-white/5 text-white/50 border border-candor-border'
            }`}
          >
            {f === 'alle' ? 'Alle' : f === 'candor' ? 'Candor' : 'Concurrenten'}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-candor-border">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="p-3 text-left text-xs text-white/50 font-semibold uppercase tracking-wide cursor-pointer hover:text-white/80 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronUp size={12} />
                        : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/project/${p.id}`)}
                className={`border-b border-candor-border/50 cursor-pointer hover:bg-white/5 transition-colors ${
                  p.isCandor ? 'border-l-2 border-l-candor-teal' : ''
                }`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{p.naam}</span>
                    {p.isCandor && <span className="badge-candor">Candor</span>}
                  </div>
                  <div className="text-white/40 text-xs">{p.locatie.stad}</div>
                </td>
                <td className="p-3 num text-white text-sm">{formatPrice(p.prijs.min)}</td>
                <td className="p-3 num text-white text-sm">{p.units.totaal}</td>
                <td className="p-3 num text-sm">
                  <span className={
                    p.competitieveScore >= 4 ? 'text-candor-green' :
                    p.competitieveScore >= 3 ? 'text-candor-orange' : 'text-candor-red'
                  }>
                    {p.competitieveScore}/5
                  </span>
                </td>
                <td className="p-3 text-white/70 text-sm">{p.oplevering}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {/* Sort controls */}
        <div className="flex gap-1 flex-wrap">
          {columns.slice(1).map(col => (
            <button
              key={col.key}
              onClick={() => handleSort(col.key)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                sortKey === col.key
                  ? 'bg-candor-teal/20 text-candor-teal border border-candor-teal/30'
                  : 'bg-white/5 text-white/40 border border-candor-border'
              }`}
            >
              {col.label}
              {sortKey === col.key && (
                sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
              )}
            </button>
          ))}
        </div>

        {sorted.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/project/${p.id}`)}
            className={`card p-4 text-left w-full ${p.isCandor ? 'border-l-2 border-l-candor-teal' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{p.naam}</span>
                  {p.isCandor && <span className="badge-candor">Candor</span>}
                </div>
                <div className="text-white/40 text-xs">{p.locatie.wijk ?? p.locatie.stad}</div>
              </div>
              <div className="text-right">
                <div className="num text-candor-teal font-bold text-sm">{formatPrice(p.prijs.min)}</div>
                <div className={`num text-xs ${
                  p.competitieveScore >= 4 ? 'text-candor-green' :
                  p.competitieveScore >= 3 ? 'text-candor-orange' : 'text-candor-red'
                }`}>
                  Score {p.competitieveScore}/5
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className="num">{p.units.totaal} units</span>
              <span>·</span>
              <span>{p.oplevering}</span>
              <span>·</span>
              <span>{p.verkoopStatus}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
