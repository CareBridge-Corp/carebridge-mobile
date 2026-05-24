import { toApiLanguage } from "../localization/language";

export interface NormalizedMChatQuestion {
  id: number;
  question: string;
  description: string;
  example: string;
  area: string;
}

export function isQuestionPlaceholder(text: string): boolean {
  const trimmed = text.trim();
  return !trimmed || /^Q\d+$/i.test(trimmed);
}

export function parseQuestionId(value: string | number): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const trimmed = String(value).trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const match = trimmed.match(/^Q(\d+)$/i);
  return match ? Number(match[1]) : null;
}

export function extractLocalizedQuestionText(
  raw: unknown,
  lang: string,
): string {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (/^Q\d+$/i.test(trimmed)) return "";
    return trimmed;
  }

  if (raw && typeof raw === "object") {
    const record = raw as Record<string, string | undefined>;
    const apiLang = toApiLanguage(lang);
    const candidates = [
      record[apiLang],
      record[lang],
      record.en,
      ...Object.values(record),
    ];

    for (const value of candidates) {
      if (typeof value !== "string") continue;
      const trimmed = value.trim();
      if (!trimmed || /^Q\d+$/i.test(trimmed)) continue;
      return trimmed;
    }
  }

  return "";
}

export function normalizeMChatQuestion(
  item: {
    id: number;
    question: unknown;
    description?: unknown;
    example?: unknown;
    area?: string;
  },
  lang: string,
): NormalizedMChatQuestion {
  return {
    id: item.id,
    question: extractLocalizedQuestionText(item.question, lang),
    description: extractLocalizedQuestionText(item.description, lang),
    example: extractLocalizedQuestionText(item.example, lang),
    area: item.area || "general_monitoring",
  };
}

export function buildQuestionLookup(
  questions: NormalizedMChatQuestion[],
): Map<number, NormalizedMChatQuestion> {
  return new Map(questions.map((question) => [question.id, question]));
}

export function resolveQuestionLabel(
  key: string | number,
  lookup: Map<number, NormalizedMChatQuestion>,
): string {
  const id = parseQuestionId(key);
  if (id == null) {
    return String(key);
  }

  const match = lookup.get(id);
  if (match?.question && !isQuestionPlaceholder(match.question)) {
    return match.question;
  }

  return `Question ${id}`;
}
