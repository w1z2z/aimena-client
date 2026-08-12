"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { useAuthGate } from "@/features/auth";
import { getCategories, getCities, type ApiCategoryNode, type ApiCity } from "@/shared/api/catalog";
import { ApiError, ensureFreshAccessToken } from "@/shared/api/http";
import { uploadListingFileViaBackend } from "@/shared/api/media";
import { compressListingImageForUpload } from "@/shared/lib/compress-image";
import {
  createListingDraft,
  getListing,
  getListingTagSuggestions,
  publishListing,
  updateListing,
  type ApiListingDetail,
  type ApiListingImage,
} from "@/shared/api/listings";
import { buildCitySelectOptions } from "@/shared/lib/city-select-options";
import { extractPriceDigits, formatPriceWithSpaces } from "@/shared/lib/format-price";
import {
  clearHeroListingDraft,
  readHeroListingDraft,
} from "@/shared/lib/hero-listing-draft";
import { SelectField, type SelectOption } from "@/shared/ui/select-field";
import { Header } from "@/widgets/header/Header";
import { DeleteIcon } from "@/shared/ui/icons";
import { Switch } from "@/shared/ui/switch/Switch";

import { ListingPublishedModal } from "./ListingPublishedModal";
import { ListingPublishingOverlay } from "./ListingPublishingOverlay";

import {
  ACCEPTED_DOCUMENT_TYPES,
  ACCEPTED_IMAGE_TYPES,
  CITY_FETCH_DEBOUNCE_MS,
  CONDITION_OPTIONS,
  DOCUMENT_PHOTO_SLOTS,
  EXTRA_PAY_OPTIONS,
  FIELD_ERROR_CLASS,
  FIELD_SCROLL_ORDER,
  HEADER_SCROLL_OFFSET_PX,
  ITEM_PHOTO_MAX_ROWS,
  ITEM_PHOTO_SLOTS,
  ITEM_PHOTOS_PER_ROW,
  MAX_DOCUMENT_PDF_BYTES,
  MAX_PHOTO_BYTES,
  SERVICE_FORMAT_OPTIONS,
  SERVICE_WORK_LEVEL_OPTIONS,
  TAGS_FETCH_DEBOUNCE_MS,
  WANTS_TAGS_LIMIT,
  WANTS_CATEGORIES_LIMIT,
  type ConditionId,
  type ExtraPayId,
  type FieldErrors,
  type ListingKind,
  type ServiceFormatId,
  type ServiceWorkLevelId,
} from "./constants";

function normalizeListingDescription(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type CategoryTreeNode = ApiCategoryNode & {
  children?: Array<{ id: string; name: string; slug: string }>;
};

type PhotoItem = {
  id: string;
  previewUrl: string;
  file: File | null;
  mediaId?: string;
  mime?: string;
  isPdf?: boolean;
};

type TagSuggestionItem = {
  value: string;
  label: string;
  isCreateAction?: boolean;
};

type WantsCategoryPin = {
  id: string;
  label: string;
};

type PhotoKind = "item" | "doc";

export type ListingEditorMode = "create" | "edit";

type ListingEditorProps = {
  mode?: ListingEditorMode;
  listingId?: string;
};

function mergeCitiesById(current: ApiCity[], incoming: ApiCity[]): ApiCity[] {
  if (incoming.length === 0) return current;
  const seen = new Set(current.map((cityItem) => cityItem.id));
  const merged = [...current];
  for (const cityItem of incoming) {
    if (seen.has(cityItem.id)) continue;
    seen.add(cityItem.id);
    merged.push(cityItem);
  }
  return merged;
}

const ACCEPTED_IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const PDF_MIME = "application/pdf";

function isAcceptedImageFile(file: File) {
  return ACCEPTED_IMAGE_MIME.has(file.type.toLowerCase());
}

function isPdfFile(file: File) {
  return file.type.toLowerCase() === PDF_MIME || file.name.toLowerCase().endsWith(".pdf");
}

function createPhotoItems(files: File[]): PhotoItem[] {
  return files.map((file) => {
    const pdf = isPdfFile(file);
    return {
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      previewUrl: pdf ? "" : URL.createObjectURL(file),
      file,
      mime: file.type,
      isPdf: pdf,
    };
  });
}

function partitionPickedImages(files: FileList | File[]) {
  const accepted: File[] = [];
  const tooLarge: string[] = [];
  const badType: string[] = [];

  for (const file of Array.from(files)) {
    if (!isAcceptedImageFile(file)) {
      badType.push(file.name);
      continue;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      tooLarge.push(file.name);
      continue;
    }
    accepted.push(file);
  }

  return { accepted, tooLarge, badType };
}

function partitionPickedDocuments(files: FileList | File[]) {
  const accepted: File[] = [];
  const tooLarge: string[] = [];
  const badType: string[] = [];

  for (const file of Array.from(files)) {
    const pdf = isPdfFile(file);
    if (!pdf && !isAcceptedImageFile(file)) {
      badType.push(file.name);
      continue;
    }
    const maxBytes = pdf ? MAX_DOCUMENT_PDF_BYTES : MAX_PHOTO_BYTES;
    if (file.size > maxBytes) {
      tooLarge.push(file.name);
      continue;
    }
    accepted.push(file);
  }

  return { accepted, tooLarge, badType };
}

function buildPhotoPickError(
  tooLarge: string[],
  badType: string[],
  options?: { allowPdf?: boolean },
): string | null {
  const parts: string[] = [];
  const formatHint = options?.allowPdf
    ? "PNG, JPG, WebP или PDF"
    : "PNG, JPG или WebP";
  const sizeHint = options?.allowPdf ? "5 МБ (фото) / 10 МБ (PDF)" : "5 МБ";

  if (tooLarge.length === 1) {
    parts.push(
      `«${tooLarge[0]}» слишком большой — лимит ${sizeHint}`,
    );
  } else if (tooLarge.length > 1) {
    parts.push(`${tooLarge.length} файла превышают лимит ${sizeHint}`);
  }

  if (badType.length === 1) {
    parts.push(`«${badType[0]}» — нужен ${formatHint}`);
  } else if (badType.length > 1) {
    parts.push(`${badType.length} файла неподходящего формата (${formatHint})`);
  }

  return parts.length > 0 ? `${parts.join(". ")}.` : null;
}

const UPLOAD_CONCURRENCY = 4;

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

function photosFromListingImages(
  images: ApiListingImage[],
  kind: "item" | "document",
): PhotoItem[] {
  return images
    .filter((image) => image.kind === kind)
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((image) => {
      const mime = image.mime ?? "";
      const isPdf = mime === PDF_MIME || image.url.toLowerCase().endsWith(".pdf");
      return {
        id: image.id,
        previewUrl: isPdf ? "" : (image.thumbUrl ?? image.url),
        file: null,
        mediaId: image.mediaId,
        mime,
        isPdf,
      };
    });
}

function resolveCategorySelection(
  tree: CategoryTreeNode[],
  categoryId: string,
): { parentId: string; childId: string | null } | null {
  for (const parent of tree) {
    if (parent.id === categoryId) {
      return { parentId: parent.id, childId: null };
    }
    const child = parent.children?.find((item) => item.id === categoryId);
    if (child) {
      return { parentId: parent.id, childId: child.id };
    }
  }
  return null;
}

function isConditionId(value: string | null | undefined): value is ConditionId {
  return typeof value === "string" && CONDITION_OPTIONS.some((option) => option.id === value);
}

function isServiceFormatId(value: string): value is ServiceFormatId {
  return SERVICE_FORMAT_OPTIONS.some((option) => option.id === value);
}

function isServiceWorkLevelId(value: unknown): value is ServiceWorkLevelId {
  return (
    typeof value === "string" &&
    SERVICE_WORK_LEVEL_OPTIONS.some((option) => option.id === value)
  );
}

function revokePhotoUrls(photos: PhotoItem[]) {
  for (const photo of photos) {
    if (photo.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(photo.previewUrl);
    }
  }
}

function reorderPhotos(photos: PhotoItem[], sourceId: string, dropIndex: number): PhotoItem[] {
  const sourceIndex = photos.findIndex((photo) => photo.id === sourceId);
  if (sourceIndex < 0) {
    return photos;
  }

  const normalizedDropIndex = Math.max(0, Math.min(dropIndex, photos.length));
  const next = [...photos];
  const [moved] = next.splice(sourceIndex, 1);
  const adjustedDropIndex =
    sourceIndex < normalizedDropIndex ? normalizedDropIndex - 1 : normalizedDropIndex;
  next.splice(adjustedDropIndex, 0, moved);
  return next;
}

function getItemPhotoGridLayout(photoCount: number) {
  const hasAddSlot = photoCount < ITEM_PHOTO_SLOTS;
  const totalCells = photoCount + (hasAddSlot ? 1 : 0);
  const rows = Math.min(
    ITEM_PHOTO_MAX_ROWS,
    Math.max(1, Math.ceil(totalCells / ITEM_PHOTOS_PER_ROW)),
  );
  const visibleSlots = rows * ITEM_PHOTOS_PER_ROW;

  return { rows, visibleSlots, hasAddSlot };
}

function getDocPhotoGridLayout(photoCount: number) {
  const hasAddSlot = photoCount < DOCUMENT_PHOTO_SLOTS;

  return { visibleSlots: ITEM_PHOTOS_PER_ROW, hasAddSlot };
}

const EXCHANGE_FIELD_INPUT_CLASS =
  "box-border h-[50px] w-full rounded-[18px] border-[0.5px] border-[#CACACA] bg-[#F2F4F7] px-3 py-[11px] text-[14px] font-normal leading-[140%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[140%] placeholder:text-[#3D3D3D]";

const SECTION_TITLE_CLASS =
  "m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#626262]";

const SECTION_TEXT_CLASS = "text-[14px] font-normal leading-[170%] text-[#1A1A1A]";
const PHOTO_UPLOAD_LABEL_CLASS =
  "text-[14px] font-semibold leading-[120%] tracking-[0.001em] text-[#1A1A1A]";

function PlaceholderImage() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#5F6677]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M5.5 17l4.6-4.8a1.3 1.3 0 011.9 0L14.6 15l1.7-1.7a1.3 1.3 0 011.9 0L20 15.2" />
    </svg>
  );
}

function PdfPlaceholder({ label }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#EEF0F4] px-2 text-center">
      <span className="rounded-[8px] bg-white px-2 py-1 text-[11px] font-bold tracking-wide text-[#FF2056]">
        PDF
      </span>
      {label ? (
        <span className="line-clamp-2 text-[11px] font-medium leading-[130%] text-[#3D3D3D]">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function PhotoCard({
  previewUrl,
  onDelete,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  dropIndicator = null,
  showPrimaryBadge = false,
  isPdf = false,
  fileName,
}: {
  previewUrl?: string;
  onDelete: () => void;
  draggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: DragEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
  dropIndicator?: "before" | "after" | null;
  showPrimaryBadge?: boolean;
  isPdf?: boolean;
  fileName?: string;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative aspect-square w-full select-none ${
        isDragging ? "cursor-grabbing opacity-60" : draggable ? "cursor-grab" : ""
      }`}
    >
      {dropIndicator === "before" ? (
        <span
          className="pointer-events-none absolute inset-y-2 left-0 z-[3] w-1 -translate-x-[calc(50%+6px)] rounded-full bg-[#8E8BED]"
          aria-hidden
        />
      ) : null}
      {dropIndicator === "after" ? (
        <span
          className="pointer-events-none absolute inset-y-2 right-0 z-[3] w-1 translate-x-[calc(50%+6px)] rounded-full bg-[#8E8BED]"
          aria-hidden
        />
      ) : null}
      <div className="relative h-full w-full overflow-hidden rounded-[21px] border-[0.5px] border-[#CACACA] bg-[#F2F4F7]">
        {showPrimaryBadge ? (
          <span className="absolute left-[10px] top-[10px] z-[2] rounded-[999px] bg-[#8E8BED] px-2.5 py-1 text-[12px] font-semibold leading-none text-white">
            Основное
          </span>
        ) : null}
        <button
          type="button"
          onClick={onDelete}
          aria-label={isPdf ? "Удалить документ" : "Удалить фото"}
          className="absolute right-[10px] top-[10px] z-[1] flex size-[28px] items-center justify-center rounded-full bg-[#F2F4F7] text-[#626262] transition hover:brightness-95"
        >
          <DeleteIcon />
        </button>
        {isPdf ? (
          <PdfPlaceholder label={fileName} />
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" draggable={false} className="h-full w-full cursor-grab object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PlaceholderImage />
          </div>
        )}
      </div>
    </div>
  );
}

function AddPhotoCard({
  label,
  onClick,
  onDragOver,
  onDrop,
}: {
  label: string;
  onClick?: () => void;
  onDragOver?: (event: DragEvent<HTMLButtonElement>) => void;
  onDrop?: (event: DragEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="aspect-square w-full rounded-[12px] border border-dashed border-[#D1D8E7] bg-[#FAFBFE] text-[13px] font-semibold text-[#636B7D]"
    >
      {label}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={FIELD_ERROR_CLASS}>{message}</p>;
}

function fieldAnchorId(field: keyof FieldErrors) {
  return `create-listing-field-${field}`;
}

function scrollToFirstError(errors: FieldErrors) {
  const firstField = FIELD_SCROLL_ORDER.find((field) => errors[field]);
  if (!firstField) return;

  const element = document.getElementById(fieldAnchorId(firstField));
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET_PX;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

export function ListingEditor({ mode = "create", listingId }: ListingEditorProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { guardAuth } = useAuthGate();
  const isEditMode = mode === "edit";
  const itemPhotosInputRef = useRef<HTMLInputElement>(null);
  const docPhotosInputRef = useRef<HTMLInputElement>(null);
  const priceMeasureRef = useRef<HTMLSpanElement>(null);
  const [listingKind, setListingKind] = useState<ListingKind>("item");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceDigits, setPriceDigits] = useState("");
  const [priceTextWidth, setPriceTextWidth] = useState(0);
  const [itemCategoryTree, setItemCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [serviceCategoryTree, setServiceCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [childCategoryId, setChildCategoryId] = useState<string | null>(null);
  const [wantsParentCategoryId, setWantsParentCategoryId] = useState<string | null>(null);
  const [wantsChildCategoryId, setWantsChildCategoryId] = useState<string | null>(null);
  const [wantsCategoryPins, setWantsCategoryPins] = useState<WantsCategoryPin[]>([]);
  const [wantsTagInput, setWantsTagInput] = useState("");
  const [wantsTags, setWantsTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [cityId, setCityId] = useState<string | null>(null);
  const [cityQuery, setCityQuery] = useState("");
  const [debouncedCityQuery, setDebouncedCityQuery] = useState("");
  const [featuredCities, setFeaturedCities] = useState<ApiCity[]>([]);
  const [regularCities, setRegularCities] = useState<ApiCity[]>([]);
  const [cityPage, setCityPage] = useState(1);
  const [cityPageCount, setCityPageCount] = useState(1);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [condition, setCondition] = useState<ConditionId | null>(null);
  const [serviceWorkLevel, setServiceWorkLevel] = useState<ServiceWorkLevelId | null>(null);
  const [serviceFormats, setServiceFormats] = useState<ServiceFormatId[]>([]);
  const [extraPay, setExtraPay] = useState<ExtraPayId>("none");
  const [isFree, setIsFree] = useState(false);
  const [exchangeEnabled, setExchangeEnabled] = useState(false);
  const [itemPhotos, setItemPhotos] = useState<PhotoItem[]>([]);
  const [docPhotos, setDocPhotos] = useState<PhotoItem[]>([]);
  const [dragSource, setDragSource] = useState<{ kind: PhotoKind; id: string } | null>(null);
  const [dragInsertIndex, setDragInsertIndex] = useState<{ kind: PhotoKind; index: number } | null>(
    null,
  );
  const dragSourceRef = useRef<{ kind: PhotoKind; id: string } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishedModalOpen, setIsPublishedModalOpen] = useState(false);
  const [draftCityLabel, setDraftCityLabel] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listingStatus, setListingStatus] = useState<ApiListingDetail["status"] | null>(null);
  const heroDraftAppliedRef = useRef(false);
  const listingHydratedRef = useRef(false);
  const itemPhotoGrid = getItemPhotoGridLayout(itemPhotos.length);
  const docPhotoGrid = getDocPhotoGridLayout(docPhotos.length);
  const categoryTree = listingKind === "service" ? serviceCategoryTree : itemCategoryTree;
  const wantsCategoryTree = itemCategoryTree;
  const parentCategoryOptions = useMemo<SelectOption[]>(
    () =>
      categoryTree.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [categoryTree],
  );
  const wantsParentCategoryOptions = useMemo<SelectOption[]>(
    () =>
      wantsCategoryTree
        .filter((item) => !wantsCategoryPins.some((pin) => pin.id === item.id))
        .map((item) => ({
          value: item.id,
          label: item.name,
        })),
    [wantsCategoryTree, wantsCategoryPins],
  );
  const selectedParentCategory = useMemo(
    () => categoryTree.find((item) => item.id === parentCategoryId) ?? null,
    [categoryTree, parentCategoryId],
  );
  const childCategoryOptions = useMemo<SelectOption[]>(() => {
    const children = (selectedParentCategory?.children ?? []).map((item) => ({
      value: item.id,
      label: item.name,
    }));
    if (children.length === 0) return [];
    return [{ value: "", label: "Все" }, ...children];
  }, [selectedParentCategory]);
  const finalCategoryId = childCategoryId ?? parentCategoryId;
  const selectedWantsParentCategory = useMemo(
    () => wantsCategoryTree.find((item) => item.id === wantsParentCategoryId) ?? null,
    [wantsCategoryTree, wantsParentCategoryId],
  );
  const wantsChildCategoryOptions = useMemo<SelectOption[]>(() => {
    const children = (selectedWantsParentCategory?.children ?? [])
      .filter((item) => !wantsCategoryPins.some((pin) => pin.id === item.id))
      .map((item) => ({
        value: item.id,
        label: item.name,
      }));
    if (children.length === 0) return [];
    const parentAlreadyPinned = wantsCategoryPins.some(
      (pin) => pin.id === selectedWantsParentCategory?.id,
    );
    return parentAlreadyPinned
      ? children
      : [{ value: "__all__", label: "Вся категория" }, ...children];
  }, [selectedWantsParentCategory, wantsCategoryPins]);
  const wantsCategoriesAtLimit = wantsCategoryPins.length >= WANTS_CATEGORIES_LIMIT;
  const tagSuggestions = useMemo<TagSuggestionItem[]>(() => {
    const normalizedInput = wantsTagInput.trim().toLowerCase();
    const existingMatches = suggestedTags
      .filter((tag) => !wantsTags.some((existing) => existing.toLowerCase() === tag.toLowerCase()))
      .filter((tag) => (normalizedInput ? tag.toLowerCase().includes(normalizedInput) : true))
      .slice(0, 8)
      .map((tag) => ({
        value: tag,
        label: tag,
      }));

    if (!normalizedInput || wantsTags.length >= WANTS_TAGS_LIMIT) {
      return existingMatches;
    }

    const rawInput = wantsTagInput.trim();
    const alreadySelected = wantsTags.some(
      (existingTag) => existingTag.toLowerCase() === normalizedInput,
    );
    const alreadySuggested = existingMatches.some(
      (item) => item.value.toLowerCase() === normalizedInput,
    );

    if (alreadySelected || alreadySuggested) {
      return existingMatches;
    }

    return [
      {
        value: rawInput,
        label: `Добавить "${rawInput}"`,
        isCreateAction: true,
      },
      ...existingMatches,
    ];
  }, [suggestedTags, wantsTagInput, wantsTags]);
  const cityOptions = useMemo(() => {
    const options = buildCitySelectOptions({
      featured: featuredCities,
      cities: regularCities,
      mapCityToOption: (cityItem) => ({
        value: cityItem.id,
        label: cityItem.regionName
          ? `${cityItem.name}, ${cityItem.regionName}`
          : cityItem.name,
      }),
    });

    const pinned: SelectOption[] = [];

    if (user?.cityId && user.city) {
      const hasProfileCity = options.some((option) => option.value === user.cityId);
      if (!hasProfileCity) {
        pinned.push({ value: user.cityId, label: user.city });
      }
    }

    if (cityId && draftCityLabel) {
      const hasDraftCity =
        options.some((option) => option.value === cityId) ||
        pinned.some((option) => option.value === cityId);
      if (!hasDraftCity) {
        pinned.push({ value: cityId, label: draftCityLabel });
      }
    }

    return pinned.length > 0 ? [...pinned, ...options] : options;
  }, [cityId, draftCityLabel, featuredCities, regularCities, user?.city, user?.cityId]);

  useEffect(() => {
    if (isEditMode) return;
    if (heroDraftAppliedRef.current) return;
    heroDraftAppliedRef.current = true;

    const draft = readHeroListingDraft();
    if (!draft) return;

    if (draft.title) setTitle(draft.title);
    if (draft.price) setPriceDigits(draft.price);
    if (draft.cityId) {
      setCityId(draft.cityId);
      if (draft.cityLabel) setDraftCityLabel(draft.cityLabel);
    }
  }, [isEditMode]);

  const itemPhotosRef = useRef(itemPhotos);
  const docPhotosRef = useRef(docPhotos);
  const latestCitiesRequestRef = useRef(0);
  itemPhotosRef.current = itemPhotos;
  docPhotosRef.current = docPhotos;

  useEffect(() => {
    return () => {
      revokePhotoUrls(itemPhotosRef.current);
      revokePhotoUrls(docPhotosRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      getCategories({ parentsOnly: false, homeArc: false, forType: "item" }),
      getCategories({ parentsOnly: false, homeArc: false, forType: "service" }),
    ])
      .then(([itemCategories, serviceCategories]) => {
        if (cancelled) return;
        setItemCategoryTree(itemCategories.data as CategoryTreeNode[]);
        setServiceCategoryTree(serviceCategories.data as CategoryTreeNode[]);
      })
      .catch(() => {
        if (cancelled) return;
        setItemCategoryTree([]);
        setServiceCategoryTree([]);
      })
      .finally(() => {
        if (cancelled) return;
        setCategoriesReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEditMode || !listingId || !categoriesReady || listingHydratedRef.current) {
      return;
    }
    if (isAuthLoading) {
      return;
    }

    let cancelled = false;
    setIsHydrating(true);
    setLoadError(null);

    void getListing(listingId)
      .then((response) => {
        if (cancelled) return;

        const listing = response.listing;
        if (!user?.id || !listing.owner?.id || listing.owner.id !== user.id) {
          setLoadError("Вы можете редактировать только свои объявления");
          setIsHydrating(false);
          return;
        }

        const listingCategories =
          listing.type === "service" ? serviceCategoryTree : itemCategoryTree;
        const categorySelection = resolveCategorySelection(
          listingCategories,
          listing.category.id,
        );
        const nextFormats = listing.serviceFormats.filter(isServiceFormatId).slice(0, 1);
        const nextWorkLevel = isServiceWorkLevelId(listing.serviceWorkLevel)
          ? listing.serviceWorkLevel
          : listing.type === "service"
            ? "specialist"
            : null;
        const cityLabel = listing.city.regionName
          ? `${listing.city.name}, ${listing.city.regionName}`
          : listing.city.name;

        setListingKind(listing.type);
        setTitle(listing.title);
        setDescription(listing.description);
        setPriceDigits(
          typeof listing.estimatedPrice === "number" ? String(listing.estimatedPrice) : "",
        );
        setParentCategoryId(categorySelection?.parentId ?? listing.category.id);
        setChildCategoryId(categorySelection?.childId ?? null);
        setWantsParentCategoryId(null);
        setWantsChildCategoryId(null);
        setWantsCategoryPins(
          (listing.wantsCategories ?? []).map((category) => ({
            id: category.id,
            label: category.name,
          })),
        );
        setWantsTags(listing.wantsTags);
        setExchangeEnabled(
          listing.wantsTags.length > 0 ||
            Boolean(listing.wantsCategories?.length) ||
            Boolean(listing.wantsText),
        );
        setCityId(listing.city.id);
        setDraftCityLabel(cityLabel);
        setCondition(
          listing.type === "item" && isConditionId(listing.condition) ? listing.condition : null,
        );
        setServiceWorkLevel(nextWorkLevel);
        setServiceFormats(nextFormats);
        setExtraPay(
          listing.extraPay === "i_pay" ||
            listing.extraPay === "they_pay" ||
            listing.extraPay === "both"
            ? listing.extraPay
            : "none",
        );
        setIsFree(listing.isFree);
        setItemPhotos(photosFromListingImages(listing.images, "item"));
        setDocPhotos(photosFromListingImages(listing.images, "document"));
        setListingStatus(listing.status);
        listingHydratedRef.current = true;
        setIsHydrating(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError) {
          setLoadError(error.message);
        } else if (error instanceof Error) {
          setLoadError(error.message);
        } else {
          setLoadError("Не удалось загрузить объявление");
        }
        setIsHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEditMode, listingId, categoriesReady, itemCategoryTree, serviceCategoryTree, user?.id, isAuthLoading]);

  useEffect(() => {
    if (!isEditMode || isAuthLoading) return;
    guardAuth("create-listing");
  }, [guardAuth, isEditMode, isAuthLoading]);

  useEffect(() => {
    const query = wantsTagInput.trim();
    if (!query) {
      setSuggestedTags([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void getListingTagSuggestions(
        {
          q: query,
          limit: 10,
        },
        controller.signal,
      )
        .then((response) => {
          setSuggestedTags(response.data);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setSuggestedTags([]);
        });
    }, TAGS_FETCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [wantsTagInput]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedCityQuery(cityQuery.trim());
      setCityPage(1);
    }, CITY_FETCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [cityQuery]);

  useEffect(() => {
    let cancelled = false;
    const requestId = latestCitiesRequestRef.current + 1;
    latestCitiesRequestRef.current = requestId;

    setIsCityLoading(true);
    void getCities({
      q: debouncedCityQuery || undefined,
      page: cityPage,
      pageSize: 50,
    })
      .then((response) => {
        if (cancelled || requestId !== latestCitiesRequestRef.current) return;
        const nextFeatured = response.data.featured;
        const nextRegular = response.data.cities;
        setCityPageCount(Math.max(response.meta.pageCount, 1));
        setFeaturedCities((current) =>
          cityPage === 1 ? nextFeatured : mergeCitiesById(current, nextFeatured),
        );
        setRegularCities((current) =>
          cityPage === 1 ? nextRegular : mergeCitiesById(current, nextRegular),
        );
      })
      .catch(() => {
        if (cancelled || requestId !== latestCitiesRequestRef.current) return;
        if (cityPage === 1) {
          setFeaturedCities([]);
          setRegularCities([]);
          setCityPageCount(1);
        }
      })
      .finally(() => {
        if (cancelled || requestId !== latestCitiesRequestRef.current) return;
        setIsCityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cityPage, debouncedCityQuery]);

  const clearError = (key: keyof FieldErrors) => {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleListingKindChange = (nextKind: ListingKind) => {
    if (nextKind === listingKind) return;
    setListingKind(nextKind);
    setParentCategoryId(null);
    setChildCategoryId(null);
    setItemPhotos((current) => {
      revokePhotoUrls(current);
      return [];
    });
    setDocPhotos((current) => {
      revokePhotoUrls(current);
      return [];
    });
    resetPhotoDragState();
  };

  const listingTypeLabel = listingKind === "item" ? "вещи" : "услуги";
  const listingTypeName = listingKind === "item" ? "вещь" : "услугу";
  const formattedPrice = formatPriceWithSpaces(priceDigits);

  useLayoutEffect(() => {
    const node = priceMeasureRef.current;
    if (!node) return;
    setPriceTextWidth(node.getBoundingClientRect().width);
  }, [formattedPrice]);

  const handleIsFreeChange = (next: boolean) => {
    setIsFree(next);
    if (next) {
      // Defer layout collapse so it doesn't hitch the switch knob animation.
      requestAnimationFrame(() => setExchangeEnabled(false));
    }
  };

  const handleExchangeEnabledChange = (next: boolean) => {
    setExchangeEnabled(next);
    if (next) {
      requestAnimationFrame(() => setIsFree(false));
    }
  };

  const handleItemPhotosSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const remaining = ITEM_PHOTO_SLOTS - itemPhotos.length;
    if (remaining <= 0) {
      setErrors((current) => ({
        ...current,
        photos: `Можно добавить не больше ${ITEM_PHOTO_SLOTS} фото`,
      }));
      event.target.value = "";
      return;
    }

    const { accepted, tooLarge, badType } = partitionPickedImages(files);
    const nextPhotos = createPhotoItems(accepted.slice(0, remaining));
    const pickError = buildPhotoPickError(tooLarge, badType);

    if (nextPhotos.length > 0) {
      setItemPhotos((current) => [...current, ...nextPhotos]);
    }

    if (pickError) {
      setErrors((current) => ({ ...current, photos: pickError }));
    } else if (nextPhotos.length > 0) {
      clearError("photos");
    }

    event.target.value = "";
  };

  const handleDocPhotosSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const remaining = DOCUMENT_PHOTO_SLOTS - docPhotos.length;
    if (remaining <= 0) {
      setErrors((current) => ({
        ...current,
        documents: `Можно добавить не больше ${DOCUMENT_PHOTO_SLOTS} фото`,
      }));
      event.target.value = "";
      return;
    }

    const { accepted, tooLarge, badType } = partitionPickedDocuments(files);
    const nextPhotos = createPhotoItems(accepted.slice(0, remaining));
    const pickError = buildPhotoPickError(tooLarge, badType, { allowPdf: true });

    if (nextPhotos.length > 0) {
      setDocPhotos((current) => [...current, ...nextPhotos]);
    }

    if (pickError) {
      setErrors((current) => ({ ...current, documents: pickError }));
    } else if (nextPhotos.length > 0) {
      clearError("documents");
    }

    event.target.value = "";
  };

  const removeItemPhoto = (photoId: string) => {
    setItemPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((photo) => photo.id !== photoId);
    });
  };

  const removeDocPhoto = (photoId: string) => {
    setDocPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((photo) => photo.id !== photoId);
    });
  };

  const handlePhotoDragStart = (
    event: DragEvent<HTMLDivElement>,
    kind: PhotoKind,
    photoId: string,
    photoIndex: number,
  ) => {
    const nextSource = { kind, id: photoId };
    dragSourceRef.current = nextSource;
    const rect = event.currentTarget.getBoundingClientRect();
    event.dataTransfer.setDragImage(event.currentTarget, rect.width / 2, rect.height / 2);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", photoId);
    setDragSource(nextSource);
    setDragInsertIndex({ kind, index: photoIndex });
  };

  const handlePhotoDragOver = (event: DragEvent<HTMLDivElement | HTMLButtonElement>, kind: PhotoKind, dropIndex: number) => {
    const source = dragSourceRef.current;
    if (!source || source.kind !== kind) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragInsertIndex((current) => {
      if (current?.kind === kind && current.index === dropIndex) return current;
      return { kind, index: dropIndex };
    });
  };

  const getDropIndexFromCard = (event: DragEvent<HTMLDivElement>, photoIndex: number) => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - targetRect.left;
    return pointerX < targetRect.width / 2 ? photoIndex : photoIndex + 1;
  };

  const getPhotoDropIndicator = (
    kind: PhotoKind,
    photoId: string,
    photoIndex: number,
    photoCount: number,
  ): "before" | "after" | null => {
    if (!dragSource || dragSource.kind !== kind || !dragInsertIndex || dragInsertIndex.kind !== kind) {
      return null;
    }
    if (dragSource.id === photoId) return null;
    if (dragInsertIndex.index === photoIndex) return "before";
    if (dragInsertIndex.index === photoCount && photoIndex === photoCount - 1) return "after";
    return null;
  };

  const handlePhotoDrop = (
    event: DragEvent<HTMLDivElement | HTMLButtonElement>,
    kind: PhotoKind,
    dropIndex: number,
  ) => {
    event.preventDefault();
    const source = dragSourceRef.current;
    if (!source || source.kind !== kind) return;
    const sourceId = source.id;

    if (kind === "item") {
      setItemPhotos((current) => reorderPhotos(current, sourceId, dropIndex));
      resetPhotoDragState();
      return;
    }

    setDocPhotos((current) => reorderPhotos(current, sourceId, dropIndex));
    resetPhotoDragState();
  };

  const resetPhotoDragState = () => {
    dragSourceRef.current = null;
    setDragSource(null);
    setDragInsertIndex(null);
  };

  const addWantsTag = (rawTag: string) => {
    const normalized = rawTag.trim();
    if (!normalized) return;
    setWantsTags((current) => {
      if (current.length >= WANTS_TAGS_LIMIT) return current;
      const hasDuplicate = current.some(
        (existingTag) => existingTag.toLowerCase() === normalized.toLowerCase(),
      );
      if (hasDuplicate) return current;
      return [...current, normalized];
    });
    setWantsTagInput("");
  };

  const addWantsCategoryPin = (id: string, label: string) => {
    setWantsCategoryPins((current) => {
      if (current.length >= WANTS_CATEGORIES_LIMIT) return current;
      if (current.some((pin) => pin.id === id)) return current;
      return [...current, { id, label }];
    });
    setWantsParentCategoryId(null);
    setWantsChildCategoryId(null);
  };

  const removeWantsCategoryPin = (id: string) => {
    setWantsCategoryPins((current) => current.filter((pin) => pin.id !== id));
  };

  const handleWantsParentCategoryChange = (value: string) => {
    if (!value) {
      setWantsParentCategoryId(null);
      setWantsChildCategoryId(null);
      return;
    }

    const parent = wantsCategoryTree.find((item) => item.id === value);
    if (!parent) return;

    const children = parent.children ?? [];
    if (children.length === 0) {
      addWantsCategoryPin(parent.id, parent.name);
      return;
    }

    setWantsParentCategoryId(value);
    setWantsChildCategoryId(null);
  };

  const handleWantsChildCategoryChange = (value: string) => {
    if (!selectedWantsParentCategory) return;

    if (value === "__all__") {
      addWantsCategoryPin(selectedWantsParentCategory.id, selectedWantsParentCategory.name);
      return;
    }

    if (!value) {
      setWantsChildCategoryId(null);
      return;
    }

    const child = selectedWantsParentCategory.children?.find((item) => item.id === value);
    if (child) {
      addWantsCategoryPin(child.id, child.name);
    }
  };

  const handleWantsTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addWantsTag(wantsTagInput);
      return;
    }

    if (event.key === "Backspace" && wantsTagInput.length === 0 && wantsTags.length > 0) {
      event.preventDefault();
      setWantsTags((current) => current.slice(0, -1));
    }
  };

  const handleInsertCityFromProfile = () => {
    if (!user?.cityId || !user.city) {
      setErrors((current) => ({
        ...current,
        city: "В профиле не указан город. Добавьте его в профиле или выберите вручную.",
      }));
      scrollToFirstError({
        city: "В профиле не указан город. Добавьте его в профиле или выберите вручную.",
      });
      return;
    }

    const profileCityId = user.cityId;
    setCityId(profileCityId);
    clearError("city");
  };

  const uploadPhotos = async (
    photos: PhotoItem[],
    role: "item" | "document",
  ) => {
    return mapPool(photos, UPLOAD_CONCURRENCY, async (photo) => {
      if (photo.mediaId && !photo.file) {
        return photo.mediaId;
      }
      if (!photo.file) {
        throw new Error("Не удалось подготовить файл для загрузки");
      }
      const prepared = photo.isPdf
        ? photo.file
        : await compressListingImageForUpload(photo.file);
      const uploaded = await uploadListingFileViaBackend(prepared, role);
      return uploaded.uploadId;
    });
  };

  const validateAndPublish = async () => {
    const nextErrors: FieldErrors = {};

    if (!title.trim()) nextErrors.title = `Вы не добавили наименование ${listingTypeLabel}`;
    if (!description.trim()) nextErrors.description = "Добавьте описание";
    if (!finalCategoryId) nextErrors.category = `Выберите категорию ${listingTypeLabel}`;
    if (!cityId) {
      nextErrors.city = "Выберите город из списка или вставьте его из профиля";
    }
    if (listingKind === "item" && !condition) {
      nextErrors.condition = "Вы не выбрали состояние вашей вещи";
    }
    if (listingKind === "service" && !serviceWorkLevel) {
      nextErrors.serviceWorkLevel = "Выберите уровень работы";
    }
    if (listingKind === "service" && serviceFormats.length === 0) {
      nextErrors.serviceFormat = "Выберите формат оказания услуги";
    }
    if (itemPhotos.length < 1) {
      nextErrors.photos =
        listingKind === "item" ? "Вы не добавили фото вещи" : "Вы не добавили фото услуги";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError(nextErrors);
      return;
    }

    if (isSubmitting) return;

    const categoryId = finalCategoryId;
    const selectedCityId = cityId;
    if (!categoryId || !selectedCityId) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await ensureFreshAccessToken();

      const [itemUploadIds, documentUploadIds] = await Promise.all([
        uploadPhotos(itemPhotos, "item"),
        uploadPhotos(docPhotos, "document"),
      ]);

      const wantsCategoryIds =
        exchangeEnabled && !isFree ? wantsCategoryPins.map((pin) => pin.id) : [];
      const wantsPayloadTags = exchangeEnabled && !isFree ? wantsTags : [];
      const estimatedPrice = priceDigits ? Number(priceDigits) : null;

      const payload = {
        type: listingKind,
        serviceFormats: listingKind === "service" ? serviceFormats : undefined,
        serviceWorkLevel: listingKind === "service" ? serviceWorkLevel ?? undefined : undefined,
        title: title.trim(),
        description: normalizeListingDescription(description),
        categoryId,
        wantsCategoryIds,
        cityId: selectedCityId,
        condition: listingKind === "item" ? condition ?? undefined : undefined,
        estimatedPrice: estimatedPrice ?? undefined,
        extraPay: isFree ? ("none" as const) : extraPay,
        isFree,
        wantsTags: wantsPayloadTags,
        itemUploadIds,
        documentUploadIds,
      };

      if (isEditMode) {
        if (!listingId) {
          throw new Error("Не указан идентификатор объявления");
        }

        await updateListing(listingId, {
          ...payload,
          estimatedPrice,
        });

        if (listingStatus !== "active") {
          await publishListing(listingId);
        }

        router.push(`/listings/${listingId}`);
        return;
      }

      const created = await createListingDraft(payload);

      await publishListing(created.listing.id);
      clearHeroListingDraft();
      setIsPublishedModalOpen(true);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError(
          isEditMode
            ? "Не удалось сохранить объявление. Попробуйте снова."
            : "Не удалось опубликовать объявление. Попробуйте снова.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && (isHydrating || loadError)) {
    return (
      <main className="min-h-screen w-full bg-[#F8F8F5] text-[#1A1A1A]">
        <Header />
        <div className="h-[54px]" aria-hidden="true" />
        <div className="mx-auto flex w-full max-w-[1238px] flex-col gap-4 px-4 pb-14 pt-14">
          <h1 className="m-0 text-[40px] font-bold leading-[40px] tracking-[-0.005em] text-[#1A1A1A]">
            Редактирование объявления
          </h1>
          {loadError ? (
            <p className="m-0 text-[14px] font-normal leading-[170%] text-[#FF2056]">{loadError}</p>
          ) : (
            <p className="m-0 text-[14px] font-semibold leading-[120%] text-[#3D3D3D]">
              Загружаем объявление...
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F8F8F5] text-[#1A1A1A]">
      <Header />
      <div className="h-[54px]" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-[1238px] flex-col gap-5 px-4 pb-14 pt-14">
        <section className="flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 text-[40px] font-bold leading-[40px] tracking-[-0.005em] text-[#1A1A1A]">
              {isEditMode ? "Редактирование объявления" : "Создание объявления"}
            </h1>
            <p className="mb-5 mt-2 text-[14px] font-semibold leading-[120%] tracking-[-0.002em] text-[#3D3D3D]">
              {isEditMode
                ? "Обновите данные объявления и сохраните изменения"
                : "Создавайте объявления, чтобы обмениваться с другими"}
            </p>
          </div>
          <div className="mt-1 rounded-[15px] bg-[linear-gradient(135deg,#8E8BED_0%,#C8FF00_100%)] p-[1px]">
            <div className="relative box-border inline-flex h-[42px] w-[212px] items-center gap-[4px] rounded-[15px] border-0 bg-[#F2F4F7] p-[4px]">
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-[4px] left-[4px] top-[4px] w-[calc(50%-6px)] rounded-[13px] bg-[#8E8BED] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  listingKind === "service" ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
                }`}
              />
              <button
                type="button"
                onClick={() => handleListingKindChange("item")}
                className={`relative z-[1] flex h-full flex-1 items-center justify-center rounded-[13px] text-[14px] font-semibold leading-none tracking-[0.001em] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  listingKind === "item" ? "text-white" : "text-[#1A1A1A] hover:text-[#8E8BED]"
                }`}
              >
                Вещь
              </button>
              <button
                type="button"
                onClick={() => handleListingKindChange("service")}
                className={`relative z-[1] flex h-full flex-1 items-center justify-center rounded-[13px] text-[14px] font-semibold leading-none tracking-[0.001em] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  listingKind === "service" ? "text-white" : "text-[#1A1A1A] hover:text-[#8E8BED]"
                }`}
              >
                Услуга
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[16px] bg-[#C8FF00] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <h2 className="m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#1A1A1A]">
            Основная информация*
          </h2>
          <div className="mt-3 grid gap-3">
            <div id={fieldAnchorId("title")} className="grid gap-1.5">
              <p className={`m-0 ${SECTION_TEXT_CLASS}`}>Наименование {listingTypeLabel}</p>
              <input
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  clearError("title");
                }}
                placeholder={`Наименование вашей ${listingTypeName}`}
                className="h-11 rounded-[18px] border-[0.5px] border-[#C4D86F] bg-white px-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
              />
              <FieldError message={errors.title} />
            </div>
            <div id={fieldAnchorId("category")} className="grid gap-1.5">
              <p className={`m-0 ${SECTION_TEXT_CLASS}`}>Категория {listingTypeLabel}</p>
              <SelectField
                value={parentCategoryId ?? ""}
                onChange={(value) => {
                  setParentCategoryId(value || null);
                  setChildCategoryId(null);
                  clearError("category");
                }}
                options={parentCategoryOptions}
                placeholder={`Выберите категорию ${listingTypeLabel}`}
                variant="field"
                className="create-listing-city-select"
                searchable={false}
                allowCustomValue={false}
                aria-label={`Категория ${listingTypeLabel}`}
              />
              <div
                className={`create-listing-subcategory-panel${
                  childCategoryOptions.length > 0 ? " is-open" : ""
                }`}
              >
                <div className="create-listing-subcategory-panel__inner">
                  <div className="create-listing-subcategory-panel__content mt-2">
                    <SelectField
                      value={childCategoryId ?? ""}
                      onChange={(value) => {
                        setChildCategoryId(value || null);
                      }}
                      options={childCategoryOptions}
                      placeholder="Уточните подкатегорию (необязательно)"
                      variant="field"
                      className="create-listing-city-select"
                      searchable={false}
                      allowCustomValue={false}
                      disabled={childCategoryOptions.length === 0}
                      aria-label={`Подкатегория ${listingTypeLabel}`}
                    />
                  </div>
                </div>
              </div>
              <FieldError message={errors.category} />
            </div>
            <div id={fieldAnchorId("city")}>
              <div className="flex items-end gap-3">
                <div className="grid min-w-0 flex-1 gap-1.5">
                  <p className={`m-0 ${SECTION_TEXT_CLASS}`}>Город {listingTypeLabel}</p>
                  <SelectField
                    value={cityId ?? ""}
                    onChange={(value) => {
                      setCityId(value || null);
                      if (!value) setDraftCityLabel(null);
                      clearError("city");
                    }}
                    onInputChange={(value) => {
                      setCityQuery(value);
                    }}
                    options={cityOptions}
                    onListEndReached={() => {
                      if (isCityLoading) return;
                      if (cityPage >= cityPageCount) return;
                      setCityPage((current) => current + 1);
                    }}
                    placeholder="Начните вводить город или выберите из списка"
                    variant="field"
                    className="create-listing-city-select"
                    allowCustomValue={false}
                    clearable
                    aria-label={`Город ${listingTypeLabel}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleInsertCityFromProfile}
                  className="h-12 shrink-0 whitespace-nowrap rounded-[18px] border-[0.5px] border-[#8E8BED] bg-[#8E8BED] px-5 text-[14px] font-semibold text-white"
                >
                  Вставить из профиля
                </button>
              </div>
              <FieldError message={errors.city} />
            </div>
          </div>
        </section>

        <section id={fieldAnchorId("photos")} className="rounded-[16px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <h3 className={SECTION_TITLE_CLASS}>Добавить фото (до 10 фото)*</h3>
          <p className={`mt-4 ${PHOTO_UPLOAD_LABEL_CLASS}`}>Загрузить фото</p>
          <p className={`mt-1 ${SECTION_TEXT_CLASS}`}>PNG, JPG, WebP до 5 МБ каждое</p>
          <input
            ref={itemPhotosInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            multiple
            className="hidden"
            onChange={handleItemPhotosSelected}
          />
          <div className="relative mt-4 box-border w-full rounded-[6.82px] border-[0.5px] border-dashed border-[#CACACA] p-6">
            <div className="relative grid grid-cols-5 gap-3">
              {Array.from({ length: itemPhotoGrid.visibleSlots }).map((_, index) => {
                if (index < itemPhotos.length) {
                  const photo = itemPhotos[index];
                  return (
                    <PhotoCard
                      key={photo.id}
                      previewUrl={photo.previewUrl}
                      onDelete={() => removeItemPhoto(photo.id)}
                      draggable
                      onDragStart={(event) =>
                        handlePhotoDragStart(event, "item", photo.id, index)
                      }
                      onDragOver={(event) =>
                        handlePhotoDragOver(event, "item", getDropIndexFromCard(event, index))
                      }
                      onDrop={(event) =>
                        handlePhotoDrop(event, "item", getDropIndexFromCard(event, index))
                      }
                      onDragEnd={resetPhotoDragState}
                      isDragging={dragSource?.kind === "item" && dragSource.id === photo.id}
                      dropIndicator={getPhotoDropIndicator("item", photo.id, index, itemPhotos.length)}
                      showPrimaryBadge={index === 0}
                    />
                  );
                }

                if (itemPhotoGrid.hasAddSlot && index === itemPhotos.length) {
                  return (
                    <AddPhotoCard
                      key="item-photo-add"
                      label="+ Добавить"
                      onClick={() => itemPhotosInputRef.current?.click()}
                      onDragOver={(event) =>
                        handlePhotoDragOver(event, "item", itemPhotos.length)
                      }
                      onDrop={(event) => handlePhotoDrop(event, "item", itemPhotos.length)}
                    />
                  );
                }

                return <div key={`item-empty-${index}`} className="aspect-square w-full" aria-hidden="true" />;
              })}
            </div>
          </div>
          <FieldError message={errors.photos} />
        </section>

        <section className="rounded-[16px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <h3 className={SECTION_TITLE_CLASS}>Дополнительная информация</h3>

          <div id={fieldAnchorId("description")}>
            <p className={`mt-4 ${SECTION_TEXT_CLASS}`}>
              Опишите вашу {listingTypeName} подробнее (до 2000 символов)
            </p>
            <div className="create-listing-description mt-2">
              <textarea
                maxLength={2000}
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  clearError("description");
                }}
                placeholder="Введите описание...."
                className="create-listing-description__input"
              />
            </div>
            <FieldError message={errors.description} />
          </div>

          {listingKind === "item" ? (
            <div id={fieldAnchorId("condition")}>
              <p className={`mt-4 ${SECTION_TEXT_CLASS}`}>Выберите состояние вашей вещи *</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {CONDITION_OPTIONS.map((item) => {
                  const active = condition === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCondition(item.id);
                        clearError("condition");
                      }}
                      className={`flex h-12 min-w-[116px] items-center justify-center rounded-[18px] px-6 py-3 text-[14px] font-semibold leading-[120%] tracking-[0.001em] transition-colors duration-200 ${
                        active
                          ? "border-[0.5px] border-[#8E8BED] bg-[#8E8BED] text-white hover:border-[#9E9EF0] hover:bg-[#9E9EF0]"
                          : "border-[0.5px] border-[#CACACA] bg-white text-[#1A1A1A] hover:border-[#8E8BED] hover:bg-[#F2F4F7]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.condition} />
            </div>
          ) : (
            <>
              <div id={fieldAnchorId("serviceWorkLevel")}>
                <p className={`mt-4 ${SECTION_TEXT_CLASS}`}>Выберите уровень работы *</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {SERVICE_WORK_LEVEL_OPTIONS.map((item) => {
                    const active = serviceWorkLevel === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setServiceWorkLevel(item.id);
                          clearError("serviceWorkLevel");
                        }}
                        className={`flex h-12 min-w-[116px] items-center justify-center rounded-[18px] px-6 py-3 text-[14px] font-semibold leading-[120%] tracking-[0.001em] transition-colors duration-200 ${
                          active
                            ? "border-[0.5px] border-[#8E8BED] bg-[#8E8BED] text-white hover:border-[#9E9EF0] hover:bg-[#9E9EF0]"
                            : "border-[0.5px] border-[#CACACA] bg-white text-[#1A1A1A] hover:border-[#8E8BED] hover:bg-[#F2F4F7]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <FieldError message={errors.serviceWorkLevel} />
              </div>

              <div id={fieldAnchorId("serviceFormat")}>
                <p className={`mt-4 ${SECTION_TEXT_CLASS}`}>Формат оказания услуги *</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {SERVICE_FORMAT_OPTIONS.map((item) => {
                    const active = serviceFormats.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setServiceFormats([item.id]);
                          clearError("serviceFormat");
                        }}
                        className={`flex h-12 min-w-[116px] items-center justify-center rounded-[18px] px-6 py-3 text-[14px] font-semibold leading-[120%] tracking-[0.001em] transition-colors duration-200 ${
                          active
                            ? "border-[0.5px] border-[#8E8BED] bg-[#8E8BED] text-white hover:border-[#9E9EF0] hover:bg-[#9E9EF0]"
                            : "border-[0.5px] border-[#CACACA] bg-white text-[#1A1A1A] hover:border-[#8E8BED] hover:bg-[#F2F4F7]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <FieldError message={errors.serviceFormat} />
              </div>
            </>
          )}

          <div className="mt-4 grid gap-4">
            <div>
              <p className={`mb-2 ${SECTION_TEXT_CLASS}`}>
                Напишите примерную стоимость вашей {listingTypeName} (другим будет легче предложить
                равноценный обмен)
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-normal leading-[170%] text-[#3D3D3D]">
                  ~
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formattedPrice}
                  onChange={(event) => {
                    const nextDigits = extractPriceDigits(event.target.value);
                    setPriceDigits(nextDigits);
                  }}
                  placeholder="0"
                  className="h-11 w-full rounded-[12px] border border-[#E2E6EF] bg-[#F6F7FB] pl-6 pr-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
                />
                <span
                  ref={priceMeasureRef}
                  aria-hidden="true"
                  className="pointer-events-none invisible absolute left-6 top-1/2 -translate-y-1/2 whitespace-pre text-[14px] font-normal leading-[170%]"
                >
                  {formattedPrice || "0"}
                </span>
                <span
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[14px] font-normal leading-[170%] text-[#3D3D3D]"
                  style={{ left: `calc(1.5rem + ${priceTextWidth}px + 0.25rem)` }}
                >
                  руб.
                </span>
              </div>
            </div>

            <div>
              <p className={`m-0 ${SECTION_TEXT_CLASS}`}>
                Отметьте вашу готовность к доплате (другие поймут могут ли они доплатить в счет обмена)
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                {EXTRA_PAY_OPTIONS.map((item) => {
                  const active = extraPay === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExtraPay(item.id)}
                      className={`flex h-12 items-center justify-center rounded-[18px] px-6 py-3 text-[14px] font-semibold leading-[120%] tracking-[0.001em] transition-colors duration-200 ${
                        active
                          ? "border-[0.5px] border-[#8E8BED] bg-[#8E8BED] text-white hover:border-[#9E9EF0] hover:bg-[#9E9EF0]"
                          : "border-[0.5px] border-[#CACACA] bg-white text-[#1A1A1A] hover:border-[#8E8BED] hover:bg-[#F2F4F7]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          className={`create-listing-free-section rounded-[16px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)] ${
            isFree ? "is-on bg-[#C8FF00]" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <h3
                className={`m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] ${
                  isFree ? "text-[#1A1A1A]" : "text-[#626262]"
                }`}
              >
                Отдаю даром
              </h3>
              <p className={`mt-1 ${SECTION_TEXT_CLASS}`}>
                Включите, если отдаёте {listingTypeName} без обмена — взамен вы ничего не получите
              </p>
            </div>
            <div className="create-listing-switch-slot">
              <Switch checked={isFree} onChange={handleIsFreeChange} />
            </div>
          </div>
        </section>

        <section className="rounded-[16px] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <h3 className={SECTION_TITLE_CLASS}>Желаемый обмен</h3>
              <p className={`mt-1 ${SECTION_TEXT_CLASS}`}>
                Включите, чтобы указать, что хотите получить взамен
              </p>
            </div>
            <div className="create-listing-switch-slot">
              <Switch checked={exchangeEnabled} onChange={handleExchangeEnabledChange} />
            </div>
          </div>

          <div className={`create-listing-exchange-panel${exchangeEnabled ? " is-open" : ""}`}>
            <div className="create-listing-exchange-panel__inner" inert={!exchangeEnabled}>
              <div className="create-listing-exchange-panel__content mt-6 grid gap-4">
                <div className="grid gap-2">
                  <p className={`m-0 ${SECTION_TEXT_CLASS}`}>
                    Выберите категории вещей или услуг, которые хотите получить взамен (до{" "}
                    {WANTS_CATEGORIES_LIMIT}). Можно указать категорию целиком или уточнить
                    подкатегорию
                  </p>
                  {wantsCategoryPins.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {wantsCategoryPins.map((pin) => (
                        <span
                          key={pin.id}
                          className="inline-flex items-center gap-1.5 rounded-[999px] border border-[#CACACA] bg-white px-3.5 py-1.5 text-[14px] leading-[120%] text-[#1A1A1A]"
                        >
                          {pin.label}
                          <button
                            type="button"
                            onClick={() => removeWantsCategoryPin(pin.id)}
                            className="text-[17px] leading-none text-[#626262] hover:text-[#1A1A1A]"
                            aria-label={`Удалить категорию ${pin.label}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <SelectField
                    value={wantsParentCategoryId ?? ""}
                    onChange={handleWantsParentCategoryChange}
                    options={wantsParentCategoryOptions}
                    placeholder={
                      wantsCategoriesAtLimit
                        ? `Достигнут лимит ${WANTS_CATEGORIES_LIMIT}`
                        : "Например: Электроника, Одежда, Услуги"
                    }
                    variant="field"
                    className="create-listing-exchange-select"
                    searchable={false}
                    allowCustomValue={false}
                    disabled={wantsCategoriesAtLimit}
                    aria-label="Желаемая категория"
                  />
                  <div
                    className={`create-listing-subcategory-panel${
                      !wantsCategoriesAtLimit && wantsChildCategoryOptions.length > 0
                        ? " is-open"
                        : ""
                    }`}
                  >
                    <div className="create-listing-subcategory-panel__inner">
                      <div className="create-listing-subcategory-panel__content mt-2">
                        <SelectField
                          value={wantsChildCategoryId ?? ""}
                          onChange={handleWantsChildCategoryChange}
                          options={wantsChildCategoryOptions}
                          placeholder="Уточните подкатегорию или оставьте всю категорию"
                          variant="field"
                          className="create-listing-exchange-select"
                          searchable={false}
                          allowCustomValue={false}
                          disabled={
                            wantsCategoriesAtLimit || wantsChildCategoryOptions.length === 0
                          }
                          aria-label="Желаемая подкатегория"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <p className={`m-0 ${SECTION_TEXT_CLASS}`}>
                    Укажите вещи или услуги, которые хотите получить взамен (до {WANTS_TAGS_LIMIT}).
                    Начните вводить название — можно выбрать из подсказок или добавить своё
                  </p>
                  <div className="grid gap-2">
                    {wantsTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {wantsTags.map((tag) => (
                          <span
                            key={tag.toLowerCase()}
                            className="inline-flex items-center gap-1.5 rounded-[999px] border border-[#CACACA] bg-white px-3.5 py-1.5 text-[14px] leading-[120%] text-[#1A1A1A]"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() =>
                                setWantsTags((current) =>
                                  current.filter((item) => item.toLowerCase() !== tag.toLowerCase()),
                                )
                              }
                              className="text-[17px] leading-none text-[#626262] hover:text-[#1A1A1A]"
                              aria-label={`Удалить тег ${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div>
                      <input
                        type="text"
                        value={wantsTagInput}
                        onChange={(event) => setWantsTagInput(event.target.value)}
                        onKeyDown={handleWantsTagKeyDown}
                        onBlur={() => {
                          if (wantsTagInput.trim()) {
                            addWantsTag(wantsTagInput);
                          }
                        }}
                        placeholder={
                          wantsTags.length >= WANTS_TAGS_LIMIT
                            ? `Достигнут лимит ${WANTS_TAGS_LIMIT}`
                            : "Например: iPhone, MacBook, ремонт ноутбука"
                        }
                        disabled={wantsTags.length >= WANTS_TAGS_LIMIT}
                        className={`${EXCHANGE_FIELD_INPUT_CLASS} mb-2`}
                      />
                      {tagSuggestions.length > 0 &&
                      wantsTags.length < WANTS_TAGS_LIMIT &&
                      wantsTagInput.trim().length > 0 ? (
                        <div className="mt-2 max-h-44 overflow-y-auto rounded-[12px] border border-[#CACACA] bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.14)]">
                          {tagSuggestions.map((item) => (
                            <button
                              key={`${item.value.toLowerCase()}-${item.isCreateAction ? "create" : "existing"}`}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => addWantsTag(item.value)}
                              className={`block w-full rounded-[8px] px-3 py-2 text-left text-[13px] leading-[120%] ${
                                item.isCreateAction
                                  ? "bg-[#F3F2FF] text-[#1A1A1A]"
                                  : "text-[#1A1A1A] hover:bg-[#F8F8F5]"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id={fieldAnchorId("documents")}
          className="rounded-[16px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
        >
          <h3 className={SECTION_TITLE_CLASS}>
            Добавить документы, сертификаты, дипломы (до 5 файлов)
          </h3>
          <p className={`mt-4 ${PHOTO_UPLOAD_LABEL_CLASS}`}>Загрузить файлы</p>
          <p className={`mt-1 ${SECTION_TEXT_CLASS}`}>
            PNG, JPG, WebP до 5 МБ или PDF до 10 МБ
          </p>
          <input
            ref={docPhotosInputRef}
            type="file"
            accept={ACCEPTED_DOCUMENT_TYPES}
            multiple
            className="hidden"
            onChange={handleDocPhotosSelected}
          />
          <div className="relative mt-4 box-border w-full rounded-[6.82px] border-[0.5px] border-dashed border-[#CACACA] p-6">
            <div className="relative grid grid-cols-5 gap-3">
              {Array.from({ length: docPhotoGrid.visibleSlots }).map((_, index) => {
                if (index < docPhotos.length) {
                  const photo = docPhotos[index];
                  return (
                    <PhotoCard
                      key={photo.id}
                      previewUrl={photo.previewUrl}
                      isPdf={Boolean(photo.isPdf)}
                      fileName={photo.file?.name}
                      onDelete={() => removeDocPhoto(photo.id)}
                      draggable
                      onDragStart={(event) =>
                        handlePhotoDragStart(event, "doc", photo.id, index)
                      }
                      onDragOver={(event) =>
                        handlePhotoDragOver(event, "doc", getDropIndexFromCard(event, index))
                      }
                      onDrop={(event) =>
                        handlePhotoDrop(event, "doc", getDropIndexFromCard(event, index))
                      }
                      onDragEnd={resetPhotoDragState}
                      isDragging={dragSource?.kind === "doc" && dragSource.id === photo.id}
                      dropIndicator={getPhotoDropIndicator("doc", photo.id, index, docPhotos.length)}
                    />
                  );
                }

                if (docPhotoGrid.hasAddSlot && index === docPhotos.length) {
                  return (
                    <AddPhotoCard
                      key="doc-photo-add"
                      label="+ Добавить"
                      onClick={() => docPhotosInputRef.current?.click()}
                      onDragOver={(event) =>
                        handlePhotoDragOver(event, "doc", docPhotos.length)
                      }
                      onDrop={(event) => handlePhotoDrop(event, "doc", docPhotos.length)}
                    />
                  );
                }

                return <div key={`doc-empty-${index}`} className="aspect-square w-full" aria-hidden="true" />;
              })}
            </div>
          </div>
          <FieldError message={errors.documents} />
        </section>

        {submitError ? (
          <p className="m-0 text-[14px] font-normal leading-[170%] text-[#FF2056]">
            {submitError}
          </p>
        ) : null}

        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            onClick={validateAndPublish}
            disabled={isSubmitting}
            className="flex h-[63px] flex-1 items-center justify-center rounded-[21px] bg-[#8E8BED] px-[74px] py-4 text-[14px] font-semibold leading-[120%] tracking-[0.001em] text-white disabled:opacity-70"
          >
            {isEditMode
              ? listingStatus === "active"
                ? "Сохранить изменения"
                : "Сохранить и опубликовать"
              : "Опубликовать объявление"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="box-border flex h-[63px] w-[323px] shrink-0 items-center justify-center rounded-[21px] border border-[#CACACA] bg-white px-[74px] py-4 text-[14px] font-semibold leading-[120%] tracking-[0.001em] text-[#1A1A1A] disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </div>

      <ListingPublishingOverlay
        open={isSubmitting}
        title={
          isEditMode
            ? listingStatus === "active"
              ? "Сохраняем изменения…"
              : "Публикуем объявление…"
            : "Публикуем объявление…"
        }
      />
      <ListingPublishedModal open={isPublishedModalOpen} />
    </main>
  );
}
