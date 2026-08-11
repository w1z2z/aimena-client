import type { ProfileDealTypeFilter } from "./ProfileSortControl";

export type MockDealStatus = Exclude<ProfileDealTypeFilter, "all">;

export type MockDeal = {
  id: string;
  status: MockDealStatus;
  date: string;
  /** ISO for sorting */
  dateIso: string;
  given: { title: string; imageUrl: string };
  received: { title: string; imageUrl: string };
  partner: {
    name: string;
    avatarUrl: string | null;
    avatarInitial: string;
    points: number;
  };
  canLeaveReview: boolean;
  highlighted: boolean;
};

export type MockReview = {
  id: string;
  date: string;
  dateIso: string;
  text: string;
  author: {
    name: string;
    avatarUrl: string | null;
    avatarInitial: string;
    points: number;
  };
};

const GAVE = "/profile/deal-gave.png";
const GOT = "/profile/deal-got.png";

const AVATARS = [
  "https://i.pravatar.cc/88?img=12",
  "https://i.pravatar.cc/88?img=32",
  "https://i.pravatar.cc/88?img=47",
  "https://i.pravatar.cc/88?img=5",
  "https://i.pravatar.cc/88?img=68",
  null,
  "https://i.pravatar.cc/88?img=15",
  "https://i.pravatar.cc/88?img=25",
  null,
  "https://i.pravatar.cc/88?img=41",
] as const;

const PARTNER_NAMES = [
  "Иван Перов",
  "Анна Смирнова",
  "Дмитрий Козлов",
  "Мария Орлова",
  "Алексей Волков",
  "Елена Новикова",
  "Павел Соколов",
  "Ольга Морозова",
  "Никита Белов",
  "София Крылова",
] as const;

export const MOCK_DEALS: MockDeal[] = [
  {
    id: "deal-1",
    status: "successful",
    date: "21.06.2026",
    dateIso: "2026-06-21",
    given: { title: 'MacBook 14"', imageUrl: GAVE },
    received: { title: "iPhone 17 Pro, Apple watch", imageUrl: GOT },
    partner: {
      name: PARTNER_NAMES[0],
      avatarUrl: AVATARS[0],
      avatarInitial: "И",
      points: 27777,
    },
    canLeaveReview: true,
    highlighted: false,
  },
  {
    id: "deal-2",
    status: "in_progress",
    date: "18.06.2026",
    dateIso: "2026-06-18",
    given: { title: "PlayStation 5", imageUrl: GAVE },
    received: { title: "Xbox Series X + Game Pass", imageUrl: GOT },
    partner: {
      name: PARTNER_NAMES[1],
      avatarUrl: AVATARS[1],
      avatarInitial: "А",
      points: 1540,
    },
    canLeaveReview: false,
    highlighted: false,
  },
  {
    id: "deal-3",
    status: "cancelled",
    date: "12.06.2026",
    dateIso: "2026-06-12",
    given: { title: "Велосипед Trek FX 3", imageUrl: GAVE },
    received: { title: "Самокат Xiaomi Pro 2", imageUrl: GOT },
    partner: {
      name: PARTNER_NAMES[2],
      avatarUrl: AVATARS[2],
      avatarInitial: "Д",
      points: 320,
    },
    canLeaveReview: false,
    highlighted: false,
  },
  {
    id: "deal-4",
    status: "successful",
    date: "05.06.2026",
    dateIso: "2026-06-05",
    given: { title: "Кофемашина DeLonghi", imageUrl: GAVE },
    received: { title: "Робот-пылесос Roborock", imageUrl: GOT },
    partner: {
      name: PARTNER_NAMES[3],
      avatarUrl: AVATARS[3],
      avatarInitial: "М",
      points: 8900,
    },
    canLeaveReview: false,
    highlighted: false,
  },
  {
    id: "deal-5",
    status: "in_progress",
    date: "01.06.2026",
    dateIso: "2026-06-01",
    given: { title: "Гитара Fender Stratocaster", imageUrl: GAVE },
    received: { title: "Синтезатор Yamaha PSR", imageUrl: GOT },
    partner: {
      name: PARTNER_NAMES[4],
      avatarUrl: AVATARS[4],
      avatarInitial: "А",
      points: 412,
    },
    canLeaveReview: false,
    highlighted: false,
  },
  {
    id: "deal-6",
    status: "successful",
    date: "28.05.2026",
    dateIso: "2026-05-28",
    given: { title: "iPad Air 5", imageUrl: GAVE },
    received: { title: "Kindle Paperwhite + чехол", imageUrl: GOT },
    partner: {
      name: PARTNER_NAMES[5],
      avatarUrl: AVATARS[5],
      avatarInitial: "Е",
      points: 56,
    },
    canLeaveReview: true,
    highlighted: false,
  },
  {
    id: "deal-7",
    status: "cancelled",
    date: "20.05.2026",
    dateIso: "2026-05-20",
    given: { title: "Куртка The North Face", imageUrl: GAVE },
    received: { title: "Кроссовки Nike Pegasus", imageUrl: GOT },
    partner: {
      name: PARTNER_NAMES[6],
      avatarUrl: AVATARS[6],
      avatarInitial: "П",
      points: 2100,
    },
    canLeaveReview: false,
    highlighted: false,
  },
  {
    id: "deal-8",
    status: "successful",
    date: "14.05.2026",
    dateIso: "2026-05-14",
    given: { title: "Монитор Dell 27\" 4K", imageUrl: GAVE },
    received: { title: "Клавиатура Keychron Q1", imageUrl: GOT },
    partner: {
      name: PARTNER_NAMES[7],
      avatarUrl: AVATARS[7],
      avatarInitial: "О",
      points: 998,
    },
    canLeaveReview: false,
    highlighted: false,
  },
  {
    id: "deal-9",
    status: "in_progress",
    date: "09.05.2026",
    dateIso: "2026-05-09",
    given: { title: "Дрель Bosch Professional", imageUrl: GAVE },
    received: { title: "Набор инструментов Makita", imageUrl: GOT },
    partner: {
      name: PARTNER_NAMES[8],
      avatarUrl: AVATARS[8],
      avatarInitial: "Н",
      points: 77,
    },
    canLeaveReview: false,
    highlighted: false,
  },
  {
    id: "deal-10",
    status: "successful",
    date: "02.05.2026",
    dateIso: "2026-05-02",
    given: { title: "LEGO Technic Porsche", imageUrl: GAVE },
    received: { title: "Конструктор LEGO Icons", imageUrl: GOT },
    partner: {
      name: PARTNER_NAMES[9],
      avatarUrl: AVATARS[9],
      avatarInitial: "С",
      points: 13450,
    },
    canLeaveReview: false,
    highlighted: false,
  },
];

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: "review-1",
    date: "21.06.2026",
    dateIso: "2026-06-21",
    text: "Обмен прошёл идеально: товар как в описании, человек пунктуальный и вежливый. Рекомендую!",
    author: {
      name: PARTNER_NAMES[0],
      avatarUrl: AVATARS[0],
      avatarInitial: "И",
      points: 27777,
    },
  },
  {
    id: "review-2",
    date: "18.06.2026",
    dateIso: "2026-06-18",
    text: "Быстро договорились, всё честно. Немного задержались с встречей, но предупредили заранее.",
    author: {
      name: PARTNER_NAMES[1],
      avatarUrl: AVATARS[1],
      avatarInitial: "А",
      points: 1540,
    },
  },
  {
    id: "review-3",
    date: "12.06.2026",
    dateIso: "2026-06-12",
    text: "Отличный опыт. Вещь в лучшем состоянии, чем ожидал. Обязательно обменяюсь ещё.",
    author: {
      name: PARTNER_NAMES[2],
      avatarUrl: AVATARS[2],
      avatarInitial: "Д",
      points: 320,
    },
  },
  {
    id: "review-4",
    date: "05.06.2026",
    dateIso: "2026-06-05",
    text: "Комфортное общение, без лишних вопросов. Передача заняла минут пятнадцать.",
    author: {
      name: PARTNER_NAMES[3],
      avatarUrl: AVATARS[3],
      avatarInitial: "М",
      points: 8900,
    },
  },
  {
    id: "review-5",
    date: "01.06.2026",
    dateIso: "2026-06-01",
    text: "Честный обмен. Документы и зарядка в комплекте, как и обещали в чате.",
    author: {
      name: PARTNER_NAMES[4],
      avatarUrl: AVATARS[4],
      avatarInitial: "А",
      points: 412,
    },
  },
  {
    id: "review-6",
    date: "28.05.2026",
    dateIso: "2026-05-28",
    text: "Супер! Приятно иметь дело с адекватными людьми. Платформа реально экономит нервы.",
    author: {
      name: PARTNER_NAMES[5],
      avatarUrl: AVATARS[5],
      avatarInitial: "Е",
      points: 56,
    },
  },
  {
    id: "review-7",
    date: "20.05.2026",
    dateIso: "2026-05-20",
    text: "Всё по делу. Фото соответствовали, встретились в удобном месте рядом с метро.",
    author: {
      name: PARTNER_NAMES[6],
      avatarUrl: AVATARS[6],
      avatarInitial: "П",
      points: 2100,
    },
  },
  {
    id: "review-8",
    date: "14.05.2026",
    dateIso: "2026-05-14",
    text: "Сделка закрылась за день. Спасибо за аккуратную упаковку и подробные ответы.",
    author: {
      name: PARTNER_NAMES[7],
      avatarUrl: AVATARS[7],
      avatarInitial: "О",
      points: 998,
    },
  },
  {
    id: "review-9",
    date: "09.05.2026",
    dateIso: "2026-05-09",
    text: "Нормальный обмен, без сюрпризов. Буду смотреть другие объявления этого профиля.",
    author: {
      name: PARTNER_NAMES[8],
      avatarUrl: AVATARS[8],
      avatarInitial: "Н",
      points: 77,
    },
  },
  {
    id: "review-10",
    date: "02.05.2026",
    dateIso: "2026-05-02",
    text: "Очень доволен результатом. Всё чисто, быстро и по-человечески. 10/10.",
    author: {
      name: PARTNER_NAMES[9],
      avatarUrl: AVATARS[9],
      avatarInitial: "С",
      points: 13450,
    },
  },
];

export function filterMockDeals(
  deals: MockDeal[],
  typeFilter: ProfileDealTypeFilter,
  sort: "newest" | "oldest",
): MockDeal[] {
  const filtered =
    typeFilter === "all" ? deals : deals.filter((deal) => deal.status === typeFilter);
  const direction = sort === "oldest" ? 1 : -1;
  return [...filtered].sort(
    (a, b) => direction * (Date.parse(a.dateIso) - Date.parse(b.dateIso)),
  );
}
