import type { ApiCity } from "@/shared/api/catalog";
import type { SelectOption } from "@/shared/ui/select-field";

type BuildCitySelectOptionsParams = {
  featured: ApiCity[];
  cities: ApiCity[];
  mapCityToOption: (city: ApiCity) => SelectOption;
};

export function buildCitySelectOptions({
  featured,
  cities,
  mapCityToOption,
}: BuildCitySelectOptionsParams): SelectOption[] {
  const options: SelectOption[] = [];
  const seen = new Set<string>();

  if (featured.length > 0) {
    options.push({
      value: "__featured_cities_group__",
      label: "Популярные города",
      disabled: true,
    });

    for (const city of featured) {
      if (seen.has(city.id)) continue;
      seen.add(city.id);
      options.push(mapCityToOption(city));
    }
  }

  const otherCities = cities.filter((city) => !seen.has(city.id));
  if (otherCities.length > 0) {
    options.push({
      value: "__all_cities_group__",
      label: "Все города",
      disabled: true,
    });

    for (const city of otherCities) {
      seen.add(city.id);
      options.push(mapCityToOption(city));
    }
  }

  return options;
}
