/**
 * RPG-CHARAKTERBOGEN & TITEL-SYSTEM
 * Mr. oder Mrs. Walibi - Sauftour '26
 */

window.RPG_CLASSES = [
  {
    id: "brecher",
    name: "Der Brecher",
    icon: "🎢",
    tagline: "Volle Wucht",
    desc: "Liebt die intensivsten Achterbahnen und meidet ruhige Fahrgeschäfte.",
    buff: "+20% Punkte auf Coaster & Action-Quests",
    category: "action"
  },
  {
    id: "feinschmecker",
    name: "Der Feinschmecker",
    icon: "🍔",
    tagline: "Gourmet-Spürnase",
    desc: "Kennt jeden Snack-Stand und steuert zielsicher den nächsten Imbiss an.",
    buff: "+20% Punkte auf Verpflegungs- & Fritte-Quests",
    category: "food"
  },
  {
    id: "navigator",
    name: "Der Navigator",
    icon: "🧭",
    tagline: "Parkplan im Kopf",
    desc: "Hat den Parkplan im Kopf und bestimmt das Marschtempo der Gruppe.",
    buff: "+20% Punkte auf Orientierungs- & Timing-Quests",
    category: "guide"
  },
  {
    id: "tank",
    name: "Der Tank",
    icon: "🛡️",
    tagline: "Unzerstörbar",
    desc: "Höchste Durchhaltefähigkeit bei langen Sessions, Attraktionen und Getränken.",
    buff: "Erhöhte Ausdauer & Trink-Resistenz",
    category: "drink"
  },
  {
    id: "coaster_junkie",
    name: "Der Coaster-Junkie",
    icon: "🚀",
    tagline: "Airtime-Süchtig",
    desc: "Geht nur in den Park für First Drops, Inversionen und maximale Airtime.",
    buff: "Extra-Punkte bei jeder gefahrenen Achterbahn",
    category: "action"
  },
  {
    id: "taschenhalter",
    name: "Der Taschenhalter",
    icon: "🎒",
    tagline: "Hüter des Gepäcks",
    desc: "Bleibt gerne draußen stehen und passt gewissenhaft auf alle Rucksäcke auf.",
    buff: "+15 Punkte Bonus bei Gruppen-Unterstützung",
    category: "social"
  },
  {
    id: "schreckhafte",
    name: "Der Schreckhafte",
    icon: "😱",
    tagline: "Voller Dezibel",
    desc: "Zieht bei jedem Drop Grimassen und kreischt verlässlich in jeder Kurve.",
    buff: "Bonuspunkte auf Onride-Fotoposen & Kreisch-Videos",
    category: "fun"
  },
  {
    id: "sparfuchs",
    name: "Der Sparfuchs",
    icon: "🪙",
    tagline: "Rabatt-Kalkulator",
    desc: "Rechnet jeden Souvenirpreis vor und vergleicht Snack-Angebote centgenau.",
    buff: "Erspart der Gruppe unnötige Ausgaben",
    category: "social"
  },
  {
    id: "dj_entertainer",
    name: "Der DJ / Entertainer",
    icon: "🎤",
    tagline: "Stimmungs-Katalysator",
    desc: "Hält die Stimmung in jeder noch so langen Warteschlange auf Anschlag hoch.",
    buff: "+20% Punkte auf La-Ola-Wellen & Social-Posts",
    category: "fun"
  },
  {
    id: "fotograf",
    name: "Der Fotograf",
    icon: "📸",
    tagline: "Dauer-Auslöser",
    desc: "Hält die Kamera auf jedes Geschehen und verpasst keinen Schnappschuss.",
    buff: "+10 XP bei Foto- und Video-Uploads",
    category: "social"
  },
  {
    id: "alchemist",
    name: "Der Alchemist",
    icon: "🧪",
    tagline: "Mix-Genie",
    desc: "Mixt abenteuerliche Getränkekombinationen und Spezial-Shots zusammen.",
    buff: "+20% Punkte bei Mix- & Trink-Challenges",
    category: "drink"
  },
  {
    id: "stratege",
    name: "Der Stratege",
    icon: "📐",
    tagline: "Sekundengenau",
    desc: "Berechnet Wartezeiten, Fastpässe und Laufwege auf die Sekunde genau.",
    buff: "Optimiert die Parkroute für maximale Bahnen",
    category: "guide"
  },
  {
    id: "bedenkentraeger",
    name: "Der Bedenkenträger",
    icon: "⚠️",
    tagline: "Sicherheits-TÜV",
    desc: "Liest jedes Warnschild und überprüft Sicherheitsbügel doppelt.",
    buff: "Schützt die Gruppe vor riskanten Manövern",
    category: "social"
  },
  {
    id: "dauer_optimist",
    name: "Der Dauer-Optimist",
    icon: "☀️",
    tagline: "Sonnenschein",
    desc: "Findet selbst 90 Minuten Wartezeit bei strömendem Regen noch fantastisch.",
    buff: "Gedulds-Buff auf alle langen Wartezeiten",
    category: "fun"
  },
  {
    id: "fluchthelfer",
    name: "Der Fluchthelfer",
    icon: "🏃",
    tagline: "Rettungsanker",
    desc: "Sucht als Erster nach Toiletten, Schattenplätzen oder gemütlichen Bänken.",
    buff: "Findet in Rekordzeit die nächste Oase",
    category: "guide"
  },
  {
    id: "souvenir_koenig",
    name: "Der Souvenir-König",
    icon: "🧸",
    tagline: "Merch-Sammler",
    desc: "Verlässt den Park garantiert beladen mit Plüschtieren, T-Shirts oder Hüten.",
    buff: "+20% Punkte auf Souvenir-Shop-Quests",
    category: "fun"
  },
  {
    id: "hypochonder",
    name: "Der Hypochonder",
    icon: "🩹",
    tagline: "Feinfühlig",
    desc: "Spürt nach jeder zweiten Bahn ein leichtes Ziehen im Rücken oder Magen.",
    buff: "Verdient Mitleids- & Sympathie-Punkte",
    category: "fun"
  },
  {
    id: "motivator",
    name: "Der Motivator",
    icon: "🔥",
    tagline: "Gruppen-Antreiber",
    desc: "Zieht auch den Letzten der Gruppe noch in die höchste Bahn.",
    buff: "+25 Punkte für mitgenommene Mitfahrer",
    category: "action"
  },
  {
    id: "ruhepol",
    name: "Der Ruhepol",
    icon: "🧘",
    tagline: "Zen-Meister",
    desc: "Bleibt bei jeder Hektik tiefenentspannt und lässt sich einfach treiben.",
    buff: "Resistent gegen Park-Stress und Hektik",
    category: "social"
  },
  {
    id: "pechvogel",
    name: "Der Pechvogel",
    icon: "🦆",
    tagline: "Wasser-Magnet",
    desc: "Sitzt verlässlich auf dem nassesten Platz der Wasserbahn.",
    buff: "Doppelte Punkte bei klitschnassen Wasserbahn-Fahrten",
    category: "fun"
  }
];

window.RPG_STATS = [
  {
    id: "magen",
    name: "Magen-Härte",
    icon: "🤢",
    desc: "Resistenz gegen Loopings, Inversionen und schwere Kost.",
    color: "#10b981",
    unit: "/10"
  },
  {
    id: "blase",
    name: "Blasenkapazität",
    icon: "🚽",
    desc: "Wie lange hält man ohne Toiletten-Stopp durch.",
    color: "#06b6d4",
    unit: "/10"
  },
  {
    id: "geduld",
    name: "Geduldsfaden",
    icon: "⏳",
    desc: "Nervenstärke beim Stehen in 60+ Minuten Warteschlangen.",
    color: "#f59e0b",
    unit: "/10"
  },
  {
    id: "durst",
    name: "Durst-Resistenz",
    icon: "🍺",
    desc: "Fähigkeit, ohne Pause flüssigen Nachschub zu verarbeiten.",
    color: "#ff7700",
    unit: "/10"
  },
  {
    id: "adrenalin",
    name: "Adrenalin-Pegel",
    icon: "⚡",
    desc: "Sucht nach immer höheren Drops und schnelleren Fahrten.",
    color: "#e11d48",
    unit: "/10"
  }
];

// Automatische Promille-Meilensteine mit Schwellenwert in Promille
window.PROMILLE_MILESTONES = [
  { threshold: 0.3, id: "title_promille_03", title: "Warm-Trinker", icon: "🍻", desc: "Erste Betriebstemperatur von 0,3‰ erreicht." },
  { threshold: 0.5, id: "title_promille_05", title: "Hobby-Alkoholiker", icon: "🍺", desc: "Solide 0,5‰ Park-Pegel gemessen." },
  { threshold: 0.8, id: "title_promille_08", title: "Fahrgeschäft-Tauglichkeits-Prüfer", icon: "🎢", desc: "0,8‰ – Höchste Konzentration vor dem Looping!" },
  { threshold: 1.0, id: "title_promille_10", title: "Pegel-Kapitän", icon: "⚓", desc: "Die 1,0‰ Schallmauer souverän durchbrochen." },
  { threshold: 1.3, id: "title_promille_13", title: "Schluckspecht von Walibi", icon: "🦅", desc: "1,3‰ – Gleitflug durch den Freizeitpark!" },
  { threshold: 1.5, id: "title_promille_15", title: "Trunkenbold der Tafelrunde", icon: "⚔️", desc: "1,5‰ – Ritterliche Standfestigkeit bewiesen!" },
  { threshold: 1.8, id: "title_promille_18", title: "Promille-Baron", icon: "👑", desc: "1,8‰ – Adel verpflichtet zum nächsten Kaltgetränk!" },
  { threshold: 2.0, id: "title_promille_20", title: "Lebende Legende / Absoluter Härtetest", icon: "💀", desc: "2,0+‰ – Historischer Rekordwert auf der Sauftour '26!" }
];

// Weitere freischaltbare Titel aus Aktionen (werden erst bei Erfüllung im Profil sichtbar)
window.ACTION_TITLES = [
  { id: "title_untamed_bezwinger", title: "Untamed-Bezwinger", icon: "🪵", desc: "Hybrid-Coaster Untamed bezwungen." },
  { id: "title_first_drop_survivor", title: "First-Drop-Survivor", icon: "🎢", desc: "Den Mega-Drop von Goliath oder Lost Gravity gemeistert." },
  { id: "title_wasser_magnet", title: "Wasser-Magnet", icon: "🌊", desc: "Crazy River oder El Rio Grande gefahren und nass geworden." },
  { id: "title_pommes_diplomat", title: "Pommes-Diplomat", icon: "🍟", desc: "Den Pommes-Tauschhandel oder Frikandel-Test bestanden." },
  { id: "title_schaumkronen_koenig", title: "Schaumkronen-König", icon: "🍺", desc: "Mindestens 5 Biere auf der Tour registriert." },
  { id: "title_schnappschuss_legende", title: "Schnappschuss-Legende", icon: "📸", desc: "Mindestens 5 Fotos oder Videos im Live-Feed geteilt." },
  { id: "title_ehren_zeuge", title: "Ehren-Zeuge", icon: "👁️", desc: "Mindestens 3 Quests von Mitspielern als Zeuge bestätigt." },
  { id: "title_thronanwaerter", title: "Mr./Mrs. Walibi Thronanwärter", icon: "👑", desc: "Einen Platz unter den Top 3 im Gesamtranking erreicht." }
];
