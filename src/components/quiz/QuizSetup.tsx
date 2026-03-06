import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Timer, Bookmark } from 'lucide-react'
import type { QuizConfig, QuizCategorie, QuizMoeilijkheid } from '../../data/types'
import { alleCategorieen } from '../../data/quizGenerator'
import { getBookmarks } from '../../utils/storage'

const aantalOpties = [5, 10, 15, 20]
const moeilijkhedenOpties: Array<QuizMoeilijkheid | 'Alles'> = ['Alles', 'Easy', 'Medium', 'Hard']
const scopeOpties: QuizConfig['scope'][] = ['Alles', 'Alleen Candor', 'Alleen Concurrenten']

export default function QuizSetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const [bookmarks] = useState(() => getBookmarks())
  const [config, setConfig] = useState<QuizConfig>({
    aantalVragen: 10,
    categorieen: (location.state?.presetCategorieen as QuizCategorie[]) ?? [],
    moeilijkheid: 'Alles',
    scope: 'Alles',
    metTimer: false,
  })

  function toggleCategorie(cat: QuizCategorie) {
    setConfig(c => ({
      ...c,
      categorieen: c.categorieen.includes(cat)
        ? c.categorieen.filter(x => x !== cat)
        : [...c.categorieen, cat],
    }))
  }

  // Direct start bookmark quiz vanuit QuizResult
  useEffect(() => {
    if (location.state?.startBookmarkQuiz && bookmarks.length > 0) {
      navigate('/quiz/game', { state: { config: { ...config, bookmarkIds: bookmarks } } })
    }
  }, [])

  function startQuiz() {
    navigate('/quiz/game', { state: { config } })
  }

  return (
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <Target size={22} className="text-candor-teal" />
          <h1 className="text-xl font-bold text-white">Quiz instellen</h1>
        </div>
        <p className="text-white/50 text-sm">Kies je voorkeuren en start de quiz</p>
      </motion.div>

      <div className="space-y-5">
        {/* Bookmark quiz */}
        {bookmarks.length > 0 && (
          <div className="card p-4 border border-candor-orange/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bookmark size={18} className="text-candor-orange shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-white">{bookmarks.length} gebookmarkte vragen</div>
                  <div className="text-xs text-white/40">Oefen je moeilijke vragen</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/quiz/game', { state: { config: { ...config, bookmarkIds: bookmarks } } })}
                className="btn-primary text-xs py-2 px-3 shrink-0"
              >
                Start
              </button>
            </div>
          </div>
        )}

        {/* Aantal vragen */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">Aantal vragen</h2>
          <div className="flex gap-2">
            {aantalOpties.map(n => (
              <button
                key={n}
                onClick={() => setConfig(c => ({ ...c, aantalVragen: n }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  config.aantalVragen === n
                    ? 'bg-candor-teal text-white'
                    : 'bg-white/5 text-white/60 border border-candor-border'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Categorieën */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wide">Categorieën</h2>
          <p className="text-white/40 text-xs mb-3">Leeg = alle categorieën</p>
          <div className="flex flex-wrap gap-2">
            {alleCategorieen.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategorie(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  config.categorieen.includes(cat)
                    ? 'bg-candor-teal text-white'
                    : 'bg-white/5 text-white/60 border border-candor-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Moeilijkheid */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">Moeilijkheid</h2>
          <div className="flex gap-2">
            {moeilijkhedenOpties.map(m => (
              <button
                key={m}
                onClick={() => setConfig(c => ({ ...c, moeilijkheid: m }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  config.moeilijkheid === m
                    ? m === 'Easy'
                      ? 'bg-candor-green text-white'
                      : m === 'Medium'
                      ? 'bg-candor-orange text-white'
                      : m === 'Hard'
                      ? 'bg-candor-red text-white'
                      : 'bg-candor-teal text-white'
                    : 'bg-white/5 text-white/60 border border-candor-border'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">Projecten</h2>
          <div className="space-y-2">
            {scopeOpties.map(s => (
              <button
                key={s}
                onClick={() => setConfig(c => ({ ...c, scope: s }))}
                className={`w-full py-3 rounded-xl text-sm font-semibold text-left px-4 transition-colors ${
                  config.scope === s
                    ? 'bg-candor-teal/20 text-candor-teal border border-candor-teal/40'
                    : 'bg-white/5 text-white/60 border border-candor-border'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-candor-orange" />
              <div>
                <div className="text-sm font-semibold text-white">Timer per vraag</div>
                <div className="text-xs text-white/40">30 seconden per vraag</div>
              </div>
            </div>
            <button
              onClick={() => setConfig(c => ({ ...c, metTimer: !c.metTimer }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                config.metTimer ? 'bg-candor-teal' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  config.metTimer ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Start button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <button onClick={startQuiz} className="btn-primary w-full text-base py-4">
          🎯 Start Quiz ({config.aantalVragen} vragen)
        </button>
      </motion.div>
    </div>
  )
}
