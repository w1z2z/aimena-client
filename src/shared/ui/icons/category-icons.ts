import type { StaticImageData } from "next/image";

import allIcon from "./all.svg";
import animalsIcon from "./animals.svg";
import clothesIcon from "./clothes.svg";
import collectionIcon from "./collection.svg";
import electronicsIcon from "./electronics.svg";
import freeIcon from "./free.svg";
import hobbyIcon from "./hobby.svg";
import homeIcon from "./home.svg";
import categoryPlaceholderIcon from "./category-placeholder.svg";
import transportIcon from "./transport.svg";

export type CategoryId =
  | "collection"
  | "animals"
  | "free"
  | "electronics"
  | "all"
  | "clothes"
  | "home"
  | "hobby"
  | "transport"
  | "kids"
  | "services"
  | "food"
  | "real-estate";

export type CategoryItem = {
  id: CategoryId;
  label: string;
  icon: StaticImageData;
};

export function getCategoryIconSrc(icon: StaticImageData) {
  return icon.src;
}

export const categoryPlaceholderIconSrc = getCategoryIconSrc(categoryPlaceholderIcon);

/** Fallback icons for home-arc; missing artwork uses placeholder. */
export const categoryItems: CategoryItem[] = [
  { id: "all", label: "Все", icon: allIcon },
  { id: "clothes", label: "Одежда", icon: clothesIcon },
  { id: "home", label: "Для дома", icon: homeIcon },
  { id: "hobby", label: "Хобби", icon: hobbyIcon },
  { id: "transport", label: "Транспорт", icon: transportIcon },
  { id: "real-estate", label: "Недвижимость", icon: categoryPlaceholderIcon },
  { id: "services", label: "Услуги", icon: categoryPlaceholderIcon },
  { id: "food", label: "Продукты", icon: categoryPlaceholderIcon },
  { id: "animals", label: "Животные", icon: animalsIcon },
  { id: "kids", label: "Детям", icon: categoryPlaceholderIcon },
  { id: "collection", label: "Коллекция", icon: collectionIcon },
  { id: "free", label: "Даром", icon: freeIcon },
  { id: "electronics", label: "Электроника", icon: electronicsIcon },
];
