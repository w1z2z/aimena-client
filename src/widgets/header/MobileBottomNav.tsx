"use client";

import { usePathname, useRouter } from "next/navigation";

import { useAuth, useAuthGate } from "@/features/auth";
import { useChatInbox } from "@/features/chat-inbox";
import { ChatBubbleIcon, HeartIcon, LoginIcon, SearchIcon } from "@/shared/ui/icons";

type MobileBottomNavProps = {
  searchActive?: boolean;
  onSearchClick: () => void;
  onProfileClick: () => void;
};

function CreateIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
      width={18}
      height={18}
    >
      <path d="M8 2.5V13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2.5 8H13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MobileBottomNav({
  searchActive = false,
  onSearchClick,
  onProfileClick,
}: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { hasUnreadConversations } = useChatInbox();
  const { guardAuth } = useAuthGate();

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  const favoritesActive = pathname.startsWith("/favorites");
  const chatsActive = pathname.startsWith("/chats");
  const createActive = pathname.startsWith("/create-listing");
  const profileActive =
    pathname.startsWith("/profile") || pathname.startsWith("/users/");

  const handleFavorites = () => {
    guardAuth("favorites", () => {
      router.push("/favorites");
    });
  };

  const handleChats = () => {
    guardAuth("chat", () => {
      router.push("/chats");
    });
  };

  const handleCreate = () => {
    guardAuth("create-listing", () => {
      router.push("/create-listing");
    });
  };

  const handleProfile = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    onProfileClick();
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Основная навигация">
      <div className="mobile-bottom-nav__inner">
        <button
          type="button"
          className={`mobile-bottom-nav__item${searchActive ? " is-active" : ""}`}
          aria-label="Поиск"
          aria-pressed={searchActive}
          onClick={onSearchClick}
        >
          <SearchIcon />
          <span className="mobile-bottom-nav__label">Поиск</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-nav__item${favoritesActive ? " is-active" : ""}`}
          aria-label="Избранное"
          aria-current={favoritesActive ? "page" : undefined}
          onClick={handleFavorites}
        >
          <HeartIcon className="h-[16px] w-[18px]" />
          <span className="mobile-bottom-nav__label">Избранное</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-nav__item mobile-bottom-nav__item--create${createActive ? " is-active" : ""}`}
          aria-label="Разместить объявление"
          aria-current={createActive ? "page" : undefined}
          onClick={handleCreate}
        >
          <span className="mobile-bottom-nav__create">
            <CreateIcon />
          </span>
          <span className="mobile-bottom-nav__label">Разместить</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-nav__item${chatsActive ? " is-active" : ""}`}
          aria-label="Чаты"
          aria-current={chatsActive ? "page" : undefined}
          onClick={handleChats}
        >
          <span className="mobile-bottom-nav__icon-wrap">
            <ChatBubbleIcon className="h-[18px] w-[18px]" />
            {hasUnreadConversations ? (
              <span aria-hidden className="unread-dot unread-dot--nav" />
            ) : null}
          </span>
          <span className="mobile-bottom-nav__label">Чаты</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-nav__item${profileActive ? " is-active" : ""}`}
          aria-label={isAuthenticated ? "Профиль" : "Войти"}
          aria-current={profileActive ? "page" : undefined}
          onClick={handleProfile}
        >
          {isAuthenticated && user ? (
            <span
              className="mobile-bottom-nav__avatar"
              style={{
                background:
                  "linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(90deg, #8E8BED 0%, #c8ff02 100%) border-box",
              }}
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                user.avatarInitial
              )}
            </span>
          ) : (
            <span className="mobile-bottom-nav__login-icon">
              <LoginIcon className="h-[16px] w-[16px]" />
            </span>
          )}
          <span className="mobile-bottom-nav__label">
            {isAuthenticated ? "Профиль" : "Войти"}
          </span>
        </button>
      </div>
    </nav>
  );
}
