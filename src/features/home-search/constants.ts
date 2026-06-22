import type { ConditionOptionId } from "./types";

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
