import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";

export function useWeekPlanActions(childId?: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["roadmaps", childId] });
  };

  const startWeekPlan = useMutation({
    mutationFn: async (weekPlanId: string) =>
      apiClient.post(`/users/week-plans/${weekPlanId}/start`),
    onSuccess: invalidate,
  });

  const completeWeekPlan = useMutation({
    mutationFn: async ({
      weekPlanId,
      parentNotes,
    }: {
      weekPlanId: string;
      parentNotes?: string;
    }) =>
      apiClient.post(`/users/week-plans/${weekPlanId}/complete`, {
        parentNotes,
      }),
    onSuccess: invalidate,
  });

  const startActivity = useMutation({
    mutationFn: async ({
      weekPlanId,
      activityId,
    }: {
      weekPlanId: string;
      activityId: string;
    }) =>
      apiClient.post(
        `/users/week-plans/${weekPlanId}/activities/${activityId}/start`,
      ),
    onSuccess: invalidate,
  });

  const completeActivity = useMutation({
    mutationFn: async ({
      weekPlanId,
      activityId,
    }: {
      weekPlanId: string;
      activityId: string;
    }) =>
      apiClient.post(
        `/users/week-plans/${weekPlanId}/activities/${activityId}/complete`,
      ),
    onSuccess: invalidate,
  });

  return {
    startWeekPlan,
    completeWeekPlan,
    startActivity,
    completeActivity,
  };
}
