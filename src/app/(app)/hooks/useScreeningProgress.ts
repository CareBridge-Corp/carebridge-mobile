import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import { toApiLanguage } from "../../../shared/localization/language";
import {
  buildQuestionLookup,
  isQuestionPlaceholder,
  normalizeMChatQuestion,
  NormalizedMChatQuestion,
} from "../../../shared/utils/mchatQuestions";

export type { NormalizedMChatQuestion };
export {
  buildQuestionLookup,
  isQuestionPlaceholder,
  normalizeMChatQuestion,
  parseQuestionId,
  resolveQuestionLabel,
} from "../../../shared/utils/mchatQuestions";

function enrichQuestionsFromBank(
  questions: NormalizedMChatQuestion[],
  bankLookup: Map<number, NormalizedMChatQuestion>,
): NormalizedMChatQuestion[] {
  return questions
    .map((item) => {
      if (!isQuestionPlaceholder(item.question)) {
        return item;
      }

      const fromBank = bankLookup.get(item.id);
      if (!fromBank || isQuestionPlaceholder(fromBank.question)) {
        return item;
      }

      return {
        ...item,
        question: fromBank.question,
        description: item.description || fromBank.description,
        example: item.example || fromBank.example,
        area: fromBank.area || item.area,
      };
    })
    .filter((item) => !isQuestionPlaceholder(item.question));
}
export interface DomainProgressEntry {
  area: string;
  areaLabel: string;
  history: Array<{
    month: number;
    failedCount: number;
    totalQuestions: number;
    screeningId: string;
  }>;
  currentFailedCount: number;
  previousFailedCount: number;
  trend: "improving" | "stable" | "needs_attention" | "resolved";
  progressPercent: number;
  improvedQuestionIds: string[];
  stillFailedQuestionIds: string[];
  improvedCount: number;
  stillFailedCount: number;
  newFailedCount: number;
}

export interface ScreeningComparisonSummary {
  hasComparison: boolean;
  previousScreeningId: string | null;
  currentScreeningId: string | null;
  previousMonth: number | null;
  currentMonth: number | null;
  previousFailedTotal: number;
  currentFailedTotal: number;
  improvedCount: number;
  stillFailedCount: number;
  newFailedCount: number;
  improvementRate: number;
  improvedQuestionIds: string[];
  stillFailedQuestionIds: string[];
  newFailedQuestionIds: string[];
}

export interface ScreeningProgressResponse {
  message: string;
  childId: string;
  profileStatus: "awaiting_screening" | "profile_in_progress" | "roadmap_ready";
  hasActiveRoadmap: boolean;
  roadmapCycleComplete?: boolean;
  readyForNextScreening?: boolean;
  currentScreeningMonth: number;
  nextScreeningMonth: number;
  pendingFailedQuestionCount: number;
  latestScreening: {
    screeningId: string;
    status: string;
    riskLevel: string;
    screeningMonth: number;
    failedQuestionIds: string[];
    areaBreakdown: Array<{
      area: string;
      totalQuestions: number;
      failedQuestions: number;
      questionIds: string[];
    }>;
    date: string;
  } | null;
  domainProgress: DomainProgressEntry[];
  screeningComparison: ScreeningComparisonSummary;
}

export function useScreeningProgress(childId: string | undefined) {
  return useQuery({
    queryKey: ["screening-progress", childId],
    queryFn: async () => {
      if (!childId) return null;
      return apiClient.get<ScreeningProgressResponse>(
        `/screenings/child/${childId}/progress`,
      );
    },
    enabled: !!childId,
    refetchInterval: 60000,
  });
}

export interface MChatQuestion {
  id: number;
  question: string;
  description?: string;
  example?: string;
  area: string;
  lang: string;
}

export interface MChatQuestionsResponse {
  questions: MChatQuestion[];
  totalQuestions: number;
  lang: string;
  screeningMonth?: number;
  carryForwardCount?: number;
  newQuestionCount?: number;
  questionIds?: number[];
}

export function useMChatQuestions(
  childId: string | undefined,
  lang: string = "en",
) {
  return useQuery({
    queryKey: ["mchat-questions", childId, lang],
    queryFn: async () => {
      const apiLang = toApiLanguage(lang);
      const params = new URLSearchParams({ lang: apiLang });
      if (childId) params.append("childId", childId);

      const [response, bankResponse] = await Promise.all([
        apiClient.get<MChatQuestionsResponse>(
          `/inference/questions?${params.toString()}`,
        ),
        apiClient.get<MChatQuestionsResponse>(
          `/inference/questions/bank?lang=${apiLang}`,
        ),
      ]);

      const bankLookup = buildQuestionLookup(
        (bankResponse.questions ?? []).map((item) =>
          normalizeMChatQuestion(item, lang),
        ),
      );

      const normalizedQuestions = enrichQuestionsFromBank(
        (response.questions ?? []).map((item) =>
          normalizeMChatQuestion(item, lang),
        ),
        bankLookup,
      );

      const orderedQuestions =
        response.questionIds?.length && normalizedQuestions.length > 0
          ? response.questionIds
              .map((id) => normalizedQuestions.find((q) => q.id === id))
              .filter((q): q is NormalizedMChatQuestion => !!q)
          : normalizedQuestions;

      return {
        ...response,
        questions: orderedQuestions,
      };
    },
    staleTime: 0,
  });
}

export function useQuestionBank(lang: string = "en") {
  return useQuery({
    queryKey: ["mchat-question-bank", lang],
    queryFn: async () => {
      const apiLang = toApiLanguage(lang);
      const response = await apiClient.get<MChatQuestionsResponse>(
        `/inference/questions/bank?lang=${apiLang}`,
      );
      const normalized = (response.questions ?? []).map((item) =>
        normalizeMChatQuestion(item, lang),
      );
      const questions = normalized.filter(
        (item) => !isQuestionPlaceholder(item.question),
      );
      return {
        ...response,
        questions,
        lookup: buildQuestionLookup(normalized),
      };
    },
    staleTime: 1000 * 60 * 30,
  });
}
