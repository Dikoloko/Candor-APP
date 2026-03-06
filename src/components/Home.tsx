import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Zap, BarChart2, Database, TrendingUp, Award, BookOpen, Globe } from 'lucide-react'
import { getTodayCount, getStats, getLeaderboard } from '../utils/storage'
import { isSupabaseConfigured, getRemoteLeaderboard, type RemoteEntry } from '../utils/supabase'

const cards = [
  {
    to: '/quiz',
    icon: Target,
    title: 'Quiz Mode',
    desc: 'Test je kennis van projecten & concurrenten',
    color: 'from-candor-teal/20 to-candor-teal/5',
    border: 'border-candor-teal/30',
    iconColor: 'text-candor-teal',
    emoji: '🎯',
  },
  {
    to: '/quick-facts',
    icon: Zap,
    title: 'Quick Facts',
    desc: 'Snel opzoeken per project',
    color: 'from-candor-orange/20 to-candor-orange/5',
    border: 'border-candor-orange/30',
    iconColor: 'text-candor-orange',
    emoji: '⚡',
  },
  {
    to: '/compare',
    icon: BarChart2,
    title: 'Vergelijk',
    desc: 'Projecten naast elkaar zetten',
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    emoji: '📊',
  },
  {
    to: '/database',
    icon: Database,
    title: 'Database',
    desc: 'Alle projecten bekijken',
    color: 'from-candor-green/20 to-candor-green/5',
    border: 'border-candor-green/30',
    iconColor: 'text-candor-green',
    emoji: '📋',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function Home() {
  const navigate = useNavigate()
  const todayCount = getTodayCount()
  const stats = getStats()
  const leaderboard = getLeaderboard()
  const [remoteBoard, setRemoteBoard] = useState<RemoteEntry[]>([])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    getRemoteLeaderboard().then(setRemoteBoard).catch(() => {})
  }, [])

  return (
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <img src="/candor_white.png" alt="Candor" className="h-9 w-auto mb-2" />
        <p className="text-white font-semibold text-base mb-0.5">Competitor Quiz</p>
        <p className="text-white/50 text-sm">
          Ken je de Gentse studentenmarkt van binnen en buiten?
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-2 mb-6"
      >
        <div className="card p-3 text-center">
          <BookOpen size={18} className="text-candor-teal mx-auto mb-1" />
          <div className="num text-lg font-bold text-white">{todayCount}</div>
          <div className="text-[10px] text-white/50">Vandaag</div>
        </div>
        <div className="card p-3 text-center">
          <TrendingUp size={18} className="text-candor-green mx-auto mb-1" />
          <div className="num text-lg font-bold text-white">{stats?.gemScore ?? '—'}%</div>
          <div className="text-[10px] text-white/50">Gem. score</div>
        </div>
        <div className="card p-3 text-center">
          <Award size={18} className="text-candor-orange mx-auto mb-1" />
          <div className="num text-lg font-bold text-white">{stats?.besteScore ?? '—'}%</div>
          <div className="text-[10px] text-white/50">Beste score</div>
        </div>
      </motion.div>

      {/* Main cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 mb-6"
      >
        {cards.map(({ to, icon: Icon, title, desc, color, border, iconColor, emoji }) => (
          <motion.button
            key={to}
            variants={item}
            onClick={() => navigate(to)}
            className={`card bg-gradient-to-br ${color} border ${border} p-4 text-left active:scale-95 transition-transform duration-100`}
          >
            <div className="text-2xl mb-2">{emoji}</div>
            <div className={`mb-1 ${iconColor}`}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <div className="font-semibold text-white text-sm mb-0.5">{title}</div>
            <div className="text-white/50 text-xs leading-tight">{desc}</div>
          </motion.button>
        ))}
      </motion.div>

      {/* Leaderboard */}
      {(remoteBoard.length > 0 || leaderboard.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            {remoteBoard.length > 0
              ? <Globe size={16} className="text-candor-teal" />
              : <Award size={16} className="text-candor-orange" />
            }
            <h2 className="font-semibold text-white text-sm">
              {remoteBoard.length > 0 ? 'Gedeeld leaderboard' : 'Leaderboard'}
            </h2>
          </div>
          <div className="space-y-2">
            {(remoteBoard.length > 0 ? remoteBoard : leaderboard).slice(0, 5).map((entry, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="num text-candor-teal/70 text-xs w-4">{i + 1}</span>
                <span className="flex-1 text-white/80 text-sm truncate">{entry.naam}</span>
                <span className="num text-candor-orange font-bold text-sm">
                  {entry.punten ?? '—'} pt
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {leaderboard.length === 0 && remoteBoard.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card p-4 text-center"
        >
          <Award size={32} className="text-white/20 mx-auto mb-2" />
          <p className="text-white/40 text-sm">Speel een quiz om op het leaderboard te komen!</p>
          <button
            onClick={() => navigate('/quiz')}
            className="mt-3 btn-primary text-sm py-2"
          >
            Start je eerste quiz
          </button>
        </motion.div>
      )}
    </div>
  )
}
