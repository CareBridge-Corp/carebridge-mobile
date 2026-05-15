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

export interface Roadmap {
  roadmapId: string;
  screeningId: string;
  created_date: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  activities: Activity[];
  weekPlans: WeekPlan[];
}

export interface RoadmapResponse {
  message: string;
  childId: string;
  count: number;
  roadmaps: Roadmap[];
}
