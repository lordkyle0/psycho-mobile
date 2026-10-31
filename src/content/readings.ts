import type { ArchetypeKey } from './archetypes';

// Versets : traduction Louis Segond 1910 (domaine public).
export interface Verse {
  ref: string;
  text: string;
  archetypes: ArchetypeKey[];
}

export const VERSES: Verse[] = [
  {
    ref: 'Proverbes 4:23',
    text: 'Garde ton cœur plus que toute autre chose, car de lui viennent les sources de la vie.',
    archetypes: ['roi', 'reine', 'mystique'],
  },
  {
    ref: 'Josué 1:9',
    text: "Ne t'ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.",
    archetypes: ['guerrier', 'amazone'],
  },
  {
    ref: 'Philippiens 4:13',
    text: 'Je puis tout par celui qui me fortifie.',
    archetypes: ['guerrier', 'amazone'],
  },
  {
    ref: 'Proverbes 16:32',
    text: "Celui qui est lent à la colère vaut mieux qu'un héros, et celui qui est maître de lui-même, que celui qui prend des villes.",
    archetypes: ['guerrier', 'roi'],
  },
  {
    ref: '2 Timothée 1:7',
    text: "Car ce n'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d'amour et de sagesse.",
    archetypes: ['guerrier', 'amazone', 'magicien'],
  },
  {
    ref: 'Matthieu 6:34',
    text: 'Ne vous inquiétez donc pas du lendemain; car le lendemain aura soin de lui-même. A chaque jour suffit sa peine.',
    archetypes: ['mystique', 'mere'],
  },
  {
    ref: 'Romains 12:2',
    text: "Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence, afin que vous discerniez quelle est la volonté de Dieu, ce qui est bon, agréable et parfait.",
    archetypes: ['magicien', 'mystique'],
  },
  {
    ref: 'Galates 5:22-23',
    text: "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance; la loi n'est pas contre ces choses.",
    archetypes: ['amant', 'amante', 'mere'],
  },
  {
    ref: 'Psaume 46:11',
    text: 'Arrêtez, et sachez que je suis Dieu: Je domine sur les nations, je domine sur la terre.',
    archetypes: ['mystique', 'magicien'],
  },
  {
    ref: 'Jacques 1:19',
    text: 'Sachez-le, mes frères bien-aimés. Ainsi, que tout homme soit prompt à écouter, lent à parler, lent à se mettre en colère;',
    archetypes: ['magicien', 'mere', 'roi'],
  },
  {
    ref: '1 Corinthiens 13:4',
    text: "La charité est patiente, elle est pleine de bonté; la charité n'est point envieuse; la charité ne se vante point, elle ne s'enfle point d'orgueil,",
    archetypes: ['amant', 'amante', 'mere'],
  },
  {
    ref: 'Proverbes 31:25',
    text: "Elle est revêtue de force et de gloire, et elle se rit de l'avenir.",
    archetypes: ['reine', 'amazone'],
  },
  {
    ref: 'Ésaïe 40:31',
    text: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles; ils courent, et ne se lassent point, ils marchent, et ne se fatiguent point.",
    archetypes: ['guerrier', 'amazone', 'mystique'],
  },
  {
    ref: 'Michée 6:8',
    text: "On t'a fait connaître, ô homme, ce qui est bien; et ce que l'Éternel demande de toi, c'est que tu pratiques la justice, que tu aimes la miséricorde, et que tu marches humblement avec ton Dieu.",
    archetypes: ['roi', 'reine'],
  },
  {
    ref: 'Psaume 139:14',
    text: 'Je te loue de ce que je suis une créature si merveilleuse. Tes œuvres sont admirables, et mon âme le reconnaît bien.',
    archetypes: ['amant', 'amante', 'reine'],
  },
  {
    ref: 'Ecclésiaste 3:1',
    text: 'Il y a un temps pour tout, un temps pour toute chose sous les cieux:',
    archetypes: ['magicien', 'mystique'],
  },
  {
    ref: 'Proverbes 3:5-6',
    text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.",
    archetypes: ['mystique', 'roi'],
  },
  {
    ref: 'Matthieu 7:7',
    text: "Demandez, et l'on vous donnera; cherchez, et vous trouverez; frappez, et l'on vous ouvrira.",
    archetypes: ['magicien', 'amazone'],
  },
  {
    ref: '1 Pierre 5:7',
    text: 'et déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.',
    archetypes: ['mere', 'mystique'],
  },
  {
    ref: 'Colossiens 3:23',
    text: 'Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes,',
    archetypes: ['guerrier', 'amazone', 'roi'],
  },
  {
    ref: 'Psaume 23:1',
    text: "L'Éternel est mon berger: je ne manquerai de rien.",
    archetypes: ['roi', 'mere', 'mystique'],
  },
  {
    ref: 'Jean 8:32',
    text: 'vous connaîtrez la vérité, et la vérité vous affranchira.',
    archetypes: ['magicien', 'mystique'],
  },
];

// Plan de lecture : Proverbes selon le jour du mois, un Psaume, et les quatre Évangiles en continu.
const GOSPELS: [string, number][] = [
  ['Matthieu', 28],
  ['Marc', 16],
  ['Luc', 24],
  ['Jean', 21],
];
const GOSPEL_CHAPTERS = GOSPELS.reduce((n, [, c]) => n + c, 0);

export interface BiblePlan {
  proverbs: string;
  psalm: string;
  gospel: string;
}

export function biblePlan(dayOfMonth: number, dayOfYear: number): BiblePlan {
  let idx = (dayOfYear - 1) % GOSPEL_CHAPTERS;
  let gospel = '';
  for (const [book, chapters] of GOSPELS) {
    if (idx < chapters) {
      gospel = `${book} ${idx + 1}`;
      break;
    }
    idx -= chapters;
  }
  return {
    proverbs: `Proverbes ${Math.min(dayOfMonth, 31)}`,
    psalm: `Psaume ${((dayOfYear - 1) % 150) + 1}`,
    gospel,
  };
}

export interface PhilosophyReading {
  author: string;
  source: string;
  text: string;
  reflection: string;
  archetypes: ArchetypeKey[];
}

// Citations d'auteurs classiques ; les traductions des Anciens sont des formulations usuelles en français.
export const PHILOSOPHY: PhilosophyReading[] = [
  {
    author: 'Épictète',
    source: 'Manuel, 1',
    text: 'Il y a ce qui dépend de nous, et ce qui ne dépend pas de nous.',
    reflection:
      "Liste ce qui t'inquiète aujourd'hui. Barre tout ce qui ne dépend pas de toi.",
    archetypes: ['magicien', 'roi', 'mystique'],
  },
  {
    author: 'Épictète',
    source: 'Manuel, 5',
    text: "Ce qui trouble les hommes, ce ne sont pas les choses, mais les jugements qu'ils portent sur les choses.",
    reflection: 'Quel jugement, plutôt que quel fait, te pèse en ce moment ?',
    archetypes: ['magicien', 'mystique'],
  },
  {
    author: 'Marc Aurèle',
    source: 'Pensées, II, 1',
    text: "Dès l'aurore, dis-toi d'avance : je rencontrerai un indiscret, un ingrat, un insolent, un fourbe, un envieux, un insociable.",
    reflection:
      'Prépare-toi à une contrariété probable du jour. Comment veux-tu y répondre ?',
    archetypes: ['roi', 'guerrier'],
  },
  {
    author: 'Marc Aurèle',
    source: 'Pensées, X, 16',
    text: "Ne discute plus sur ce que doit être l'homme de bien, mais sois-le.",
    reflection: "Quelle vertu vas-tu incarner concrètement aujourd'hui ?",
    archetypes: ['guerrier', 'roi', 'amazone'],
  },
  {
    author: 'Marc Aurèle',
    source: 'Pensées, VII, 69',
    text: "La perfection morale consiste à vivre chaque jour comme si c'était le dernier, sans agitation, sans torpeur, sans hypocrisie.",
    reflection:
      'Laquelle des trois — agitation, torpeur, hypocrisie — te guette le plus ?',
    archetypes: ['roi', 'reine', 'guerrier'],
  },
  {
    author: 'Sénèque',
    source: 'De la brièveté de la vie, I',
    text: "Ce n'est pas que nous ayons peu de temps, c'est que nous en perdons beaucoup.",
    reflection:
      "Où as-tu perdu du temps hier ? Que vas-tu en faire aujourd'hui ?",
    archetypes: ['guerrier', 'amazone'],
  },
  {
    author: 'Sénèque',
    source: 'Lettres à Lucilius, 13',
    text: 'Nous souffrons plus souvent en imagination que dans la réalité.',
    reflection:
      "Quelle peur imaginaire peux-tu confronter à la réalité aujourd'hui ?",
    archetypes: ['magicien', 'guerrier'],
  },
  {
    author: 'Sénèque',
    source: 'Lettres à Lucilius, 1',
    text: 'Revendique-toi pour toi-même.',
    reflection: 'À qui ou à quoi as-tu abandonné ta souveraineté récemment ?',
    archetypes: ['roi', 'reine'],
  },
  {
    author: 'Socrate',
    source: 'Platon, Apologie de Socrate, 38a',
    text: "Une vie sans examen ne vaut pas la peine d'être vécue.",
    reflection: "Qu'as-tu examiné de toi cette semaine ?",
    archetypes: ['magicien', 'mystique'],
  },
  {
    author: 'Aristote',
    source: 'Éthique à Nicomaque, II, 1',
    text: "C'est en pratiquant les actions justes que nous devenons justes, les actions modérées que nous devenons modérés, et les actions courageuses que nous devenons courageux.",
    reflection:
      'Quelle petite action répétée construit la personne que tu veux devenir ?',
    archetypes: ['guerrier', 'amazone', 'roi'],
  },
  {
    author: 'Montaigne',
    source: 'Essais, I, 39',
    text: "La plus grande chose du monde, c'est de savoir être à soi.",
    reflection: "Quand t'es-tu senti(e) pleinement toi-même cette semaine ?",
    archetypes: ['reine', 'roi', 'mystique'],
  },
  {
    author: 'Montaigne',
    source: 'Essais, I, 20',
    text: 'Qui apprendrait les hommes à mourir leur apprendrait à vivre.',
    reflection:
      "Si tu n'avais qu'un an à vivre, que changerais-tu dès aujourd'hui ?",
    archetypes: ['magicien', 'amant'],
  },
  {
    author: 'Pascal',
    source: 'Pensées',
    text: 'Le cœur a ses raisons que la raison ne connaît point.',
    reflection: "Que te dit ton cœur que ta raison refuse d'entendre ?",
    archetypes: ['amant', 'amante', 'mystique'],
  },
  {
    author: 'Pascal',
    source: 'Pensées',
    text: "Tout le malheur des hommes vient d'une seule chose, qui est de ne savoir pas demeurer en repos, dans une chambre.",
    reflection:
      'Peux-tu rester 10 minutes sans stimulation ? Que se passe-t-il en toi ?',
    archetypes: ['mystique', 'magicien'],
  },
  {
    author: 'Pascal',
    source: 'Pensées',
    text: "L'homme n'est qu'un roseau, le plus faible de la nature ; mais c'est un roseau pensant.",
    reflection: 'Où se trouve ta force véritable, malgré ta fragilité ?',
    archetypes: ['magicien', 'reine'],
  },
  {
    author: 'Descartes',
    source: 'Discours de la méthode, III',
    text: "Tâcher toujours plutôt à me vaincre que la fortune, et à changer mes désirs que l'ordre du monde.",
    reflection:
      'Quel désir pourrais-tu ajuster plutôt que de lutter contre la réalité ?',
    archetypes: ['guerrier', 'magicien'],
  },
  {
    author: 'La Rochefoucauld',
    source: 'Maximes, 19',
    text: "Nous avons tous assez de force pour supporter les maux d'autrui.",
    reflection:
      "As-tu été aussi exigeant(e) envers toi qu'envers les autres ? Et aussi indulgent(e) ?",
    archetypes: ['mere', 'roi'],
  },
  {
    author: 'Kierkegaard',
    source: 'Journal',
    text: "La vie ne peut être comprise qu'en regardant en arrière ; mais elle doit être vécue en regardant en avant.",
    reflection: 'Quelle leçon du passé éclaire ton prochain pas ?',
    archetypes: ['magicien', 'amazone'],
  },
  {
    author: 'Nietzsche',
    source: 'Le Gai Savoir, 270',
    text: 'Que dit ta conscience ? « Tu dois devenir celui que tu es. »',
    reflection: "Qu'est-ce qui, en toi, demande à grandir ?",
    archetypes: ['roi', 'reine', 'amazone'],
  },
  {
    author: 'Simone Weil',
    source: 'Lettre à Joë Bousquet',
    text: "L'attention est la forme la plus rare et la plus pure de la générosité.",
    reflection: "À qui vas-tu offrir ton attention pleine aujourd'hui ?",
    archetypes: ['mere', 'amante', 'amant'],
  },
  {
    author: 'Lao-Tseu',
    source: 'Tao Te King, 33',
    text: "Connaître les autres, c'est sagesse ; se connaître soi-même, c'est sagesse supérieure.",
    reflection: "Qu'as-tu découvert sur toi récemment ?",
    archetypes: ['mystique', 'magicien'],
  },
  {
    author: 'Lao-Tseu',
    source: 'Tao Te King, 64',
    text: 'Un voyage de mille lieues commence par un pas.',
    reflection: "Quel est le premier petit pas vers ton objectif de l'année ?",
    archetypes: ['amazone', 'guerrier'],
  },
  {
    author: 'C. G. Jung',
    source: 'Lettre à Fanny Bowditch, 1916',
    text: "Ta vision ne deviendra claire que lorsque tu regarderas dans ton cœur. Qui regarde à l'extérieur rêve ; qui regarde à l'intérieur s'éveille.",
    reflection:
      "Qu'est-ce que tu cherches dehors qui se trouve peut-être en toi ?",
    archetypes: ['mystique', 'magicien'],
  },
  {
    author: 'Viktor Frankl',
    source: 'Découvrir un sens à sa vie',
    text: 'On peut tout enlever à un homme, excepté une chose, la dernière des libertés humaines : choisir son attitude face aux circonstances.',
    reflection: 'Quelle attitude choisis-tu face à ta difficulté du moment ?',
    archetypes: ['guerrier', 'roi', 'reine'],
  },
];
