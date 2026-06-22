import type { StaticImageData } from "next/image";

import allIcon from "./all.svg";
import animalsIcon from "./animals.svg";
import clothesIcon from "./clothes.svg";
import collectionIcon from "./collection.svg";
import electronicsIcon from "./electronics.svg";
import freeIcon from "./free.svg";
import hobbyIcon from "./hobby.svg";
import homeIcon from "./home.svg";
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
  | "transport";

export type CategoryItem = {
  id: CategoryId;
  label: string;
  icon: StaticImageData;
};

export function getCategoryIconSrc(icon: StaticImageData) {
  return icon.src;
}

export const categoryItems: CategoryItem[] = [
  { id: "collection", label: "Коллекция", icon: collectionIcon },
  { id: "animals", label: "Животные", icon: animalsIcon },
  { id: "free", label: "Даром", icon: freeIcon },
  { id: "electronics", label: "Электроника", icon: electronicsIcon },
  { id: "all", label: "ВСЕ", icon: allIcon },
  { id: "clothes", label: "Одежда", icon: clothesIcon },
  { id: "home", label: "Для дома", icon: homeIcon },
  { id: "hobby", label: "Хобби", icon: hobbyIcon },
  { id: "transport", label: "Транспорт", icon: transportIcon },
];
