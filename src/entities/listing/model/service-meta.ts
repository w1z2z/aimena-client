import type { ApiListingServiceFormat, ApiListingServiceWorkLevel } from "@/shared/api/listings";

export const SERVICE_FORMAT_LABELS: Record<ApiListingServiceFormat, string> = {
  online: "Онлайн",
  offline: "Офлайн",
  onsite: "С выездом",
  client: "У клиента",
};

export const SERVICE_WORK_LEVEL_LABELS: Record<ApiListingServiceWorkLevel, string> = {
  master: "Мастер",
  professional: "Профессионал",
  specialist: "Специалист",
  junior: "Новичок",
};

export function mapServiceFormatToLabel(format: ApiListingServiceFormat): string {
  return SERVICE_FORMAT_LABELS[format] ?? format;
}

export function mapServiceWorkLevelToLabel(
  level: ApiListingServiceWorkLevel | null | undefined,
): string {
  if (!level) return "—";
  return SERVICE_WORK_LEVEL_LABELS[level] ?? "—";
}
