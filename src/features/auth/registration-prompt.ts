export type RegistrationPromptReason =
  | "create-listing"
  | "favorites"
  | "chat"
  | "propose-exchange"
  | "report-listing"
  | "report-user";

export const registrationPromptCopy: Record<
  RegistrationPromptReason,
  { subtitle: string }
> = {
  "create-listing": {
    subtitle: "Авторизуйтесь, чтобы создать объявление",
  },
  favorites: {
    subtitle: "Авторизуйтесь, чтобы добавлять в избранное",
  },
  chat: {
    subtitle: "Авторизуйтесь, чтобы начать общение",
  },
  "propose-exchange": {
    subtitle: "Авторизуйтесь, чтобы предложить обмен",
  },
  "report-listing": {
    subtitle: "Авторизуйтесь, чтобы пожаловаться на объявление",
  },
  "report-user": {
    subtitle: "Авторизуйтесь, чтобы пожаловаться на пользователя",
  },
};
