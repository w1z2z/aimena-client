export type RegistrationPromptReason =
  | "create-listing"
  | "favorites"
  | "chat"
  | "propose-exchange"
  | "report-listing";

export const registrationPromptCopy: Record<
  RegistrationPromptReason,
  { subtitle: string }
> = {
  "create-listing": {
    subtitle: "Авторизуйтесь, чтобы создавать объявления",
  },
  favorites: {
    subtitle: "Авторизуйтесь, чтобы добавлять в избранное",
  },
  chat: {
    subtitle: "Авторизуйтесь, чтобы общаться с людьми",
  },
  "propose-exchange": {
    subtitle: "Авторизуйтесь, чтобы предложить обмен",
  },
  "report-listing": {
    subtitle: "Авторизуйтесь, чтобы пожаловаться на объявление",
  },
};
