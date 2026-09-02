"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  EXTRA_PAY_LABELS,
  mapApiConditionToLabel,
  mapServiceFormatToLabel,
  mapServiceWorkLevelToLabel,
} from "@/entities/listing";
import { useAuth, useAuthGate } from "@/features/auth";
import { useChatInbox } from "@/features/chat-inbox";
import { MQ } from "@/shared/lib/breakpoints";
import { useMediaQuery } from "@/shared/lib/use-media-query";
import {
  getChats,
  getChatAttachableDocuments,
  getChatThread,
  getIncomingOffer,
  sendChatMessage,
  type AttachableListingDocuments,
  type ChatListing,
  type ChatMessage,
  type ChatSummary,
  type ChatThread,
  type IncomingOffer,
} from "@/shared/api/chats";
import {
  connectChatSocket,
  joinChatThread,
  leaveChatThread,
  markChatThreadRead,
  onChatDealUpdated,
  onChatInboxUpdated,
  onChatMessage,
  onChatThreadUpdated,
  sendChatSocketMessage,
} from "@/shared/api/chat-socket";
import { acceptExchangeOffer, rejectExchangeOffer } from "@/shared/api/deals";
import { ApiError } from "@/shared/api/http";
import { uploadChatFileViaBackend } from "@/shared/api/media";
import { useOverlayPresence } from "@/shared/lib/use-overlay-presence";
import { LocationPinIcon, MenuSquareIcon, RatingStarIcon } from "@/shared/ui/icons";
import { Header } from "@/widgets/header/Header";
import { pluralRu } from "@/widgets/profile/constants";

import { ChatDocumentsPicker } from "./ChatDocumentsPicker";
import { ChatList } from "./ChatList";
import { ChatMessageBubble, chatMessagePreview } from "./ChatMessageBubble";
import { DealFlow, dealSideStatus, dealModalFromQuery } from "./DealFlow";

type SendMessagePayload = {
  body?: string;
  chatUploadIds?: string[];
  chatFileNames?: string[];
  listingDocumentIds?: string[];
};

type ChatFilter = "all" | "chats" | "unread" | "offers";

function filterChatSummaries(items: ChatSummary[], filter: ChatFilter) {
  if (filter === "chats") {
    return items.filter((item) => item.kind === "chat" || item.kind === "support");
  }
  if (filter === "offers") return items.filter((item) => item.kind === "offer");
  if (filter === "unread") return items.filter((item) => item.unreadCount > 0);
  return items;
}

function pinSupportFirst(items: ChatSummary[]) {
  const support = items.filter((item) => item.kind === "support");
  const rest = items.filter((item) => item.kind !== "support");
  return [...support, ...rest];
}

function sortChatsByActivity(items: ChatSummary[]) {
  const support = items.filter((item) => item.kind === "support");
  const rest = items
    .filter((item) => item.kind !== "support")
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  return [...support, ...rest];
}

function replaceChatSummary(
  items: ChatSummary[],
  updated: ChatSummary,
  resortByActivity: boolean,
) {
  const index = items.findIndex((item) => item.id === updated.id);
  if (index < 0) {
    return resortByActivity
      ? sortChatsByActivity([updated, ...items])
      : pinSupportFirst([updated, ...items]);
  }

  const next = [...items];
  next[index] = updated;
  return resortByActivity ? sortChatsByActivity(next) : next;
}

function formatPrice(value: number | null) {
  if (value === null) return "Цена не указана";
  return `~${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function chatDayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatChatDayLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Сегодня";

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Вчера";

  const sameYear = date.getFullYear() === today.getFullYear();
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
}

function ListingImage({
  listing,
  className,
}: {
  listing: ChatListing;
  className: string;
}) {
  if (listing.coverImageUrl) {
    return (
      // Storage URL is dynamic and configured by the API.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={listing.coverImageUrl} alt="" className={className} />
    );
  }
  return (
    <span className={`${className} chats-image-placeholder`} aria-hidden>
      {listing.title.slice(0, 1).toUpperCase()}
    </span>
  );
}

function Avatar({
  src,
  name,
  className,
  fallback = null,
}: {
  src: string | null;
  name: string;
  className: string;
  fallback?: string | null;
}) {
  if (src) {
    return (
      // Storage URL is dynamic and configured by the API.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className={className} />
    );
  }
  return (
    <span className={`${className} chats-avatar-placeholder`} aria-hidden>
      {fallback ?? name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function Pill({
  children,
  truncate = false,
}: {
  children: ReactNode;
  truncate?: boolean;
}) {
  if (truncate) {
    return (
      <span className="chats-pill chats-pill--want">
        <span className="chats-pill__text">{children}</span>
      </span>
    );
  }

  return <span className="chats-pill">{children}</span>;
}

function ProfileHeader({
  profile,
}: {
  profile: {
    displayName: string;
    slug: string;
    avatarUrl: string | null;
    swapsCount: number;
    ratingAvg: number;
  };
}) {
  return (
    <Link
      href={`/users/${profile.slug}`}
      className="chats-profile-header"
      aria-label={`Профиль ${profile.displayName}`}
    >
      <Avatar
        src={profile.avatarUrl}
        name={profile.displayName}
        className="chats-profile-header__avatar"
      />
      <div>
        <strong>{profile.displayName}</strong>
        <span>
          <RatingStarIcon />
          {new Intl.NumberFormat("ru-RU").format(profile.ratingAvg ?? 0)}
        </span>
      </div>
    </Link>
  );
}

function ListingCard({
  listing,
  title,
  showWants = false,
  message,
  secondaryListing = null,
  listingsCount,
  onNext,
  hasNext = false,
  showMessage = false,
}: {
  listing: ChatListing;
  title: string;
  showWants?: boolean;
  message?: string;
  secondaryListing?: ChatListing | null;
  listingsCount?: number;
  onNext?: () => void;
  hasNext?: boolean;
  showMessage?: boolean;
}) {
  const condition =
    listing.type === "service"
      ? mapServiceWorkLevelToLabel(listing.serviceWorkLevel)
      : mapApiConditionToLabel(listing.condition);
  const listingHref = `/listings/${listing.id}`;
  const totalListings = listingsCount ?? 1;
  const hiddenCount = Math.max(totalListings - 2, 0);
  const titleText =
    listingsCount && listingsCount > 1
      ? `${title} (${listingsCount} ${pluralRu(listingsCount, "объявление", "объявления", "объявлений")})`
      : title;

  return (
    <section className="chats-offer-column">
      <h2>{titleText}</h2>
      <article className="chats-listing-detail">
        <div className="chats-listing-detail__heading">
          <div className="chats-listing-detail__media">
            <Link
              href={listingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="chats-listing-detail__media-link"
              aria-label={listing.title}
            >
              <ListingImage listing={listing} className="chats-listing-detail__image" />
            </Link>
            {secondaryListing ? (
              <span className="chats-listing-detail__image-stack-wrap">
                <ListingImage
                  listing={secondaryListing}
                  className="chats-listing-detail__image-stack"
                />
                {hiddenCount > 0 ? (
                  <span className="chats-listing-detail__stack-count">+{hiddenCount}</span>
                ) : null}
              </span>
            ) : null}
          </div>
          <div
            className={[
              "chats-listing-detail__meta",
              hasNext ? "chats-listing-detail__meta--with-next" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="chats-category">{listing.category.name}</span>
            <Link
              href={listingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="chats-listing-detail__title-link"
            >
              <h3>{listing.title}</h3>
            </Link>
            <div className="chats-listing-detail__pills">
              <span className="chats-location-pill">
                <LocationPinIcon />
                {listing.city.name}
              </span>
              {listing.type === "service"
                ? (listing.serviceFormats ?? []).slice(0, 1).map((format) => (
                    <span key={format} className="chats-location-pill">
                      {mapServiceFormatToLabel(format)}
                    </span>
                  ))
                : null}
            </div>
          </div>
        </div>

        <div className="chats-listing-stats">
          <div>
            <span>Примерная стоимость</span>
            <Pill>{formatPrice(listing.estimatedPrice)}</Pill>
          </div>
          <div>
            <span>{listing.type === "service" ? "Уровень работы" : "Состояние"}</span>
            <Pill>{condition || "Не указано"}</Pill>
          </div>
          <div>
            <span>Доплата</span>
            <Pill>{EXTRA_PAY_LABELS[listing.extraPay]}</Pill>
          </div>
          <div>
            <span>Документы</span>
            <Pill>{listing.hasDocuments ? "Есть" : "Нет"}</Pill>
          </div>
        </div>

        {showWants ? (
          <div className="chats-listing-wants">
            <h3>{listing.isFree ? "Желаемый обмен" : "Желаю взамен"}</h3>
            {listing.isFree ? (
              <>
                <div>
                  <span className="chats-listing-wants__label">Категории</span>
                  <div className="chats-listing-wants__row">
                    <span className="chats-category">Даром</span>
                  </div>
                </div>
                <div>
                  <span className="chats-listing-wants__label">Вещи и Услуги</span>
                  <div className="chats-listing-wants__row">
                    <Pill>Отдается даром</Pill>
                  </div>
                </div>
              </>
            ) : (
              <>
                {listing.wantsCategories?.length ? (
                  <div>
                    <span className="chats-listing-wants__label">Категории</span>
                    <div className="chats-listing-wants__row">
                      {listing.wantsCategories.map((category) => (
                        <span key={category.id} className="chats-category">
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div>
                  <span className="chats-listing-wants__label">Вещи и Услуги</span>
                  <div className="chats-listing-wants__row">
                    {(listing.wantsTags.length > 0
                      ? listing.wantsTags
                      : ["Любые варианты"]
                    ).map((tag) => (
                      <Pill key={tag} truncate>
                        {tag}
                      </Pill>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}

        {showMessage ? (
          <div className="chats-offer-message">
            <p className="chats-offer-message__text">{message?.trim() || ""}</p>
          </div>
        ) : null}

        {hasNext && onNext ? (
          <button
            type="button"
            className="chats-offer-next"
            aria-label="Следующее предложение"
            onClick={onNext}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/chat/offer-chevron.svg" alt="" />
          </button>
        ) : null}
      </article>
    </section>
  );
}

function FreeClaimCard({
  message,
  kindLabel,
  kindLabelAccusative,
  isSenderView,
}: {
  message: string;
  kindLabel: string;
  kindLabelAccusative: string;
  isSenderView: boolean;
}) {
  const panelTitle = isSenderView
    ? "Выбирать свои объявления не нужно"
    : "Взамен ничего не предлагают";
  const panelText = isSenderView
    ? `Эта ${kindLabel} отдаётся даром — взамен ничего не требуется. Ниже ваше сообщение владельцу.`
    : `Это объявление вы отдаёте даром, поэтому взамен ничего не получите. Ниже сообщение от человека, который хочет получить ${kindLabelAccusative}.`;

  return (
    <section className="chats-offer-column">
      <h2>Предложение</h2>
      <article className="chats-listing-detail chats-listing-detail--free-claim">
        <div className="chats-free-claim-panel">
          <p className="chats-free-claim-panel__title">{panelTitle}</p>
          <p className="chats-free-claim-panel__text">{panelText}</p>
        </div>
        <div className="chats-offer-message">
          <p className="chats-offer-message__text">{message.trim()}</p>
        </div>
      </article>
    </section>
  );
}

function Sidebar({
  items,
  selectedId,
  filter,
  onFilterChange,
  onSelect,
}: {
  items: ChatSummary[];
  selectedId: string | null;
  filter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
  onSelect: (item: ChatSummary) => void;
}) {
  const tabs: Array<{ id: ChatFilter; label: string }> = [
    { id: "all", label: "Все" },
    { id: "chats", label: "Чаты" },
    { id: "unread", label: "Непрочитанные" },
    { id: "offers", label: "Предложения" },
  ];

  return (
    <aside className="chats-sidebar">
      <h1>Чаты</h1>
      <div className="chats-tabs" aria-label="Фильтр чатов">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-active={filter === tab.id ? "true" : undefined}
            onClick={() => onFilterChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <ChatList items={items} selectedId={selectedId} onSelect={onSelect} />
    </aside>
  );
}

function IncomingOfferPanel({
  offer,
  busy,
  error,
  onAccept,
  onReject,
  onBack,
}: {
  offer: IncomingOffer;
  busy: boolean;
  error: string;
  onAccept: () => void;
  onReject: () => void;
  onBack?: () => void;
}) {
  const [offerIndex, setOfferIndex] = useState(0);
  const offeredListings = offer.offeredListings;
  const offeredListing = offeredListings[offerIndex] ?? offeredListings[0];
  const secondaryListing =
    offeredListings.length > 1
      ? offeredListings[(offerIndex + 1) % offeredListings.length]
      : null;
  const isSenderView = offer.viewerRole === "sender" || offer.status === "rejected";
  const counterpart = isSenderView ? offer.recipient : offer.sender;
  const declined = offer.status === "rejected";
  const isFreeClaim =
    Boolean(offer.targetListing.isFree) || offeredListings.length === 0;
  const freeKindNoun = offer.targetListing.type === "service" ? "услуга" : "вещь";
  const freeKindAccusative =
    offer.targetListing.type === "service" ? "услугу" : "вещь";
  const targetListing = {
    ...offer.targetListing,
    isFree: Boolean(offer.targetListing.isFree) || isFreeClaim,
  };
  const freeClaimCard = (
    <FreeClaimCard
      message={offer.message || ""}
      kindLabel={freeKindNoun}
      kindLabelAccusative={freeKindAccusative}
      isSenderView={isSenderView}
    />
  );

  return (
    <section className="chats-panel chats-panel--offer">
      {onBack ? <ChatsMobileBack onBack={onBack} /> : null}
      <ProfileHeader profile={counterpart ?? offer.sender} />
      <div className="chats-offer-comparison">
        {isSenderView ? (
          <>
            {isFreeClaim ? (
              freeClaimCard
            ) : offeredListing ? (
              <ListingCard
                listing={offeredListing}
                title="Мое"
                message={offer.message || ""}
                showMessage
                secondaryListing={secondaryListing}
                listingsCount={offeredListings.length}
                hasNext={offeredListings.length > 1}
                onNext={() =>
                  setOfferIndex((current) => (current + 1) % offeredListings.length)
                }
              />
            ) : null}
            <span className="chats-swap-badge" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/chat/swap-arrows.svg" alt="" />
            </span>
            <ListingCard listing={targetListing} title="Объявление" showWants />
          </>
        ) : (
          <>
            <ListingCard listing={targetListing} title="Мое" showWants />
            <span className="chats-swap-badge" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/chat/swap-arrows.svg" alt="" />
            </span>
            {isFreeClaim ? (
              freeClaimCard
            ) : offeredListing ? (
              <ListingCard
                listing={offeredListing}
                title="Предложение"
                message={offer.message || ""}
                showMessage
                secondaryListing={secondaryListing}
                listingsCount={offeredListings.length}
                hasNext={offeredListings.length > 1}
                onNext={() =>
                  setOfferIndex((current) => (current + 1) % offeredListings.length)
                }
              />
            ) : null}
          </>
        )}
      </div>
      {error ? <p className="chats-action-error">{error}</p> : null}
      {declined ? (
        <p className="chats-action-error">Предложение отклонено</p>
      ) : (
        <div className="chats-actions">
          <button type="button" disabled={busy} onClick={onAccept}>
            {busy ? "Обрабатываем…" : "Принять предложение"}
          </button>
          <button type="button" disabled={busy} onClick={onReject}>
            Отказаться от предложения
          </button>
        </div>
      )}
    </section>
  );
}

function ChatSupportMenu({
  counterpart,
}: {
  counterpart: {
    slug: string;
  };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const { isRendered, isVisible } = useOverlayPresence(open);

  useLayoutEffect(() => {
    if (!isRendered) {
      setPanelPosition(null);
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(337, Math.max(240, window.innerWidth - 24));
      const left = Math.min(
        Math.max(12, rect.right - width),
        window.innerWidth - width - 12,
      );
      setPanelPosition({
        top: Math.round(rect.bottom + 8),
        left: Math.round(left),
        width: Math.round(width),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isRendered, isVisible]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const panelReady = panelPosition !== null;
  const showPanel = isVisible && panelReady;

  return (
    <div ref={containerRef} className="chats-swap-menu">
      <button
        ref={triggerRef}
        type="button"
        className="chats-swap-menu__trigger"
        aria-label="Меню чата"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={isRendered ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <MenuSquareIcon className="text-[#1A1A1A]" />
      </button>

      {isRendered && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label="Действия в чате"
              aria-hidden={!showPanel}
              className={[
                "listing-detail-actions__panel",
                "chats-swap-menu__panel",
                showPanel ? "listing-detail-actions__panel--open" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                panelPosition
                  ? {
                      top: panelPosition.top,
                      left: panelPosition.left,
                      width: panelPosition.width,
                      minWidth: panelPosition.width,
                    }
                  : { top: -9999, left: -9999, visibility: "hidden" }
              }
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <Link
                href={`/users/${counterpart.slug}`}
                className="listing-detail-actions__item"
                onClick={() => setOpen(false)}
              >
                Открыть профиль
              </Link>
              <button
                type="button"
                className="listing-detail-actions__item listing-detail-actions__item--danger chats-swap-menu__soon-btn"
                disabled
                aria-disabled="true"
              >
                Позвать поддержку
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function SwapHeaderPinSlot({
  listing,
  listings,
  label,
  active,
}: {
  listing: ChatListing;
  listings: ChatListing[];
  label: string;
  active: boolean;
}) {
  const extraCount = listings.length > 1 ? listings.length - 1 : 0;

  return (
    <span className={`chats-swap-header__pin${active ? " is-active" : ""}`}>
      <span className="chats-swap-header__pin-thumb-wrap">
        <ListingImage listing={listing} className="chats-swap-header__pin-thumb" />
        {extraCount > 0 ? (
          <span className="chats-list-item__deal-count">+{extraCount}</span>
        ) : null}
      </span>
      <span className="chats-swap-header__pin-label">{label}</span>
    </span>
  );
}

function SwapPreviewCard({
  label,
  listing,
  listings,
  activeIndex = 0,
  menu = false,
  counterpart = null,
  statusLabel,
  statusActive = false,
  onNext,
}: {
  label: string;
  listing: ChatListing;
  listings: ChatListing[];
  activeIndex?: number;
  menu?: boolean;
  counterpart?: {
    slug: string;
  } | null;
  statusLabel: string;
  statusActive?: boolean;
  onNext?: () => void;
}) {
  const count = listings.length;
  const hasNext = count > 1 && Boolean(onNext);
  const listingHref = `/listings/${listing.id}`;
  const labelText =
    count > 1
      ? `${label} (${count} ${pluralRu(count, "объявление", "объявления", "объявлений")})`
      : label;

  return (
    <div
      className={[
        "chats-swap-preview",
        menu ? "chats-swap-preview--theirs" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="chats-swap-preview__media">
        <Link
          href={listingHref}
          target="_blank"
          rel="noopener noreferrer"
          className="chats-swap-preview__image-link"
          aria-label={listing.title}
        >
          <ListingImage listing={listing} className="chats-swap-preview__image" />
        </Link>
        {hasNext && onNext ? (
          <button
            type="button"
            className="chats-swap-preview__pager"
            aria-label={`Следующее объявление, ${activeIndex + 1} из ${count}`}
            onClick={onNext}
          >
            <span>
              {activeIndex + 1}/{count}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/chat/offer-chevron.svg" alt="" />
          </button>
        ) : null}
      </div>
      <div className="chats-swap-preview__body">
        <div className="chats-swap-preview__copy">
          <span className="chats-swap-preview__label">{labelText}</span>
          <Link
            href={listingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="chats-swap-preview__title-link"
          >
            <strong className="chats-swap-preview__title">{listing.title}</strong>
          </Link>
        </div>
        <span
          className={`chats-swap-preview__status${statusActive ? " is-active" : ""}`}
        >
          {statusLabel}
        </span>
      </div>
      {menu && counterpart ? <ChatSupportMenu counterpart={counterpart} /> : null}
    </div>
  );
}

function ChatsMobileBack({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" className="chats-mobile-back" onClick={onBack}>
      <svg
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
        aria-hidden
        className="chats-mobile-back__chevron"
      >
        <path
          d="M1 1L5 5L9 1"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Чаты
    </button>
  );
}

function SupportHeader({
  name,
  onBack,
}: {
  name: string;
  onBack?: () => void;
}) {
  return (
    <div className="chats-support-header">
      {onBack ? <ChatsMobileBack onBack={onBack} /> : null}
      <strong>{name}</strong>
      <span>Мы на связи в этом чате</span>
    </div>
  );
}

function SwapHeader({
  thread,
  currentUserId,
  onBack,
}: {
  thread: ChatThread;
  currentUserId: string;
  onBack?: () => void;
}) {
  const [offerIndex, setOfferIndex] = useState(0);
  const [plaquesOpen, setPlaquesOpen] = useState(true);

  if (!thread.offer) return null;

  const mineStatus = dealSideStatus(thread.deal, "mine");
  const theirsStatus = dealSideStatus(thread.deal, "theirs");
  const target = thread.offer.targetListing;
  const offeredListings = thread.offer.offeredListings;
  const offered =
    offeredListings[offerIndex] ?? offeredListings[0] ?? null;

  if (!offered) return null;

  const iOwnTarget = target.ownerId === currentUserId;
  const goNextOffered = () => {
    if (offeredListings.length < 2) return;
    setOfferIndex((current) => (current + 1) % offeredListings.length);
  };

  const mine = iOwnTarget
    ? {
        label: "Ваше",
        listing: target,
        listings: [target],
        activeIndex: 0,
        menu: false as const,
        onNext: undefined,
      }
    : {
        label: "Ваше",
        listing: offered,
        listings: offeredListings,
        activeIndex: offerIndex,
        menu: false as const,
        onNext: goNextOffered,
      };

  const theirs = iOwnTarget
    ? {
        label: "Его",
        listing: offered,
        listings: offeredListings,
        activeIndex: offerIndex,
        menu: true as const,
        onNext: goNextOffered,
      }
    : {
        label: "Его",
        listing: target,
        listings: [target],
        activeIndex: 0,
        menu: true as const,
        onNext: undefined,
      };

  return (
    <div className="chats-swap-header-wrap">
      <div
        className={`chats-swap-header${plaquesOpen ? " is-expanded" : " is-collapsed"}`}
      >
        {onBack ? <ChatsMobileBack onBack={onBack} /> : null}
        <div className="chats-swap-header__pins" aria-hidden={plaquesOpen}>
          <div className="chats-swap-header__pins-inner">
            <div className="chats-swap-header__pins-content">
              <SwapHeaderPinSlot
                listing={mine.listing}
                listings={mine.listings}
                label={mineStatus.label}
                active={mineStatus.active}
              />
              <SwapHeaderPinSlot
                listing={theirs.listing}
                listings={theirs.listings}
                label={theirsStatus.label}
                active={theirsStatus.active}
              />
            </div>
          </div>
        </div>
        <div
          className={`chats-swap-header__plaques${plaquesOpen ? " is-open" : ""}`}
        >
          <div className="chats-swap-header__plaques-inner">
            <div className="chats-swap-header__plaques-content">
              <SwapPreviewCard
                label={mine.label}
                listing={mine.listing}
                listings={mine.listings}
                activeIndex={mine.activeIndex}
                menu={mine.menu}
                statusLabel={mineStatus.label}
                statusActive={mineStatus.active}
                onNext={mine.onNext}
              />
              <SwapPreviewCard
                label={theirs.label}
                listing={theirs.listing}
                listings={theirs.listings}
                activeIndex={theirs.activeIndex}
                menu={theirs.menu}
                counterpart={thread.counterpart}
                statusLabel={theirsStatus.label}
                statusActive={theirsStatus.active}
                onNext={theirs.onNext}
              />
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="chats-swap-header__fold"
        aria-expanded={plaquesOpen}
        aria-label={plaquesOpen ? "Свернуть статусы" : "Развернуть статусы"}
        onClick={() => setPlaquesOpen((open) => !open)}
      >
        <svg
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden
          className={`chats-swap-header__fold-icon${plaquesOpen ? " is-open" : ""}`}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function ActiveChatPanel({
  thread,
  currentUserId,
  initialDealModal,
  onSend,
  onDealUpdated,
  onBack,
}: {
  thread: ChatThread;
  currentUserId: string;
  initialDealModal: ReturnType<typeof dealModalFromQuery>;
  onSend: (payload: SendMessagePayload) => Promise<boolean>;
  onDealUpdated: (deal: ChatThread["deal"]) => void;
  onBack?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const { isRendered: attachmentsRendered, isVisible: attachmentsVisible } =
    useOverlayPresence(attachmentsOpen);
  const [docsPickerOpen, setDocsPickerOpen] = useState(false);
  const [attachableDocs, setAttachableDocs] = useState<AttachableListingDocuments[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [attachError, setAttachError] = useState("");
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const attachmentsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottomRef = useRef(true);
  const programmaticScrollRef = useRef(false);
  const scrollRetryTimersRef = useRef<number[]>([]);
  const lastMessage = thread.messages[thread.messages.length - 1];
  const lastMessageId = lastMessage?.id;
  const lastMessageSenderId = lastMessage?.senderId;

  const scrollMessagesToBottom = useCallback(() => {
    const root = messagesRef.current;
    if (!root) return;

    stickToBottomRef.current = true;
    programmaticScrollRef.current = true;

    for (const timerId of scrollRetryTimersRef.current) {
      window.clearTimeout(timerId);
    }
    scrollRetryTimersRef.current = [];

    const run = () => {
      const node = messagesRef.current;
      if (!node) return;
      // iOS Safari: avoid scrollTo(smooth) and scrollIntoView (they move the wrong scroller).
      const top = Math.max(0, node.scrollHeight - node.clientHeight);
      node.scrollTop = top;
    };

    run();
    window.requestAnimationFrame(() => {
      run();
      window.requestAnimationFrame(run);
    });

    for (const delay of [0, 50, 120, 250, 400]) {
      scrollRetryTimersRef.current.push(window.setTimeout(run, delay));
    }
    scrollRetryTimersRef.current.push(
      window.setTimeout(() => {
        programmaticScrollRef.current = false;
        stickToBottomRef.current = true;
        run();
      }, 480),
    );
  }, []);

  useEffect(() => {
    return () => {
      for (const timerId of scrollRetryTimersRef.current) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  useLayoutEffect(() => {
    stickToBottomRef.current = true;
    scrollMessagesToBottom();
  }, [thread.id, scrollMessagesToBottom]);

  useLayoutEffect(() => {
    if (!stickToBottomRef.current) return;
    scrollMessagesToBottom();
  }, [thread.messages.length, pendingMessages.length, scrollMessagesToBottom]);

  useLayoutEffect(() => {
    if (!stickToBottomRef.current) return;
    scrollMessagesToBottom();
  }, [
    thread.deal?.status,
    thread.deal?.termsConfirmedByMe,
    thread.deal?.termsConfirmedByOther,
    thread.deal?.completedByMe,
    thread.deal?.completedByOther,
    scrollMessagesToBottom,
  ]);

  const sendTextMessage = async () => {
    const body = message.trim();
    if (!body || sending || composerRef.current?.disabled) return;
    setSending(true);
    stickToBottomRef.current = true;
    const sent = await onSend({ body });
    if (sent) setMessage("");
    setSending(false);
    scrollMessagesToBottom();
    const node = composerRef.current;
    if (node && !node.disabled) {
      try {
        node.focus({ preventScroll: true });
      } catch {
        node.focus();
      }
    }
    scrollMessagesToBottom();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void sendTextMessage();
  };

  const keepComposerFocused = (event: SyntheticEvent) => {
    // Prevent the control from taking focus so iOS keeps the keyboard open.
    event.preventDefault();
  };

  const resizeComposer = () => {
    const node = composerRef.current;
    if (!node) return;
    node.style.height = "0px";
    node.style.height = `${Math.min(node.scrollHeight, 120)}px`;
  };

  useLayoutEffect(() => {
    resizeComposer();
  }, [message]);

  useEffect(() => {
    if (!attachmentsOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!attachmentsRef.current?.contains(event.target as Node)) {
        setAttachmentsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAttachmentsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [attachmentsOpen]);

  useEffect(() => {
    const root = messagesRef.current;
    if (!root) return;

    const syncStickiness = () => {
      if (programmaticScrollRef.current) return;
      const distanceFromBottom = root.scrollHeight - root.scrollTop - root.clientHeight;
      stickToBottomRef.current = distanceFromBottom < 80;
    };

    root.addEventListener("scroll", syncStickiness, { passive: true });
    return () => root.removeEventListener("scroll", syncStickiness);
  }, [thread.id]);

  useEffect(() => {
    const keepBottomOnKeyboard = () => {
      if (!stickToBottomRef.current) return;
      scrollMessagesToBottom();
    };
    window.visualViewport?.addEventListener("resize", keepBottomOnKeyboard);
    return () => {
      window.visualViewport?.removeEventListener("resize", keepBottomOnKeyboard);
    };
  }, [scrollMessagesToBottom]);

  useEffect(() => {
    if (!lastMessageId) return;
    const fromMe = lastMessageSenderId === currentUserId;
    if (!stickToBottomRef.current && !fromMe) return;
    scrollMessagesToBottom();
  }, [
    thread.id,
    lastMessageId,
    lastMessageSenderId,
    currentUserId,
    scrollMessagesToBottom,
  ]);

  const isSupport = thread.kind === "support" || !thread.offer;
  const composerLocked = thread.status !== "active";

  const openDocumentsPicker = async () => {
    setAttachmentsOpen(false);
    setAttachError("");
    setAttachableDocs([]);
    setDocsLoading(true);
    setDocsPickerOpen(true);
    try {
      const response = await getChatAttachableDocuments(thread.id);
      setAttachableDocs(response.listings);
    } catch (error) {
      setAttachableDocs([]);
      setAttachError(
        error instanceof ApiError
          ? error.message
          : "Не удалось загрузить документы объявлений.",
      );
      setDocsPickerOpen(false);
    } finally {
      setDocsLoading(false);
    }
  };

  const sendListingDocuments = async (listingDocumentIds: string[]) => {
    setSending(true);
    stickToBottomRef.current = true;
    scrollMessagesToBottom();
    let allSent = true;
    try {
      for (const listingDocumentId of listingDocumentIds) {
        const sent = await onSend({ listingDocumentIds: [listingDocumentId] });
        if (!sent) {
          allSent = false;
          break;
        }
      }
      if (allSent) {
        setDocsPickerOpen(false);
        setAttachError("");
      } else {
        setAttachError("Не удалось отправить документы.");
      }
    } finally {
      setSending(false);
      scrollMessagesToBottom();
    }
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files?.length || composerLocked || sending) return;
    setAttachmentsOpen(false);
    setAttachError("");
    const selected = [...files].slice(0, 10);
    const batchId = `pending-${Date.now()}`;
    const pendingItems = selected.map((file, index) => {
      const isImage = file.type.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : "";
      const attachment = {
        id: `${batchId}-${index}`,
        kind: (isImage ? "image" : "file") as "image" | "file",
        fileName: file.name,
        mime: file.type || "application/octet-stream",
        url: previewUrl || "#",
        thumbUrl: previewUrl || "",
        fullUrl: previewUrl || "",
        sourceListingId: null as string | null,
        size: file.size,
      };
      const message: ChatMessage = {
        id: `${batchId}-msg-${index}`,
        senderId: currentUserId,
        type: "attachment",
        body: "",
        createdAt: new Date().toISOString(),
        attachments: [attachment],
      };
      return { file, message, attachment };
    });

    setPendingMessages((current) => [
      ...current,
      ...pendingItems.map((item) => item.message),
    ]);
    stickToBottomRef.current = true;
    scrollMessagesToBottom();
    setSending(true);

    try {
      const uploaded = await Promise.all(
        pendingItems.map((item) => uploadChatFileViaBackend(item.file)),
      );

      let failed = false;
      for (let index = 0; index < uploaded.length; index += 1) {
        const item = pendingItems[index];
        const upload = uploaded[index];
        const sent = await onSend({
          chatUploadIds: [upload.uploadId],
          chatFileNames: [upload.fileName],
        });
        setPendingMessages((current) =>
          current.filter((message) => message.id !== item.message.id),
        );
        if (item.attachment.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.attachment.url);
        }
        if (!sent) {
          failed = true;
          break;
        }
      }
      if (failed) setAttachError("Не удалось отправить файлы.");
    } catch (error) {
      setAttachError(
        error instanceof ApiError ? error.message : "Не удалось загрузить файлы.",
      );
      setPendingMessages((current) =>
        current.filter((message) => !message.id.startsWith(`${batchId}-msg-`)),
      );
      pendingItems.forEach((item) => {
        if (item.attachment.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.attachment.url);
        }
      });
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <section className="chats-panel chats-panel--active">
      <div className="chats-active-stage">
        {isSupport ? (
          <SupportHeader name={thread.counterpart.displayName} onBack={onBack} />
        ) : (
          <SwapHeader
            thread={thread}
            currentUserId={currentUserId}
            onBack={onBack}
          />
        )}
        <div ref={messagesRef} className="chats-messages">
          {(() => {
            let lastDay = "";
            const nodes: ReactNode[] = [];

            const pushDay = (iso: string, key: string) => {
              const day = chatDayKey(iso);
              if (!day || day === lastDay) return;
              lastDay = day;
              nodes.push(
                <p key={`day-${day}-${key}`} className="chats-system-message">
                  {formatChatDayLabel(iso)}
                </p>,
              );
            };

            thread.messages.forEach((messageItem) => {
              pushDay(messageItem.createdAt, messageItem.id);
              if (messageItem.type === "system") {
                nodes.push(
                  <p key={messageItem.id} className="chats-system-message">
                    {messageItem.body}
                  </p>,
                );
                return;
              }
              nodes.push(
                <ChatMessageBubble
                  key={messageItem.id}
                  message={messageItem}
                  isOwn={messageItem.senderId === currentUserId}
                  read={
                    messageItem.senderId === currentUserId &&
                    Boolean(
                      thread.counterpartLastReadAt &&
                        new Date(thread.counterpartLastReadAt).getTime() >=
                          new Date(messageItem.createdAt).getTime(),
                    )
                  }
                />,
              );
            });

            pendingMessages.forEach((messageItem) => {
              pushDay(messageItem.createdAt, messageItem.id);
              nodes.push(
                <ChatMessageBubble
                  key={messageItem.id}
                  message={messageItem}
                  isOwn
                  pending
                  read={false}
                />,
              );
            });

            return nodes;
          })()}
        </div>

        <div className="chats-active-footer">
          {attachError ? <p className="chats-attach-error">{attachError}</p> : null}
          <div className="chats-footer-bar">
            <div ref={attachmentsRef} className="chats-composer-wrap">
              {attachmentsRendered ? (
                <div
                  className={`chats-attachments-menu overlay-pop overlay-pop--origin-left${attachmentsVisible ? " is-open" : ""}`}
                  role="menu"
                  aria-hidden={!attachmentsVisible}
                >
                  <button
                    type="button"
                    role="menuitem"
                    disabled={composerLocked || sending}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/chat/file-upload.svg" alt="" />
                    Загрузить файлы
                  </button>
                  {!isSupport ? (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={composerLocked || sending}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void openDocumentsPicker();
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/chat/document-upload.svg" alt="" />
                      Прикрепить документы
                    </button>
                  ) : null}
                </div>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                className="absolute h-px w-px overflow-hidden whitespace-nowrap"
                style={{ clip: "rect(0, 0, 0, 0)" }}
                accept="image/png,image/jpeg,image/webp,application/pdf"
                multiple
                onChange={(event) => void handleFilesSelected(event.target.files)}
              />
              <form className="chats-composer" onSubmit={submit}>
                <button
                  type="button"
                  className="chats-composer__attach"
                  aria-label="Прикрепить файл"
                  aria-expanded={attachmentsOpen}
                  aria-haspopup="menu"
                  disabled={composerLocked || sending}
                  onMouseDown={keepComposerFocused}
                  onClick={() => {
                    if (!composerLocked) setAttachmentsOpen((open) => !open);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/chat/attachment.svg" alt="" />
                </button>
                <textarea
                  ref={composerRef}
                  value={message}
                  rows={1}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" || event.shiftKey) return;
                    if (event.nativeEvent.isComposing) return;
                    event.preventDefault();
                    void sendTextMessage();
                  }}
                  onFocus={(event) => {
                    const node = event.currentTarget;
                    try {
                      node.focus({ preventScroll: true });
                    } catch {
                      /* ignore */
                    }
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                  placeholder={composerLocked ? "Чат только для чтения" : "Сообщение..."}
                  maxLength={2000}
                  disabled={composerLocked}
                  name="aimena-chat-message"
                  autoComplete="off"
                  autoCorrect="on"
                  autoCapitalize="sentences"
                  spellCheck={true}
                  enterKeyHint="send"
                  inputMode="text"
                  data-1p-ignore
                  data-lpignore="true"
                  data-form-type="other"
                  aria-label="Сообщение"
                />
                <button
                  type="button"
                  className="chats-composer__send"
                  aria-label="Отправить"
                  disabled={composerLocked || !message.trim() || sending}
                  onMouseDown={keepComposerFocused}
                  onClick={() => void sendTextMessage()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/chat/send-star.svg" alt="" />
                </button>
              </form>
            </div>

            {!isSupport ? (
              <DealFlow
                deal={thread.deal}
                threadStatus={thread.status}
                initialModal={initialDealModal}
                onDealUpdated={(deal) => {
                  stickToBottomRef.current = true;
                  onDealUpdated(deal);
                  scrollMessagesToBottom();
                }}
              />
            ) : null}
          </div>
        </div>
      </div>

      <ChatDocumentsPicker
        open={docsPickerOpen}
        listings={attachableDocs}
        loading={docsLoading}
        busy={sending}
        onClose={() => {
          if (!sending) setDocsPickerOpen(false);
        }}
        onSend={(ids) => void sendListingDocuments(ids)}
      />
    </section>
  );
}

export function ChatsView() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { guardAuth } = useAuthGate();
  const { refreshUnread } = useChatInbox();
  const searchParams = useSearchParams();
  const isCompact = useMediaQuery(MQ.compact);
  const selectedFromQuery = searchParams.get("selected");
  const openSupportFromQuery = searchParams.get("support") === "1";
  const initialDealModal = dealModalFromQuery(searchParams.get("dealModal"));
  const [summaries, setSummaries] = useState<ChatSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(selectedFromQuery);
  const [filter, setFilter] = useState<ChatFilter>("all");
  const [incomingOffer, setIncomingOffer] = useState<IncomingOffer | null>(null);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const mobileThreadOpen = isCompact && Boolean(selectedId);
  const pageModeClass = isCompact
    ? mobileThreadOpen
      ? " is-mobile-thread"
      : " is-mobile-list"
    : "";

  const syncChatUrl = useCallback(
    (nextId: string | null) => {
      const next =
        nextId != null
          ? `/chats?selected=${encodeURIComponent(nextId)}`
          : "/chats";
      const current =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "";
      if (current === next) return;
      router.replace(next, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    if (!mobileThreadOpen) {
      setKeyboardOpen(false);
      const root = document.documentElement;
      root.style.removeProperty("--chats-vv-top");
      root.style.removeProperty("--chats-vv-height");
      root.style.removeProperty("--chats-kbd-inset");
      return;
    }

    const root = document.documentElement;
    const lockWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
      if (document.documentElement.scrollTop !== 0) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body.scrollTop !== 0) {
        document.body.scrollTop = 0;
      }
    };

    const syncViewport = () => {
      const vv = window.visualViewport;
      lockWindowScroll();
      if (!vv) {
        root.style.removeProperty("--chats-vv-top");
        root.style.removeProperty("--chats-vv-height");
        setKeyboardOpen(false);
        return;
      }
      // Follow the visible viewport so Safari's keyboard pan does not hide the header.
      const top = Math.max(0, Math.round(vv.offsetTop));
      const height = Math.max(0, Math.round(vv.height));
      root.style.setProperty("--chats-vv-top", `${top}px`);
      root.style.setProperty("--chats-vv-height", `${height}px`);
      const covered = Math.max(0, window.innerHeight - height - top);
      setKeyboardOpen(covered > 60);
    };

    syncViewport();
    window.visualViewport?.addEventListener("resize", syncViewport);
    window.visualViewport?.addEventListener("scroll", syncViewport);
    window.addEventListener("resize", syncViewport);
    window.addEventListener("scroll", lockWindowScroll, { passive: true });

    return () => {
      window.visualViewport?.removeEventListener("resize", syncViewport);
      window.visualViewport?.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("scroll", lockWindowScroll);
      root.style.removeProperty("--chats-vv-top");
      root.style.removeProperty("--chats-vv-height");
      root.style.removeProperty("--chats-kbd-inset");
      setKeyboardOpen(false);
    };
  }, [mobileThreadOpen]);

  const loadSummaries = useCallback(async (signal?: AbortSignal) => {
    const response = await getChats(signal);
    setSummaries(response.data);
    setSelectedId((current) => {
      if (
        selectedFromQuery &&
        response.data.some((item) => item.id === selectedFromQuery)
      ) {
        return selectedFromQuery;
      }
      // Keep an in-page selection; do not auto-open the first chat on /chats.
      if (current && response.data.some((item) => item.id === current)) return current;
      return null;
    });
    return response.data;
  }, [selectedFromQuery]);

  useEffect(() => {
    if (selectedFromQuery) {
      setSelectedId(selectedFromQuery);
      return;
    }
    if (openSupportFromQuery) return;
    setSelectedId(null);
    setThread(null);
    setIncomingOffer(null);
  }, [openSupportFromQuery, selectedFromQuery]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      guardAuth("chat");
      return;
    }
    const controller = new AbortController();
    void getChats(controller.signal)
      .then((response) => {
        const items = response.data;
        const supportItem = items.find((item) => item.kind === "support");
        let nextSelected =
          selectedFromQuery && items.some((item) => item.id === selectedFromQuery)
            ? selectedFromQuery
            : null;

        if (!nextSelected && openSupportFromQuery && supportItem) {
          nextSelected = supportItem.id;
          window.history.replaceState(
            null,
            "",
            `/chats?selected=${encodeURIComponent(nextSelected)}`,
          );
        }

        setSummaries(items);
        setSelectedId((current) => {
          if (nextSelected) return nextSelected;
          if (current && items.some((item) => item.id === current)) return current;
          return null;
        });
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("Не удалось загрузить чаты.");
      })
      .finally(() => setLoading(false));

    void connectChatSocket();

    return () => controller.abort();
  }, [
    authLoading,
    guardAuth,
    isAuthenticated,
    openSupportFromQuery,
    selectedFromQuery,
  ]);

  const selectedSummary = summaries.find((item) => item.id === selectedId) ?? null;
  // Stable key: do not depend on summary object identity (preview/unread updates
  // must not re-fetch the open thread — that caused GET spam in API logs).
  const selectedFetchKey = selectedSummary
    ? selectedSummary.kind === "offer"
      ? `offer:${selectedSummary.offerId}`
      : `thread:${selectedSummary.threadId ?? selectedSummary.id}`
    : null;

  useEffect(() => {
    if (!selectedFetchKey || !selectedId) return;
    const selected = summaries.find((item) => item.id === selectedId);
    if (!selected) return;

    const controller = new AbortController();
    const request =
      selected.kind === "offer"
        ? getIncomingOffer(selected.offerId, controller.signal).then((response) => {
            setThread(null);
            setIncomingOffer(response.offer);
          })
        : getChatThread(selected.threadId ?? selected.id, controller.signal).then(
            (response) => {
              setIncomingOffer(null);
              setThread(response.thread);
              setSummaries((current) => {
                const index = current.findIndex((item) => item.id === selected.id);
                if (index < 0 || current[index].unreadCount === 0) return current;
                const next = [...current];
                next[index] = { ...current[index], unreadCount: 0 };
                return next;
              });
              void refreshUnread();
            },
          );
    void request.catch((requestError: unknown) => {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError("Не удалось открыть выбранный чат.");
    });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-fetch when selection identity changes
  }, [selectedFetchKey, selectedId]);

  useEffect(() => {
    if (!thread?.id) return;
    const threadId = thread.id;
    void connectChatSocket().then(() => {
      joinChatThread(threadId);
      markChatThreadRead(threadId);
    });
    return () => {
      leaveChatThread(threadId);
    };
  }, [thread?.id]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribeMessage = onChatMessage((event) => {
      const createdAt =
        typeof event.message.createdAt === "string"
          ? event.message.createdAt
          : new Date(event.message.createdAt).toISOString();
      const nextMessage: ChatMessage = { ...event.message, createdAt };

      setThread((current) => {
        if (!current || current.id !== event.threadId) return current;
        if (current.messages.some((item) => item.id === nextMessage.id)) return current;
        return { ...current, messages: [...current.messages, nextMessage] };
      });

      setSummaries((current) => {
        const index = current.findIndex((item) => item.id === event.threadId);
        if (index < 0) {
          void loadSummaries();
          return current;
        }
        const item = current[index];
        const isOpen = selectedId === event.threadId;
        const updated: ChatSummary = {
          ...item,
          preview: chatMessagePreview(nextMessage),
          updatedAt: createdAt,
          unreadCount: isOpen
            ? 0
            : nextMessage.senderId === user?.id
              ? item.unreadCount
              : item.unreadCount + 1,
        };
        return replaceChatSummary(current, updated, true);
      });

      if (selectedId === event.threadId) {
        markChatThreadRead(event.threadId);
      }
    });

    const unsubscribeUpdated = onChatThreadUpdated((event) => {
      if (event.counterpartLastReadAt) {
        const readAt =
          typeof event.counterpartLastReadAt === "string"
            ? event.counterpartLastReadAt
            : new Date(event.counterpartLastReadAt).toISOString();
        setThread((current) =>
          current && current.id === event.threadId
            ? { ...current, counterpartLastReadAt: readAt }
            : current,
        );
      }

      setSummaries((current) => {
        const index = current.findIndex((item) => item.id === event.threadId);
        if (index < 0) {
          void loadSummaries();
          return current;
        }
        const item = current[index];
        const nextUpdatedAt = event.lastMessageAt
          ? typeof event.lastMessageAt === "string"
            ? event.lastMessageAt
            : new Date(event.lastMessageAt).toISOString()
          : item.updatedAt;
        const updated: ChatSummary = {
          ...item,
          preview: event.preview ?? item.preview,
          updatedAt: nextUpdatedAt,
          unreadCount:
            typeof event.unreadCount === "number" ? event.unreadCount : item.unreadCount,
        };
        const activityChanged = nextUpdatedAt !== item.updatedAt;
        return replaceChatSummary(current, updated, activityChanged);
      });
    });

    const unsubscribeInbox = onChatInboxUpdated(() => {
      void loadSummaries();
      void refreshUnread();
    });

    const unsubscribeDeal = onChatDealUpdated((event) => {
      setThread((current) => {
        if (!current || current.id !== event.threadId) return current;
        const nextStatus =
          event.deal.status === "cancelled"
            ? "read_only_cancelled"
            : event.deal.status === "reviewed"
              ? "read_only_reviewed"
              : current.status;
        return { ...current, deal: event.deal, status: nextStatus };
      });
      if (selectedId === event.threadId) {
        markChatThreadRead(event.threadId);
        void refreshUnread();
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeUpdated();
      unsubscribeInbox();
      unsubscribeDeal();
    };
  }, [isAuthenticated, loadSummaries, refreshUnread, selectedId, user?.id]);

  const filteredSummaries = useMemo(() => {
    return filterChatSummaries(summaries, filter);
  }, [filter, summaries]);

  const handleSelect = (item: ChatSummary) => {
    if (item.id === selectedId) {
      if (isCompact) syncChatUrl(item.id);
      return;
    }
    setSelectedId(item.id);
    setIncomingOffer(null);
    setThread(null);
    setError("");
    syncChatUrl(item.id);
  };

  const handleBackToList = useCallback(() => {
    setSelectedId(null);
    setIncomingOffer(null);
    setThread(null);
    setError("");
    syncChatUrl(null);
  }, [syncChatUrl]);

  const handleFilterChange = (nextFilter: ChatFilter) => {
    const nextItems = filterChatSummaries(summaries, nextFilter);
    setFilter(nextFilter);
    if (!nextItems.some((item) => item.id === selectedId)) {
      setSelectedId(null);
      setIncomingOffer(null);
      setThread(null);
      setError("");
      if (selectedId) syncChatUrl(null);
    }
  };

  const resolveOffer = async (action: "accept" | "reject") => {
    if (!incomingOffer || actionBusy) return;
    setActionBusy(true);
    setError("");
    try {
      const response =
        action === "accept"
          ? await acceptExchangeOffer(incomingOffer.id)
          : await rejectExchangeOffer(incomingOffer.id);
      const items = await loadSummaries();
      const nextId =
        action === "accept" && response.threadId
          ? response.threadId
          : (items[0]?.id ?? null);
      setSelectedId(nextId);
      setIncomingOffer(null);
      syncChatUrl(nextId);
    } catch (actionError) {
      setError(
        actionError instanceof ApiError
          ? actionError.message
          : "Не удалось обработать предложение.",
      );
    } finally {
      setActionBusy(false);
    }
  };

  const handleSend = async (payload: SendMessagePayload) => {
    if (!thread) return false;
    try {
      let message: ChatMessage;
      try {
        message = await sendChatSocketMessage(thread.id, payload);
      } catch {
        const response = await sendChatMessage(thread.id, payload);
        message = response.message;
      }

      const createdAt =
        typeof message.createdAt === "string"
          ? message.createdAt
          : new Date(message.createdAt).toISOString();
      const nextMessage = {
        ...message,
        createdAt,
        attachments: message.attachments ?? [],
      };

      setThread((current) => {
        if (!current) return current;
        if (current.messages.some((item) => item.id === nextMessage.id)) return current;
        return { ...current, messages: [...current.messages, nextMessage] };
      });
      setSummaries((current) => {
        const index = current.findIndex((item) => item.id === thread.id);
        if (index < 0) return current;
        const item = current[index];
        const updated: ChatSummary = {
          ...item,
          preview: chatMessagePreview(nextMessage),
          updatedAt: createdAt,
          unreadCount: 0,
        };
        return replaceChatSummary(current, updated, true);
      });
      return true;
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "Не удалось отправить сообщение.",
      );
      return false;
    }
  };

  return (
    <div
      className={`chats-page${pageModeClass}`}
      data-keyboard={keyboardOpen ? "true" : undefined}
    >
      {mobileThreadOpen ? null : <Header />}
      <main className="chats-main">
        <Sidebar
          items={filteredSummaries}
          selectedId={selectedId}
          filter={filter}
          onFilterChange={handleFilterChange}
          onSelect={handleSelect}
        />
        {loading ? <div className="chats-empty-panel">Загружаем чаты…</div> : null}
        {!loading && incomingOffer ? (
          <IncomingOfferPanel
            offer={incomingOffer}
            busy={actionBusy}
            error={error}
            onAccept={() => void resolveOffer("accept")}
            onReject={() => void resolveOffer("reject")}
            onBack={isCompact ? handleBackToList : undefined}
          />
        ) : null}
        {!loading && thread && user ? (
          <ActiveChatPanel
            key={thread.id}
            thread={thread}
            currentUserId={user.id}
            initialDealModal={initialDealModal}
            onBack={isCompact ? handleBackToList : undefined}
            onSend={handleSend}
            onDealUpdated={(deal) => {
              setThread((current) => {
                if (!current) return current;
                const nextStatus =
                  deal?.status === "cancelled"
                    ? "read_only_cancelled"
                    : deal?.status === "reviewed"
                      ? "read_only_reviewed"
                      : current.status;
                return { ...current, deal, status: nextStatus };
              });
            }}
          />
        ) : null}
        {!loading && !incomingOffer && !thread ? (
          <div className="chats-empty-panel">
            {error ? (
              error
            ) : (
              <span className="chats-empty-panel__hint">Откройте любой чат...</span>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
