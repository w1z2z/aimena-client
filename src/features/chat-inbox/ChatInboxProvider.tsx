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
import { getChatInboxStatus, type ChatSummary } from "@/shared/api/chats";

type ChatInboxContextValue = {
  hasUnreadNotifications: boolean;
  hasUnreadConversations: boolean;
  refreshUnread: () => Promise<void>;
};

const ChatInboxContext = createContext<ChatInboxContextValue | null>(null);

export function ChatInboxProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [hasUnreadConversations, setHasUnreadConversations] = useState(false);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setHasUnreadNotifications(false);
      setHasUnreadConversations(false);
      return;
    }

    try {
      const status = await getChatInboxStatus();
      setHasUnreadNotifications(status.hasUnreadNotifications);
      setHasUnreadConversations(status.hasUnreadConversations);
    } catch {
      // Keep the previous unread state if the request fails.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasUnreadNotifications(false);
      setHasUnreadConversations(false);
      return;
    }

    void connectChatSocket();
    void refreshUnread();

    const unsubscribeThread = onChatThreadUpdated((event) => {
      if (typeof event.unreadCount === "number") {
        if (event.unreadCount > 0) {
          setHasUnreadConversations(true);
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
      hasUnreadNotifications,
      hasUnreadConversations,
      refreshUnread,
    }),
    [hasUnreadNotifications, hasUnreadConversations, refreshUnread],
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
