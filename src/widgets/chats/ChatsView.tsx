"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  EXTRA_PAY_LABELS,
  mapApiConditionToLabel,
  mapServiceFormatToLabel,
  mapServiceWorkLevelToLabel,
} from "@/entities/listing";
import { useAuth, useAuthGate } from "@/features/auth";
import {
  getChats,
  getChatThread,
  getIncomingOffer,
  sendChatMessage,
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
  onChatMessage,
  onChatThreadUpdated,
  sendChatSocketMessage,
} from "@/shared/api/chat-socket";
import { acceptExchangeOffer, rejectExchangeOffer } from "@/shared/api/deals";
import { ApiError } from "@/shared/api/http";
import { LocationPinIcon, MenuSquareIcon, StarMiniIcon } from "@/shared/ui/icons";
import { Header } from "@/widgets/header/Header";
import { pluralRu } from "@/widgets/profile/constants";

type ChatFilter = "all" | "chats" | "unread" | "offers";

const PANEL_CLOSE_MS = 220;

function filterChatSummaries(items: ChatSummary[], filter: ChatFilter) {
  if (filter === "chats") return items.filter((item) => item.kind === "chat");
  if (filter === "offers") return items.filter((item) => item.kind === "offer");
  if (filter === "unread") return items.filter((item) => item.unreadCount > 0);
  return items;
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

function formatListTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return formatTime(value);
  return "Вчера";
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
}: {
  src: string | null;
  name: string;
  className: string;
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
      {name.slice(0, 1).toUpperCase()}
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
          <StarMiniIcon />
          {new Intl.NumberFormat("ru-RU").format(profile.swapsCount)}
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
            <h3>Желаю взамен</h3>
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
      <div className="chats-list">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chats-list-item"
            data-active={selectedId === item.id ? "true" : undefined}
            onClick={() => onSelect(item)}
          >
            <Avatar
              src={item.counterpart.avatarUrl}
              name={item.counterpart.displayName}
              className="chats-list-item__avatar"
            />
            <span className="chats-list-item__copy">
              <strong>{item.counterpart.displayName}</strong>
              <span>{item.kind === "offer" ? "Вам предложение!" : item.preview}</span>
            </span>
            <span className="chats-list-item__meta">
              <time>{formatListTime(item.updatedAt)}</time>
              {item.kind === "offer" ? (
                <span className="chats-list-item__badge chats-list-item__badge--offer">!</span>
              ) : item.unreadCount > 0 ? (
                <span className="chats-list-item__badge chats-list-item__badge--count">
                  {item.unreadCount}
                </span>
              ) : null}
            </span>
          </button>
        ))}
        {items.length === 0 ? (
          <p className="chats-list__empty">В этой категории пока ничего нет.</p>
        ) : null}
      </div>
    </aside>
  );
}

function IncomingOfferPanel({
  offer,
  busy,
  error,
  onAccept,
  onReject,
}: {
  offer: IncomingOffer;
  busy: boolean;
  error: string;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [offerIndex, setOfferIndex] = useState(0);
  const offeredListings = offer.offeredListings;
  const offeredListing = offeredListings[offerIndex] ?? offeredListings[0];
  const secondaryListing =
    offeredListings.length > 1
      ? offeredListings[(offerIndex + 1) % offeredListings.length]
      : null;

  return (
    <section className="chats-panel chats-panel--offer">
      <ProfileHeader profile={offer.sender} />
      <div className="chats-offer-comparison">
        <ListingCard listing={offer.targetListing} title="Мое" showWants />
        <span className="chats-swap-badge" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/chat/swap-arrows.svg" alt="" />
        </span>
        {offeredListing ? (
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
      </div>
      {error ? <p className="chats-action-error">{error}</p> : null}
      <div className="chats-actions">
        <button type="button" disabled={busy} onClick={onAccept}>
          {busy ? "Обрабатываем…" : "Принять предложение"}
        </button>
        <button type="button" disabled={busy} onClick={onReject}>
          Отказаться от предложения
        </button>
      </div>
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
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      const frameId = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frameId);
    }

    setIsVisible(false);
    const timeoutId = window.setTimeout(() => setIsMounted(false), PANEL_CLOSE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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

  return (
    <div ref={containerRef} className="chats-swap-menu">
      <button
        type="button"
        className="chats-swap-menu__trigger"
        aria-label="Меню чата"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={isMounted ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <MenuSquareIcon className="text-[#1A1A1A]" />
      </button>

      {isMounted ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Действия в чате"
          aria-hidden={!isVisible}
          className={[
            "listing-detail-actions__panel",
            isVisible ? "listing-detail-actions__panel--open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
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
            className="listing-detail-actions__item listing-detail-actions__item--danger"
            onClick={() => setOpen(false)}
          >
            Позвать поддержку
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SwapPreviewCard({
  label,
  listing,
  listings,
  activeIndex = 0,
  menu = false,
  counterpart = null,
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
        <span className="chats-swap-preview__status">Ждём готовности владельца</span>
      </div>
      {menu && counterpart ? <ChatSupportMenu counterpart={counterpart} /> : null}
    </div>
  );
}

function SwapHeader({
  thread,
  currentUserId,
}: {
  thread: ChatThread;
  currentUserId: string;
}) {
  const target = thread.offer.targetListing;
  const offeredListings = thread.offer.offeredListings;
  const [offerIndex, setOfferIndex] = useState(0);
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
    <div className="chats-swap-header">
      <SwapPreviewCard
        label={mine.label}
        listing={mine.listing}
        listings={mine.listings}
        activeIndex={mine.activeIndex}
        menu={mine.menu}
        onNext={mine.onNext}
      />
      <SwapPreviewCard
        label={theirs.label}
        listing={theirs.listing}
        listings={theirs.listings}
        activeIndex={theirs.activeIndex}
        menu={theirs.menu}
        counterpart={thread.counterpart}
        onNext={theirs.onNext}
      />
    </div>
  );
}

function ActiveChatPanel({
  thread,
  currentUserId,
  onSend,
}: {
  thread: ChatThread;
  currentUserId: string;
  onSend: (body: string) => Promise<boolean>;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const lastMessage = thread.messages[thread.messages.length - 1];
  const lastMessageId = lastMessage?.id;
  const lastMessageSenderId = lastMessage?.senderId;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const body = message.trim();
    if (!body || sending) return;
    setSending(true);
    stickToBottomRef.current = true;
    const sent = await onSend(body);
    if (sent) setMessage("");
    setSending(false);
  };

  useEffect(() => {
    const root = messagesRef.current;
    if (!root) return;

    const syncStickiness = () => {
      const distanceFromBottom = root.scrollHeight - root.scrollTop - root.clientHeight;
      stickToBottomRef.current = distanceFromBottom < 80;
    };

    syncStickiness();
    root.addEventListener("scroll", syncStickiness, { passive: true });
    return () => root.removeEventListener("scroll", syncStickiness);
  }, [thread.id]);

  useEffect(() => {
    const root = messagesRef.current;
    if (!root || !lastMessageId) return;

    const fromMe = lastMessageSenderId === currentUserId;
    if (!stickToBottomRef.current && !fromMe) return;

    root.scrollTo({
      top: root.scrollHeight,
      behavior: stickToBottomRef.current || fromMe ? "smooth" : "auto",
    });
    stickToBottomRef.current = true;
  }, [thread.id, lastMessageId, lastMessageSenderId, currentUserId, thread.messages.length]);

  return (
    <section className="chats-panel chats-panel--active">
      <div className="chats-active-stage">
        <SwapHeader thread={thread} currentUserId={currentUserId} />
        <div ref={messagesRef} className="chats-messages">
          <div className="chats-date-divider">Сегодня</div>
          {thread.messages.map((messageItem) =>
            messageItem.type === "system" ? (
              <p key={messageItem.id} className="chats-system-message">
                {messageItem.body}
              </p>
            ) : (
              <div
                key={messageItem.id}
                className="chats-message"
                data-own={messageItem.senderId === currentUserId ? "true" : undefined}
              >
                <p>{messageItem.body}</p>
                <time>{formatTime(messageItem.createdAt)}</time>
              </div>
            ),
          )}
        </div>

        <div className="chats-active-footer">
          <div className="chats-footer-bar">
            <div className="chats-composer-wrap">
              {attachmentsOpen ? (
                <div className="chats-attachments-menu">
                  <button type="button">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/chat/file-upload.svg" alt="" />
                    Загрузить файлы
                  </button>
                  <button type="button">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/chat/document-upload.svg" alt="" />
                    Прикрепить документы
                  </button>
                </div>
              ) : null}
              <form className="chats-composer" onSubmit={submit}>
                <button
                  type="button"
                  className="chats-composer__attach"
                  aria-label="Прикрепить файл"
                  onClick={() => setAttachmentsOpen((open) => !open)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/chat/attachment.svg" alt="" />
                </button>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Написать...."
                  maxLength={2000}
                />
                <button
                  type="submit"
                  className="chats-composer__send"
                  aria-label="Отправить"
                  disabled={!message.trim() || sending}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/chat/send-star.svg" alt="" />
                </button>
              </form>
            </div>

            {notice ? <p className="chats-action-notice">{notice}</p> : null}
            <div className="chats-actions">
              <button
                type="button"
                onClick={() =>
                  setNotice("Подтверждение готовности будет подключено к этапу сделки.")
                }
              >
                Готов к обмену
              </button>
              <button
                type="button"
                onClick={() =>
                  setNotice("Отмена будет доступна только как обоюдный запрос сделки.")
                }
              >
                Отказаться от обмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ChatsView() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { guardAuth } = useAuthGate();
  const searchParams = useSearchParams();
  const selectedFromQuery = searchParams.get("selected");
  const [summaries, setSummaries] = useState<ChatSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(selectedFromQuery);
  const [filter, setFilter] = useState<ChatFilter>("all");
  const [incomingOffer, setIncomingOffer] = useState<IncomingOffer | null>(null);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState("");

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
    setSelectedId(null);
    setThread(null);
    setIncomingOffer(null);
  }, [selectedFromQuery]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      guardAuth("chat");
      return;
    }
    const controller = new AbortController();
    void getChats(controller.signal)
      .then((response) => {
        setSummaries(response.data);
        setSelectedId((current) => {
          if (
            selectedFromQuery &&
            response.data.some((item) => item.id === selectedFromQuery)
          ) {
            return selectedFromQuery;
          }
          if (current && response.data.some((item) => item.id === current)) return current;
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
  }, [authLoading, guardAuth, isAuthenticated, selectedFromQuery]);

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
          preview: nextMessage.body,
          updatedAt: createdAt,
          unreadCount: isOpen
            ? 0
            : nextMessage.senderId === user?.id
              ? item.unreadCount
              : item.unreadCount + 1,
        };
        const next = [...current];
        next.splice(index, 1);
        return [updated, ...next];
      });

      if (selectedId === event.threadId) {
        markChatThreadRead(event.threadId);
      }
    });

    const unsubscribeUpdated = onChatThreadUpdated((event) => {
      setSummaries((current) => {
        const index = current.findIndex((item) => item.id === event.threadId);
        if (index < 0) return current;
        const item = current[index];
        const updated: ChatSummary = {
          ...item,
          preview: event.preview ?? item.preview,
          updatedAt: event.lastMessageAt
            ? typeof event.lastMessageAt === "string"
              ? event.lastMessageAt
              : new Date(event.lastMessageAt).toISOString()
            : item.updatedAt,
          unreadCount:
            typeof event.unreadCount === "number" ? event.unreadCount : item.unreadCount,
        };
        const next = [...current];
        next.splice(index, 1);
        return [updated, ...next];
      });
    });

    return () => {
      unsubscribeMessage();
      unsubscribeUpdated();
    };
  }, [isAuthenticated, loadSummaries, selectedId, user?.id]);

  const filteredSummaries = useMemo(() => {
    return filterChatSummaries(summaries, filter);
  }, [filter, summaries]);

  const handleSelect = (item: ChatSummary) => {
    if (item.id === selectedId) return;
    setSelectedId(item.id);
    setIncomingOffer(null);
    setThread(null);
    setError("");
  };

  const handleFilterChange = (nextFilter: ChatFilter) => {
    const nextItems = filterChatSummaries(summaries, nextFilter);
    setFilter(nextFilter);
    if (!nextItems.some((item) => item.id === selectedId)) {
      setSelectedId(nextItems[0]?.id ?? null);
      setIncomingOffer(null);
      setThread(null);
      setError("");
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

  const handleSend = async (body: string) => {
    if (!thread) return false;
    try {
      let message: ChatMessage;
      try {
        message = await sendChatSocketMessage(thread.id, body);
      } catch {
        const response = await sendChatMessage(thread.id, body);
        message = response.message;
      }

      const createdAt =
        typeof message.createdAt === "string"
          ? message.createdAt
          : new Date(message.createdAt).toISOString();
      const nextMessage = { ...message, createdAt };

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
          preview: nextMessage.body,
          updatedAt: createdAt,
          unreadCount: 0,
        };
        const next = [...current];
        next.splice(index, 1);
        return [updated, ...next];
      });
      return true;
    } catch {
      setError("Не удалось отправить сообщение.");
      return false;
    }
  };

  return (
    <div className="chats-page">
      <Header />
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
          />
        ) : null}
        {!loading && thread && user ? (
          <ActiveChatPanel
            key={thread.id}
            thread={thread}
            currentUserId={user.id}
            onSend={handleSend}
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
