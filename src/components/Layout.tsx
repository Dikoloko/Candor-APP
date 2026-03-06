import { NavLink, useLocation } from 'react-router-dom'
import { Home, Target, Zap, BarChart2, Database } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/quiz', icon: Target, label: 'Quiz' },
  { to: '/quick-facts', icon: Zap, label: 'Quick Facts' },
  { to: '/compare', icon: BarChart2, label: 'Vergelijk' },
  { to: '/database', icon: Database, label: 'Database' },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-dvh bg-candor-bg">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 safe-top shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-candor-teal flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-white/90 text-sm tracking-wide">CANDOR QUIZ</span>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-candor-dark border-t border-candor-border safe-bottom z-50">
        <div className="flex items-stretch h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-candor-teal'
                    : 'text-white/40 hover:text-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-candor-teal/15' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
