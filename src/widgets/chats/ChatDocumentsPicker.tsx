"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { AttachableListingDocuments } from "@/shared/api/chats";

type Props = {
  listings: AttachableListingDocuments[];
  loading?: boolean;
  busy?: boolean;
  onClose: () => void;
  onSend: (listingDocumentIds: string[]) => void;
};

export function ChatDocumentsPicker({
  listings,
  loading,
  busy,
  onClose,
  onSend,
}: Props) {
  const allIds = useMemo(
    () => listings.flatMap((listing) => listing.documents.map((doc) => doc.listingImageId)),
    [listings],
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set(allIds));

  useEffect(() => {
    setSelected(new Set(allIds));
  }, [allIds]);

  useEffect(() => {
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
  }, [busy, onClose]);

  if (typeof document === "undefined") return null;

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
      className="chats-docs-picker"
      role="dialog"
      aria-modal="true"
      aria-label="Прикрепить документы"
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="chats-docs-picker__backdrop"
        aria-label="Закрыть"
        onClick={onClose}
        disabled={busy}
      />
      <div className="chats-docs-picker__panel">
        <div className="chats-docs-picker__header">
          <h3>Прикрепить документы</h3>
          <button type="button" onClick={onClose} aria-label="Закрыть" disabled={busy}>
            ×
          </button>
        </div>

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
                <h4>{listing.title}</h4>
                <ul>
                  {listing.documents.map((doc) => {
                    const checked = selected.has(doc.listingImageId);
                    return (
                      <li key={doc.listingImageId}>
                        <label className="chats-docs-picker__item">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(doc.listingImageId)}
                          />
                          {doc.mime.startsWith("image/") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={doc.thumbUrl || doc.url} alt="" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src="/images/chat/document-upload.svg" alt="" />
                          )}
                          <span>{doc.fileName}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="chats-docs-picker__actions">
          <button type="button" className="chats-docs-picker__cancel" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button
            type="button"
            className="chats-docs-picker__send"
            disabled={busy || loading || selected.size === 0}
            onClick={() => onSend([...selected])}
          >
            {busy ? "Отправка…" : `Отправить (${selected.size})`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
