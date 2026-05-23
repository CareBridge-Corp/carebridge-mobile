import { Clinician } from "../store/clinicianStore";

export interface Activity {
  activityId: string;
  title: string;
  description: string;
  instruction: string;
  mediaUrl: string | null;
  riskCategory: string;
  order?: number;
  completed?: boolean;
}

export interface ActivityStatus {
  started: boolean;
  completed: boolean;
  activityId: string;
}

export interface Prescription {
  dosage: string;
  frequency: string;
  description: string;
  medicationName: string;
}

export interface WeekPlan {
  weekPlanId: string;
  roadmapId: string;
  clinicianId: string;
  weekNumber: number;
  description: string;
  activityIds: string[];
  activityStatuses: ActivityStatus[];
  activities: Activity[];
  mediaLinks: string[];
  prescription: Prescription | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  startDate: string | null;
  completionDate: string | null;
  parentNotes: string | null;
  createdAt: string;
  updatedAt: string;
  clinician: Clinician | null;
}

export interface RoadmapSummary {
  roadmapId: string;
  screeningId: string;
  status: "ACTIVE" | "INACTIVE" | "COMPLETED" | "PAUSED";
  created_date: string;
}

/** Raw API response from GET /roadmaps/:childId/week-plans */
export interface WeekPlansResponse {
  message: string;
  childId: string;
  count: number;
  roadmap: RoadmapSummary | null;
  weekPlans: WeekPlan[];
}

/** Normalized shape used by UI components */
export interface ActiveRoadmapData {
  roadmap: RoadmapSummary | null;
  weekPlans: WeekPlan[];
  hasActiveRoadmap: boolean;
}

export function normalizeWeekPlansResponse(
  response: WeekPlansResponse | null | undefined,
  childId?: string,
): ActiveRoadmapData {
  const weekPlans = response?.weekPlans ?? [];
  const roadmap =
    response?.roadmap ??
    (weekPlans.length > 0 && childId
      ? {
          roadmapId: weekPlans[0].roadmapId,
          screeningId: weekPlans[0].roadmapId,
          status: "ACTIVE" as const,
          created_date: weekPlans[0].createdAt,
        }
      : null);

  return {
    roadmap,
    weekPlans,
    hasActiveRoadmap:
      weekPlans.length > 0 &&
      (roadmap?.status === "ACTIVE" || weekPlans.length > 0),
  };
}
