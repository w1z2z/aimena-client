import { ApiError } from "@/shared/api/http";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Email is already registered": "Этот email уже зарегистрирован",
  "Invalid credentials": "Неверный email или пароль",
  Unauthorized: "Неверный email или пароль",
  "Email is not verified": "Сначала подтвердите почту",
  "Could not create user": "Не удалось создать аккаунт. Попробуйте позже",
  "Invalid or expired verify token": "Ссылка подтверждения недействительна или устарела",
  "Please wait before requesting another email":
    "Подождите около минуты перед повторной отправкой",
  "email must be an email": "Введите корректный email",
  "password must be longer than or equal to 8 characters":
    "Пароль должен быть не короче 8 символов",
  "password must be a string": "Введите пароль",
};

function translateRawMessage(message: string): string {
  const exact = AUTH_ERROR_MESSAGES[message];
  if (exact) return exact;

  const normalized = message.trim();
  for (const [english, russian] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (normalized.toLowerCase() === english.toLowerCase()) {
      return russian;
    }
  }

  // class-validator sometimes returns arrays joined oddly — match by fragment
  if (/must be an email/i.test(normalized)) return AUTH_ERROR_MESSAGES["email must be an email"];
  if (/longer than or equal to 8/i.test(normalized)) {
    return AUTH_ERROR_MESSAGES["password must be longer than or equal to 8 characters"];
  }

  // Already Russian or unknown — show as-is only if looks Cyrillic, else fallback
  if (/[а-яё]/i.test(normalized)) return normalized;
  return "";
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  const translated = translateRawMessage(error.message);
  return translated || fallback;
}
