import {
  RoadmapSummary,
  WeekPlan,
} from "../../app/(app)/types/roadmap";

export const ROADMAP_WEEKS = 4;
export const ROADMAP_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export function buildDefaultActiveRoadmap(
  childId: string,
  weekPlans: WeekPlan[] = [],
): RoadmapSummary {
  const first = weekPlans[0];
  return {
    roadmapId: first?.roadmapId ?? `default-${childId}`,
    screeningId: first?.roadmapId ?? "",
    status: "ACTIVE",
    created_date: first?.createdAt ?? new Date().toISOString(),
  };
}

export function resolveActiveRoadmap(
  childId: string | undefined,
  roadmap: RoadmapSummary | null | undefined,
  weekPlans: WeekPlan[],
): RoadmapSummary | null {
  if (roadmap?.status === "ACTIVE") return roadmap;
  if (weekPlans.length > 0 && childId) {
    return buildDefaultActiveRoadmap(childId, weekPlans);
  }
  return null;
}

export function getActivityStatus(
  weekPlan: WeekPlan,
  activityId: string,
) {
  return (
    weekPlan.activityStatuses?.find((s) => s.activityId === activityId) ?? {
      activityId,
      started: false,
      completed: false,
    }
  );
}

export function getActivityIndex(weekPlan: WeekPlan, activityId: string) {
  const ids = weekPlan.activityIds?.length
    ? weekPlan.activityIds
    : weekPlan.activities.map((a) => a.activityId);
  return ids.indexOf(activityId);
}

export function canAccessWeek(
  weekPlan: WeekPlan,
  weekPlans: WeekPlan[],
): { allowed: boolean; reason?: string } {
  if (weekPlan.weekNumber <= 1) {
    return { allowed: true };
  }

  const previous = weekPlans.find(
    (wp) =>
      wp.roadmapId === weekPlan.roadmapId &&
      wp.weekNumber === weekPlan.weekNumber - 1,
  );

  if (!previous) return { allowed: true };

  if (previous.status !== "COMPLETED") {
    return {
      allowed: false,
      reason: `Complete Week ${previous.weekNumber} before starting Week ${weekPlan.weekNumber}.`,
    };
  }

  return { allowed: true };
}

export function canStartActivity(
  weekPlan: WeekPlan,
  activityId: string,
  weekPlans: WeekPlan[],
): { allowed: boolean; reason?: string } {
  const weekAccess = canAccessWeek(weekPlan, weekPlans);
  if (!weekAccess.allowed) return weekAccess;

  if (weekPlan.status === "COMPLETED") {
    return { allowed: false, reason: "This week is already completed." };
  }

  const activityIndex = getActivityIndex(weekPlan, activityId);
  if (activityIndex < 0) {
    return { allowed: false, reason: "Activity not found in this week plan." };
  }

  const status = getActivityStatus(weekPlan, activityId);
  if (status.completed) {
    return { allowed: false, reason: "Activity is already completed." };
  }
  if (status.started) {
    return { allowed: true };
  }

  if (activityIndex === 0) {
    return { allowed: true };
  }

  const orderedIds = weekPlan.activityIds?.length
    ? weekPlan.activityIds
    : weekPlan.activities.map((a) => a.activityId);
  const previousActivityId = orderedIds[activityIndex - 1];
  const previousStatus = getActivityStatus(weekPlan, previousActivityId);

  if (!previousStatus.completed) {
    return {
      allowed: false,
      reason: "Complete the previous activity before starting this one.",
    };
  }

  return { allowed: true };
}

export function canCompleteActivity(
  weekPlan: WeekPlan,
  activityId: string,
  weekPlans: WeekPlan[],
): { allowed: boolean; reason?: string } {
  const status = getActivityStatus(weekPlan, activityId);
  if (status.completed) {
    return { allowed: false, reason: "Activity is already completed." };
  }

  const startCheck = canStartActivity(weekPlan, activityId, weekPlans);
  if (!startCheck.allowed) {
    return startCheck;
  }

  return { allowed: true };
}

export function isWeekFullyCompleted(weekPlan: WeekPlan) {
  const activities = weekPlan.activities ?? [];
  if (activities.length === 0) return false;
  return activities.every(
    (a) => getActivityStatus(weekPlan, a.activityId).completed,
  );
}

export function calculateRoadmapProgress(weekPlans: WeekPlan[]) {
  const totalActivities = weekPlans.reduce(
    (acc, wp) => acc + (wp.activities?.length ?? 0),
    0,
  );
  const completedActivities = weekPlans.reduce(
    (acc, wp) =>
      acc +
      (wp.activityStatuses?.filter((s) => s.completed).length ?? 0),
    0,
  );

  return totalActivities > 0
    ? Math.round((completedActivities / totalActivities) * 100)
    : 0;
}

export function isRoadmapCycleComplete(
  weekPlans: WeekPlan[],
  roadmap: RoadmapSummary | null,
) {
  if (!roadmap || weekPlans.length === 0) return false;

  const sorted = [...weekPlans].sort((a, b) => a.weekNumber - b.weekNumber);
  const allWeeksDone = sorted.every((wp) => wp.status === "COMPLETED");
  if (!allWeeksDone) return false;

  const skipCooldown =
    process.env.EXPO_PUBLIC_SKIP_ROADMAP_COOLDOWN !== "false";

  if (skipCooldown) return true;

  const lastWeek = sorted[sorted.length - 1];
  if (!lastWeek?.completionDate) return true;

  const completedAt = new Date(lastWeek.completionDate).getTime();
  const cooldownEnds = completedAt + ROADMAP_COOLDOWN_MS;
  return Date.now() >= cooldownEnds;
}

export function isReadyForNextScreening(
  weekPlans: WeekPlan[],
  roadmap: RoadmapSummary | null,
) {
  if (!roadmap || weekPlans.length === 0) return false;
  return weekPlans.every((wp) => wp.status === "COMPLETED");
}

export function getCurrentWeekPlan(weekPlans: WeekPlan[]) {
  return (
    weekPlans.find((wp) => wp.status === "IN_PROGRESS") ??
    weekPlans.find((wp) => wp.status === "PENDING") ??
    weekPlans[weekPlans.length - 1] ??
    null
  );
}

export function isRoadmapCycleFinished(weekPlans: WeekPlan[]) {
  return (
    weekPlans.length > 0 &&
    weekPlans.every((wp) => wp.status === "COMPLETED")
  );
}

export function resolveRoadmapCycleStatus(
  weekPlans: WeekPlan[],
  roadmap: RoadmapSummary | null,
  progress?: {
    roadmapCycleComplete?: boolean;
    readyForNextScreening?: boolean;
  },
) {
  const roadmapCycleComplete =
    progress?.roadmapCycleComplete ?? isRoadmapCycleFinished(weekPlans);

  const readyForNextScreening =
    progress?.readyForNextScreening ??
    (roadmapCycleComplete && isRoadmapCycleComplete(weekPlans, roadmap));

  return { roadmapCycleComplete, readyForNextScreening };
}
