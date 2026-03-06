import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Euro, Users, TrendingUp, Settings,
  Leaf, ThumbsUp, ThumbsDown, Calendar, Building2, Star,
} from 'lucide-react'
import { getProjectById } from '../data/projects'

function formatPrice(n: number) {
  return `€${n.toLocaleString('nl-BE')}`
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-candor-teal">{icon}</div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-candor-border/40 last:border-0">
      <span className="text-white/40 text-xs shrink-0 mt-0.5">{label}</span>
      <span className={`text-sm text-right num font-medium ${highlight ? 'text-candor-teal' : 'text-white/85'}`}>
        {value}
      </span>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const project = getProjectById(id ?? '')

  if (!project) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-white/50">Project niet gevonden.</p>
        <button onClick={() => navigate('/database')} className="btn-primary mt-4">Terug</button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-4">
      {/* Hero header */}
      <div className={`px-4 pt-3 pb-5 ${project.isCandor ? 'bg-gradient-to-b from-candor-teal/15 to-transparent' : 'bg-gradient-to-b from-candor-blue/10 to-transparent'}`}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white/50 text-sm mb-4 -ml-1 hover:text-white/80 transition-colors"
        >
          <ArrowLeft size={16} />
          Terug
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{project.naam}</h1>
                {project.isCandor && (
                  <span className="badge-candor text-sm px-3 py-1">Candor</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-white/50 text-sm">
                <MapPin size={13} />
                {project.locatie.adres ?? project.locatie.stad}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold num ${project.isCandor ? 'text-candor-teal' : 'text-white'}`}>
                {formatPrice(project.prijs.min)}
              </div>
              <div className="text-white/40 text-xs">{project.verkoopStatus}</div>
            </div>
          </div>

          {/* Score stars + meta */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-candor-orange fill-candor-orange" />
              <span className="num text-white/70 text-sm">{project.competitieveScore}/5</span>
            </div>
            <span className="text-candor-orange text-sm">{project.locatieBeoordeling}</span>
            <span className="text-white/30">·</span>
            <span className="text-white/50 text-sm">{project.type}</span>
            <span className="text-white/30">·</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              project.investeringType === 'onroerend'
                ? 'bg-candor-blue/30 text-candor-clear'
                : 'bg-candor-orange/20 text-candor-orange'
            }`}>
              {project.investeringType}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Quick facts banner */}
      <div className="px-4 mb-4">
        <div className="bg-candor-teal/10 border border-candor-teal/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-candor-teal uppercase tracking-wide mb-2">Quick Facts</p>
          <ul className="space-y-1.5">
            {project.quickFacts.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-candor-teal shrink-0 font-bold">→</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Prijs & Fiscaal */}
        <Section icon={<Euro size={16} />} title="Prijs & Fiscaal">
          <Row label="Instapprijs" value={formatPrice(project.prijs.min)} highlight />
          {project.prijs.max && <Row label="Max prijs" value={formatPrice(project.prijs.max)} />}
          <Row label="BTW / Regime" value={project.prijs.btwRegime} />
          <Row label="Fiscaal regime" value={project.fiscaalRegime} />
          {project.prijs.meubilairInbegrepen !== undefined && (
            <Row
              label="Meubilair"
              value={project.prijs.meubilairInbegrepen
                ? 'Inbegrepen'
                : project.prijs.meubilairPrijs
                ? `Optioneel — ${formatPrice(project.prijs.meubilairPrijs)}`
                : 'Niet inbegrepen'}
            />
          )}
        </Section>

        {/* Locatie */}
        <Section icon={<MapPin size={16} />} title="Locatie">
          {project.locatie.adres && <Row label="Adres" value={project.locatie.adres} />}
          {project.locatie.wijk && <Row label="Wijk" value={project.locatie.wijk} />}
          <Row label="Stad" value={project.locatie.stad} />
          {project.locatie.afstandUniDetail && (
            <Row label="Universiteiten" value={project.locatie.afstandUniDetail} />
          )}
          {project.locatie.afstandStation && (
            <Row label="Station" value={project.locatie.afstandStation} />
          )}
          <Row label="Locatiescore" value={`${project.locatieBeoordeling} (${project.competitieveScore}/5)`} />
        </Section>

        {/* Units */}
        <Section icon={<Users size={16} />} title="Units">
          <Row label="Totaal units" value={`${project.units.totaal} units`} highlight />
          {project.units.oppervlakteMin && (
            <Row label="Oppervlakte" value={`${project.units.oppervlakteMin}–${project.units.oppervlakteMax}m²`} />
          )}
          <div className="pt-2">
            <p className="text-xs text-white/40 mb-2">Types</p>
            <div className="flex flex-wrap gap-1.5">
              {project.units.types.map((t, i) => (
                <span key={i} className="text-xs bg-white/5 border border-candor-border px-2.5 py-1 rounded-lg text-white/65">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* Rendement */}
        <Section icon={<TrendingUp size={16} />} title="Rendement">
          {project.rendement.bruto && <Row label="Bruto rendement" value={project.rendement.bruto} highlight />}
          {project.rendement.netto && <Row label="Netto rendement" value={project.rendement.netto} />}
          {project.huur?.min && (
            <Row label="Huur range" value={`€${project.huur.min}–€${project.huur.max}/maand`} />
          )}
          <Row
            label="Huurgarantie"
            value={
              project.rendement.garantie === true
                ? project.rendement.garantieDetail ?? 'Ja'
                : project.rendement.garantie === false
                ? 'Nee'
                : String(project.rendement.garantie)
            }
          />
        </Section>

        {/* Beheer */}
        <Section icon={<Settings size={16} />} title="Beheer">
          <Row label="Beheerder" value={project.beheer.partner} />
          <Row label="Beheertype" value={project.beheer.type} />
          {project.beheer.kost && <Row label="Vergoeding" value={project.beheer.kost} />}
          {project.beheer.pooling !== undefined && (
            <Row label="Pooling" value={project.beheer.pooling ? 'Ja' : 'Nee'} />
          )}
          {project.beheer.poolingDetail && (
            <Row label="Pooling detail" value={project.beheer.poolingDetail} />
          )}
        </Section>

        {/* Duurzaamheid */}
        <Section icon={<Leaf size={16} />} title="Duurzaamheid">
          {project.duurzaamheid.epc && <Row label="EPC / Peil" value={project.duurzaamheid.epc} />}
          <div className="pt-2 flex flex-wrap gap-1.5">
            {project.duurzaamheid.kenmerken.map((k, i) => (
              <span key={i} className="text-xs bg-candor-green/10 border border-candor-green/20 text-candor-green px-2.5 py-1 rounded-lg">
                {k}
              </span>
            ))}
          </div>
        </Section>

        {/* Voorzieningen */}
        {project.voorzieningen && project.voorzieningen.length > 0 && (
          <Section icon={<Building2 size={16} />} title="Voorzieningen">
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.voorzieningen.map((v, i) => (
                <span key={i} className="text-xs bg-white/5 border border-candor-border px-2.5 py-1 rounded-lg text-white/65">
                  {v}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Oplevering */}
        <Section icon={<Calendar size={16} />} title="Planning">
          <Row label="Oplevering" value={project.oplevering} highlight />
          {project.startVerkoop && <Row label="Start verkoop" value={project.startVerkoop} />}
          <Row label="Verkoop status" value={project.verkoopStatus} />
          <Row label="Ontwikkelaar" value={project.ontwikkelaar.naam} />
          <Row label="Ervaring" value={project.ontwikkelaar.ervaring} />
        </Section>

        {/* USPs & Zwaktes */}
        <div className="grid grid-cols-1 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp size={16} className="text-candor-green" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Sterktes</h2>
            </div>
            <ul className="space-y-2">
              {project.usps.map((u, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                  <span className="text-candor-green font-bold shrink-0 text-base leading-tight">+</span>
                  {u}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsDown size={16} className="text-candor-red" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Aandachtspunten</h2>
            </div>
            <ul className="space-y-2">
              {project.zwaktes.map((z, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                  <span className="text-candor-red font-bold shrink-0 text-base leading-tight">−</span>
                  {z}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-2" />
      </div>
    </div>
  )
}
