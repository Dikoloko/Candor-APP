import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RotateCcw, Share2, Trophy, XCircle, CheckCircle, ChevronDown, ChevronUp, Bookmark, AlertTriangle } from 'lucide-react'
import type { QuizResultaat, QuizCategorie } from '../../data/types'
import { addLeaderboardEntry, getBookmarks } from '../../utils/storage'
import { isSupabaseConfigured, addRemoteEntry } from '../../utils/supabase'

export default function QuizResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const resultaat: QuizResultaat | null = location.state?.resultaat ?? null
  const [displayScore, setDisplayScore] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [naam, setNaam] = useState('')
  const [naamOpgeslagen, setNaamOpgeslagen] = useState(false)

  useEffect(() => {
    if (!resultaat) return
    const pct = Math.round((resultaat.score / resultaat.totaal) * 100)
    let n = 0
    const interval = setInterval(() => {
      n = Math.min(n + 2, pct)
      setDisplayScore(n)
      if (n >= pct) clearInterval(interval)
    }, 20)
    return () => clearInterval(interval)
  }, [resultaat])

  if (!resultaat) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-white/50">Geen resultaat gevonden.</p>
        <button onClick={() => navigate('/quiz')} className="btn-primary mt-4">Nieuwe quiz</button>
      </div>
    )
  }

  const pct = Math.round((resultaat.score / resultaat.totaal) * 100)
  const fout = resultaat.antwoorden.filter(a => !a.correct)

  // Per-categorie breakdown
  const categorieStats = resultaat.antwoorden.reduce<Record<QuizCategorie, { correct: number; totaal: number }>>((acc, a) => {
    if (!acc[a.categorie]) acc[a.categorie] = { correct: 0, totaal: 0 }
    acc[a.categorie].totaal++
    if (a.correct) acc[a.categorie].correct++
    return acc
  }, {} as Record<QuizCategorie, { correct: number; totaal: number }>)

  const kleur = pct >= 80 ? 'text-candor-green' : pct >= 60 ? 'text-candor-orange' : 'text-candor-red'
  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'

  const zwakkeCategorieen = Object.entries(categorieStats)
    .filter(([, stat]) => stat.correct / stat.totaal < 0.6)
    .map(([cat]) => cat as QuizCategorie)

  const bookmarkCount = getBookmarks().length

  function handleDeel() {
    const tekst = `Candor Competitor Quiz: ${resultaat!.score}/${resultaat!.totaal} (${pct}%) — ${emoji}`
    if (navigator.share) {
      navigator.share({ title: 'Candor Quiz Resultaat', text: tekst })
    } else {
      navigator.clipboard.writeText(tekst).then(() => alert('Gekopieerd naar klembord!'))
    }
  }

  function slaOpNaam() {
    if (!naam.trim()) return
    addLeaderboardEntry({
      naam: naam.trim(),
      score: resultaat!.score,
      totaal: resultaat!.totaal,
      punten: resultaat!.totalePunten,
      maxPunten: resultaat!.maxPunten,
      datum: resultaat!.datum,
    })
    if (isSupabaseConfigured) {
      addRemoteEntry({
        naam: naam.trim(),
        score: resultaat!.score,
        totaal: resultaat!.totaal,
        punten: resultaat!.totalePunten,
        max_punten: resultaat!.maxPunten,
        datum: resultaat!.datum,
      })
    }
    setNaamOpgeslagen(true)
  }

  return (
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto">
      {/* Score hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-6 text-center mb-4"
      >
        <div className="text-4xl mb-2">{emoji}</div>
        <div className={`num text-6xl font-bold ${kleur} mb-1`}>{displayScore}%</div>
        <div className="text-white/50 text-sm mb-1">
          {resultaat.score}/{resultaat.totaal} correct
        </div>
        <div className="num text-candor-orange font-bold text-lg">
          {resultaat.totalePunten} / {resultaat.maxPunten} punten
        </div>
        <div className="text-white/30 text-xs">
          {new Date(resultaat.datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        {/* Leaderboard naam */}
        {!naamOpgeslagen ? (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Jouw naam voor leaderboard"
              value={naam}
              onChange={e => setNaam(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && slaOpNaam()}
              className="flex-1 bg-white/5 border border-candor-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-candor-teal"
            />
            <button onClick={slaOpNaam} className="btn-primary py-2 px-4 text-sm">
              <Trophy size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-4 text-candor-green text-sm flex items-center justify-center gap-1">
            <CheckCircle size={14} /> Score opgeslagen op leaderboard!
          </div>
        )}
      </motion.div>

      {/* Categorie breakdown */}
      {Object.keys(categorieStats).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4 mb-4"
        >
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Per categorie</h2>
          <div className="space-y-2">
            {Object.entries(categorieStats).map(([cat, stat]) => {
              const catPct = Math.round((stat.correct / stat.totaal) * 100)
              const barColor = catPct >= 80 ? 'bg-candor-green' : catPct >= 60 ? 'bg-candor-orange' : 'bg-candor-red'
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">{cat}</span>
                    <span className="num text-white/50">{stat.correct}/{stat.totaal}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${barColor} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${catPct}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Zwakke punten */}
      {zwakkeCategorieen.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-4 mb-4 border border-candor-orange/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={15} className="text-candor-orange shrink-0" />
            <h2 className="text-sm font-semibold text-candor-orange uppercase tracking-wide">Verbeterpunten</h2>
          </div>
          <p className="text-white/60 text-xs mb-3">
            Je scoort laag op: <span className="text-white/80">{zwakkeCategorieen.join(', ')}</span>
          </p>
          <button
            onClick={() => navigate('/quiz', { state: { presetCategorieen: zwakkeCategorieen } })}
            className="btn-primary w-full text-sm py-2.5"
          >
            Oefen zwakke categorieën
          </button>
        </motion.div>
      )}

      {/* Bookmark quiz */}
      {bookmarkCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="card p-4 mb-4 border border-candor-orange/20"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="text-candor-orange shrink-0" />
              <p className="text-white/70 text-sm">{bookmarkCount} vragen gebookmarkt</p>
            </div>
            <button
              onClick={() => navigate('/quiz', { state: { startBookmarkQuiz: true } })}
              className="btn-ghost text-xs py-1.5 px-3 shrink-0"
            >
              Start
            </button>
          </div>
        </motion.div>
      )}

      {/* Foute antwoorden */}
      {fout.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4 mb-4"
        >
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
            Foute antwoorden ({fout.length})
          </h2>
          <div className="space-y-2">
            {fout.map(a => (
              <div key={a.vraagId} className="border border-candor-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === a.vraagId ? null : a.vraagId)}
                  className="w-full flex items-start gap-3 p-3 text-left"
                >
                  <XCircle size={16} className="text-candor-red shrink-0 mt-0.5" />
                  <span className="flex-1 text-white/80 text-sm leading-snug">{a.vraag}</span>
                  {expanded === a.vraagId ? <ChevronUp size={14} className="text-white/30 shrink-0" /> : <ChevronDown size={14} className="text-white/30 shrink-0" />}
                </button>
                {expanded === a.vraagId && (
                  <div className="px-3 pb-3 border-t border-candor-border">
                    <div className="flex items-center gap-1 text-xs text-candor-green mt-2 mb-1">
                      <CheckCircle size={12} />
                      <span className="font-semibold">Correct antwoord:</span>
                    </div>
                    <p className="text-candor-green text-sm num mb-2">
                      {Array.isArray(a.correctAntwoord)
                        ? a.correctAntwoord.join(' → ')
                        : String(a.correctAntwoord)}
                    </p>
                    <p className="text-white/60 text-xs leading-relaxed">{a.uitleg}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleDeel} className="btn-ghost flex items-center gap-2 flex-1">
          <Share2 size={16} />
          Deel
        </button>
        <button onClick={() => navigate('/quiz')} className="btn-primary flex items-center gap-2 flex-1">
          <RotateCcw size={16} />
          Opnieuw
        </button>
      </div>
    </div>
  )
}
