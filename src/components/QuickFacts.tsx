import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronLeft, ChevronRight, MapPin, Euro, Users, TrendingUp, Settings, Leaf, ThumbsUp, ThumbsDown } from 'lucide-react'
import { projects } from '../data/projects'
import type { Project } from '../data/types'

function formatPrice(n: number) {
  return `€${n.toLocaleString('nl-BE')}`
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="card p-4 text-left w-full active:scale-98 transition-transform"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-white">{project.naam}</h3>
            {project.isCandor && <span className="badge-candor">Candor</span>}
          </div>
          <div className="flex items-center gap-1 text-white/50 text-xs">
            <MapPin size={10} />
            {project.locatie.wijk ?? project.locatie.stad}
          </div>
        </div>
        <div className="text-right">
          <div className="num text-candor-teal font-bold text-sm">{formatPrice(project.prijs.min)}</div>
          <div className="text-white/40 text-xs">{project.verkoopStatus}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {project.quickFacts.slice(0, 2).map((f, i) => (
          <span key={i} className="text-xs text-white/50 line-clamp-1">{f}</span>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-candor-border/50">
        <span className="text-xs text-white/30">{project.locatieBeoordeling}</span>
        <span className="text-white/20">·</span>
        <span className="text-xs text-white/30">Score: {project.competitieveScore}/5</span>
        <span className="text-white/20">·</span>
        <span className="text-xs text-white/30">{project.oplevering}</span>
      </div>
    </motion.button>
  )
}

function DetailOverlay({ project, onClose, onPrev, onNext, hasPrev, hasNext }: {
  project: Project
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}) {
  const touchStart = useRef(0)

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && hasNext) onNext()
      else if (diff < 0 && hasPrev) onPrev()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-candor-bg z-50 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="sticky top-0 bg-candor-bg/95 backdrop-blur border-b border-candor-border px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={onClose} className="p-2 -ml-2 text-white/60">
          <X size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-white truncate">{project.naam}</h2>
            {project.isCandor && <span className="badge-candor shrink-0">Candor</span>}
          </div>
          <p className="text-white/40 text-xs">{project.locatie.stad}</p>
        </div>
        <div className="flex gap-1">
          <button disabled={!hasPrev} onClick={onPrev} className="p-2 text-white/40 disabled:opacity-20">
            <ChevronLeft size={20} />
          </button>
          <button disabled={!hasNext} onClick={onNext} className="p-2 text-white/40 disabled:opacity-20">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Quick facts */}
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">Quick Facts</h3>
          <ul className="space-y-2">
            {project.quickFacts.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-candor-teal shrink-0">→</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Prijs */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Euro size={16} className="text-candor-teal" />
            <h3 className="text-sm font-semibold text-white">Prijs</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-white/40 mb-0.5">Instapprijs</div>
              <div className="num text-white font-bold">{formatPrice(project.prijs.min)}</div>
            </div>
            {project.prijs.max && (
              <div>
                <div className="text-xs text-white/40 mb-0.5">Max prijs</div>
                <div className="num text-white font-bold">{formatPrice(project.prijs.max)}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-white/40 mb-0.5">BTW/Regime</div>
              <div className="text-white text-sm">{project.prijs.btwRegime}</div>
            </div>
            <div>
              <div className="text-xs text-white/40 mb-0.5">Fiscaal</div>
              <div className="text-white text-sm leading-tight">{project.fiscaalRegime}</div>
            </div>
          </div>
        </div>

        {/* Locatie */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-candor-teal" />
            <h3 className="text-sm font-semibold text-white">Locatie</h3>
          </div>
          <div className="space-y-1 text-sm">
            {project.locatie.adres && <div className="text-white/80">{project.locatie.adres}</div>}
            {project.locatie.wijk && <div className="text-white/50">{project.locatie.wijk}</div>}
            {project.locatie.afstandUniDetail && (
              <div className="text-white/50 text-xs mt-2">{project.locatie.afstandUniDetail}</div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-candor-orange">{project.locatieBeoordeling}</span>
              <span className="num text-white/40 text-xs">Score: {project.competitieveScore}/5</span>
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-candor-teal" />
            <h3 className="text-sm font-semibold text-white">Units</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <div className="text-xs text-white/40 mb-0.5">Totaal</div>
              <div className="num text-white font-bold">{project.units.totaal}</div>
            </div>
            {project.units.oppervlakteMin && (
              <div>
                <div className="text-xs text-white/40 mb-0.5">Min m²</div>
                <div className="num text-white font-bold">{project.units.oppervlakteMin}m²</div>
              </div>
            )}
            {project.units.oppervlakteMax && (
              <div>
                <div className="text-xs text-white/40 mb-0.5">Max m²</div>
                <div className="num text-white font-bold">{project.units.oppervlakteMax}m²</div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {project.units.types.map((t, i) => (
              <span key={i} className="text-xs bg-white/5 border border-candor-border px-2 py-1 rounded-lg text-white/60">{t}</span>
            ))}
          </div>
        </div>

        {/* Rendement */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-candor-teal" />
            <h3 className="text-sm font-semibold text-white">Rendement</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {project.rendement.bruto && (
              <div>
                <div className="text-xs text-white/40 mb-0.5">Bruto</div>
                <div className="num text-white font-bold">{project.rendement.bruto}</div>
              </div>
            )}
            {project.rendement.netto && (
              <div>
                <div className="text-xs text-white/40 mb-0.5">Netto</div>
                <div className="num text-white font-bold">{project.rendement.netto}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-white/40 mb-0.5">Huurgarantie</div>
              <div className={`text-sm font-semibold ${project.rendement.garantie === true || project.rendement.garantie === 'te bevestigen' ? 'text-candor-green' : 'text-candor-red'}`}>
                {project.rendement.garantie === true
                  ? project.rendement.garantieDetail ?? 'Ja'
                  : project.rendement.garantie === false
                  ? 'Nee'
                  : String(project.rendement.garantie)}
              </div>
            </div>
          </div>
        </div>

        {/* Beheer */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={16} className="text-candor-teal" />
            <h3 className="text-sm font-semibold text-white">Beheer</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-white/40 mb-0.5">Partner</div>
              <div className="text-white">{project.beheer.partner}</div>
            </div>
            <div>
              <div className="text-xs text-white/40 mb-0.5">Type</div>
              <div className="text-white capitalize">{project.beheer.type}</div>
            </div>
            {project.beheer.kost && (
              <div>
                <div className="text-xs text-white/40 mb-0.5">Beheervergoeding</div>
                <div className="num text-white">{project.beheer.kost}</div>
              </div>
            )}
            {project.beheer.pooling !== undefined && (
              <div>
                <div className="text-xs text-white/40 mb-0.5">Pooling</div>
                <div className={project.beheer.pooling ? 'text-candor-green' : 'text-white/50'}>
                  {project.beheer.pooling ? 'Ja' : 'Nee'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Duurzaamheid */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Leaf size={16} className="text-candor-green" />
            <h3 className="text-sm font-semibold text-white">Duurzaamheid</h3>
          </div>
          {project.duurzaamheid.epc && (
            <div className="mb-2">
              <span className="text-xs text-white/40">EPC: </span>
              <span className="text-white text-sm">{project.duurzaamheid.epc}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {project.duurzaamheid.kenmerken.map((k, i) => (
              <span key={i} className="text-xs bg-candor-green/10 border border-candor-green/20 text-candor-green px-2 py-1 rounded-lg">{k}</span>
            ))}
          </div>
        </div>

        {/* USPs en zwaktes */}
        <div className="grid grid-cols-1 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp size={16} className="text-candor-green" />
              <h3 className="text-sm font-semibold text-white">Sterktes</h3>
            </div>
            <ul className="space-y-1.5">
              {project.usps.map((u, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                  <span className="text-candor-green shrink-0">+</span>
                  {u}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsDown size={16} className="text-candor-red" />
              <h3 className="text-sm font-semibold text-white">Zwaktes</h3>
            </div>
            <ul className="space-y-1.5">
              {project.zwaktes.map((z, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                  <span className="text-candor-red shrink-0">−</span>
                  {z}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </motion.div>
  )
}

export default function QuickFacts() {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const filtered = projects.filter(p =>
    p.naam.toLowerCase().includes(search.toLowerCase()) ||
    p.locatie.stad.toLowerCase().includes(search.toLowerCase()) ||
    (p.locatie.wijk ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // Candor altijd eerst
  const sorted = [...filtered].sort((a, b) => (b.isCandor ? 1 : 0) - (a.isCandor ? 1 : 0))

  return (
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white mb-3">Quick Facts</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Zoek project of stad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-candor-card border border-candor-border rounded-xl pl-9 pr-4 py-3 text-white text-sm outline-none focus:border-candor-teal transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
        {sorted.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <Search size={32} className="mx-auto mb-2" />
            <p>Geen projecten gevonden</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <DetailOverlay
            project={sorted[selectedIndex]}
            onClose={() => setSelectedIndex(null)}
            onPrev={() => setSelectedIndex(i => Math.max(0, (i ?? 1) - 1))}
            onNext={() => setSelectedIndex(i => Math.min(sorted.length - 1, (i ?? 0) + 1))}
            hasPrev={selectedIndex > 0}
            hasNext={selectedIndex < sorted.length - 1}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
