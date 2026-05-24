import type { Ionicons } from "@expo/vector-icons";

export interface GameItem {
  id: string;
  title: string;
  focus: string;
  ageRange: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  url?: string;
  /** Developmental areas this game supports (matches activity riskCategory / M-CHAT area). */
  tags: string[];
}

export const GAMES_CATALOG: GameItem[] = [
  {
    id: "feelings-match",
    title: "Feelings Match",
    focus: "Emotion recognition",
    ageRange: "3+ years",
    description:
      "Match faces with simple feelings — happy, sad, curious — to build social-emotional awareness.",
    icon: "happy-outline",
    accent: "#FDE68A",
    url: "https://www.understood.org/en/articles/games-that-teach-social-emotional-skills",
    tags: [
      "social-interaction",
      "social_interaction",
      "social-communication",
      "social_communication",
      "emotional-regulation",
      "emotional_regulation",
    ],
  },
  {
    id: "shape-sorter",
    title: "Shape Sorter",
    focus: "Visual reasoning",
    ageRange: "2+ years",
    description:
      "Calming sorting tasks that strengthen pattern recognition and fine motor control.",
    icon: "shapes-outline",
    accent: "#BFDBFE",
    url: "https://www.gamesforyoungminds.com/",
    tags: [
      "joint-attention",
      "joint_attention",
      "play-skills",
      "play_skills",
      "following-gaze",
    ],
  },
  {
    id: "sound-safari",
    title: "Sound Safari",
    focus: "Auditory focus",
    ageRange: "3+ years",
    description:
      "Listen for animal sounds and tap the picture that matches — supports listening attention.",
    icon: "musical-notes-outline",
    accent: "#C7F0DB",
    url: "https://www.do2learn.com/games/auditory.htm",
    tags: [
      "auditory-sensitivity",
      "sensory-processing",
      "sensory_processing",
      "communication",
      "name-response",
    ],
  },
  {
    id: "story-builder",
    title: "Story Builder",
    focus: "Communication",
    ageRange: "4+ years",
    description:
      "Drag pictures to build short stories — encourages narrative skills and turn-taking.",
    icon: "book-outline",
    accent: "#FBCFE8",
    url: "https://www.autismparentingmagazine.com/best-autism-games/",
    tags: [
      "communication",
      "social-interaction",
      "social_interaction",
      "peer-interaction",
      "pretend-play",
      "play_skills",
    ],
  },
  {
    id: "breath-buddy",
    title: "Breath Buddy",
    focus: "Self-regulation",
    ageRange: "3+ years",
    description:
      "Guided breathing animations that help regulate big feelings during transitions.",
    icon: "leaf-outline",
    accent: "#DDD6FE",
    url: "https://childmind.org/article/breathing-exercises-for-kids/",
    tags: [
      "emotional-regulation",
      "emotional_regulation",
      "sensory-processing",
      "sensory_processing",
    ],
  },
  {
    id: "peek-a-boo",
    title: "Peek-a-boo",
    focus: "Joint attention",
    ageRange: "1+ years",
    description:
      "Classic face games that build shared attention, eye contact, and social smiles.",
    icon: "eye-outline",
    accent: "#FED7AA",
    tags: [
      "joint-attention",
      "joint_attention",
      "eye-contact",
      "eye_contact",
      "social-interaction",
      "social_interaction",
      "smiling",
    ],
  },
  {
    id: "copy-cat",
    title: "Copy Cat",
    focus: "Imitation",
    ageRange: "2+ years",
    description:
      "Take turns copying simple actions and sounds — strengthens imitation and engagement.",
    icon: "copy-outline",
    accent: "#A7F3D0",
    tags: ["imitation", "social-interaction", "social_interaction", "play_skills"],
  },
];

/** Map activity riskCategory (hyphen or underscore) to related game IDs. */
const CATEGORY_GAME_IDS: Record<string, string[]> = {
  "joint-attention": ["peek-a-boo", "shape-sorter", "story-builder"],
  joint_attention: ["peek-a-boo", "shape-sorter", "story-builder"],
  "following-gaze": ["peek-a-boo", "shape-sorter"],
  pointing: ["shape-sorter", "story-builder"],
  showing: ["story-builder", "feelings-match"],
  "eye-contact": ["peek-a-boo", "feelings-match"],
  eye_contact: ["peek-a-boo", "feelings-match"],
  "social-interaction": ["feelings-match", "story-builder", "copy-cat"],
  social_interaction: ["feelings-match", "story-builder", "copy-cat"],
  "peer-interaction": ["feelings-match", "story-builder"],
  "social-communication": ["feelings-match", "story-builder"],
  social_communication: ["feelings-match", "story-builder"],
  "social-responsiveness": ["feelings-match", "peek-a-boo"],
  communication: ["story-builder", "sound-safari"],
  "receptive-language": ["story-builder", "sound-safari"],
  language: ["story-builder", "sound-safari"],
  imitation: ["copy-cat", "peek-a-boo"],
  "pretend-play": ["story-builder", "copy-cat"],
  play_skills: ["shape-sorter", "story-builder", "copy-cat"],
  "name-response": ["sound-safari", "peek-a-boo"],
  smiling: ["peek-a-boo", "feelings-match"],
  "sensory-processing": ["breath-buddy", "shape-sorter"],
  sensory_processing: ["breath-buddy", "shape-sorter"],
  "auditory-sensitivity": ["sound-safari", "breath-buddy"],
  "visual-sensitivity": ["shape-sorter", "breath-buddy"],
  "motor-skills": ["shape-sorter", "copy-cat"],
  walking: ["copy-cat", "shape-sorter"],
  "emotional-regulation": ["breath-buddy", "feelings-match"],
  emotional_regulation: ["breath-buddy", "feelings-match"],
  "understanding-feelings": ["feelings-match", "story-builder"],
  attachment: ["peek-a-boo", "feelings-match"],
  "attention-seeking": ["copy-cat", "peek-a-boo"],
  "unusual-behaviors": ["breath-buddy", "shape-sorter"],
  imagination: ["story-builder", "copy-cat"],
};

export function getGamesForActivity(riskCategory?: string | null): GameItem[] {
  if (!riskCategory) {
    return GAMES_CATALOG.slice(0, 4);
  }

  const normalized = riskCategory.trim().toLowerCase();
  const explicitIds = CATEGORY_GAME_IDS[normalized];
  if (explicitIds?.length) {
    const byId = new Map(GAMES_CATALOG.map((g) => [g.id, g]));
    return explicitIds.map((id) => byId.get(id)).filter(Boolean) as GameItem[];
  }

  return GAMES_CATALOG.filter((game) =>
    game.tags.some((tag) => tag === normalized || tag.replace(/_/g, "-") === normalized),
  ).slice(0, 4);
}

export function getDefaultGames(limit = 4): GameItem[] {
  return GAMES_CATALOG.slice(0, limit);
}
