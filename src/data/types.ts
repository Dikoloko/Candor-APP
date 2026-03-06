export interface Ontwikkelaar {
  naam: string
  ervaring: string
}

export interface Locatie {
  stad: string
  adres?: string
  wijk?: string
  afstandUni?: number
  afstandUniDetail?: string
  afstandStation?: string
}

export interface Units {
  totaal: number
  oppervlakteMin: number | null
  oppervlakteMax: number | null
  types: string[]
}

export interface Prijs {
  min: number
  max?: number
  btwRegime: string
  meubilairInbegrepen?: boolean
  meubilairPrijs?: number
}

export interface Rendement {
  bruto?: string
  netto?: string
  garantie: boolean | string
  garantieDetail?: string
}

export interface Huur {
  min?: number
  max?: number
}

export interface Beheer {
  type: string
  partner: string
  kost?: string
  pooling?: boolean
  poolingDetail?: string
}

export interface Duurzaamheid {
  epc?: string
  kenmerken: string[]
}

export interface Project {
  id: string
  naam: string
  isCandor: boolean
  type: string
  investeringType: string
  status: string
  ontwikkelaar: Ontwikkelaar
  locatie: Locatie
  units: Units
  prijs: Prijs
  rendement: Rendement
  huur?: Huur
  beheer: Beheer
  duurzaamheid: Duurzaamheid
  voorzieningen?: string[]
  oplevering: string
  startVerkoop?: string
  verkoopStatus: string
  fiscaalRegime: string
  locatieBeoordeling: string
  competitieveScore: number
  usps: string[]
  zwaktes: string[]
  quickFacts: string[]
}

export type QuizVraagType = 'multiple_choice' | 'true_false' | 'schatting' | 'ranking'

export type QuizCategorie =
  | 'Prijs'
  | 'Rendement'
  | 'Locatie'
  | 'Units'
  | 'Beheer'
  | 'Duurzaamheid'
  | 'Algemeen'
  | 'Vergelijking'
  | 'Markt'

export type QuizMoeilijkheid = 'Easy' | 'Medium' | 'Hard'

export interface QuizQuestion {
  id: string
  vraag: string
  type: QuizVraagType
  opties?: string[]
  correctAntwoord: string | number | string[]
  uitleg: string
  categorie: QuizCategorie
  moeilijkheid: QuizMoeilijkheid
  projectIds: string[]
  tolerantie?: number
}

export interface QuizConfig {
  aantalVragen: number
  categorieen: QuizCategorie[]
  moeilijkheid: QuizMoeilijkheid | 'Alles'
  scope: 'Alleen Candor' | 'Alleen Concurrenten' | 'Alles'
  metTimer: boolean
}

export interface QuizAntwoord {
  vraagId: string
  vraag: string
  gegeven: string | number | string[]
  correct: boolean
  correctAntwoord: string | number | string[]
  uitleg: string
  categorie: QuizCategorie
}

export interface QuizResultaat {
  id: string
  score: number
  totaal: number
  antwoorden: QuizAntwoord[]
  datum: string
  config: QuizConfig
}

export interface LeaderboardEntry {
  naam: string
  score: number
  totaal: number
  datum: string
}
