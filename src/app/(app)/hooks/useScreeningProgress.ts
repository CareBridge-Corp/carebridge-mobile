import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import { toApiLanguage } from "../../../shared/localization/language";

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
      return apiClient.get<MChatQuestionsResponse>(
        `/inference/questions?${params.toString()}`,
      );
    },
    staleTime: 0,
  });
}
