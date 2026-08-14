"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  EXTRA_PAY_LABELS,
  mapApiConditionToLabel,
  mapServiceFormatToLabel,
  mapServiceWorkLevelToLabel,
} from "@/entities/listing";
import { useAuth, useAuthGate } from "@/features/auth";
import { createExchangeOffer } from "@/shared/api/deals";
import { ApiError } from "@/shared/api/http";
import {
  getListing,
  getMyListings,
  type ApiListingCard,
  type ApiListingDetail,
} from "@/shared/api/listings";
import { LocationPinIcon, RatingStarIcon, SearchIcon, SwapIcon } from "@/shared/ui/icons";
import { Header } from "@/widgets/header/Header";

function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) return "Цена не указана";
  return `~${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function ListingImage({
  src,
  title,
  className,
}: {
  src: string | null;
  title: string;
  className: string;
}) {
  return src ? (
    // URLs are supplied by the API and may point to dynamically configured storage.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} />
  ) : (
    <span className={`${className} exchange-offer-image-placeholder`} aria-hidden>
      {title.slice(0, 1).toUpperCase()}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="exchange-offer-pill">{children}</span>;
}

function SelectAddIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden>
      <path
        d="M1 10.5C1 6.02166 1 3.78249 2.39124 2.39125C3.78249 1 6.02166 1 10.5 1C14.9783 1 17.2175 1 18.6088 2.39125C20 3.78249 20 6.02166 20 10.5C20 14.9783 20 17.2176 18.6088 18.6088C17.2175 20.0001 14.9783 20 10.5 20C6.02166 20 3.78249 20.0001 2.39124 18.6088C1 17.2176 1 14.9783 1 10.5Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 6.5V14.5M14.5 10.5001H6.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SelectRemoveIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden>
      <path
        d="M1 10.5C1 6.02166 1 3.78249 2.39124 2.39124C3.78249 1 6.02166 1 10.5 1C14.9783 1 17.2175 1 18.6088 2.39124C20 3.78249 20 6.02166 20 10.5C20 14.9783 20 17.2175 18.6088 18.6087C17.2175 20 14.9783 20 10.5 20C6.02166 20 3.78249 20 2.39124 18.6087C1 17.2175 1 14.9783 1 10.5Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 10.5L6.5 10.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OwnListingCard({
  listing,
  selected,
  onToggle,
}: {
  listing: ApiListingCard;
  selected: boolean;
  onToggle: () => void;
}) {
  const detailLabel =
    listing.type === "service"
      ? mapServiceWorkLevelToLabel(listing.serviceWorkLevel)
      : mapApiConditionToLabel(listing.condition);

  return (
    <article
      className="exchange-offer-own-card"
      data-selected={selected ? "true" : undefined}
    >
      <ListingImage
        src={listing.coverImageUrl}
        title={listing.title}
        className="exchange-offer-own-card__image"
      />
      <div className="exchange-offer-own-card__content">
        <h3>{listing.title}</h3>
        <div className="exchange-offer-own-card__meta">
          <Pill>
            <LocationPinIcon />
            {listing.city.name}
          </Pill>
          {listing.hasDocuments ? <Pill>Документы</Pill> : null}
          <span className="exchange-offer-category">{listing.category.name}</span>
        </div>
        <div className="exchange-offer-own-card__meta">
          <Pill>{formatPrice(listing.estimatedPrice)}</Pill>
          {detailLabel ? <Pill>{detailLabel}</Pill> : null}
          {listing.type === "service"
            ? (listing.serviceFormats ?? []).slice(0, 1).map((format) => (
                <Pill key={format}>{mapServiceFormatToLabel(format)}</Pill>
              ))
            : null}
        </div>
      </div>
      <button
        type="button"
        className="exchange-offer-select"
        data-selected={selected ? "true" : undefined}
        onClick={onToggle}
        aria-pressed={selected}
        aria-label={selected ? `Убрать ${listing.title}` : `Выбрать ${listing.title}`}
      >
        {selected ? <SelectRemoveIcon /> : <SelectAddIcon />}
      </button>
    </article>
  );
}

function TargetListing({ listing }: { listing: ApiListingDetail }) {
  const cover = listing.images.find((image) => image.isCover) ?? listing.images[0];
  const detailLabel =
    listing.type === "service"
      ? mapServiceWorkLevelToLabel(listing.serviceWorkLevel)
      : mapApiConditionToLabel(listing.condition);

  return (
    <section className="exchange-offer-target">
      <div className="exchange-offer-target__heading">
        <ListingImage
          src={cover?.thumbUrl ?? cover?.url ?? null}
          title={listing.title}
          className="exchange-offer-target__image"
        />
        <div>
          <span className="exchange-offer-category">{listing.category.name}</span>
          <h2>{listing.title}</h2>
          <div className="exchange-offer-target__pills">
            <Pill>
              <LocationPinIcon />
              {listing.city.name}
            </Pill>
            {listing.isFree ? <Pill>Даром</Pill> : null}
            {listing.type === "service"
              ? (listing.serviceFormats ?? []).map((format) => (
                  <Pill key={format}>{mapServiceFormatToLabel(format)}</Pill>
                ))
              : null}
          </div>
        </div>
      </div>

      <div className="exchange-offer-stats">
        <div>
          <span>Примерная стоимость</span>
          <Pill>{listing.isFree ? "Даром" : formatPrice(listing.estimatedPrice)}</Pill>
        </div>
        <div>
          <span>{listing.type === "service" ? "Уровень работы" : "Состояние"}</span>
          <Pill>{detailLabel || "Не указано"}</Pill>
        </div>
        <div>
          <span>Доплата</span>
          <Pill>{listing.isFree ? "Не нужна" : EXTRA_PAY_LABELS[listing.extraPay]}</Pill>
        </div>
        <div>
          <span>Документы</span>
          <Pill>{listing.hasDocuments ? "Есть" : "Нет"}</Pill>
        </div>
      </div>

      <div className="exchange-offer-wants">
        <h3>Желает взамен</h3>
        {listing.isFree ? (
          <>
            <div>
              <span className="exchange-offer-wants__label">Категории</span>
              <div className="exchange-offer-wants__row">
                <span className="exchange-offer-category">Даром</span>
              </div>
            </div>
            <div>
              <span className="exchange-offer-wants__label">Вещи и Услуги</span>
              <div className="exchange-offer-wants__row">
                <Pill>Отдается даром</Pill>
              </div>
            </div>
          </>
        ) : (
          <>
            {listing.wantsCategories.length > 0 ? (
              <div>
                <span className="exchange-offer-wants__label">Категории</span>
                <div className="exchange-offer-wants__row">
                  {listing.wantsCategories.map((category) => (
                    <span key={category.id} className="exchange-offer-category">
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <span className="exchange-offer-wants__label">Вещи и Услуги</span>
              <div className="exchange-offer-wants__row">
                {(listing.wantsTags.length > 0 ? listing.wantsTags : ["Любые варианты"]).map(
                  (tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ),
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function ExchangeOfferView() {
  const params = useParams<{ listingId: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { guardAuth } = useAuthGate();
  const listingId = params.listingId;
  const [target, setTarget] = useState<ApiListingDetail | null>(null);
  const [ownListings, setOwnListings] = useState<ApiListingCard[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      guardAuth("propose-exchange");
      return;
    }

    const controller = new AbortController();
    void getListing(listingId, controller.signal)
      .then(async (targetResponse) => {
        if (targetResponse.listing.owner?.id === user?.id) {
          setError("Нельзя предложить обмен на собственное объявление.");
          return;
        }
        setTarget(targetResponse.listing);
        if (targetResponse.listing.isFree) {
          setOwnListings([]);
          setSelectedIds([]);
          return;
        }
        const ownResponse = await getMyListings(
          { page: 1, pageSize: 50, status: ["active"], sort: "newest" },
          controller.signal,
        );
        setOwnListings(ownResponse.data.filter((listing) => listing.id !== listingId));
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(
          requestError instanceof ApiError && requestError.status === 404
            ? "Объявление не найдено."
            : "Не удалось загрузить данные для обмена.",
        );
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [authLoading, guardAuth, isAuthenticated, listingId, user?.id]);

  const isFreeOffer = Boolean(target?.isFree);
  const freeKindLabel = target?.type === "service" ? "услуга" : "вещь";

  const filteredListings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return ownListings;
    return ownListings.filter((listing) =>
      [listing.title, listing.category.name, listing.city.name].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [ownListings, query]);

  const selectedTotal = useMemo(
    () =>
      ownListings
        .filter((listing) => selectedIds.includes(listing.id))
        .reduce((sum, listing) => sum + (listing.estimatedPrice ?? 0), 0),
    [ownListings, selectedIds],
  );

  const difference = selectedTotal - (target?.estimatedPrice ?? 0);
  const differenceText = isFreeOffer
    ? "Взамен ничего не нужно"
    : selectedIds.length === 0
      ? "Выберите хотя бы одно предложение"
      : difference === 0
        ? "Предложения примерно равноценны"
        : `Ваше предложение ${difference > 0 ? "дороже" : "дешевле"} на ${formatPrice(
            Math.abs(difference),
          ).replace("~", "~")}`;

  const toggleListing = (id: string) => {
    if (isFreeOffer) return;
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const canSubmit = isFreeOffer || selectedIds.length > 0;

  const submit = async () => {
    if (!target || !canSubmit || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await createExchangeOffer({
        targetListingId: target.id,
        offeredListingIds: isFreeOffer ? [] : selectedIds,
        message: message.trim(),
      });
      setSent(true);
    } catch (submitError) {
      setError(
        submitError instanceof ApiError && submitError.status === 409
          ? "По этому объявлению уже идёт обмен."
          : "Не удалось отправить предложение. Попробуйте ещё раз.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="exchange-offer-page">
      <Header />
      <main className="exchange-offer-main">
        {loading ? <div className="exchange-offer-state">Загружаем предложение…</div> : null}
        {!loading && error && !target ? (
          <div className="exchange-offer-state exchange-offer-state--error">{error}</div>
        ) : null}
        {!loading && target ? (
          <>
            {target.owner?.slug ? (
              <Link
                href={`/users/${target.owner.slug}`}
                className="exchange-offer-profile"
                aria-label={`Профиль ${target.owner.displayName}`}
              >
                <ListingImage
                  src={target.owner.avatarUrl ?? null}
                  title={target.owner.displayName}
                  className="exchange-offer-profile__avatar"
                />
                <div>
                  <strong>{target.owner.displayName}</strong>
                  <span>
                    <RatingStarIcon />
                    {target.owner.ratingAvg ?? 0}
                  </span>
                </div>
              </Link>
            ) : (
              <section className="exchange-offer-profile">
                <ListingImage
                  src={target.owner?.avatarUrl ?? null}
                  title={target.owner?.displayName ?? "Пользователь"}
                  className="exchange-offer-profile__avatar"
                />
                <div>
                  <strong>{target.owner?.displayName ?? "Пользователь"}</strong>
                  <span>
                    <RatingStarIcon />
                    {target.owner?.ratingAvg ?? 0}
                  </span>
                </div>
              </section>
            )}

            <div className="exchange-offer-layout">
              <section
                className={`exchange-offer-choice${isFreeOffer ? " is-free" : ""}`}
                aria-disabled={isFreeOffer || undefined}
              >
                <div className="exchange-offer-title">
                  <h1>Вот это</h1>
                  <span>{isFreeOffer ? "Даром" : `Выбрано: ${selectedIds.length}`}</span>
                </div>
                <div
                  className="exchange-offer-balance"
                  data-balanced={
                    isFreeOffer || (difference === 0 && selectedIds.length > 0)
                      ? "true"
                      : undefined
                  }
                >
                  {differenceText}
                </div>
                {isFreeOffer ? (
                  <div className="exchange-offer-free-panel">
                    <p className="exchange-offer-free-panel__title">
                      Выбирать свои объявления не нужно
                    </p>
                    <p className="exchange-offer-free-panel__text">
                      Эта {freeKindLabel} отдаётся даром — взамен ничего не требуется.
                      Просто напишите сообщение владельцу и отправьте запрос.
                    </p>
                  </div>
                ) : (
                  <>
                    <label className="exchange-offer-search">
                      <SearchIcon />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Слишком много? Поможем найти нужное"
                      />
                    </label>
                    <div className="exchange-offer-list">
                      <div className="exchange-offer-list__scroll">
                        {filteredListings.length > 0 ? (
                          filteredListings.map((listing) => (
                            <OwnListingCard
                              key={listing.id}
                              listing={listing}
                              selected={selectedIds.includes(listing.id)}
                              onToggle={() => toggleListing(listing.id)}
                            />
                          ))
                        ) : (
                          <p className="exchange-offer-empty">
                            {ownListings.length === 0
                              ? "Сначала разместите активное предложение для обмена."
                              : "Ничего не найдено."}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={1000}
                  placeholder="Сообщение владельцу…"
                  aria-label="Сообщение владельцу"
                />
              </section>

              <div className="exchange-offer-swap" aria-hidden>
                <SwapIcon />
              </div>

              <div className="exchange-offer-result">
                <h1>{isFreeOffer ? "Хочу получить это" : "Хочу обменять на это"}</h1>
                <TargetListing listing={target} />
              </div>
            </div>

            {error ? <p className="exchange-offer-submit-error">{error}</p> : null}
            {sent ? (
              <div className="exchange-offer-success" role="status">
                <p>
                  Ваше предложение отправлено, ожидайте ответа владельца
                </p>
                <button type="button" onClick={() => router.push("/chats")}>
                  Перейти в чаты
                </button>
              </div>
            ) : (
              <div className="exchange-offer-actions">
                <button
                  type="button"
                  className="exchange-offer-actions__submit"
                  disabled={!canSubmit || submitting}
                  onClick={() => void submit()}
                >
                  {submitting ? "Отправляем…" : "Отправить предложение"}
                </button>
                <button type="button" onClick={() => router.back()}>
                  Отмена
                </button>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
