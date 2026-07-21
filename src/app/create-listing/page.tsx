"use client";

import { useState } from "react";

import { Header } from "@/widgets/header/Header";
import { DeleteIcon } from "@/shared/ui/icons";
import { Switch } from "@/shared/ui/switch/Switch";

type ConditionId = "excellent" | "new" | "good" | "used" | "needs_repair";

const CONDITION_OPTIONS: Array<{ id: ConditionId; label: string }> = [
  { id: "excellent", label: "Отличное" },
  { id: "new", label: "Новое" },
  { id: "good", label: "Хорошее" },
  { id: "used", label: "Б/у" },
  { id: "needs_repair", label: "Нужен ремонт" },
];

const ITEM_PHOTO_SLOTS = 10;
const ITEM_PHOTOS_PER_ROW = 5;
const ITEM_PHOTO_MAX_ROWS = 2;
const DOCUMENT_PHOTO_SLOTS = 5;

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

function PlaceholderImage() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#5F6677]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M5.5 17l4.6-4.8a1.3 1.3 0 011.9 0L14.6 15l1.7-1.7a1.3 1.3 0 011.9 0L20 15.2" />
    </svg>
  );
}

function PhotoCard({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="relative aspect-square w-full rounded-[21px] border-[0.5px] border-[#CACACA] bg-[#F2F4F7]">
      <button
        type="button"
        onClick={onDelete}
        aria-label="Удалить фото"
        className="absolute right-[10px] top-[10px] flex items-center justify-center"
      >
        <DeleteIcon className="h-[23.695px] w-[21.326px] text-black" />
      </button>
      <div className="flex h-full items-center justify-center">
        <PlaceholderImage />
      </div>
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

export default function CreateListingPage() {
  const [condition, setCondition] = useState<ConditionId>("excellent");
  const [readyForExtraPay, setReadyForExtraPay] = useState(true);
  const [isFree, setIsFree] = useState(false);
  const [exchangeEnabled, setExchangeEnabled] = useState(false);
  const [itemPhotosCount, setItemPhotosCount] = useState(0);
  const [docPhotosCount, setDocPhotosCount] = useState(2);
  const itemPhotoGrid = getItemPhotoGridLayout(itemPhotosCount);
  const docPhotoGrid = getDocPhotoGridLayout(docPhotosCount);

  const handleIsFreeChange = (next: boolean) => {
    setIsFree(next);
    if (next) setExchangeEnabled(false);
  };

  const handleExchangeEnabledChange = (next: boolean) => {
    setExchangeEnabled(next);
    if (next) setIsFree(false);
  };

  return (
    <main className="min-h-screen w-full bg-[#F8F8F5] text-[#1A1A1A]">
      <Header />
      <div className="h-[54px]" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-[1074px] flex-col gap-5 px-4 pb-14 pt-7">
        <section className="flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 text-[40px] font-bold leading-[40px] tracking-[-0.005em] text-[#1A1A1A]">
              Создание объявления
            </h1>
            <p className="mb-5 mt-2 text-[18px] font-semibold leading-[120%] tracking-[-0.002em] text-[#3D3D3D]">
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
            <div className="grid gap-1.5">
              <p className="m-0 text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Наименование вещи</p>
              <input
                type="text"
                placeholder="Наименование вашей вещи *"
                className="h-11 rounded-[18px] border-[0.5px] border-[#C4D86F] bg-white px-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
              />
            </div>
            <div className="grid gap-1.5">
              <p className="m-0 text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Категория вещи</p>
              <input
                type="text"
                placeholder="Напишите категорию вашей вещи"
                className="h-11 rounded-[18px] border-[0.5px] border-[#C4D86F] bg-white px-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="grid gap-1.5">
                <p className="m-0 text-[14px] font-normal leading-[170%] text-[#1A1A1A]">Город вещи</p>
                <input
                  type="text"
                  placeholder="Напишите город в котором находится вещь"
                  className="h-11 rounded-[18px] border-[0.5px] border-[#C4D86F] bg-white px-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
                />
              </div>
              <button
                type="button"
                className="h-11 self-end whitespace-nowrap rounded-[18px] border-[0.5px] border-[#8E8BED] bg-[#8E8BED] px-5 text-[14px] font-semibold text-white"
              >
                Вставить из профиля
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[16px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <h3 className="m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#626262]">
            Добавить фото (до 10 фото)*
          </h3>
          <p className="mt-4 text-[16px] font-bold leading-5 tracking-[0.001em] text-[#1A1A1A]">
            Загрузить фото
          </p>
          <p className="mt-1 text-[16px] font-bold leading-5 tracking-[0.001em] text-[#626262]">
            PNG, JPG до 5 МБ
          </p>
          <div className="relative mt-4 box-border w-full rounded-[6.82px] border-[0.5px] border-dashed border-[#CACACA] p-6">
            <div className="relative grid grid-cols-5 gap-3">
              {Array.from({ length: itemPhotoGrid.visibleSlots }).map((_, index) => {
                if (index < itemPhotosCount) {
                  return (
                    <PhotoCard
                      key={`item-photo-${index}`}
                      onDelete={() => {
                        setItemPhotosCount((current) => Math.max(current - 1, 0));
                      }}
                    />
                  );
                }
                if (itemPhotoGrid.hasAddSlot && index === itemPhotosCount) {
                  return (
                    <AddPhotoCard
                      key={`item-photo-add-${index}`}
                      label="+ Добавить"
                      onClick={() => {
                        setItemPhotosCount((current) => Math.min(current + 1, ITEM_PHOTO_SLOTS));
                      }}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        </section>

        <section className="rounded-[16px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <h3 className="m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#626262]">
            Дополнительная информация
          </h3>

          <p className="mt-4 text-[14px] font-normal leading-[170%] text-[#1A1A1A]">
            Опишите вашу вещь подробнее (до 2000 символов)
          </p>
          <textarea
            maxLength={2000}
            placeholder="Введите...."
            className="mt-2 h-[150px] w-full resize-none rounded-[12px] border border-[#E2E6EF] bg-[#F6F7FB] px-3 py-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
          />

          <p className="mt-4 text-[14px] font-normal leading-[170%] text-[#1A1A1A]">
            Выберите состояние вашей вещи *
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {CONDITION_OPTIONS.map((item) => {
              const active = condition === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCondition(item.id)}
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

          <div className="mt-4 grid gap-4">
            <div>
              <p className="mb-2 text-[16px] font-normal leading-6 tracking-[0.01em] text-[#1A1A1A]">
                Напишите примерную стоимость вашей вещи (другим будет легче предложить равноценный обмен)
              </p>
              <input
                type="text"
                placeholder="Введите стоимость вашей вещи"
                className="h-11 w-full rounded-[12px] border border-[#E2E6EF] bg-[#F6F7FB] px-3 text-[14px] font-normal leading-[170%] text-[#1A1A1A] outline-none placeholder:text-[14px] placeholder:font-normal placeholder:leading-[170%] placeholder:text-[#3D3D3D]"
              />
            </div>

            <div>
              <p className="m-0 text-[16px] font-normal leading-6 tracking-[0.01em] text-[#1A1A1A]">
                Отметьте вашу готовность к доплате (другие поймут могут ли они доплатить в счет обмена)
              </p>
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReadyForExtraPay(true)}
                  className={`flex h-12 w-[70px] items-center justify-center rounded-[18px] px-6 py-3 text-[16px] font-bold leading-5 tracking-[0.001em] ${
                    readyForExtraPay
                      ? "bg-[#8E8BED] text-white"
                      : "border-[0.5px] border-[#CACACA] bg-white text-[#1A1A1A]"
                  }`}
                >
                  Да
                </button>
                <button
                  type="button"
                  onClick={() => setReadyForExtraPay(false)}
                  className={`flex h-12 w-[78px] items-center justify-center rounded-[18px] px-6 py-3 text-[16px] font-bold leading-5 tracking-[0.001em] ${
                    !readyForExtraPay
                      ? "bg-[#8E8BED] text-white"
                      : "border-[0.5px] border-[#CACACA] bg-white text-[#1A1A1A]"
                  }`}
                >
                  Нет
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`rounded-[16px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)] ${isFree ? "bg-[#C8FF00]" : "bg-white"}`}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <h3 className="m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#626262]">
                Отдаю даром
              </h3>
              <p className="mt-1 text-[14px] font-normal leading-[170%] text-[#3D3D3D]">
                Включите, если отдаёте вещь без обмена — взамен вы ничего не получите
              </p>
            </div>
            <Switch checked={isFree} onChange={handleIsFreeChange} />
          </div>
        </section>

        <section className="rounded-[16px] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <h3 className="m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#626262]">
                Желаемый обмен
              </h3>
              <p className="mt-1 text-[14px] font-normal leading-[170%] text-[#3D3D3D]">
                Включите, чтобы выбрать желаемое предложение
              </p>
            </div>
            <Switch checked={exchangeEnabled} onChange={handleExchangeEnabledChange} />
          </div>

          <div className={`create-listing-exchange-panel${exchangeEnabled ? " is-open" : ""}`}>
            <div className="create-listing-exchange-panel__inner" inert={!exchangeEnabled}>
              <div className="create-listing-exchange-panel__content mt-6 grid gap-4">
                <div className="grid gap-2">
                  <p className="m-0 text-[16px] font-normal leading-6 tracking-[0.01em] text-[#1A1A1A]">
                    Выберите категорию, которую хотите получить
                  </p>
                  <input
                    type="text"
                    placeholder="Напишите и выберите нужную категорию"
                    className={EXCHANGE_FIELD_INPUT_CLASS}
                  />
                </div>
                <div className="grid gap-2">
                  <p className="m-0 text-[16px] font-normal leading-6 tracking-[0.01em] text-[#1A1A1A]">
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
          <h3 className="m-0 text-[24px] font-extrabold leading-[110%] tracking-[-0.003em] text-[#626262]">
            Добавить фото документов, сертификатов, дипломов (до 5 фото)
          </h3>
          <p className="mt-4 text-[16px] font-bold leading-5 tracking-[0.001em] text-[#626262]">
            Скрытые фото. Видны только после подтверждения обмена.
          </p>
          <div className="relative mt-4 box-border w-full rounded-[6.82px] border-[0.5px] border-dashed border-[#CACACA] p-6">
            <div className="relative grid grid-cols-5 gap-3">
              {Array.from({ length: docPhotoGrid.visibleSlots }).map((_, index) => {
                if (index < docPhotosCount) {
                  return (
                    <PhotoCard
                      key={`doc-photo-${index}`}
                      onDelete={() => {
                        setDocPhotosCount((current) => Math.max(current - 1, 0));
                      }}
                    />
                  );
                }
                if (docPhotoGrid.hasAddSlot && index === docPhotosCount) {
                  return (
                    <AddPhotoCard
                      key={`doc-photo-add-${index}`}
                      label="+ Добавить"
                      onClick={() => {
                        setDocPhotosCount((current) => Math.min(current + 1, DOCUMENT_PHOTO_SLOTS));
                      }}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
