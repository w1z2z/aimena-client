"use client";

import { useMemo, useState } from "react";

import type { ChatMessage, ChatMessageAttachment } from "@/shared/api/chats";

import { ChatImageLightbox } from "./ChatImageLightbox";

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatBytes(size?: number) {
  if (!size || size <= 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function ChatMessageTicks({ read }: { read: boolean }) {
  return (
    <span
      className="chats-message__ticks"
      data-read={read ? "true" : undefined}
      aria-label={read ? "Прочитано" : "Отправлено"}
    />
  );
}

function ChatMessageMeta({
  time,
  iso,
  read,
  pending,
  overlay,
}: {
  time: string;
  iso: string;
  read: boolean;
  pending?: boolean;
  overlay?: boolean;
}) {
  return (
    <span className={overlay ? "chats-message__meta chats-message__meta--overlay" : "chats-message__meta"}>
      <time dateTime={iso}>{pending ? "…" : time}</time>
      <ChatMessageTicks read={!pending && read} />
    </span>
  );
}

export function ChatMessageBubble({
  message,
  isOwn,
  pending,
  read,
}: {
  message: ChatMessage;
  isOwn: boolean;
  pending?: boolean;
  read?: boolean;
}) {
  const attachments = message.attachments ?? [];
  const images = useMemo(
    () => attachments.filter((item) => item.kind === "image"),
    [attachments],
  );
  const files = useMemo(
    () => attachments.filter((item) => item.kind === "file"),
    [attachments],
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const hasText = Boolean(message.body.trim());
  const mediaOnly = !hasText && images.length > 0 && files.length === 0;
  const timeLabel = formatTime(message.createdAt);
  const isRead = Boolean(isOwn && read);
  const listingDocLabel = images.some((item) => item.sourceListingId)
    ? "Документ объявления"
    : null;
  const meta = (
    <ChatMessageMeta
      time={timeLabel}
      iso={message.createdAt}
      read={isRead}
      pending={pending}
      overlay={mediaOnly}
    />
  );

  return (
    <div
      className={[
        "chats-message",
        mediaOnly ? "chats-message--media" : "",
        pending ? "chats-message--pending" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-own={isOwn ? "true" : undefined}
    >
      {listingDocLabel && mediaOnly ? (
        <span className="chats-message-doc-badge">{listingDocLabel}</span>
      ) : null}

      {images.length > 0 ? (
        <div
          className="chats-message-images"
          data-count={String(Math.min(images.length, 4))}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className="chats-message-images__item"
              onClick={() => {
                if (!pending) setLightboxIndex(index);
              }}
              aria-label={`Открыть ${image.fileName}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.thumbUrl || image.url}
                alt={image.fileName}
                loading="lazy"
              />
              {mediaOnly && index === images.length - 1 ? (
                <>
                  {image.sourceListingId ? (
                    <span className="chats-message-images__tag">Документ</span>
                  ) : null}
                  {meta}
                </>
              ) : null}
              {pending ? <span className="chats-message-images__spinner" aria-hidden /> : null}
            </button>
          ))}
        </div>
      ) : null}

      {files.length > 0 ? (
        <ul className="chats-message-files">
          {files.map((file) => (
            <li key={file.id}>
              <a
                className="chats-message-file"
                href={pending ? undefined : file.url}
                target="_blank"
                rel="noreferrer"
                download={pending ? undefined : file.fileName}
                onClick={(event) => {
                  if (pending) event.preventDefault();
                }}
              >
                <span className="chats-message-file__icon" aria-hidden>
                  {file.mime === "application/pdf" ? "PDF" : "FILE"}
                </span>
                <span className="chats-message-file__meta">
                  <span className="chats-message-file__name">{file.fileName}</span>
                  <span className="chats-message-file__sub">
                    {pending
                      ? "Отправка…"
                      : file.sourceListingId
                        ? "Документ объявления"
                        : formatBytes(file.size) || "Документ"}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {hasText ? (
        <p>
          {message.body}
          {meta}
        </p>
      ) : !mediaOnly ? (
        meta
      ) : null}

      {lightboxIndex !== null ? (
        <ChatImageLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  );
}

export function chatMessagePreview(message: Pick<ChatMessage, "body" | "type" | "attachments">) {
  const trimmed = message.body.trim();
  if (trimmed) return trimmed;
  const attachments = message.attachments ?? [];
  if (attachments.length === 0) {
    return message.type === "attachment" ? "Вложение" : message.body;
  }
  const images = attachments.filter((item) => item.kind === "image").length;
  const files = attachments.length - images;
  if (images > 0 && files === 0) return images === 1 ? "Фото" : `Фото (${images})`;
  if (files > 0 && images === 0) return files === 1 ? "Файл" : `Файлы (${files})`;
  return `Вложения (${attachments.length})`;
}

export type { ChatMessageAttachment };
