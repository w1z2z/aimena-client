"use client";

import { io, type Socket } from "socket.io-client";

import {
  ACCESS_TOKEN_CHANGED_EVENT,
  ensureFreshAccessToken,
  getStoredAccessToken,
} from "./http";
import type { ChatMessage } from "./chats";
import type { DealView } from "./deals";

export type ChatSocketMessageEvent = {
  threadId: string;
  message: ChatMessage;
};

export type ChatSocketThreadUpdatedEvent = {
  threadId: string;
  preview?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  lastReadAt?: string;
};

export type ChatSocketInboxUpdatedEvent = {
  itemId: string;
  kind: "offer" | "chat" | "support";
  preview?: string;
  updatedAt?: string;
  unreadCount?: number;
};

export type ChatSocketDealUpdatedEvent = {
  threadId: string;
  action: string;
  deal: DealView;
};

const SOCKET_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "") ??
  "http://localhost:9000";

let socket: Socket | null = null;
let tokenListenerAttached = false;
let connectPromise: Promise<Socket | null> | null = null;

const messageHandlers = new Set<(event: ChatSocketMessageEvent) => void>();
const threadUpdatedHandlers = new Set<(event: ChatSocketThreadUpdatedEvent) => void>();
const inboxUpdatedHandlers = new Set<(event: ChatSocketInboxUpdatedEvent) => void>();
const dealUpdatedHandlers = new Set<(event: ChatSocketDealUpdatedEvent) => void>();

function attachSocketHandlers(next: Socket) {
  next.off("message");
  next.off("thread_updated");
  next.off("inbox_updated");
  next.off("deal_updated");
  next.on("message", (event: ChatSocketMessageEvent) => {
    for (const handler of messageHandlers) handler(event);
  });
  next.on("thread_updated", (event: ChatSocketThreadUpdatedEvent) => {
    for (const handler of threadUpdatedHandlers) handler(event);
  });
  next.on("inbox_updated", (event: ChatSocketInboxUpdatedEvent) => {
    for (const handler of inboxUpdatedHandlers) handler(event);
  });
  next.on("deal_updated", (event: ChatSocketDealUpdatedEvent) => {
    for (const handler of dealUpdatedHandlers) handler(event);
  });
}

function attachTokenListener() {
  if (typeof window === "undefined" || tokenListenerAttached) return;
  tokenListenerAttached = true;

  window.addEventListener(ACCESS_TOKEN_CHANGED_EVENT, ((event: Event) => {
    const detail = (event as CustomEvent<{ accessToken: string | null }>).detail;
    const nextToken = detail?.accessToken ?? null;
    if (!nextToken) {
      disconnectChatSocket();
      return;
    }
    void connectChatSocket(nextToken);
  }) as EventListener);
}

export async function connectChatSocket(accessToken?: string | null) {
  if (typeof window === "undefined") return null;
  attachTokenListener();

  if (connectPromise && !accessToken) {
    return connectPromise;
  }

  connectPromise = (async () => {
    const token =
      accessToken ?? (await ensureFreshAccessToken().catch(() => getStoredAccessToken()));
    if (!token) {
      disconnectChatSocket();
      return null;
    }

    if (socket?.connected) {
      socket.auth = { token };
      return socket;
    }

    if (socket) {
      socket.auth = { token };
      attachSocketHandlers(socket);
      socket.connect();
      return socket;
    }

    socket = io(`${SOCKET_ORIGIN}/chat`, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      auth: { token },
    });
    attachSocketHandlers(socket);
    return socket;
  })();

  try {
    return await connectPromise;
  } finally {
    connectPromise = null;
  }
}

export function getChatSocket() {
  return socket;
}

export function disconnectChatSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  connectPromise = null;
}

export function joinChatThread(threadId: string) {
  socket?.emit("join_thread", { threadId });
}

export function leaveChatThread(threadId: string) {
  socket?.emit("leave_thread", { threadId });
}

export function markChatThreadRead(threadId: string) {
  socket?.emit("read", { threadId });
}

export function sendChatSocketMessage(
  threadId: string,
  payload: {
    body?: string;
    chatUploadIds?: string[];
    chatFileNames?: string[];
    listingDocumentIds?: string[];
  },
) {
  return new Promise<ChatMessage>((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error("Chat socket is not connected"));
      return;
    }

    socket
      .timeout(10_000)
      .emit(
        "message",
        { threadId, ...payload },
        (error: Error | null, response?: { ok?: boolean; message?: ChatMessage }) => {
          if (error) {
            reject(error);
            return;
          }
          if (!response?.ok || !response.message) {
            reject(new Error("Failed to send chat message"));
            return;
          }
          resolve(response.message);
        },
      );
  });
}

export function onChatMessage(handler: (event: ChatSocketMessageEvent) => void) {
  messageHandlers.add(handler);
  return () => {
    messageHandlers.delete(handler);
  };
}

export function onChatThreadUpdated(
  handler: (event: ChatSocketThreadUpdatedEvent) => void,
) {
  threadUpdatedHandlers.add(handler);
  return () => {
    threadUpdatedHandlers.delete(handler);
  };
}

export function onChatInboxUpdated(handler: (event: ChatSocketInboxUpdatedEvent) => void) {
  inboxUpdatedHandlers.add(handler);
  return () => {
    inboxUpdatedHandlers.delete(handler);
  };
}

export function onChatDealUpdated(handler: (event: ChatSocketDealUpdatedEvent) => void) {
  dealUpdatedHandlers.add(handler);
  return () => {
    dealUpdatedHandlers.delete(handler);
  };
}
