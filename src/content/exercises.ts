import type { ArchetypeKey } from './archetypes';

export type ExerciseCategory = 'respiration' | 'corps' | 'psyche' | 'soir';

export interface Exercise {
  id: string;
  title: string;
  minutes: number;
  category: ExerciseCategory;
  instructions: string;
}

/** Ancrage du matin : respiration / méditation. */
export const BREATHING: Exercise[] = [
  {
    id: 'resp-carree',
    title: 'Respiration carrée',
    minutes: 5,
    category: 'respiration',
    instructions:
      'Inspire 4 s, retiens 4 s, expire 4 s, retiens 4 s. Répète pendant 5 minutes, dos droit.',
  },
  {
    id: 'resp-coherence',
    title: 'Cohérence cardiaque',
    minutes: 5,
    category: 'respiration',
    instructions:
      '6 respirations par minute : inspire 5 s, expire 5 s, pendant 5 minutes. Idéal 3 fois par jour.',
  },
  {
    id: 'resp-silence',
    title: 'Silence et prière',
    minutes: 10,
    category: 'respiration',
    instructions:
      'Assieds-toi sans écran. Observe ta respiration puis confie ta journée en quelques mots. Reviens au souffle à chaque distraction.',
  },
  {
    id: 'resp-scan',
    title: 'Scan corporel',
    minutes: 8,
    category: 'respiration',
    instructions:
      "Parcours lentement ton corps des pieds à la tête. Nomme chaque tension sans la juger, relâche à l'expiration.",
  },
];

/** Activation physique. */
export const BODY: Exercise[] = [
  {
    id: 'corps-circuit',
    title: 'Circuit poids du corps',
    minutes: 15,
    category: 'corps',
    instructions:
      '3 tours : 15 squats, 10 pompes, 30 s de gainage, 20 fentes. 1 min de repos entre les tours.',
  },
  {
    id: 'corps-marche',
    title: 'Marche consciente',
    minutes: 30,
    category: 'corps',
    instructions:
      'Marche dehors sans écouteurs, rythme soutenu. Observe 5 choses belles sur ton chemin.',
  },
  {
    id: 'corps-etirements',
    title: 'Mobilité et étirements',
    minutes: 10,
    category: 'corps',
    instructions:
      'Nuque, épaules, hanches, ischio-jambiers : 45 s par position, respiration lente.',
  },
  {
    id: 'corps-froid',
    title: 'Douche froide',
    minutes: 2,
    category: 'corps',
    instructions:
      "Termine ta douche par 30 à 90 s d'eau froide en gardant une respiration lente et contrôlée.",
  },
  {
    id: 'corps-gainage',
    title: 'Gainage progressif',
    minutes: 10,
    category: 'corps',
    instructions:
      'Planche, planche latérale gauche puis droite, superman : 4 tours de 30 s chacun.',
  },
];

/** Examen et clôture du soir. */
export const EVENING: Exercise[] = [
  {
    id: 'soir-examen',
    title: 'Examen du soir (Sénèque)',
    minutes: 10,
    category: 'soir',
    instructions:
      "Repasse ta journée : qu'ai-je bien fait ? qu'ai-je mal fait ? qu'ai-je omis ? Sans t'accuser, juste pour corriger demain.",
  },
  {
    id: 'soir-gratitude',
    title: 'Trois gratitudes',
    minutes: 5,
    category: 'soir',
    instructions:
      "Note trois choses précises pour lesquelles tu es reconnaissant(e) aujourd'hui, et pourquoi.",
  },
  {
    id: 'soir-ignace',
    title: 'Examen ignatien',
    minutes: 10,
    category: 'soir',
    instructions:
      '1. Rends grâce. 2. Demande la lumière. 3. Relis la journée. 4. Demande pardon pour ce qui a blessé. 5. Prends une résolution pour demain.',
  },
];

/** Exercices psychologiques spécifiques à chaque archétype. */
export const ARCHETYPE_EXERCISES: Record<ArchetypeKey, Exercise[]> = {
  roi: [
    {
      id: 'roi-cap',
      title: 'Fixer le cap du jour',
      minutes: 5,
      category: 'psyche',
      instructions:
        'Écris tes 3 priorités du jour et la personne que tu veux encourager. Relis-les à midi.',
    },
    {
      id: 'roi-benir',
      title: "Bénir quelqu'un",
      minutes: 5,
      category: 'psyche',
      instructions:
        "Envoie un message sincère de reconnaissance ou d'encouragement à une personne de ton entourage.",
    },
    {
      id: 'roi-decision',
      title: 'Trancher une décision',
      minutes: 10,
      category: 'psyche',
      instructions:
        'Choisis une décision que tu repousses. Liste options et conséquences, puis décide et annonce-le.',
    },
  ],
  guerrier: [
    {
      id: 'guerrier-tache',
      title: "La tâche redoutée d'abord",
      minutes: 25,
      category: 'psyche',
      instructions:
        'Un pomodoro de 25 min sur la tâche que tu évites le plus, avant toute autre chose.',
    },
    {
      id: 'guerrier-non',
      title: 'Dire non',
      minutes: 5,
      category: 'psyche',
      instructions:
        'Identifie une demande qui ne sert pas ta mission et refuse-la poliment mais clairement.',
    },
    {
      id: 'guerrier-inconfort',
      title: 'Inconfort volontaire',
      minutes: 10,
      category: 'psyche',
      instructions:
        "Choisis un petit inconfort (pas de sucre, pas de réseaux sociaux, escaliers plutôt qu'ascenseur) et tiens-le toute la journée.",
    },
  ],
  magicien: [
    {
      id: 'magicien-apprendre',
      title: "20 minutes d'apprentissage",
      minutes: 20,
      category: 'psyche',
      instructions:
        'Étudie un sujet en profondeur et résume ce que tu as compris en 3 phrases.',
    },
    {
      id: 'magicien-recul',
      title: 'La pause avant la réaction',
      minutes: 5,
      category: 'psyche',
      instructions:
        "Aujourd'hui, avant chaque réponse émotionnelle, respire 3 fois et demande-toi : « Que se passe-t-il vraiment ? »",
    },
    {
      id: 'magicien-ombre',
      title: "Dialogue avec l'ombre",
      minutes: 15,
      category: 'psyche',
      instructions:
        "Écris ce qui t'a le plus irrité chez quelqu'un récemment. En quoi ce trait existe-t-il aussi en toi ?",
    },
  ],
  amant: [
    {
      id: 'amant-sens',
      title: 'Repas en pleine conscience',
      minutes: 15,
      category: 'psyche',
      instructions:
        'Prends un repas sans écran. Savoure chaque bouchée, couleurs, textures, odeurs.',
    },
    {
      id: 'amant-creer',
      title: 'Créer quelque chose',
      minutes: 20,
      category: 'psyche',
      instructions:
        'Dessine, écris, joue de la musique ou cuisine — sans objectif de performance.',
    },
    {
      id: 'amant-lien',
      title: 'Conversation profonde',
      minutes: 20,
      category: 'psyche',
      instructions:
        "Appelle un proche et pose une vraie question : « Qu'est-ce qui te porte en ce moment ? »",
    },
  ],
  reine: [
    {
      id: 'reine-valeurs',
      title: 'Revisiter ses valeurs',
      minutes: 10,
      category: 'psyche',
      instructions:
        'Écris tes 5 valeurs essentielles. Laquelle as-tu honorée hier ? Laquelle as-tu trahie ?',
    },
    {
      id: 'reine-posture',
      title: 'Posture de souveraineté',
      minutes: 5,
      category: 'psyche',
      instructions:
        "Tiens-toi droite 2 minutes, épaules ouvertes, regard à l'horizon. Affirme ce que tu veux pour aujourd'hui.",
    },
    {
      id: 'reine-deleguer',
      title: 'Déléguer avec confiance',
      minutes: 10,
      category: 'psyche',
      instructions:
        "Confie une tâche à quelqu'un en exprimant ta confiance, sans contrôler la manière.",
    },
  ],
  mere: [
    {
      id: 'mere-soin',
      title: 'Un soin pour soi',
      minutes: 20,
      category: 'psyche',
      instructions:
        'Offre-toi un vrai moment de soin (bain, sieste, lecture) sans culpabilité.',
    },
    {
      id: 'mere-ecoute',
      title: 'Écoute sans conseiller',
      minutes: 15,
      category: 'psyche',
      instructions:
        "Écoute quelqu'un sans donner de conseil ni ramener à toi. Reformule seulement.",
    },
    {
      id: 'mere-jardin',
      title: 'Faire pousser',
      minutes: 10,
      category: 'psyche',
      instructions:
        "Occupe-toi d'une plante, d'un projet ou d'une personne qui a besoin de croissance.",
    },
  ],
  amazone: [
    {
      id: 'amazone-objectif',
      title: 'Sprint vers un objectif',
      minutes: 30,
      category: 'psyche',
      instructions:
        "Choisis l'objectif de la semaine le plus important et avance 30 min dessus, téléphone éteint.",
    },
    {
      id: 'amazone-limite',
      title: 'Poser une limite',
      minutes: 5,
      category: 'psyche',
      instructions:
        "Exprime clairement un besoin ou une limite à quelqu'un, avec calme.",
    },
    {
      id: 'amazone-defi',
      title: 'Défi physique',
      minutes: 20,
      category: 'psyche',
      instructions:
        'Relève un défi physique un peu au-dessus de ton niveau habituel.',
    },
  ],
  mystique: [
    {
      id: 'mystique-silence',
      title: "Quart d'heure de silence",
      minutes: 15,
      category: 'psyche',
      instructions:
        'Silence complet, sans téléphone. Note ensuite la première intuition qui émerge.',
    },
    {
      id: 'mystique-reves',
      title: 'Journal des rêves',
      minutes: 10,
      category: 'psyche',
      instructions:
        'Au réveil, note ton rêve ou ton premier ressenti. Quel symbole revient ?',
    },
    {
      id: 'mystique-lectio',
      title: 'Lectio divina',
      minutes: 15,
      category: 'psyche',
      instructions:
        'Lis lentement le texte biblique du jour, 3 fois. Garde le mot qui te touche et médite-le.',
    },
  ],
  amante: [
    {
      id: 'amante-beaute',
      title: 'Chasse à la beauté',
      minutes: 10,
      category: 'psyche',
      instructions:
        "Photographie ou note 3 choses belles aujourd'hui. Laquelle t'a le plus touchée ?",
    },
    {
      id: 'amante-corps',
      title: 'Danser',
      minutes: 10,
      category: 'psyche',
      instructions:
        'Mets une musique que tu aimes et danse librement, seule ou accompagnée.',
    },
    {
      id: 'amante-gratitude',
      title: 'Lettre de gratitude',
      minutes: 15,
      category: 'psyche',
      instructions:
        'Écris une courte lettre à une personne qui a compté pour toi. Envoie-la si tu le sens.',
    },
  ],
};
