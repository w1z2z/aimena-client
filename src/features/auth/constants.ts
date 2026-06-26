export const cityOptions = ["Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Краснодар"];

export const onboardingCategories = [
  "Транспорт",
  "Недвижимость",
  "Электроника",
  "Одежда",
  "Для дома и дачи",
  "Детские товары",
  "Животные",
  "Хобби и отдых",
  "Услуги",
  "Продукты питания",
] as const;

export type OnboardingCategory = (typeof onboardingCategories)[number];
