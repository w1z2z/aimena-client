export const AUTH_USER_STORAGE_KEY = "swaply-auth-user";
export const AUTH_ACCESS_TOKEN_STORAGE_KEY = "swaply-auth-access-token";
export const ONBOARDING_CATEGORIES_STORAGE_KEY = "swaply-onboarding-categories";

/** Routes where mobile bottom nav must stay hidden (login / register / password / onboarding). */
const AUTH_FLOW_PATH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/change-password",
  "/verify-email",
  "/onboarding",
] as const;

export function isAuthFlowPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return AUTH_FLOW_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
