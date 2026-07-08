import type { ApiListingCondition } from "@/shared/api/listings";

export type ConditionOptionId = "excellent" | "new" | "good" | "used" | "repair";

export const CONDITION_LABELS: Record<ApiListingCondition, string> = {
  excellent: "Отличное",
  new: "Новое",
  good: "Хорошее",
  used: "Б.у",
  needs_repair: "Требует ремонта",
  service: "Услуга",
};

export const CONDITION_LABEL_TO_ID: Record<string, ConditionOptionId> = {
  Отличное: "excellent",
  Новое: "new",
  Хорошее: "good",
  "Б.у": "used",
  "Требует ремонта": "repair",
};

export const CONDITION_ID_TO_LABEL: Record<ConditionOptionId, string> = {
  excellent: "Отличное",
  new: "Новое",
  good: "Хорошее",
  used: "Б.у",
  repair: "Требует ремонта",
};

export const HERO_CONDITION_OPTIONS = [
  CONDITION_ID_TO_LABEL.excellent,
  CONDITION_ID_TO_LABEL.new,
  CONDITION_ID_TO_LABEL.good,
  CONDITION_ID_TO_LABEL.used,
  CONDITION_ID_TO_LABEL.repair,
] as const;

export const FILTER_CONDITION_OPTIONS = (
  Object.entries(CONDITION_ID_TO_LABEL) as Array<[ConditionOptionId, string]>
).map(([id, label]) => ({ id, label }));

export const CONDITION_TO_BACKEND: Record<string, ApiListingCondition> = {
  excellent: "excellent",
  new: "new",
  good: "good",
  used: "used",
  repair: "needs_repair",
};

export function mapConditionLabelToId(label: string): ConditionOptionId | undefined {
  return CONDITION_LABEL_TO_ID[label];
}

export function mapConditionIdToBackend(id: ConditionOptionId): ApiListingCondition | undefined {
  return CONDITION_TO_BACKEND[id];
}

export function mapApiConditionToLabel(condition: ApiListingCondition): string {
  return CONDITION_LABELS[condition];
}
