"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/features/auth";
import {
  connectChatSocket,
  onChatInboxUpdated,
  onChatThreadUpdated,
} from "@/shared/api/chat-socket";
import { getChats, type ChatSummary } from "@/shared/api/chats";

import { computeHasUnread } from "./utils";

type ChatInboxContextValue = {
  hasUnread: boolean;
  refreshUnread: () => Promise<void>;
};

const ChatInboxContext = createContext<ChatInboxContextValue | null>(null);

export function ChatInboxProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setHasUnread(false);
      return;
    }

    try {
      const response = await getChats();
      setHasUnread(computeHasUnread(response.data));
    } catch {
      // Keep the previous unread state if the request fails.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasUnread(false);
      return;
    }

    void connectChatSocket();
    void refreshUnread();

    const unsubscribeThread = onChatThreadUpdated((event) => {
      if (typeof event.unreadCount === "number") {
        if (event.unreadCount > 0) {
          setHasUnread(true);
        } else {
          void refreshUnread();
        }
        return;
      }
      void refreshUnread();
    });

    const unsubscribeInbox = onChatInboxUpdated(() => {
      void refreshUnread();
    });

    return () => {
      unsubscribeThread();
      unsubscribeInbox();
    };
  }, [isAuthenticated, refreshUnread]);

  const value = useMemo<ChatInboxContextValue>(
    () => ({
      hasUnread,
      refreshUnread,
    }),
    [hasUnread, refreshUnread],
  );

  return <ChatInboxContext.Provider value={value}>{children}</ChatInboxContext.Provider>;
}

export function useChatInbox() {
  const context = useContext(ChatInboxContext);
  if (!context) {
    throw new Error("useChatInbox must be used within ChatInboxProvider");
  }
  return context;
}

export type { ChatSummary };
