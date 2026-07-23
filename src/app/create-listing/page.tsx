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
import { getCategories, getCities, type ApiCategoryNode, type ApiCity } from "@/shared/api/catalog";
import { ApiError } from "@/shared/api/http";
import { uploadListingFileViaBackend } from "@/shared/api/media";
import { createListingDraft, getListingTagSuggestions, publishListing } from "@/shared/api/listings";
import { buildCitySelectOptions } from "@/shared/lib/city-select-options";
import { SelectField, type SelectOption } from "@/shared/ui/select-field";
import { Header } from "@/widgets/header/Header";
import { DeleteIcon } from "@/shared/ui/icons";
import { Switch } from "@/shared/ui/switch/Switch";

import { ListingPublishedModal } from "./ListingPublishedModal";

import {
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
  MAX_PHOTO_BYTES,
  SERVICE_FORMAT_OPTIONS,
  SERVICE_WORK_LEVEL_OPTIONS,
  TAGS_FETCH_DEBOUNCE_MS,
  WANTS_TAGS_LIMIT,
  type ConditionId,
  type ExtraPayId,
  type FieldErrors,
  type ListingKind,
  type ServiceFormatId,
  type ServiceWorkLevelId,
} from "./constants";


type CategoryTreeNode = ApiCategoryNode & {
  children?: Array<{ id: string; name: string; slug: string }>;
};

type PhotoItem = {
  id: string;
  previewUrl: string;
  file: File;
};

type TagSuggestionItem = {
  value: string;
  label: string;
  isCreateAction?: boolean;
};

type PhotoKind = "item" | "doc";

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

function createPhotoItems(files: FileList | File[]): PhotoItem[] {
  return Array.from(files)
    .filter((file) => file.type.startsWith("image/") && file.size <= MAX_PHOTO_BYTES)
    .map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      previewUrl: URL.createObjectURL(file),
      file,
    }));
}

function revokePhotoUrls(photos: PhotoItem[]) {
  for (const photo of photos) {
    URL.revokeObjectURL(photo.previewUrl);
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

function formatPriceWithSpaces(rawDigits: string) {
  if (!rawDigits) return "";
  return rawDigits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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

function PhotoCard({
  previewUrl,
  onDelete,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  showPrimaryBadge = false,
}: {
  previewUrl?: string;
  onDelete: () => void;
  draggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: DragEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
  showPrimaryBadge?: boolean;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative aspect-square w-full select-none overflow-hidden rounded-[21px] border-[0.5px] border-[#CACACA] bg-[#F2F4F7] transition ${
        isDragging ? "cursor-grabbing opacity-60" : draggable ? "cursor-grab" : ""
      }`}
    >
      {showPrimaryBadge ? (
        <span className="absolute left-[10px] top-[10px] z-[2] rounded-[999px] bg-[#8E8BED] px-2.5 py-1 text-[12px] font-semibold leading-none text-white">
          Основное
        </span>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        aria-label="Удалить фото"
        className="absolute right-[10px] top-[10px] z-[1] flex items-center justify-center"
      >
        <DeleteIcon className="h-[26px] w-[24px] text-white" />
      </button>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" draggable={false} className="h-full w-full cursor-grab object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <PlaceholderImage />
        </div>
      )}
    </div>
  );
}

function PhotoDropGap({
  onDragOver,
  onDrop,
}: {
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="aspect-square w-full rounded-[21px] border-[1.5px] border-dashed border-[#8E8BED] bg-[#8E8BED]/12"
      aria-hidden="true"
    />
  );
}

function AddPhotoCard({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
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

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const itemPhotosInputRef = useRef<HTMLInputElement>(null);
  const docPhotosInputRef = useRef<HTMLInputElement>(null);
  const priceMeasureRef = useRef<HTMLSpanElement>(null);
  const [listingKind, setListingKind] = useState<ListingKind>("item");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceDigits, setPriceDigits] = useState("");
  const [priceTextWidth, setPriceTextWidth] = useState(0);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [childCategoryId, setChildCategoryId] = useState<string | null>(null);
  const [wantsParentCategoryId, setWantsParentCategoryId] = useState<string | null>(null);
  const [wantsChildCategoryId, setWantsChildCategoryId] = useState<string | null>(null);
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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishedModalOpen, setIsPublishedModalOpen] = useState(false);
  const itemPhotoGrid = getItemPhotoGridLayout(itemPhotos.length);
  const docPhotoGrid = getDocPhotoGridLayout(docPhotos.length);
  const parentCategoryOptions = useMemo<SelectOption[]>(
    () =>
      categoryTree.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [categoryTree],
  );
  const selectedParentCategory = useMemo(
    () => categoryTree.find((item) => item.id === parentCategoryId) ?? null,
    [categoryTree, parentCategoryId],
  );
  const childCategoryOptions = useMemo<SelectOption[]>(
    () =>
      (selectedParentCategory?.children ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [selectedParentCategory],
  );
  const finalCategoryId = childCategoryId ?? parentCategoryId;
  const selectedWantsParentCategory = useMemo(
    () => categoryTree.find((item) => item.id === wantsParentCategoryId) ?? null,
    [categoryTree, wantsParentCategoryId],
  );
  const wantsChildCategoryOptions = useMemo<SelectOption[]>(
    () =>
      (selectedWantsParentCategory?.children ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [selectedWantsParentCategory],
  );
  const finalWantsCategoryId = wantsChildCategoryId ?? wantsParentCategoryId;
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

    if (user?.cityId && user.city) {
      const hasProfileCity = options.some((option) => option.value === user.cityId);
      if (!hasProfileCity) {
        return [{ value: user.cityId, label: user.city }, ...options];
      }
    }

    return options;
  }, [featuredCities, regularCities, user?.city, user?.cityId]);

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
    void getCategories({ parentsOnly: false, homeArc: false })
      .then((response) => {
        if (cancelled) return;
        setCategoryTree(response.data as CategoryTreeNode[]);
      })
      .catch(() => {
        if (cancelled) return;
        setCategoryTree([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
    if (next) setExchangeEnabled(false);
  };

  const handleExchangeEnabledChange = (next: boolean) => {
    setExchangeEnabled(next);
    if (next) setIsFree(false);
  };

  const handleItemPhotosSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const remaining = ITEM_PHOTO_SLOTS - itemPhotos.length;
    if (remaining <= 0) {
      event.target.value = "";
      return;
    }

    const nextPhotos = createPhotoItems(Array.from(files)).slice(0, remaining);
    if (nextPhotos.length > 0) {
      setItemPhotos((current) => [...current, ...nextPhotos]);
      clearError("photos");
    }
    event.target.value = "";
  };

  const handleDocPhotosSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const remaining = DOCUMENT_PHOTO_SLOTS - docPhotos.length;
    if (remaining <= 0) {
      event.target.value = "";
      return;
    }

    const nextPhotos = createPhotoItems(Array.from(files)).slice(0, remaining);
    if (nextPhotos.length > 0) {
      setDocPhotos((current) => [...current, ...nextPhotos]);
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
    const rect = event.currentTarget.getBoundingClientRect();
    event.dataTransfer.setDragImage(event.currentTarget, rect.width / 2, rect.height / 2);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", photoId);
    setDragSource({ kind, id: photoId });
    setDragInsertIndex({ kind, index: photoIndex });
  };

  const handlePhotoDragOver = (event: DragEvent<HTMLDivElement>, kind: PhotoKind, dropIndex: number) => {
    if (!dragSource || dragSource.kind !== kind) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragInsertIndex?.kind === kind && dragInsertIndex.index === dropIndex) return;
    setDragInsertIndex({ kind, index: dropIndex });
  };

  const getDropIndexFromCard = (event: DragEvent<HTMLDivElement>, photoIndex: number) => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - targetRect.left;
    return pointerX < targetRect.width / 2 ? photoIndex : photoIndex + 1;
  };

  const handlePhotoDrop = (event: DragEvent<HTMLDivElement>, kind: PhotoKind, dropIndex: number) => {
    event.preventDefault();
    if (!dragSource || dragSource.kind !== kind) return;
    const sourceId = dragSource.id;

    if (kind === "item") {
      setItemPhotos((current) => reorderPhotos(current, sourceId, dropIndex));
      resetPhotoDragState();
      return;
    }

    setDocPhotos((current) => reorderPhotos(current, sourceId, dropIndex));
    resetPhotoDragState();
  };

  const resetPhotoDragState = () => {
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

  const uploadPhotos = async (photos: PhotoItem[]) => {
    const uploadIds: string[] = [];
    for (const photo of photos) {
      const uploaded = await uploadListingFileViaBackend(photo.file);
      uploadIds.push(uploaded.uploadId);
    }
    return uploadIds;
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
      nextErrors.serviceFormat = "Выберите хотя бы один формат оказания услуги";
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
      const [itemUploadIds, documentUploadIds] = await Promise.all([
        uploadPhotos(itemPhotos),
        uploadPhotos(docPhotos),
      ]);

      const wantsCategoryId =
        exchangeEnabled && !isFree ? (finalWantsCategoryId ?? undefined) : undefined;
      const wantsPayloadTags = exchangeEnabled && !isFree ? wantsTags : [];
      const estimatedPrice = priceDigits ? Number(priceDigits) : undefined;

      const created = await createListingDraft({
        type: listingKind,
        serviceFormats: listingKind === "service" ? serviceFormats : undefined,
        title: title.trim(),
        description: description.trim(),
        categoryId,
        wantsCategoryId,
        cityId: selectedCityId,
        condition: listingKind === "item" ? condition ?? undefined : undefined,
        estimatedPrice,
        extraPay: isFree ? "none" : extraPay,
        isFree,
        wantsTags: wantsPayloadTags,
        itemUploadIds,
        documentUploadIds,
      });

      await publishListing(created.listing.id);
      setIsPublishedModalOpen(true);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Не удалось опубликовать объявление. Попробуйте снова.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#F8F8F5] text-[#1A1A1A]">
      <Header />
      <div className="h-[54px]" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-[1238px] flex-col gap-5 px-4 pb-14 pt-14">
        <section className="flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 text-[40px] font-bold leading-[40px] tracking-[-0.005em] text-[#1A1A1A]">
              Создание объявления
            </h1>
            <p className="mb-5 mt-2 text-[14px] font-semibold leading-[120%] tracking-[-0.002em] text-[#3D3D3D]">
              Создавайте объявления, чтобы обмениваться с другими
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
                    aria-label={`Город ${listingTypeLabel}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleInsertCityFromProfile}
                  className="h-11 shrink-0 whitespace-nowrap rounded-[18px] border-[0.5px] border-[#8E8BED] bg-[#8E8BED] px-5 text-[14px] font-semibold text-white"
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
          <p className={`mt-1 ${SECTION_TEXT_CLASS}`}>PNG, JPG до 5 МБ</p>
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
              {(() => {
                const showGap = dragSource?.kind === "item" && dragInsertIndex?.kind === "item";
                const dropIndex = showGap ? dragInsertIndex.index : -1;
                const cells: Array<
                  | { type: "photo"; photo: PhotoItem; photoIndex: number }
                  | { type: "add" }
                  | { type: "gap"; dropIndex: number }
                  | { type: "empty"; id: string }
                > = [];

                for (let index = 0; index <= itemPhotos.length; index += 1) {
                  if (showGap && dropIndex === index) {
                    cells.push({ type: "gap", dropIndex: index });
                  }
                  if (index < itemPhotos.length) {
                    cells.push({ type: "photo", photo: itemPhotos[index], photoIndex: index });
                  }
                }

                if (itemPhotoGrid.hasAddSlot) {
                  cells.push({ type: "add" });
                }

                const minSlots = itemPhotoGrid.visibleSlots + (showGap ? 1 : 0);
                while (cells.length < minSlots) {
                  cells.push({ type: "empty", id: `item-empty-${cells.length}` });
                }

                return cells.map((cell, index) => {
                  if (cell.type === "photo") {
                    const photo = cell.photo;
                    return (
                      <PhotoCard
                        key={photo.id}
                        previewUrl={photo.previewUrl}
                        onDelete={() => removeItemPhoto(photo.id)}
                        draggable
                        onDragStart={(event) =>
                          handlePhotoDragStart(event, "item", photo.id, cell.photoIndex)
                        }
                        onDragOver={(event) =>
                          handlePhotoDragOver(event, "item", getDropIndexFromCard(event, cell.photoIndex))
                        }
                        onDrop={(event) =>
                          handlePhotoDrop(event, "item", getDropIndexFromCard(event, cell.photoIndex))
                        }
                        onDragEnd={resetPhotoDragState}
                        isDragging={dragSource?.kind === "item" && dragSource.id === photo.id}
                        showPrimaryBadge={cell.photoIndex === 0}
                      />
                    );
                  }

                  if (cell.type === "add") {
                    return (
                      <AddPhotoCard
                        key={`item-photo-add-${index}`}
                        label="+ Добавить"
                        onClick={() => itemPhotosInputRef.current?.click()}
                      />
                    );
                  }

                  if (cell.type === "gap") {
                    return (
                      <PhotoDropGap
                        key={`item-photo-gap-${index}`}
                        onDragOver={(event) => handlePhotoDragOver(event, "item", cell.dropIndex)}
                        onDrop={(event) => handlePhotoDrop(event, "item", cell.dropIndex)}
                      />
                    );
                  }

                  return <div key={cell.id} className="aspect-square w-full" aria-hidden="true" />;
                });
              })()}
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
            <textarea
              maxLength={2000}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                clearError("description");
              }}
              placeholder="Введите описание...."
              className="mt-2 h-[150px] w-full resize-none rounded-[12px] border border-[#E2E6EF] bg-[#F6F7FB] px-3 py-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
            />
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
                          setServiceFormats((current) =>
                            current.includes(item.id)
                              ? current.filter((currentItem) => currentItem !== item.id)
                              : [...current, item.id],
                          );
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
                    const nextDigits = event.target.value.replace(/\D/g, "");
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
          className={`rounded-[16px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)] ${isFree ? "bg-[#C8FF00]" : "bg-white"}`}
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
            <Switch checked={isFree} onChange={handleIsFreeChange} />
          </div>
        </section>

        <section className="rounded-[16px] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <h3 className={SECTION_TITLE_CLASS}>Желаемый обмен</h3>
              <p className={`mt-1 ${SECTION_TEXT_CLASS}`}>
                Включите, чтобы выбрать желаемое предложение
              </p>
            </div>
            <Switch checked={exchangeEnabled} onChange={handleExchangeEnabledChange} />
          </div>

          <div className={`create-listing-exchange-panel${exchangeEnabled ? " is-open" : ""}`}>
            <div className="create-listing-exchange-panel__inner" inert={!exchangeEnabled}>
              <div className="create-listing-exchange-panel__content mt-6 grid gap-4">
                <div className="grid gap-2">
                  <p className={`m-0 ${SECTION_TEXT_CLASS}`}>
                    Выберите категорию, которую хотите получить
                  </p>
                  <SelectField
                    value={wantsParentCategoryId ?? ""}
                    onChange={(value) => {
                      setWantsParentCategoryId(value || null);
                      setWantsChildCategoryId(null);
                    }}
                    options={parentCategoryOptions}
                    placeholder="Выберите нужную категорию"
                    variant="field"
                    className="create-listing-exchange-select"
                    searchable={false}
                    allowCustomValue={false}
                    aria-label="Желаемая категория"
                  />
                  <div
                    className={`create-listing-subcategory-panel${
                      wantsChildCategoryOptions.length > 0 ? " is-open" : ""
                    }`}
                  >
                    <div className="create-listing-subcategory-panel__inner">
                      <div className="create-listing-subcategory-panel__content mt-2">
                        <SelectField
                          value={wantsChildCategoryId ?? ""}
                          onChange={(value) => {
                            setWantsChildCategoryId(value || null);
                          }}
                          options={wantsChildCategoryOptions}
                          placeholder="Уточните подкатегорию (необязательно)"
                          variant="field"
                          className="create-listing-exchange-select"
                          searchable={false}
                          allowCustomValue={false}
                          disabled={wantsChildCategoryOptions.length === 0}
                          aria-label="Желаемая подкатегория"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <p className={`m-0 ${SECTION_TEXT_CLASS}`}>
                    Создайте тег, либо выберите существующий, просто начните писать (до 10 тегов)
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
                            ? "Достигнут лимит 10 тегов"
                            : "Например: iPhone, MacBook, велосипед"
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

        <section className="rounded-[16px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <h3 className={SECTION_TITLE_CLASS}>
            Добавить фото документов, сертификатов, дипломов (до 5 фото)
          </h3>
          <p className={`mt-4 ${PHOTO_UPLOAD_LABEL_CLASS}`}>Загрузить фото</p>
          <p className={`mt-1 ${SECTION_TEXT_CLASS}`}>PNG, JPG до 5 МБ</p>
          <input
            ref={docPhotosInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            multiple
            className="hidden"
            onChange={handleDocPhotosSelected}
          />
          <div className="relative mt-4 box-border w-full rounded-[6.82px] border-[0.5px] border-dashed border-[#CACACA] p-6">
            <div className="relative grid grid-cols-5 gap-3">
              {(() => {
                const showGap = dragSource?.kind === "doc" && dragInsertIndex?.kind === "doc";
                const dropIndex = showGap ? dragInsertIndex.index : -1;
                const cells: Array<
                  | { type: "photo"; photo: PhotoItem; photoIndex: number }
                  | { type: "add" }
                  | { type: "gap"; dropIndex: number }
                  | { type: "empty"; id: string }
                > = [];

                for (let index = 0; index <= docPhotos.length; index += 1) {
                  if (showGap && dropIndex === index) {
                    cells.push({ type: "gap", dropIndex: index });
                  }
                  if (index < docPhotos.length) {
                    cells.push({ type: "photo", photo: docPhotos[index], photoIndex: index });
                  }
                }

                if (docPhotoGrid.hasAddSlot) {
                  cells.push({ type: "add" });
                }

                const minSlots = docPhotoGrid.visibleSlots + (showGap ? 1 : 0);
                while (cells.length < minSlots) {
                  cells.push({ type: "empty", id: `doc-empty-${cells.length}` });
                }

                return cells.map((cell, index) => {
                  if (cell.type === "photo") {
                    const photo = cell.photo;
                    return (
                      <PhotoCard
                        key={photo.id}
                        previewUrl={photo.previewUrl}
                        onDelete={() => removeDocPhoto(photo.id)}
                        draggable
                        onDragStart={(event) =>
                          handlePhotoDragStart(event, "doc", photo.id, cell.photoIndex)
                        }
                        onDragOver={(event) =>
                          handlePhotoDragOver(event, "doc", getDropIndexFromCard(event, cell.photoIndex))
                        }
                        onDrop={(event) =>
                          handlePhotoDrop(event, "doc", getDropIndexFromCard(event, cell.photoIndex))
                        }
                        onDragEnd={resetPhotoDragState}
                        isDragging={dragSource?.kind === "doc" && dragSource.id === photo.id}
                      />
                    );
                  }

                  if (cell.type === "add") {
                    return (
                      <AddPhotoCard
                        key={`doc-photo-add-${index}`}
                        label="+ Добавить"
                        onClick={() => docPhotosInputRef.current?.click()}
                      />
                    );
                  }

                  if (cell.type === "gap") {
                    return (
                      <PhotoDropGap
                        key={`doc-photo-gap-${index}`}
                        onDragOver={(event) => handlePhotoDragOver(event, "doc", cell.dropIndex)}
                        onDrop={(event) => handlePhotoDrop(event, "doc", cell.dropIndex)}
                      />
                    );
                  }

                  return <div key={cell.id} className="aspect-square w-full" aria-hidden="true" />;
                });
              })()}
            </div>
          </div>
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
            className="flex h-[63px] flex-1 items-center justify-center rounded-[21px] bg-[#8E8BED] px-[74px] py-4 text-[14px] font-semibold leading-[120%] tracking-[0.001em] text-white"
          >
            {isSubmitting ? "Публикация..." : "Опубликовать объявление"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="box-border flex h-[63px] w-[323px] shrink-0 items-center justify-center rounded-[21px] border border-[#CACACA] bg-white px-[74px] py-4 text-[14px] font-semibold leading-[120%] tracking-[0.001em] text-[#1A1A1A]"
          >
            Отмена
          </button>
        </div>
      </div>

      <ListingPublishedModal open={isPublishedModalOpen} />
    </main>
  );
}
