import type { CategoryId } from "@/shared/ui/icons/category-icons";
import type { ExchangeListingCardData } from "@/widgets/home-listings-grid/ExchangeListingCard";

export type MockListing = ExchangeListingCardData & {
  categoryId: CategoryId;
  hasDocuments: boolean;
  price: number;
};

const cities = ["Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Краснодар"] as const;

const titlesByCategory: Record<Exclude<CategoryId, "all">, string[]> = {
  electronics: [
    'MacBook Pro 14" M3',
    "iPhone 15 Pro",
    "Sony PlayStation 5",
    "Монитор 4K 27\"",
    "iPad Air M2",
  ],
  clothes: ["Куртка The North Face", "Кроссовки Nike Air", "Пальто шерстяное", "Джинсы Levi's"],
  transport: ["Велосипед Trek", "Самокат Ninebot", "Автокресло детское", "Зимняя резина R17"],
  home: ["Диван угловой", "Кофемашина DeLonghi", "Пылесос Dyson", "Микроволновка Samsung"],
  hobby: ["Гитара Fender", "Набор для рисования", "Гантели 20 кг", "Настольный теннис"],
  animals: ["Аквариум 200л", "Клетка для хомяка", "Переноска для кошки", "Автокормушка"],
  collection: ["Монеты СССР", "Виниловые пластинки", "Фигурки Funko", "Марки 80-х"],
  free: ["Книги художественные", "Детские игрушки", "Коробка посуды", "Садовый инвентарь"],
};

const wantPools = [
  ["Sony PlayStation 5", "Монитор 4K"],
  ["iPhone 14", "AirPods Pro"],
  ["Велосипед", "Кофемашина"],
  ["Диван", "Куртка зимняя"],
  ["Гитара", "Планшет"],
];

const conditions = ["Отличное", "Новое", "Хорошее", "Б.у", "Требует ремонта"] as const;

function buildCategoryListings(categoryId: Exclude<CategoryId, "all">, startId: number): MockListing[] {
  return titlesByCategory[categoryId].map((title, index) => {
    const wants = wantPools[(startId + index) % wantPools.length];
    return {
      id: startId + index,
      categoryId,
      title,
      city: cities[(startId + index) % cities.length],
      condition: conditions[(startId + index) % conditions.length],
      wants,
      wantsMore: (index % 3) + 2,
      hasDocuments: index % 2 === 0,
      price: 25_000 + (startId + index) * 11_500,
    };
  });
}

export const mockListings: MockListing[] = (
  Object.keys(titlesByCategory) as Array<Exclude<CategoryId, "all">>
).flatMap((categoryId, categoryIndex) => buildCategoryListings(categoryId, categoryIndex * 10 + 1));
