export type ConditionId = "excellent" | "new" | "good" | "used" | "needs_repair";
export type ExtraPayId = "none" | "i_pay" | "they_pay";
export type ListingKind = "item" | "service";
export type ServiceFormatId = "online" | "offline" | "onsite";
export type ServiceWorkLevelId = "master" | "professional" | "specialist" | "junior";

export type FieldErrors = {
  title?: string;
  description?: string;
  category?: string;
  city?: string;
  condition?: string;
  serviceWorkLevel?: string;
  serviceFormat?: string;
  photos?: string;
};

/** Order matches visual top→bottom on the page */
export const FIELD_SCROLL_ORDER: Array<keyof FieldErrors> = [
  "title",
  "description",
  "category",
  "city",
  "photos",
  "condition",
  "serviceWorkLevel",
  "serviceFormat",
];

export const HEADER_SCROLL_OFFSET_PX = 72;

/** Create-listing labels (kept as designed; differ slightly from home hero copy). */
export const CONDITION_OPTIONS: Array<{ id: ConditionId; label: string }> = [
  { id: "excellent", label: "Отличное" },
  { id: "new", label: "Новое" },
  { id: "good", label: "Хорошее" },
  { id: "used", label: "Б/у" },
  { id: "needs_repair", label: "Нужен ремонт" },
];

export const EXTRA_PAY_OPTIONS: Array<{ id: ExtraPayId; label: string }> = [
  { id: "none", label: "Без доплаты" },
  { id: "i_pay", label: "Готов доплатить" },
  { id: "they_pay", label: "Хочу доплату" },
];

export const SERVICE_FORMAT_OPTIONS: Array<{ id: ServiceFormatId; label: string }> = [
  { id: "online", label: "Онлайн" },
  { id: "offline", label: "Офлайн" },
  { id: "onsite", label: "С выездом" },
];

export const SERVICE_WORK_LEVEL_OPTIONS: Array<{ id: ServiceWorkLevelId; label: string }> = [
  { id: "master", label: "Мастер" },
  { id: "professional", label: "Профессионал" },
  { id: "specialist", label: "Специалист" },
  { id: "junior", label: "Новичок" },
];

export const ITEM_PHOTO_SLOTS = 10;
export const ITEM_PHOTOS_PER_ROW = 5;
export const ITEM_PHOTO_MAX_ROWS = 2;
export const DOCUMENT_PHOTO_SLOTS = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/jpg,image/webp";
export const WANTS_TAGS_LIMIT = 10;

export const FIELD_ERROR_CLASS = "m-0 mt-1 text-[14px] font-normal leading-[170%] text-[#FF2056]";
export const CITY_FETCH_DEBOUNCE_MS = 250;
export const TAGS_FETCH_DEBOUNCE_MS = 200;
