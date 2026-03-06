import type { QuizResultaat, LeaderboardEntry } from '../data/types'

const KEYS = {
  scores: 'candor_quiz_scores',
  today: 'candor_today_count',
  leaderboard: 'candor_leaderboard',
} as const

// Quiz scores
export function getScores(): QuizResultaat[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.scores) ?? '[]')
  } catch {
    return []
  }
}

export function saveScore(result: QuizResultaat): void {
  const scores = getScores()
  scores.unshift(result)
  // Bewaar max 50 resultaten
  localStorage.setItem(KEYS.scores, JSON.stringify(scores.slice(0, 50)))
}

// Dagelijkse teller
interface TodayCount {
  date: string
  count: number
}

export function getTodayCount(): number {
  try {
    const raw = localStorage.getItem(KEYS.today)
    if (!raw) return 0
    const data: TodayCount = JSON.parse(raw)
    const today = new Date().toISOString().split('T')[0]
    return data.date === today ? data.count : 0
  } catch {
    return 0
  }
}

export function addTodayCount(n: number): void {
  const today = new Date().toISOString().split('T')[0]
  const current = getTodayCount()
  localStorage.setItem(KEYS.today, JSON.stringify({ date: today, count: current + n }))
}

// Leaderboard
export function getLeaderboard(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.leaderboard) ?? '[]')
  } catch {
    return []
  }
}

export function addLeaderboardEntry(entry: LeaderboardEntry): void {
  const board = getLeaderboard()
  board.push(entry)
  board.sort((a, b) => b.score / b.totaal - a.score / a.totaal)
  localStorage.setItem(KEYS.leaderboard, JSON.stringify(board.slice(0, 10)))
}

// Statistieken
export function getStats() {
  const scores = getScores()
  if (scores.length === 0) return null
  const totaal = scores.reduce((acc, s) => acc + s.score, 0)
  const max = scores.reduce((acc, s) => acc + s.totaal, 0)
  return {
    aantalQuizzes: scores.length,
    gemScore: Math.round((totaal / max) * 100),
    besteScore: Math.max(...scores.map(s => Math.round((s.score / s.totaal) * 100))),
    laatsRun: scores[0]?.datum ?? null,
  }
}
