import type { StaticImageData } from "next/image";

import allIcon from "./все.svg";
import animalsIcon from "./животные.svg";
import clothesIcon from "./одежда.svg";
import collectionIcon from "./коллекция.svg";
import electronicsIcon from "./электроника.svg";
import freeIcon from "./даром.svg";
import hobbyIcon from "./хобби.svg";
import homeIcon from "./для дома.svg";
import transportIcon from "./транспорт.svg";

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
