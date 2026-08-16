"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { AttachableListingDocuments } from "@/shared/api/chats";
import { ListingActionStarIcon } from "@/shared/ui/icons";

const TRANSITION_MS = 320;

type Props = {
  open: boolean;
  listings: AttachableListingDocuments[];
  loading?: boolean;
  busy?: boolean;
  onClose: () => void;
  onSend: (listingDocumentIds: string[]) => void;
};

function documentKindLabel(mime: string) {
  if (mime === "application/pdf") return "PDF";
  if (mime === "image/jpeg") return "JPG";
  if (mime === "image/png") return "PNG";
  if (mime === "image/webp") return "WEBP";
  if (mime.startsWith("image/")) return "Изображение";
  return "Файл";
}

export function ChatDocumentsPicker({
  open,
  listings,
  loading,
  busy,
  onClose,
  onSend,
}: Props) {
  const titleId = useId();
  const allIds = useMemo(
    () => listings.flatMap((listing) => listing.documents.map((doc) => doc.listingImageId)),
    [listings],
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set(allIds));
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setSelected(new Set(allIds));
  }, [allIds]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frameId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true));
      });
      return () => window.cancelAnimationFrame(frameId);
    }
    setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!mounted || open) return;
    const timer = window.setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [mounted, open]);

  useEffect(() => {
    if (!mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, mounted, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return createPortal(
    <div
      className={`listing-action-modal${visible ? " is-visible" : ""}`}
      role="presentation"
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        className="listing-action-modal__card listing-action-modal__card--deal chats-docs-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <ListingActionStarIcon className="listing-action-modal__icon" />
        <h2 id={titleId} className="listing-action-modal__title">
          Прикрепить документы
        </h2>
        <p className="listing-action-modal__description">
          Выберите документы своих объявлений в этом обмене.
        </p>

        {loading ? (
          <p className="chats-docs-picker__empty">Загружаем документы…</p>
        ) : listings.length === 0 ? (
          <p className="chats-docs-picker__empty">
            У ваших объявлений в этом обмене нет документов.
          </p>
        ) : (
          <div className="chats-docs-picker__list">
            {listings.map((listing) => (
              <section key={listing.listingId} className="chats-docs-picker__group">
                <h3>{listing.title}</h3>
                <ul>
                  {listing.documents.map((doc) => {
                    const checked = selected.has(doc.listingImageId);
                    const isImage = doc.mime.startsWith("image/");
                    return (
                      <li key={doc.listingImageId}>
                        <button
                          type="button"
                          className={`chats-docs-picker__item${checked ? " is-selected" : ""}`}
                          role="checkbox"
                          aria-checked={checked}
                          disabled={busy}
                          onClick={() => toggle(doc.listingImageId)}
                        >
                          <span className="chats-docs-picker__check" aria-hidden />
                          {isImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={doc.thumbUrl || doc.url} alt="" />
                          ) : (
                            <span className="chats-docs-picker__file-icon" aria-hidden>
                              PDF
                            </span>
                          )}
                          <span className="chats-docs-picker__meta">
                            <span className="chats-docs-picker__name">{doc.fileName}</span>
                            <span className="chats-docs-picker__kind">{documentKindLabel(doc.mime)}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="listing-action-modal__actions listing-action-modal__actions--deal">
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--primary"
            disabled={busy || loading || selected.size === 0}
            onClick={() => onSend([...selected])}
          >
            {busy ? "Отправка…" : selected.size > 0 ? `Отправить (${selected.size})` : "Отправить"}
          </button>
          <button
            type="button"
            className="listing-action-modal__btn listing-action-modal__btn--secondary"
            disabled={busy}
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
