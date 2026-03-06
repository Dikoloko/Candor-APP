import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { generateQuestions } from '../../data/quizGenerator'
import type { QuizConfig, QuizQuestion, QuizAntwoord, QuizResultaat } from '../../data/types'
import { saveScore, addTodayCount } from '../../utils/storage'

// --- Sortable item ---
function SortableItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-candor-dark border border-candor-border rounded-xl px-4 py-3 touch-none"
    >
      <button {...attributes} {...listeners} className="text-white/30 shrink-0">
        <GripVertical size={18} />
      </button>
      <span className="text-white text-sm flex-1">{label}</span>
    </div>
  )
}

// --- Helper ---
function arraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

export default function QuizGame() {
  const navigate = useNavigate()
  const location = useLocation()
  const config: QuizConfig = location.state?.config ?? {
    aantalVragen: 10,
    categorieen: [],
    moeilijkheid: 'Alles',
    scope: 'Alles',
    metTimer: false,
  }

  const [questions] = useState<QuizQuestion[]>(() => generateQuestions(config))
  const [current, setCurrent] = useState(0)
  const [antwoorden, setAntwoorden] = useState<QuizAntwoord[]>([])
  const [selected, setSelected] = useState<string | number | string[] | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [rankItems, setRankItems] = useState<string[]>([])
  const [schatting, setSchatting] = useState('')
  const [timer, setTimer] = useState(30)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const vraag = questions[current]

  // Init ranking items
  useEffect(() => {
    if (vraag?.type === 'ranking' && vraag.opties) {
      setRankItems([...vraag.opties])
    }
    setSelected(null)
    setSubmitted(false)
    setSchatting('')
    setTimer(30)
  }, [current, vraag])

  // Timer
  useEffect(() => {
    if (!config.metTimer || submitted || !vraag) return
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [current, submitted, config.metTimer])

  const handleSubmit = useCallback((timedOut = false) => {
    if (!vraag || submitted) return
    if (timerRef.current) clearInterval(timerRef.current)

    let gegeven: string | number | string[] = timedOut ? '' : (selected ?? '')
    let correct = false

    if (vraag.type === 'multiple_choice' || vraag.type === 'true_false') {
      correct = !timedOut && gegeven === vraag.correctAntwoord
    } else if (vraag.type === 'schatting') {
      const val = parseFloat(schatting.replace(',', '.'))
      gegeven = isNaN(val) ? 0 : val
      const tol = vraag.tolerantie ?? 0.15
      const target = vraag.correctAntwoord as number
      correct = !timedOut && !isNaN(val) && Math.abs(val - target) / target <= tol
    } else if (vraag.type === 'ranking') {
      gegeven = rankItems
      correct = !timedOut && arraysEqual(rankItems, vraag.correctAntwoord as string[])
    }

    setIsCorrect(correct)
    setSubmitted(true)

    const antwoord: QuizAntwoord = {
      vraagId: vraag.id,
      vraag: vraag.vraag,
      gegeven,
      correct,
      correctAntwoord: vraag.correctAntwoord,
      uitleg: vraag.uitleg,
      categorie: vraag.categorie,
    }
    setAntwoorden(prev => [...prev, antwoord])
  }, [vraag, submitted, selected, schatting, rankItems])

  function nextQuestion() {
    if (current + 1 >= questions.length) {
      // Save & navigate to result
      const alleAntwoorden = antwoorden
      const score = alleAntwoorden.filter(a => a.correct).length
      addTodayCount(questions.length)

      const resultaat: QuizResultaat = {
        id: Date.now().toString(),
        score,
        totaal: questions.length,
        antwoorden: alleAntwoorden,
        datum: new Date().toISOString(),
        config,
      }
      saveScore(resultaat)
      navigate('/quiz/result', { state: { resultaat } })
    } else {
      setCurrent(c => c + 1)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setRankItems(items => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  if (!vraag) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40">
        <p>Geen vragen gevonden voor deze configuratie. Pas je filters aan.</p>
      </div>
    )
  }

  const progress = ((current) / questions.length) * 100

  const moeilijkheidColor = {
    Easy: 'text-candor-green',
    Medium: 'text-candor-orange',
    Hard: 'text-candor-red',
  }[vraag.moeilijkheid]

  return (
    <div className="px-4 pt-2 pb-4 max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs">Vraag {current + 1}/{questions.length}</span>
          <div className="flex items-center gap-2">
            {config.metTimer && !submitted && (
              <div className={`flex items-center gap-1 num text-xs font-bold ${timer <= 10 ? 'text-candor-red' : 'text-white/50'}`}>
                <Clock size={12} />
                {timer}s
              </div>
            )}
            <span className={`text-xs font-semibold ${moeilijkheidColor}`}>{vraag.moeilijkheid}</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-candor-teal rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="card p-5 mb-4"
        >
          <div className="flex items-start gap-2 mb-1">
            <span className="text-xs text-candor-teal/70 font-medium">{vraag.categorie}</span>
          </div>
          <h2 className="text-white font-semibold text-base leading-snug mb-5">
            {vraag.vraag}
          </h2>

          {/* Multiple choice */}
          {vraag.type === 'multiple_choice' && (
            <div className="space-y-2">
              {vraag.opties?.map(opt => {
                const isSelected = selected === opt
                const isCorrectOpt = opt === vraag.correctAntwoord
                let cls = 'w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-colors '
                if (!submitted) {
                  cls += isSelected
                    ? 'bg-candor-teal/20 border-candor-teal text-candor-teal'
                    : 'bg-white/5 border-candor-border text-white/80 active:bg-white/10'
                } else {
                  if (isCorrectOpt) {
                    cls += 'bg-candor-green/20 border-candor-green text-candor-green'
                  } else if (isSelected && !isCorrectOpt) {
                    cls += 'bg-candor-red/20 border-candor-red text-candor-red'
                  } else {
                    cls += 'bg-white/5 border-candor-border text-white/40'
                  }
                }
                return (
                  <button
                    key={opt}
                    onClick={() => !submitted && setSelected(opt)}
                    className={cls}
                    disabled={submitted}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {/* True / False */}
          {vraag.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-3">
              {['Waar', 'Niet waar'].map(opt => {
                const isSelected = selected === opt
                const isCorrectOpt = opt === vraag.correctAntwoord
                let cls = 'py-5 rounded-xl text-sm font-bold border transition-colors '
                if (!submitted) {
                  cls += isSelected
                    ? 'bg-candor-teal/20 border-candor-teal text-candor-teal'
                    : 'bg-white/5 border-candor-border text-white/80'
                } else {
                  if (isCorrectOpt) cls += 'bg-candor-green/20 border-candor-green text-candor-green'
                  else if (isSelected) cls += 'bg-candor-red/20 border-candor-red text-candor-red'
                  else cls += 'bg-white/5 border-candor-border text-white/30'
                }
                return (
                  <button
                    key={opt}
                    onClick={() => !submitted && setSelected(opt)}
                    className={cls}
                    disabled={submitted}
                  >
                    {opt === 'Waar' ? '✓ Waar' : '✗ Niet waar'}
                  </button>
                )
              })}
            </div>
          )}

          {/* Schatting */}
          {vraag.type === 'schatting' && (
            <div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={schatting}
                  onChange={e => setSchatting(e.target.value)}
                  disabled={submitted}
                  placeholder="Voer je schatting in..."
                  className="flex-1 bg-white/5 border border-candor-border rounded-xl px-4 py-3 text-white num text-base outline-none focus:border-candor-teal transition-colors disabled:opacity-50"
                />
              </div>
              {submitted && (
                <div className="mt-3 num text-sm text-white/60">
                  Correct antwoord: <span className="text-white font-bold">
                    {typeof vraag.correctAntwoord === 'number'
                      ? vraag.correctAntwoord.toLocaleString('nl-BE')
                      : vraag.correctAntwoord}
                  </span>
                  {' '}(tolerantie ±{Math.round((vraag.tolerantie ?? 0.15) * 100)}%)
                </div>
              )}
            </div>
          )}

          {/* Ranking */}
          {vraag.type === 'ranking' && (
            <div>
              <p className="text-white/50 text-xs mb-3">Sleep items in de juiste volgorde</p>
              {!submitted ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={rankItems} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {rankItems.map(item => (
                        <SortableItem key={item} id={item} label={item} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-white/40 mb-2">Correcte volgorde:</p>
                  {(vraag.correctAntwoord as string[]).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-candor-green/10 border border-candor-green/30 rounded-xl px-4 py-3"
                    >
                      <span className="num text-candor-green text-xs w-4">{i + 1}</span>
                      <span className="text-candor-green text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`card p-4 mb-4 border ${isCorrect ? 'border-candor-green/40 bg-candor-green/10' : 'border-candor-red/40 bg-candor-red/10'}`}
          >
            <div className="flex items-start gap-3">
              {isCorrect
                ? <CheckCircle size={20} className="text-candor-green shrink-0 mt-0.5" />
                : <XCircle size={20} className="text-candor-red shrink-0 mt-0.5" />
              }
              <div>
                <div className={`font-bold text-sm mb-1 ${isCorrect ? 'text-candor-green' : 'text-candor-red'}`}>
                  {isCorrect ? 'Correct!' : 'Fout!'}
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{vraag.uitleg}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action button */}
      {!submitted ? (
        <button
          onClick={() => handleSubmit()}
          disabled={
            (vraag.type === 'multiple_choice' || vraag.type === 'true_false') && selected === null ||
            vraag.type === 'schatting' && schatting === ''
          }
          className="btn-primary w-full"
        >
          Bevestig antwoord
        </button>
      ) : (
        <button onClick={nextQuestion} className="btn-primary w-full flex items-center justify-center gap-2">
          {current + 1 >= questions.length ? 'Zie resultaat' : 'Volgende vraag'}
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  )
}
