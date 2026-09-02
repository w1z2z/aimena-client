import type {
  ConditionId,
  ExtraPayId,
  ListingKind,
  ServiceFormatId,
  ServiceWorkLevelId,
} from "@/app/create-listing/constants";

import {
  clearAllDraftPhotoRecords,
  deleteDraftPhotoRecord,
  deleteDraftPhotoRecords,
  readDraftPhotoRecord,
  saveDraftPhotoRecord,
  type DraftPhotoRecord,
} from "./listing-create-draft-photos";

export const LISTING_CREATE_DRAFT_VERSION = 1 as const;
const STORAGE_KEY_PREFIX = "swaply-listing-create-draft";
const AUTOSAVE_DEBOUNCE_MS = 400;

export type ListingCreateDraftPhotoMeta = {
  id: string;
  mime: string;
  isPdf: boolean;
  fileName: string;
};

export type ListingCreateDraft = {
  version: typeof LISTING_CREATE_DRAFT_VERSION;
  updatedAt: string;
  userId: string | null;
  listingKind: ListingKind;
  title: string;
  description: string;
  priceDigits: string;
  parentCategoryId: string | null;
  childCategoryId: string | null;
  cityId: string | null;
  cityLabel: string | null;
  condition: ConditionId | null;
  serviceWorkLevel: ServiceWorkLevelId | null;
  serviceFormats: ServiceFormatId[];
  extraPay: ExtraPayId;
  isFree: boolean;
  exchangeEnabled: boolean;
  wantsOpenToAll: boolean;
  wantsParentCategoryId: string | null;
  wantsChildCategoryId: string | null;
  wantsCategoryPins: Array<{ id: string; label: string }>;
  wantsTags: string[];
  wantsTagInput: string;
  itemPhotos: ListingCreateDraftPhotoMeta[];
  docPhotos: ListingCreateDraftPhotoMeta[];
};

export type DraftPhotoInput = {
  id: string;
  file: File | null;
  mime?: string;
  isPdf?: boolean;
  previewUrl: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getListingCreateDraftStorageKey(userId: string | null | undefined) {
  return `${STORAGE_KEY_PREFIX}:${userId ?? "guest"}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isListingKind(value: unknown): value is ListingKind {
  return value === "item" || value === "service";
}

function isExtraPayId(value: unknown): value is ExtraPayId {
  return value === "none" || value === "i_pay" || value === "they_pay" || value === "both";
}

function isConditionId(value: unknown): value is ConditionId {
  return (
    value === "excellent" ||
    value === "new" ||
    value === "good" ||
    value === "used" ||
    value === "needs_repair"
  );
}

function isServiceWorkLevelId(value: unknown): value is ServiceWorkLevelId {
  return (
    value === "master" ||
    value === "professional" ||
    value === "specialist" ||
    value === "junior"
  );
}

function isServiceFormatId(value: unknown): value is ServiceFormatId {
  return value === "online" || value === "offline" || value === "onsite";
}

function parsePhotoMeta(value: unknown): ListingCreateDraftPhotoMeta | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id) return null;
  if (typeof value.mime !== "string") return null;
  if (typeof value.isPdf !== "boolean") return null;
  if (typeof value.fileName !== "string") return null;

  return {
    id: value.id,
    mime: value.mime,
    isPdf: value.isPdf,
    fileName: value.fileName,
  };
}

function parseDraft(raw: string): ListingCreateDraft | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.version !== LISTING_CREATE_DRAFT_VERSION) return null;
    if (!isListingKind(parsed.listingKind)) return null;
    if (typeof parsed.title !== "string") return null;
    if (typeof parsed.description !== "string") return null;
    if (typeof parsed.priceDigits !== "string") return null;
    if (typeof parsed.isFree !== "boolean") return null;
    if (typeof parsed.exchangeEnabled !== "boolean") return null;
    if (typeof parsed.wantsOpenToAll !== "boolean") return null;
    if (!isExtraPayId(parsed.extraPay)) return null;

    const wantsCategoryPins = Array.isArray(parsed.wantsCategoryPins)
      ? parsed.wantsCategoryPins
          .map((pin) => {
            if (!isRecord(pin) || typeof pin.id !== "string" || typeof pin.label !== "string") {
              return null;
            }
            return { id: pin.id, label: pin.label };
          })
          .filter((pin): pin is { id: string; label: string } => Boolean(pin))
      : [];

    const wantsTags = Array.isArray(parsed.wantsTags)
      ? parsed.wantsTags.filter((tag): tag is string => typeof tag === "string")
      : [];

    const itemPhotos = Array.isArray(parsed.itemPhotos)
      ? parsed.itemPhotos
          .map(parsePhotoMeta)
          .filter((photo): photo is ListingCreateDraftPhotoMeta => Boolean(photo))
      : [];

    const docPhotos = Array.isArray(parsed.docPhotos)
      ? parsed.docPhotos
          .map(parsePhotoMeta)
          .filter((photo): photo is ListingCreateDraftPhotoMeta => Boolean(photo))
      : [];

    const serviceFormats = Array.isArray(parsed.serviceFormats)
      ? parsed.serviceFormats.filter(isServiceFormatId)
      : [];

    return {
      version: LISTING_CREATE_DRAFT_VERSION,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      userId: typeof parsed.userId === "string" ? parsed.userId : null,
      listingKind: parsed.listingKind,
      title: parsed.title,
      description: parsed.description,
      priceDigits: parsed.priceDigits,
      parentCategoryId: typeof parsed.parentCategoryId === "string" ? parsed.parentCategoryId : null,
      childCategoryId: typeof parsed.childCategoryId === "string" ? parsed.childCategoryId : null,
      cityId: typeof parsed.cityId === "string" ? parsed.cityId : null,
      cityLabel: typeof parsed.cityLabel === "string" ? parsed.cityLabel : null,
      condition: isConditionId(parsed.condition) ? parsed.condition : null,
      serviceWorkLevel: isServiceWorkLevelId(parsed.serviceWorkLevel)
        ? parsed.serviceWorkLevel
        : null,
      serviceFormats,
      extraPay: parsed.extraPay,
      isFree: parsed.isFree,
      exchangeEnabled: parsed.exchangeEnabled,
      wantsOpenToAll: parsed.wantsOpenToAll,
      wantsParentCategoryId:
        typeof parsed.wantsParentCategoryId === "string" ? parsed.wantsParentCategoryId : null,
      wantsChildCategoryId:
        typeof parsed.wantsChildCategoryId === "string" ? parsed.wantsChildCategoryId : null,
      wantsCategoryPins,
      wantsTags,
      wantsTagInput: typeof parsed.wantsTagInput === "string" ? parsed.wantsTagInput : "",
      itemPhotos,
      docPhotos,
    };
  } catch {
    return null;
  }
}

export function readListingCreateDraft(userId: string | null | undefined): ListingCreateDraft | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(getListingCreateDraftStorageKey(userId));
  if (!raw) return null;

  return parseDraft(raw);
}

export function isListingCreateDraftEmpty(draft: ListingCreateDraft): boolean {
  return (
    !draft.title.trim() &&
    !draft.description.trim() &&
    !draft.priceDigits.trim() &&
    !draft.cityId &&
    !draft.parentCategoryId &&
    !draft.childCategoryId &&
    !draft.wantsParentCategoryId &&
    !draft.wantsChildCategoryId &&
    draft.wantsCategoryPins.length === 0 &&
    draft.wantsTags.length === 0 &&
    !draft.wantsTagInput.trim() &&
    draft.itemPhotos.length === 0 &&
    draft.docPhotos.length === 0
  );
}

export function writeListingCreateDraft(draft: ListingCreateDraft) {
  if (!canUseStorage()) return;

  if (isListingCreateDraftEmpty(draft)) {
    window.localStorage.removeItem(getListingCreateDraftStorageKey(draft.userId));
    return;
  }

  window.localStorage.setItem(
    getListingCreateDraftStorageKey(draft.userId),
    JSON.stringify(draft),
  );
}

export async function clearListingCreateDraft(userId: string | null | undefined) {
  if (canUseStorage()) {
    window.localStorage.removeItem(getListingCreateDraftStorageKey(userId));
  }
  await clearAllDraftPhotoRecords();
}

function toPhotoMeta(photo: DraftPhotoInput): ListingCreateDraftPhotoMeta | null {
  if (!photo.file) return null;

  return {
    id: photo.id,
    mime: photo.mime ?? photo.file.type,
    isPdf: Boolean(photo.isPdf),
    fileName: photo.file.name,
  };
}

export async function persistDraftPhotoInputs(
  photos: DraftPhotoInput[],
  kind: DraftPhotoRecord["kind"],
) {
  await Promise.all(
    photos.map(async (photo) => {
      if (!photo.file) return;
      await saveDraftPhotoRecord({
        id: photo.id,
        kind,
        blob: photo.file,
        mime: photo.mime ?? photo.file.type,
        isPdf: Boolean(photo.isPdf),
        fileName: photo.file.name,
      });
    }),
  );
}

export async function restoreDraftPhotoItems(
  metas: ListingCreateDraftPhotoMeta[],
  kind: DraftPhotoRecord["kind"],
): Promise<
  Array<{
    id: string;
    previewUrl: string;
    file: File;
    mime?: string;
    isPdf?: boolean;
  }>
> {
  const restored = await Promise.all(
    metas.map(async (meta) => {
      const record = await readDraftPhotoRecord(meta.id);
      if (!record || record.kind !== kind) return null;

      const file = new File([record.blob], record.fileName || meta.fileName, {
        type: record.mime || meta.mime,
      });
      const isPdf = meta.isPdf;

      return {
        id: meta.id,
        previewUrl: isPdf ? "" : URL.createObjectURL(record.blob),
        file,
        mime: record.mime || meta.mime,
        isPdf,
      };
    }),
  );

  return restored.filter((photo): photo is NonNullable<typeof photo> => Boolean(photo));
}

export function buildListingCreateDraft(params: {
  userId: string | null | undefined;
  listingKind: ListingKind;
  title: string;
  description: string;
  priceDigits: string;
  parentCategoryId: string | null;
  childCategoryId: string | null;
  cityId: string | null;
  cityLabel: string | null;
  condition: ConditionId | null;
  serviceWorkLevel: ServiceWorkLevelId | null;
  serviceFormats: ServiceFormatId[];
  extraPay: ExtraPayId;
  isFree: boolean;
  exchangeEnabled: boolean;
  wantsOpenToAll: boolean;
  wantsParentCategoryId: string | null;
  wantsChildCategoryId: string | null;
  wantsCategoryPins: Array<{ id: string; label: string }>;
  wantsTags: string[];
  wantsTagInput: string;
  itemPhotos: DraftPhotoInput[];
  docPhotos: DraftPhotoInput[];
}): ListingCreateDraft {
  return {
    version: LISTING_CREATE_DRAFT_VERSION,
    updatedAt: new Date().toISOString(),
    userId: params.userId ?? null,
    listingKind: params.listingKind,
    title: params.title,
    description: params.description,
    priceDigits: params.priceDigits,
    parentCategoryId: params.parentCategoryId,
    childCategoryId: params.childCategoryId,
    cityId: params.cityId,
    cityLabel: params.cityLabel,
    condition: params.condition,
    serviceWorkLevel: params.serviceWorkLevel,
    serviceFormats: params.serviceFormats,
    extraPay: params.extraPay,
    isFree: params.isFree,
    exchangeEnabled: params.exchangeEnabled,
    wantsOpenToAll: params.wantsOpenToAll,
    wantsParentCategoryId: params.wantsParentCategoryId,
    wantsChildCategoryId: params.wantsChildCategoryId,
    wantsCategoryPins: params.wantsCategoryPins,
    wantsTags: params.wantsTags,
    wantsTagInput: params.wantsTagInput,
    itemPhotos: params.itemPhotos
      .map(toPhotoMeta)
      .filter((photo): photo is ListingCreateDraftPhotoMeta => Boolean(photo)),
    docPhotos: params.docPhotos
      .map(toPhotoMeta)
      .filter((photo): photo is ListingCreateDraftPhotoMeta => Boolean(photo)),
  };
}

export async function saveListingCreateDraftSnapshot(
  draft: ListingCreateDraft,
  itemPhotos: DraftPhotoInput[],
  docPhotos: DraftPhotoInput[],
) {
  await persistDraftPhotoInputs(itemPhotos, "item");
  await persistDraftPhotoInputs(docPhotos, "doc");
  writeListingCreateDraft(draft);
}

export { AUTOSAVE_DEBOUNCE_MS, deleteDraftPhotoRecord, deleteDraftPhotoRecords };
