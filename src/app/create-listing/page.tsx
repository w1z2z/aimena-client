"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { getCities, type ApiCity } from "@/shared/api/catalog";
import { buildCitySelectOptions } from "@/shared/lib/city-select-options";
import { SelectField, type SelectOption } from "@/shared/ui/select-field";
import { Header } from "@/widgets/header/Header";
import { DeleteIcon } from "@/shared/ui/icons";
import { Switch } from "@/shared/ui/switch/Switch";

import { ListingPublishedModal } from "./ListingPublishedModal";

type ConditionId = "excellent" | "new" | "good" | "used" | "needs_repair";
type ExtraPayId = "none" | "i_pay" | "they_pay";

type FieldErrors = {
  title?: string;
  category?: string;
  city?: string;
  condition?: string;
  photos?: string;
};

/** Order matches visual top→bottom on the page */
const FIELD_SCROLL_ORDER: Array<keyof FieldErrors> = [
  "title",
  "category",
  "city",
  "photos",
  "condition",
];

const HEADER_SCROLL_OFFSET_PX = 72;

const CONDITION_OPTIONS: Array<{ id: ConditionId; label: string }> = [
  { id: "excellent", label: "Отличное" },
  { id: "new", label: "Новое" },
  { id: "good", label: "Хорошее" },
  { id: "used", label: "Б/у" },
  { id: "needs_repair", label: "Нужен ремонт" },
];

const EXTRA_PAY_OPTIONS: Array<{ id: ExtraPayId; label: string }> = [
  { id: "none", label: "Без доплаты" },
  { id: "i_pay", label: "Готов доплатить" },
  { id: "they_pay", label: "Хочу доплату" },
];

const ITEM_PHOTO_SLOTS = 10;
const ITEM_PHOTOS_PER_ROW = 5;
const ITEM_PHOTO_MAX_ROWS = 2;
const DOCUMENT_PHOTO_SLOTS = 5;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/jpg,image/webp";

const FIELD_ERROR_CLASS = "m-0 mt-1 text-[14px] font-normal leading-[170%] text-[#FF2056]";
const CITY_FETCH_DEBOUNCE_MS = 250;

type PhotoItem = {
  id: string;
  previewUrl: string;
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

function createPhotoItems(files: FileList | File[]): PhotoItem[] {
  return Array.from(files)
    .filter((file) => file.type.startsWith("image/") && file.size <= MAX_PHOTO_BYTES)
    .map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      previewUrl: URL.createObjectURL(file),
    }));
}

function revokePhotoUrls(photos: PhotoItem[]) {
  for (const photo of photos) {
    URL.revokeObjectURL(photo.previewUrl);
  }
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
  "box-border h-12 w-full rounded-[18px] border-[0.5px] border-[#CACACA] bg-[#F2F4F7] px-3 py-2 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]";

const SECTION_TITLE_CLASS =
  "m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#626262]";

const SECTION_TEXT_CLASS = "text-[14px] font-normal leading-[170%] text-[#1A1A1A]";

function PlaceholderImage() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#5F6677]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M5.5 17l4.6-4.8a1.3 1.3 0 011.9 0L14.6 15l1.7-1.7a1.3 1.3 0 011.9 0L20 15.2" />
    </svg>
  );
}

function PhotoCard({ previewUrl, onDelete }: { previewUrl?: string; onDelete: () => void }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[21px] border-[0.5px] border-[#CACACA] bg-[#F2F4F7]">
      <button
        type="button"
        onClick={onDelete}
        aria-label="Удалить фото"
        className="absolute right-[10px] top-[10px] z-[1] flex items-center justify-center"
      >
        <DeleteIcon className="h-[23.695px] w-[21.326px] text-black" />
      </button>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <PlaceholderImage />
        </div>
      )}
    </div>
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
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [cityId, setCityId] = useState<string | null>(null);
  const [cityQuery, setCityQuery] = useState("");
  const [debouncedCityQuery, setDebouncedCityQuery] = useState("");
  const [featuredCities, setFeaturedCities] = useState<ApiCity[]>([]);
  const [regularCities, setRegularCities] = useState<ApiCity[]>([]);
  const [cityPage, setCityPage] = useState(1);
  const [cityPageCount, setCityPageCount] = useState(1);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [condition, setCondition] = useState<ConditionId | null>(null);
  const [extraPay, setExtraPay] = useState<ExtraPayId>("none");
  const [isFree, setIsFree] = useState(false);
  const [exchangeEnabled, setExchangeEnabled] = useState(false);
  const [itemPhotos, setItemPhotos] = useState<PhotoItem[]>([]);
  const [docPhotos, setDocPhotos] = useState<PhotoItem[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPublishedModalOpen, setIsPublishedModalOpen] = useState(false);
  const itemPhotoGrid = getItemPhotoGridLayout(itemPhotos.length);
  const docPhotoGrid = getDocPhotoGridLayout(docPhotos.length);
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

    const nextPhotos = createPhotoItems(Array.from(files).slice(0, remaining));
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

    const nextPhotos = createPhotoItems(Array.from(files).slice(0, remaining));
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

  const validateAndPublish = () => {
    const nextErrors: FieldErrors = {};

    if (!title.trim()) nextErrors.title = "Вы не добавили наименование вещи";
    if (!category.trim()) nextErrors.category = "Вы не добавили категорию вещи";
    if (!cityId) {
      nextErrors.city = "Выберите город из списка или вставьте его из профиля";
    }
    if (!condition) nextErrors.condition = "Вы не выбрали состояние вашей вещи";
    if (itemPhotos.length < 1) nextErrors.photos = "Вы не добавили фото вещи";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError(nextErrors);
      return;
    }

    setIsPublishedModalOpen(true);
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
          <div className="relative mt-1 inline-grid w-[220px] grid-cols-2 rounded-[12px] border border-[#CACACA] bg-[#F2F2F2] p-[3px]">
            <span className="pointer-events-none absolute bottom-[3px] left-[3px] top-[3px] w-[calc(50%-3px)] rounded-[9px] bg-[#8E8BED]" />
            <button type="button" className="relative z-[1] h-[32px] rounded-[9px] text-[14px] font-semibold text-white">
              Вещь
            </button>
            <button
              type="button"
              disabled
              className="relative z-[1] h-[32px] rounded-[9px] text-[14px] font-semibold text-[#6A6A6A] opacity-80"
            >
              Услуга
            </button>
          </div>
        </section>

        <section className="rounded-[16px] bg-[#C8FF00] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <h2 className="m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#1A1A1A]">
            Основная информация*
          </h2>
          <div className="mt-3 grid gap-3">
            <div id={fieldAnchorId("title")} className="grid gap-1.5">
              <p className={`m-0 ${SECTION_TEXT_CLASS}`}>Наименование вещи</p>
              <input
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  clearError("title");
                }}
                placeholder="Наименование вашей вещи *"
                className="h-11 rounded-[18px] border-[0.5px] border-[#C4D86F] bg-white px-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
              />
              <FieldError message={errors.title} />
            </div>
            <div id={fieldAnchorId("category")} className="grid gap-1.5">
              <p className={`m-0 ${SECTION_TEXT_CLASS}`}>Категория вещи</p>
              <input
                type="text"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  clearError("category");
                }}
                placeholder="Напишите категорию вашей вещи"
                className="h-11 rounded-[18px] border-[0.5px] border-[#C4D86F] bg-white px-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
              />
              <FieldError message={errors.category} />
            </div>
            <div id={fieldAnchorId("city")}>
              <div className="flex items-end gap-3">
                <div className="grid min-w-0 flex-1 gap-1.5">
                  <p className={`m-0 ${SECTION_TEXT_CLASS}`}>Город вещи</p>
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
                    aria-label="Город вещи"
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
          <p className="mt-4 text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Загрузить фото</p>
          <p className={`mt-0 ${SECTION_TEXT_CLASS}`}>PNG, JPG до 5 МБ</p>
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
                    />
                  );
                }
                if (itemPhotoGrid.hasAddSlot && index === itemPhotos.length) {
                  return (
                    <AddPhotoCard
                      key={`item-photo-add-${index}`}
                      label="+ Добавить"
                      onClick={() => itemPhotosInputRef.current?.click()}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
          <FieldError message={errors.photos} />
        </section>

        <section className="rounded-[16px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <h3 className={SECTION_TITLE_CLASS}>Дополнительная информация</h3>

          <p className={`mt-4 ${SECTION_TEXT_CLASS}`}>
            Опишите вашу вещь подробнее (до 2000 символов)
          </p>
          <textarea
            maxLength={2000}
            placeholder="Введите...."
            className="mt-2 h-[150px] w-full resize-none rounded-[12px] border border-[#E2E6EF] bg-[#F6F7FB] px-3 py-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
          />

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
                    className={`flex h-12 min-w-[116px] items-center justify-center rounded-[18px] px-6 py-3 text-[14px] font-semibold leading-[120%] tracking-[0.001em] ${
                      active
                        ? "bg-[#8E8BED] text-white"
                        : "border-[0.5px] border-[#CACACA] bg-white text-[#1A1A1A]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.condition} />
          </div>

          <div className="mt-4 grid gap-4">
            <div>
              <p className={`mb-2 ${SECTION_TEXT_CLASS}`}>
                Напишите примерную стоимость вашей вещи (другим будет легче предложить равноценный обмен)
              </p>
              <input
                type="text"
                placeholder="Введите стоимость вашей вещи"
                className="h-11 w-full rounded-[12px] border border-[#E2E6EF] bg-[#F6F7FB] px-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
              />
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
                      className={`flex h-12 items-center justify-center rounded-[18px] px-6 py-3 text-[14px] font-semibold leading-[120%] tracking-[0.001em] ${
                        active
                          ? "bg-[#8E8BED] text-white"
                          : "border-[0.5px] border-[#CACACA] bg-white text-[#1A1A1A]"
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
                Включите, если отдаёте вещь без обмена — взамен вы ничего не получите
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
                  <input
                    type="text"
                    placeholder="Напишите и выберите нужную категорию"
                    className={EXCHANGE_FIELD_INPUT_CLASS}
                  />
                </div>
                <div className="grid gap-2">
                  <p className={`m-0 ${SECTION_TEXT_CLASS}`}>
                    Создайте тег, либо выберите существующий, просто начните писать (до 10 тегов)
                  </p>
                  <input
                    type="text"
                    placeholder="Начните вводить желаемое"
                    className={EXCHANGE_FIELD_INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[16px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <h3 className={SECTION_TITLE_CLASS}>
            Добавить фото документов, сертификатов, дипломов (до 5 фото)
          </h3>
          <p className="mt-4 text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Загрузить фото</p>
          <p className={`mt-0 ${SECTION_TEXT_CLASS}`}>PNG, JPG до 5 МБ</p>
          <p className={`mt-1 ${SECTION_TEXT_CLASS}`}>
            Скрытые фото. Видны только после подтверждения обмена.
          </p>
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
              {Array.from({ length: docPhotoGrid.visibleSlots }).map((_, index) => {
                if (index < docPhotos.length) {
                  const photo = docPhotos[index];
                  return (
                    <PhotoCard
                      key={photo.id}
                      previewUrl={photo.previewUrl}
                      onDelete={() => removeDocPhoto(photo.id)}
                    />
                  );
                }
                if (docPhotoGrid.hasAddSlot && index === docPhotos.length) {
                  return (
                    <AddPhotoCard
                      key={`doc-photo-add-${index}`}
                      label="+ Добавить"
                      onClick={() => docPhotosInputRef.current?.click()}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        </section>

        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            onClick={validateAndPublish}
            className="flex h-[63px] flex-1 items-center justify-center rounded-[21px] bg-[#8E8BED] px-[74px] py-4 text-[14px] font-semibold leading-[120%] tracking-[0.001em] text-white"
          >
            Опубликовать объявление           
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

      <ListingPublishedModal
        open={isPublishedModalOpen}
        onClose={() => setIsPublishedModalOpen(false)}
      />
    </main>
  );
}
