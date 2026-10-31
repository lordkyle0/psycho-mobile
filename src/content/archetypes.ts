// Archétypes masculins : Robert Moore & Douglas Gillette, « King, Warrior, Magician, Lover » (1990).
// Archétypes féminins : typologie de Toni Wolff (Mère, Hétaïre/Amante, Amazone, Médiale),
// complétée par la Reine comme centre ordonnateur, en miroir du Roi.

export type Profile = 'masculin' | 'feminin' | 'integral';

export type ArchetypeKey =
  | 'roi'
  | 'guerrier'
  | 'magicien'
  | 'amant'
  | 'reine'
  | 'mere'
  | 'amazone'
  | 'mystique'
  | 'amante';

export interface Archetype {
  key: ArchetypeKey;
  name: string;
  polarity: 'masculin' | 'feminin';
  emoji: string;
  color: string;
  essence: string;
  plenitude: string[];
  /** Ombre bipolaire : pôle actif (excès) et pôle passif (manque). */
  shadowActive: { name: string; signs: string };
  shadowPassive: { name: string; signs: string };
  question: string;
}

export const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  roi: {
    key: 'roi',
    name: 'Roi',
    polarity: 'masculin',
    emoji: '👑',
    color: '#C9A227',
    essence:
      "Ordre, vision, bénédiction. Le Roi structure sa vie, porte un cap et fait grandir ceux qui l'entourent.",
    plenitude: [
      'Vision claire',
      'Calme et stabilité',
      'Responsabilité',
      'Bénir et encourager les autres',
    ],
    shadowActive: {
      name: 'Tyran',
      signs:
        "Contrôle, colère quand on est contesté, rabaisse les autres, besoin d'avoir raison.",
    },
    shadowPassive: {
      name: 'Faible',
      signs:
        "Indécision, besoin d'approbation, absence de cap, laisse les autres décider.",
    },
    question:
      "Ai-je gouverné ma journée avec un cap clair, et ai-je élevé quelqu'un aujourd'hui ?",
  },
  guerrier: {
    key: 'guerrier',
    name: 'Guerrier',
    polarity: 'masculin',
    emoji: '⚔️',
    color: '#B23A48',
    essence:
      "Discipline, courage, limites. Le Guerrier agit avec détermination au service d'une cause plus grande que lui.",
    plenitude: [
      'Discipline',
      "Courage d'agir",
      'Poser des limites',
      'Loyauté envers sa mission',
    ],
    shadowActive: {
      name: 'Sadique',
      signs: 'Dureté, agressivité, épuisement des autres et de soi, cruauté.',
    },
    shadowPassive: {
      name: 'Masochiste',
      signs:
        "Se laisser marcher dessus, procrastination, accepter l'inacceptable.",
    },
    question: "Ai-je tenu mes engagements et défendu mes limites aujourd'hui ?",
  },
  magicien: {
    key: 'magicien',
    name: 'Magicien',
    polarity: 'masculin',
    emoji: '🔮',
    color: '#5B5FC7',
    essence:
      "Connaissance, discernement, transformation. Le Magicien observe, comprend et canalise l'énergie avec sagesse.",
    plenitude: [
      'Lucidité',
      'Apprentissage',
      'Recul et détachement',
      'Transformer les crises',
    ],
    shadowActive: {
      name: 'Manipulateur',
      signs:
        "Utilise le savoir pour dominer, cynisme, rétention d'information.",
    },
    shadowPassive: {
      name: 'Innocent dénégateur',
      signs: "Refuse de voir, fuit la responsabilité, critique sans s'engager.",
    },
    question:
      "Qu'ai-je appris aujourd'hui, et ai-je pris du recul avant de réagir ?",
  },
  amant: {
    key: 'amant',
    name: 'Amant',
    polarity: 'masculin',
    emoji: '🔥',
    color: '#D9705A',
    essence:
      "Vitalité, connexion, sensibilité. L'Amant goûte la vie, la beauté et la relation avec intensité.",
    plenitude: [
      'Présence aux sens',
      'Gratitude',
      'Connexion aux autres',
      'Créativité',
    ],
    shadowActive: {
      name: 'Addict',
      signs:
        'Dépendances, recherche compulsive de plaisir, dispersion, absence de limites.',
    },
    shadowPassive: {
      name: 'Impuissant',
      signs: 'Apathie, dépression, coupure des émotions, vie en gris.',
    },
    question:
      "Ai-je savouré quelque chose aujourd'hui et me suis-je vraiment connecté à quelqu'un ?",
  },
  reine: {
    key: 'reine',
    name: 'Reine',
    polarity: 'feminin',
    emoji: '👑',
    color: '#9B59B6',
    essence:
      "Souveraineté, dignité, rayonnement. La Reine tient son royaume intérieur et fait régner l'harmonie.",
    plenitude: [
      'Confiance en soi',
      'Discernement',
      'Générosité',
      'Vision pour son foyer et sa communauté',
    ],
    shadowActive: {
      name: 'Reine tyrannique',
      signs: 'Contrôle, jalousie, exigence de reconnaissance, froideur.',
    },
    shadowPassive: {
      name: 'Reine effacée',
      signs:
        'Abdique son pouvoir, se dévalorise, laisse les autres définir sa valeur.',
    },
    question:
      'Ai-je habité ma dignité et pris des décisions alignées avec mes valeurs ?',
  },
  mere: {
    key: 'mere',
    name: 'Mère',
    polarity: 'feminin',
    emoji: '🌿',
    color: '#4E9F6E',
    essence:
      'Soin, protection, croissance. La Mère nourrit la vie — chez les autres et en elle-même.',
    plenitude: [
      'Bienveillance',
      'Patience',
      'Prendre soin de soi',
      'Faire grandir',
    ],
    shadowActive: {
      name: 'Mère dévorante',
      signs: 'Surprotection, contrôle par le soin, culpabilisation, fusion.',
    },
    shadowPassive: {
      name: 'Mère négligente',
      signs: 'Épuisement, retrait affectif, oubli de soi ou des autres.',
    },
    question:
      "Ai-je pris soin de moi autant que des autres, sans étouffer ni m'oublier ?",
  },
  amazone: {
    key: 'amazone',
    name: 'Amazone',
    polarity: 'feminin',
    emoji: '🏹',
    color: '#C0392B',
    essence:
      "Autonomie, courage, accomplissement. L'Amazone (la Guerrière) poursuit ses buts avec force et indépendance.",
    plenitude: [
      'Autonomie',
      'Courage',
      'Focus sur ses objectifs',
      'Défendre ses limites',
    ],
    shadowActive: {
      name: 'Destructrice',
      signs: 'Dureté, compétition permanente, refus de toute vulnérabilité.',
    },
    shadowPassive: {
      name: 'Victime',
      signs: 'Soumission, renoncement à ses projets, plaintes sans action.',
    },
    question:
      'Ai-je avancé vers mes objectifs avec courage et protégé mon énergie ?',
  },
  mystique: {
    key: 'mystique',
    name: 'Sage-Mystique',
    polarity: 'feminin',
    emoji: '🌙',
    color: '#34699A',
    essence:
      "Intuition, profondeur, spiritualité. La Médiale perçoit l'invisible et relie le quotidien au sacré.",
    plenitude: [
      'Intuition',
      'Vie intérieure',
      'Prière et silence',
      'Sagesse transmise',
    ],
    shadowActive: {
      name: 'Manipulatrice',
      signs: "Utilise l'intuition pour influencer, ésotérisme coupé du réel.",
    },
    shadowPassive: {
      name: 'Égarée',
      signs:
        'Confusion, submergée par les émotions des autres, perte de repères.',
    },
    question: 'Ai-je pris un temps de silence et écouté ma voix intérieure ?',
  },
  amante: {
    key: 'amante',
    name: 'Amante',
    polarity: 'feminin',
    emoji: '🌹',
    color: '#E07A9B',
    essence:
      "Relation, beauté, joie. L'Amante (Hétaïre) cultive l'intimité, l'inspiration et le plaisir d'être vivante.",
    plenitude: ['Joie', 'Sensualité', 'Inspiration', 'Relations vraies'],
    shadowActive: {
      name: 'Séductrice compulsive',
      signs: "Besoin d'être désirée, dépendance affective, superficialité.",
    },
    shadowPassive: {
      name: 'Fermée',
      signs: 'Froideur, honte du corps, renoncement au plaisir et à la beauté.',
    },
    question:
      'Ai-je goûté la beauté de la journée et nourri une relation vraie ?',
  },
};

export const PROFILE_LABELS: Record<Profile, string> = {
  masculin: 'Masculin — Roi, Guerrier, Magicien, Amant',
  feminin: 'Féminin — Reine, Mère, Amazone, Sage-Mystique, Amante',
  integral: 'Intégral — les 9 archétypes (anima / animus)',
};

export function archetypesForProfile(profile: Profile): Archetype[] {
  const all = Object.values(ARCHETYPES);
  if (profile === 'integral') return all;
  return all.filter(a => a.polarity === profile);
}
