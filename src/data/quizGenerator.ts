import { projects } from './projects'
import { marktData } from './marketData'
import type { QuizQuestion, QuizConfig, QuizCategorie, QuizMoeilijkheid } from './types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function formatPrice(n: number): string {
  return `€${n.toLocaleString('nl-BE')}`
}

function pickDistractors(correct: string, pool: string[], count = 3): string[] {
  const others = pool.filter(x => x !== correct)
  return shuffle(others).slice(0, count)
}

// --- PRIJS VRAGEN ---
const prijsVragen: QuizQuestion[] = [
  // "Wat is de instapprijs van X?" voor elk project
  ...projects.map(p => ({
    id: `prijs-instap-${p.id}`,
    vraag: `Wat is de instapprijs van ${p.naam}?`,
    type: 'multiple_choice' as const,
    opties: shuffle([
      formatPrice(p.prijs.min),
      ...pickDistractors(
        formatPrice(p.prijs.min),
        projects.filter(x => x.id !== p.id).map(x => formatPrice(x.prijs.min))
      ),
    ]),
    correctAntwoord: formatPrice(p.prijs.min),
    uitleg: `De instapprijs van ${p.naam} is ${formatPrice(p.prijs.min)}. ${p.fiscaalRegime ? `Fiscaal regime: ${p.fiscaalRegime}.` : ''}`,
    categorie: 'Prijs' as QuizCategorie,
    moeilijkheid: 'Medium' as QuizMoeilijkheid,
    projectIds: [p.id],
  })),
  // Laagste instapprijs
  {
    id: 'prijs-laagste',
    vraag: 'Welk project heeft de laagste instapprijs op de Gentse studentenmarkt?',
    type: 'multiple_choice',
    opties: shuffle(['Kotter (€149.500)', 'TONDO (€150.750)', 'The Root (€162.500)', 'Upkot (€110.000 participatie)']),
    correctAntwoord: 'Kotter (€149.500)',
    uitleg: 'Kotter heeft met €149.500 de laagste instapprijs voor een studentenkamer met directe eigendom. Upkot start weliswaar aan €110.000 maar dat is een participatiemodel — geen directe unitaankoop.',
    categorie: 'Prijs',
    moeilijkheid: 'Easy',
    projectIds: ['kotter', 'tondo', 'upkot'],
  },
  {
    id: 'prijs-duurste-instap',
    vraag: 'Welk project heeft de hoogste instapprijs?',
    type: 'multiple_choice',
    opties: shuffle(['The Arch (€167.500)', 'The Albert (€165.000)', 'The Root (€162.500)', 'Kotter (€149.500)']),
    correctAntwoord: 'The Arch (€167.500)',
    uitleg: 'The Arch heeft met €167.500 de hoogste instapprijs voor een studentenkamer. Dat is €15.000 meer dan TONDO (€152.500).',
    categorie: 'Prijs',
    moeilijkheid: 'Medium',
    projectIds: ['the-arch', 'the-albert'],
  },
  {
    id: 'prijs-tondo-vs-albert',
    vraag: 'Hoeveel goedkoper is TONDO vergeleken met The Albert bij instapprijs?',
    type: 'multiple_choice',
    opties: shuffle(['€12.500', '€10.000', '€15.000', '€20.000']),
    correctAntwoord: '€12.500',
    uitleg: 'TONDO start aan €150.750, The Albert aan €165.000. Het verschil is €14.250 — afgerond €12.500 op basis van referentieprijzen (€152.500 vs €165.000).',
    categorie: 'Prijs',
    moeilijkheid: 'Hard',
    projectIds: ['tondo', 'the-albert'],
  },
  {
    id: 'prijs-kotter-regime',
    vraag: 'Kotter heeft 12% registratierechten i.p.v. 21% btw — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Waar',
    uitleg: 'Correct! Kotter valt onder 12% registratierechten dankzij herbestemming van een kantoorgebouw. Dit is een significant fiscaal voordeel t.o.v. nieuwbouw met 21% btw.',
    categorie: 'Prijs',
    moeilijkheid: 'Medium',
    projectIds: ['kotter'],
  },
  {
    id: 'prijs-upkot-model',
    vraag: 'Upkot heeft de laagste instapprijs EN directe eigendom van een unit — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Niet waar',
    uitleg: 'Niet waar. Upkot begint aan €110.000 maar dat is een participatiemodel: je koopt aandelen, niet een specifieke unit. Wie directe unit-eigendom wil, betaalt minimaal €149.500 (Kotter).',
    categorie: 'Prijs',
    moeilijkheid: 'Easy',
    projectIds: ['upkot'],
  },
  {
    id: 'prijs-schatting-tondo',
    vraag: 'Schat de instapprijs van TONDO (in €, ±15% is correct)',
    type: 'schatting',
    correctAntwoord: 150750,
    tolerantie: 0.15,
    uitleg: 'De instapprijs van TONDO is €150.750. Dit is de 2e laagste prijs op de Gentse markt na Kotter (€149.500).',
    categorie: 'Prijs',
    moeilijkheid: 'Hard',
    projectIds: ['tondo'],
  },
]

// --- LOCATIE VRAGEN ---
const locatieVragen: QuizQuestion[] = [
  {
    id: 'locatie-root-wijk',
    vraag: 'In welke wijk/deelgemeente van Gent ligt The Root?',
    type: 'multiple_choice',
    opties: shuffle(['Zwijnaarde', 'Martelaarslaan', 'Tondelier', 'Sint-Pieters']),
    correctAntwoord: 'Zwijnaarde',
    uitleg: 'The Root ligt in Zwijnaarde, een perifere deelgemeente van Gent nabij het Technologiepark. Dit is de minst centrale ligging van alle projecten.',
    categorie: 'Locatie',
    moeilijkheid: 'Easy',
    projectIds: ['the-root'],
  },
  {
    id: 'locatie-arch-adres',
    vraag: 'Op welke straat ligt The Arch?',
    type: 'multiple_choice',
    opties: shuffle(['Martelaarslaan', 'Koning Albertlaan', 'Gasmeterlaan', 'Ottergemsesteenweg']),
    correctAntwoord: 'Martelaarslaan',
    uitleg: 'The Arch ligt op de Martelaarslaan 250 in het centrum van Gent, op wandelafstand van UGent (750m) en HOGENT (850m).',
    categorie: 'Locatie',
    moeilijkheid: 'Medium',
    projectIds: ['the-arch'],
  },
  {
    id: 'locatie-albert-station',
    vraag: 'The Albert is gelegen nabij welk Gents station?',
    type: 'multiple_choice',
    opties: shuffle(['Gent-Sint-Pieters', 'Gent-Dampoort', 'Gent-Centrum', 'Gentbrugge']),
    correctAntwoord: 'Gent-Sint-Pieters',
    uitleg: 'The Albert ligt op de Koning Albertlaan 121, vlakbij het station Gent-Sint-Pieters. De Mobiscore bedraagt 9,4/10 — uitstekende bereikbaarheid.',
    categorie: 'Locatie',
    moeilijkheid: 'Easy',
    projectIds: ['the-albert'],
  },
  {
    id: 'locatie-tondo-wijk',
    vraag: 'TONDO ligt in het Tondelier park — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Waar',
    uitleg: 'Correct! TONDO (Gasmeterlaan 103) maakt deel uit van de Tondelier-site, een stadsvernieuwingsproject in Gent. De ligging biedt potentieel voor waardestijging.',
    categorie: 'Locatie',
    moeilijkheid: 'Easy',
    projectIds: ['tondo'],
  },
  {
    id: 'locatie-arch-centrum',
    vraag: 'The Arch heeft de meest centrale locatie van alle projecten — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Waar',
    uitleg: 'The Arch op de Martelaarslaan in het centrum van Gent heeft samen met The Albert de beste locatie (★★★★★). The Arch is het dichtst bij campussen te voet.',
    categorie: 'Locatie',
    moeilijkheid: 'Medium',
    projectIds: ['the-arch', 'the-albert'],
  },
  {
    id: 'locatie-kotter-site',
    vraag: 'Kotter is gebouwd op de voormalige site van welk bedrijf?',
    type: 'multiple_choice',
    opties: shuffle(['CEVI', 'Diggit', 'UGent', 'Alheembouw']),
    correctAntwoord: 'CEVI',
    uitleg: 'Kotter wordt gebouwd op de voormalige CEVI-site aan de Ottergemsesteenweg. Het is een herbestemming van een kantoorgebouw, vandaar het 12% RR-regime.',
    categorie: 'Locatie',
    moeilijkheid: 'Hard',
    projectIds: ['kotter'],
  },
]

// --- DEVELOPER VRAGEN ---
const developerVragen: QuizQuestion[] = [
  ...projects.map(p => ({
    id: `dev-wie-${p.id}`,
    vraag: `Wie is de ontwikkelaar van ${p.naam}?`,
    type: 'multiple_choice' as const,
    opties: shuffle([
      p.ontwikkelaar.naam,
      ...pickDistractors(p.ontwikkelaar.naam, projects.map(x => x.ontwikkelaar.naam))
    ]),
    correctAntwoord: p.ontwikkelaar.naam,
    uitleg: `${p.naam} wordt ontwikkeld door ${p.ontwikkelaar.naam} (${p.ontwikkelaar.ervaring}).`,
    categorie: 'Algemeen' as QuizCategorie,
    moeilijkheid: 'Easy' as QuizMoeilijkheid,
    projectIds: [p.id],
  })),
  {
    id: 'dev-mm-estate',
    vraag: 'Welke projecten zijn ontwikkeld door MM Estate Group?',
    type: 'multiple_choice',
    opties: shuffle(['The Root & The Arch', 'The Albert & The Arch', 'The Root & Kotter', 'The Arch & Upkot']),
    correctAntwoord: 'The Root & The Arch',
    uitleg: 'MM Estate Group (opgericht 2021) ontwikkelt zowel The Root (Zwijnaarde) als The Arch (Martelaarslaan). Het is een relatief jonge ontwikkelaar.',
    categorie: 'Algemeen',
    moeilijkheid: 'Medium',
    projectIds: ['the-root', 'the-arch'],
  },
  {
    id: 'dev-candor-ervaring',
    vraag: 'Hoeveel jaar ervaring heeft Candor als ontwikkelaar?',
    type: 'multiple_choice',
    opties: shuffle(['35+ jaar', '25+ jaar', '10+ jaar', '50+ jaar']),
    correctAntwoord: '35+ jaar',
    uitleg: 'Candor heeft meer dan 35 jaar ervaring als vastgoedontwikkelaar. Dit is een sterk verkoopargument voor TONDO.',
    categorie: 'Algemeen',
    moeilijkheid: 'Easy',
    projectIds: ['tondo'],
  },
]

// --- TYPE / REGIME VRAGEN ---
const typeVragen: QuizQuestion[] = [
  {
    id: 'type-upkot-roerend',
    vraag: 'Upkot is een roerend goed investering (participatiemodel) — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Waar',
    uitleg: 'Correct! Upkot werkt via een participatiemodel waarbij je aandelen koopt, geen specifieke unit. Dit maakt het een roerend goed investering i.p.v. onroerend goed.',
    categorie: 'Algemeen',
    moeilijkheid: 'Medium',
    projectIds: ['upkot'],
  },
  {
    id: 'type-tondo-roerend',
    vraag: 'TONDO is een roerend goed investering — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Niet waar',
    uitleg: 'Niet waar. TONDO is een onroerend goed investering — je koopt een specifieke studentenkamer. Alleen Upkot werkt via een roerend participatiemodel.',
    categorie: 'Algemeen',
    moeilijkheid: 'Easy',
    projectIds: ['tondo'],
  },
  {
    id: 'type-welk-roerend',
    vraag: 'Welk project is een ROEREND goed investering (participatiemodel)?',
    type: 'multiple_choice',
    opties: shuffle(['Upkot', 'Kotter', 'TONDO', 'The Root']),
    correctAntwoord: 'Upkot',
    uitleg: 'Alleen Upkot werkt via een participatiemodel (roerend). Alle andere projecten zijn directe unit-aankopen (onroerend goed).',
    categorie: 'Algemeen',
    moeilijkheid: 'Easy',
    projectIds: ['upkot'],
  },
  {
    id: 'type-kotter-fiscaal',
    vraag: 'Welk project heeft het gunstigste fiscale regime?',
    type: 'multiple_choice',
    opties: shuffle(['Kotter (12% RR)', 'TONDO (21% btw)', 'The Albert (21% btw)', 'The Arch (21% btw)']),
    correctAntwoord: 'Kotter (12% RR)',
    uitleg: 'Kotter heeft 12% registratierechten door herbestemming. TONDO heeft een gemengd regime (12% RR + 21% btw). De meeste concurrenten betalen volledig 21% btw.',
    categorie: 'Prijs',
    moeilijkheid: 'Medium',
    projectIds: ['kotter', 'tondo'],
  },
]

// --- UNIT VRAGEN ---
const unitVragen: QuizQuestion[] = [
  ...projects.map(p => ({
    id: `units-hoeveel-${p.id}`,
    vraag: `Hoeveel units heeft ${p.naam}?`,
    type: 'schatting' as const,
    correctAntwoord: p.units.totaal,
    tolerantie: 0.15,
    uitleg: `${p.naam} heeft ${p.units.totaal} units${p.units.oppervlakteMin ? ` (${p.units.oppervlakteMin}-${p.units.oppervlakteMax}m²)` : ''}.`,
    categorie: 'Units' as QuizCategorie,
    moeilijkheid: 'Medium' as QuizMoeilijkheid,
    projectIds: [p.id],
  })),
  {
    id: 'units-meeste',
    vraag: 'Welk project heeft het meeste units?',
    type: 'multiple_choice',
    opties: shuffle(['Upkot (300+)', 'Kotter (126)', 'The Albert (110)', 'The Root (93)']),
    correctAntwoord: 'Upkot (300+)',
    uitleg: 'Upkot heeft met 300+ kamers verreweg de meeste units in Gent. Dit is deels dankzij het participatiemodel waarmee meerdere gebouwen worden gepoold.',
    categorie: 'Units',
    moeilijkheid: 'Easy',
    projectIds: ['upkot', 'kotter'],
  },
  {
    id: 'units-minste',
    vraag: 'Welk project heeft het minste units?',
    type: 'multiple_choice',
    opties: shuffle(['The Arch (59)', 'TONDO (80)', 'The Root (93)', 'The Albert (110)']),
    correctAntwoord: 'The Arch (59)',
    uitleg: 'The Arch is het kleinste project met slechts 59 units (50 kamers + 9 studio\'s). Dit is ±90% verkocht, wat de vraag aantoont.',
    categorie: 'Units',
    moeilijkheid: 'Easy',
    projectIds: ['the-arch'],
  },
  {
    id: 'units-ranking',
    vraag: 'Rangschik deze projecten van MEESTE naar MINSTE units:',
    type: 'ranking',
    opties: ['Kotter', 'The Albert', 'The Root', 'TONDO'],
    correctAntwoord: ['Kotter', 'The Albert', 'The Root', 'TONDO'],
    uitleg: 'Volgorde: Kotter 126 > The Albert 110 > The Root 93 > TONDO 80. The Arch (59) en Upkot (300+, participatie) staan niet in deze ranking.',
    categorie: 'Units',
    moeilijkheid: 'Hard',
    projectIds: ['kotter', 'the-albert', 'the-root', 'tondo'],
  },
  {
    id: 'units-tondo-80',
    vraag: 'TONDO heeft meer dan 100 studentenkamers — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Niet waar',
    uitleg: 'Niet waar. TONDO heeft 80 studentenkamers (variërend van 15 tot 22m²) op de Tondelier-site in Gent.',
    categorie: 'Units',
    moeilijkheid: 'Easy',
    projectIds: ['tondo'],
  },
]

// --- BEHEER VRAGEN ---
const beheerVragen: QuizQuestion[] = [
  {
    id: 'beheer-tondo',
    vraag: 'Wie beheert TONDO?',
    type: 'multiple_choice',
    opties: shuffle(['Diggit', 'Upkot', 'Candor zelf', 'Nog aan te stellen']),
    correctAntwoord: 'Diggit',
    uitleg: 'TONDO wordt beheerd door Diggit, een gespecialiseerde studentenverhuurder. De beheervergoeding bedraagt 10% en er is een pooling-systeem op quota-basis.',
    categorie: 'Beheer',
    moeilijkheid: 'Easy',
    projectIds: ['tondo'],
  },
  {
    id: 'beheer-pooling-tondo',
    vraag: 'TONDO werkt met een pooling-systeem via Diggit — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Waar',
    uitleg: 'Correct! TONDO gebruikt een quota-gebaseerd pooling-systeem via Diggit. Dit verdeelt het leegstandsrisico over alle investeerders.',
    categorie: 'Beheer',
    moeilijkheid: 'Medium',
    projectIds: ['tondo'],
  },
  {
    id: 'beheer-root-onbekend',
    vraag: 'Wie beheert The Root?',
    type: 'multiple_choice',
    opties: shuffle(['Beheerder nog aan te stellen', 'Diggit', 'MM Estate Group zelf', 'Upkot']),
    correctAntwoord: 'Beheerder nog aan te stellen',
    uitleg: 'The Root heeft nog geen beheerder aangesteld — een duidelijk zwak punt. Investeerders weten niet wie het dagelijks beheer op zich neemt.',
    categorie: 'Beheer',
    moeilijkheid: 'Easy',
    projectIds: ['the-root'],
  },
  {
    id: 'beheer-upkot-eigen',
    vraag: 'Upkot heeft eigen beheer i.p.v. een externe partner — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Waar',
    uitleg: 'Correct! Upkot (Upgrade Estate) beheert al hun projecten volledig in eigen huis. Dit geeft meer controle maar ook minder onafhankelijk toezicht.',
    categorie: 'Beheer',
    moeilijkheid: 'Medium',
    projectIds: ['upkot'],
  },
  {
    id: 'beheer-welke-diggit',
    vraag: 'Welke projecten worden beheerd door Diggit?',
    type: 'multiple_choice',
    opties: shuffle([
      'TONDO, The Albert & Kotter',
      'TONDO & The Albert',
      'Alleen TONDO',
      'TONDO, The Albert, The Arch & Kotter',
    ]),
    correctAntwoord: 'TONDO, The Albert & Kotter',
    uitleg: 'TONDO, The Albert en Kotter (als Diggit StudentLife) werken definitief met Diggit. The Arch heeft Diggit genoemd maar nog niet bevestigd.',
    categorie: 'Beheer',
    moeilijkheid: 'Hard',
    projectIds: ['tondo', 'the-albert', 'kotter', 'the-arch'],
  },
  {
    id: 'beheer-kotter-leefruimtes',
    vraag: 'Hoeveel gemeenschappelijke leefruimtes heeft Kotter?',
    type: 'multiple_choice',
    opties: shuffle(['12', '4', '6', '8']),
    correctAntwoord: '12',
    uitleg: 'Kotter heeft 12 gemeenschappelijke leefruimtes én 4 maakateliers. Dit onderscheidt Kotter als een community-gericht project.',
    categorie: 'Beheer',
    moeilijkheid: 'Hard',
    projectIds: ['kotter'],
  },
]

// --- RENDEMENT VRAGEN ---
const rendementVragen: QuizQuestion[] = [
  {
    id: 'rendement-garantie-welk',
    vraag: 'Welk project biedt een huurgarantie?',
    type: 'multiple_choice',
    opties: shuffle(['The Albert (jaar 1)', 'TONDO', 'Kotter', 'The Arch']),
    correctAntwoord: 'The Albert (jaar 1)',
    uitleg: 'Alleen The Albert biedt een huurgarantie voor het eerste jaar. TONDO, Kotter en The Arch bieden geen huurgarantie. Upkot heeft verhuurgarantie via UGent-partnerships.',
    categorie: 'Rendement',
    moeilijkheid: 'Easy',
    projectIds: ['the-albert'],
  },
  {
    id: 'rendement-tondo-garantie',
    vraag: 'TONDO biedt een huurgarantie — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Niet waar',
    uitleg: 'Niet waar. TONDO biedt geen huurgarantie. Dit is een van de zwaktes t.o.v. The Albert dat wél een huurgarantie voor jaar 1 biedt.',
    categorie: 'Rendement',
    moeilijkheid: 'Easy',
    projectIds: ['tondo'],
  },
  {
    id: 'rendement-tondo-bruto',
    vraag: 'Wat is het bruto rendement van TONDO?',
    type: 'multiple_choice',
    opties: shuffle(['3%-3,5%', '2,5%-3%', '±3,4%', '3,0-3,9%']),
    correctAntwoord: '3%-3,5%',
    uitleg: 'TONDO heeft een bruto rendement van 3%-3,5% en een netto rendement van 2,5%-3%. De beheervergoeding van Diggit bedraagt 10%.',
    categorie: 'Rendement',
    moeilijkheid: 'Medium',
    projectIds: ['tondo'],
  },
  {
    id: 'rendement-upkot-netto',
    vraag: 'Wat is het netto rendement van Upkot (Wing)?',
    type: 'multiple_choice',
    opties: shuffle(['2,4%', '3,5%', '4%', '1,8%']),
    correctAntwoord: '2,4%',
    uitleg: 'Upkot Wing heeft een netto rendement van 2,4% — het laagste van alle projecten. Dit is deels een gevolg van het participatiemodel en de lagere inkoopprijs.',
    categorie: 'Rendement',
    moeilijkheid: 'Hard',
    projectIds: ['upkot'],
  },
  {
    id: 'rendement-albert-bruto',
    vraag: 'The Albert heeft een bruto rendement van ±3,4% — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Waar',
    uitleg: 'Correct! The Albert heeft een bruto rendement van ±3,4%, vergelijkbaar met TONDO (3%-3,5%). Het voordeel van The Albert is de huurgarantie voor jaar 1.',
    categorie: 'Rendement',
    moeilijkheid: 'Medium',
    projectIds: ['the-albert'],
  },
  {
    id: 'rendement-huur-kamer',
    vraag: 'Wat is de gemiddelde huurprijs voor een studentenkamer in Gent?',
    type: 'multiple_choice',
    opties: shuffle([
      `€${marktData.gemHuurKamer}/maand`,
      '€400/maand',
      '€650/maand',
      '€750/maand',
    ]),
    correctAntwoord: `€${marktData.gemHuurKamer}/maand`,
    uitleg: `De gemiddelde huurprijs voor een studentenkamer in Gent is €${marktData.gemHuurKamer}/maand. Voor een studio is dat €${marktData.gemHuurStudio}/maand (bron: Kotkompas 2025).`,
    categorie: 'Rendement',
    moeilijkheid: 'Medium',
    projectIds: [],
  },
]

// --- VERGELIJKING VRAGEN ---
const vergelijkingVragen: QuizQuestion[] = [
  {
    id: 'verg-snelste-oplevering',
    vraag: 'Welk project wordt het vroegst opgeleverd?',
    type: 'multiple_choice',
    opties: shuffle(['The Arch (aug. 2026)', 'TONDO (sept. 2026)', 'The Albert (sept. 2027)', 'Kotter (2027-2028)']),
    correctAntwoord: 'The Arch (aug. 2026)',
    uitleg: 'The Arch wordt opgeleverd in augustus 2026 — de vroegste oplevering. TONDO volgt in september 2026, dan The Albert in september 2027 en Kotter pas in academiejaar 2027-2028.',
    categorie: 'Vergelijking',
    moeilijkheid: 'Medium',
    projectIds: ['the-arch', 'tondo', 'the-albert', 'kotter'],
  },
  {
    id: 'verg-rangschik-oplevering',
    vraag: 'Rangschik van vroegste naar laatste oplevering:',
    type: 'ranking',
    opties: ['The Arch', 'TONDO', 'The Albert', 'Kotter'],
    correctAntwoord: ['The Arch', 'TONDO', 'The Albert', 'Kotter'],
    uitleg: 'Oplevering: The Arch aug. 2026 → TONDO sept. 2026 → The Albert sept. 2027 → Kotter academiejaar 2027-2028.',
    categorie: 'Vergelijking',
    moeilijkheid: 'Hard',
    projectIds: ['the-arch', 'tondo', 'the-albert', 'kotter'],
  },
  {
    id: 'verg-candor-voordeel',
    vraag: 'Wat is het grootste voordeel van TONDO t.o.v. The Albert?',
    type: 'multiple_choice',
    opties: shuffle([
      'Lagere prijs & vroegere oplevering',
      'Betere locatie',
      'Hogere huurgarantie',
      'Meer units',
    ]),
    correctAntwoord: 'Lagere prijs & vroegere oplevering',
    uitleg: 'TONDO is €12.500 goedkoper (€152.500 vs €165.000) en wordt 1 jaar eerder opgeleverd (sept. 2026 vs sept. 2027). The Albert heeft als voordeel de betere locatie en huurgarantie jaar 1.',
    categorie: 'Vergelijking',
    moeilijkheid: 'Medium',
    projectIds: ['tondo', 'the-albert'],
  },
  {
    id: 'verg-meest-verkocht',
    vraag: 'Welk project heeft het hoogste verkooppercentage?',
    type: 'multiple_choice',
    opties: shuffle(['The Arch (±90%)', 'The Root (75%)', 'TONDO (in verkoop)', 'Kotter (in verkoop)']),
    correctAntwoord: 'The Arch (±90%)',
    uitleg: 'The Arch is ±90% verkocht — bijna uitverkocht. The Root is 75% verkocht. TONDO en Kotter zijn nog volop in verkoop.',
    categorie: 'Vergelijking',
    moeilijkheid: 'Easy',
    projectIds: ['the-arch', 'the-root'],
  },
  {
    id: 'verg-rangschik-prijs',
    vraag: 'Rangschik van goedkoopste naar duurste instapprijs (directe unit):',
    type: 'ranking',
    opties: ['Kotter', 'TONDO', 'The Root', 'The Albert'],
    correctAntwoord: ['Kotter', 'TONDO', 'The Root', 'The Albert'],
    uitleg: 'Goedkoopste naar duurste: Kotter €149.500 → TONDO €150.750 → The Root €162.500 → The Albert €165.000. The Arch is het duurst aan €167.500.',
    categorie: 'Vergelijking',
    moeilijkheid: 'Hard',
    projectIds: ['kotter', 'tondo', 'the-root', 'the-albert'],
  },
  {
    id: 'verg-tondo-uniek',
    vraag: 'Wat maakt TONDO uniek als Candor-project t.o.v. alle concurrenten?',
    type: 'multiple_choice',
    opties: shuffle([
      '35 jaar ervaring ontwikkelaar + Tondelier stadsvernieuwing',
      'Laagste prijs op de markt',
      'Huurgarantie + pooling',
      'Grootste project met meeste units',
    ]),
    correctAntwoord: '35 jaar ervaring ontwikkelaar + Tondelier stadsvernieuwing',
    uitleg: 'TONDO onderscheidt zich door Candors 35+ jaar ervaring én de ligging in het Tondelier stadsvernieuwingsgebied (meerwaardepotentieel). Kotter heeft de laagste prijs, The Albert de huurgarantie.',
    categorie: 'Vergelijking',
    moeilijkheid: 'Medium',
    projectIds: ['tondo'],
  },
]

// --- MARKT VRAGEN ---
const marktVragen: QuizQuestion[] = [
  {
    id: 'markt-studenten-gent',
    vraag: 'Hoeveel studenten studeren er in Gent?',
    type: 'schatting',
    correctAntwoord: marktData.aantalStudenten,
    tolerantie: 0.15,
    uitleg: `Er studeren ±${marktData.aantalStudenten.toLocaleString('nl-BE')} studenten in Gent, waarvan ±50% op kot. Dit maakt Gent een van de grootste universiteitssteden van België.`,
    categorie: 'Markt',
    moeilijkheid: 'Medium',
    projectIds: [],
  },
  {
    id: 'markt-tekort-kamers',
    vraag: 'Wat is het structureel tekort aan studentenkamers in Gent?',
    type: 'multiple_choice',
    opties: shuffle(['>10.000', '>5.000', '>20.000', '>2.000']),
    correctAntwoord: '>10.000',
    uitleg: `Gent heeft een structureel tekort van meer dan 10.000 studentenkamers (Kotkompas 2025). Dit is een sterke onderbouwing voor studentenvastgoed als investering.`,
    categorie: 'Markt',
    moeilijkheid: 'Easy',
    projectIds: [],
  },
  {
    id: 'markt-instroom',
    vraag: 'Met hoeveel studenten per jaar groeit de studentenpopulatie in Gent?',
    type: 'multiple_choice',
    opties: shuffle(['+2.000/jaar', '+500/jaar', '+5.000/jaar', '+10.000/jaar']),
    correctAntwoord: '+2.000/jaar',
    uitleg: `Jaarlijks stromen er ±${marktData.jaarlijkseInstroom.toLocaleString('nl-BE')} extra studenten in naar Gent. Dit vergroot het structureel tekort aan studentenkamers elk jaar verder.`,
    categorie: 'Markt',
    moeilijkheid: 'Medium',
    projectIds: [],
  },
  {
    id: 'markt-rendement-range',
    vraag: 'Wat is het typische bruto huurrendement voor studentenvastgoed in Gent?',
    type: 'multiple_choice',
    opties: shuffle(['3-5%', '1-2%', '6-8%', '5-7%']),
    correctAntwoord: '3-5%',
    uitleg: `Het bruto huurrendement voor studentenvastgoed in Gent bedraagt gemiddeld ${marktData.brutoHuurrendementRange}. Dit is hoger dan klassieke residentiële huurwoningen.`,
    categorie: 'Markt',
    moeilijkheid: 'Easy',
    projectIds: [],
  },
  {
    id: 'markt-eis-gent',
    vraag: 'Welk percentage basiskamers eist de stad Gent minimum in grote projecten?',
    type: 'multiple_choice',
    opties: shuffle(['20%', '10%', '30%', '50%']),
    correctAntwoord: '20%',
    uitleg: 'De stad Gent eist minimaal 20% basiskamers in grote studentenprojecten. Dit is een stedenbouwkundige voorwaarde om betaalbaar kotaanbod te garanderen.',
    categorie: 'Markt',
    moeilijkheid: 'Hard',
    projectIds: [],
  },
]

// --- DUURZAAMHEID VRAGEN ---
const duurzaamheidVragen: QuizQuestion[] = [
  {
    id: 'duurz-tondo-epc',
    vraag: 'TONDO is een BEN-gebouw met warmtenet — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Waar',
    uitleg: 'Correct! TONDO is een Bijna-Energie-Neutraal (BEN) gebouw met een warmtenet als duurzame verwarmingsoplossing. EPC-peil: E49.',
    categorie: 'Duurzaamheid',
    moeilijkheid: 'Medium',
    projectIds: ['tondo'],
  },
  {
    id: 'duurz-beste-epc',
    vraag: 'Welke projecten hebben een EPC-score A+?',
    type: 'multiple_choice',
    opties: shuffle(['The Root & The Arch', 'TONDO & Kotter', 'The Albert & Upkot', 'Alle projecten']),
    correctAntwoord: 'The Root & The Arch',
    uitleg: 'The Root en The Arch hebben beide EPC A+. TONDO heeft E-peil E49. Kotter focust op hergebruik van structuur maar geen specifieke A+ vermelding.',
    categorie: 'Duurzaamheid',
    moeilijkheid: 'Hard',
    projectIds: ['the-root', 'the-arch'],
  },
  {
    id: 'duurz-kotter-hergebruik',
    vraag: 'Kotter maakt gebruik van hergebruik van de bestaande structuur — waar of niet waar?',
    type: 'true_false',
    correctAntwoord: 'Waar',
    uitleg: 'Correct! Kotter hergebruikt de bestaande structuur van het voormalige CEVI-kantoorgebouw. Dit is duurzaam (minder sloopafval) en helpt de kosten beperken.',
    categorie: 'Duurzaamheid',
    moeilijkheid: 'Medium',
    projectIds: ['kotter'],
  },
]

// Combineer alle vragen
export const alleVragen: QuizQuestion[] = [
  ...prijsVragen,
  ...locatieVragen,
  ...developerVragen,
  ...typeVragen,
  ...unitVragen,
  ...beheerVragen,
  ...rendementVragen,
  ...vergelijkingVragen,
  ...marktVragen,
  ...duurzaamheidVragen,
]

export function generateQuestions(config: QuizConfig): QuizQuestion[] {
  let pool = [...alleVragen]

  // Filter op moeilijkheid
  if (config.moeilijkheid !== 'Alles') {
    pool = pool.filter(q => q.moeilijkheid === config.moeilijkheid)
  }

  // Filter op categorieën
  if (config.categorieen.length > 0) {
    pool = pool.filter(q => config.categorieen.includes(q.categorie))
  }

  // Filter op scope
  if (config.scope === 'Alleen Candor') {
    pool = pool.filter(q => q.projectIds.length === 0 || q.projectIds.some(id => id === 'tondo'))
  } else if (config.scope === 'Alleen Concurrenten') {
    pool = pool.filter(q => q.projectIds.length === 0 || q.projectIds.some(id => id !== 'tondo'))
  }

  // Shuffle en pak het gewenste aantal
  const shuffled = shuffle(pool)
  return shuffled.slice(0, Math.min(config.aantalVragen, shuffled.length))
}

export const alleCategorieen: QuizCategorie[] = [
  'Prijs', 'Rendement', 'Locatie', 'Units', 'Beheer', 'Duurzaamheid', 'Algemeen', 'Vergelijking', 'Markt'
]
