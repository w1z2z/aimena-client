/* eslint-disable @next/next/no-img-element */
import {
  ChatBubbleIcon,
  ChevronCircleIcon,
  FavoriteHeartIcon,
  FilterIcon,
  HeartCircleIcon,
  TagsIcon,
} from "@/shared/ui/icons";
import { Header } from "@/widgets/header/Header";

const imgHeroCard = "https://www.figma.com/api/mcp/asset/969f8ce3-cf1a-4ba7-8407-2667a3e7f752";
const imgFeedCard = "https://www.figma.com/api/mcp/asset/da84d96f-ef42-47be-ab49-014cea365952";

function ListingCard({ image, h = 511 }: { image: string; h?: number }) {
  return (
    <div className="w-[342px] rounded-[13px] bg-white py-[12px] shadow-[0px_5px_4.95px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-[29px] w-[318px] items-center justify-center rounded-[45px] border border-[#8E8BED] border-[0.5px] text-[18px] font-semibold leading-[1.2] text-[#1A1A1A]">
        MacBook Pro 14&quot; M3 Хо
      </div>

      <div className="relative mt-[12px] w-[342px] overflow-hidden" style={{ height: h - 169 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-full w-full object-cover" />

        <div className="absolute left-[299px] top-[153px] h-[35.523px] w-[35.523px]">
          <ChevronCircleIcon className="h-full w-full" />
        </div>

        <div className="absolute left-[7.77px] top-[153px] h-[35.523px] w-[35.523px]">
          <ChevronCircleIcon direction="left" className="h-full w-full" />
        </div>

        <button className="absolute right-[11px] top-[10px] h-[32px] w-[32px]">
          <HeartCircleIcon className="absolute inset-0 h-full w-full text-[#F2F4F7]" />
          <FavoriteHeartIcon className="absolute left-[9px] top-[10px] h-[11px] w-[13px] text-[#6A7282]" />
        </button>

        <div className="absolute bottom-[9px] left-[8px] flex gap-[6px]">
          <span className="rounded-[16.327px] border border-[#C8FF00] border-[0.3px] bg-white/70 px-[12px] py-[8px] text-[12px] leading-none text-[#1A1A1A]">
            Москва
          </span>
          <span className="rounded-[16.327px] border border-[#C8FF00] border-[0.3px] bg-white/70 px-[12px] py-[8px] text-[12px] leading-none text-[#1A1A1A]">
            Хорошее
          </span>
        </div>
      </div>

      <button className="mx-auto mt-[12px] h-[36px] w-[322px] rounded-[10px] bg-[#1A1A1A] text-[14px] font-semibold text-white">
        Быстрый обмен
      </button>

      <div className="mx-auto mt-[12px] flex min-h-[44px] w-[321px] flex-wrap items-center gap-[6px] rounded-[9px] border border-[#8E8BED] border-[0.3px] bg-[#F9F7FF] p-[8px]">
        <div className="flex h-[11px] w-[11px] items-center justify-center rotate-180">
          <TagsIcon className="h-[11px] w-[11px] text-[#8E8BED]" />
        </div>
        <span className="rounded-[39px] border border-[#8E8BED] border-[0.5px] bg-[#F2F4F7] p-[8px] text-[11px] font-semibold leading-[16px] text-[#1A1A1A]">
          Sony PlayStation 5
        </span>
        <span className="rounded-[39px] border border-[#8E8BED] border-[0.5px] bg-[#F2F4F7] p-[8px] text-[11px] font-semibold leading-[16px] text-[#1A1A1A]">
          Монитор 4K
        </span>
        <span className="text-[11px] font-normal leading-[16px] text-[#626262]">+5</span>
      </div>
    </div>
  );
}

export function HomeV13() {
  return (
    <div className="relative h-[3967px] w-screen overflow-x-hidden bg-[#F8F8F5] text-[#1A1A1A]">
      <div className="absolute left-1/2 top-0 h-[3967px] w-[1920px] -translate-x-1/2">
        <div className="absolute left-[239px] top-0 h-[3061px] w-[1441px]">
        <Header />

        <div className="absolute left-[-364px] top-[54px] h-[1065px] w-[2169px] rounded-[50px] bg-[#1A1A1A]">
          <div className="mx-auto h-full w-[1441px]">
            <div className="pt-[34px]">
              <div className="mx-auto flex w-[1100px] items-center justify-between text-center text-[11px] text-white/70">
                {[
                  "Коллекция",
                  "Животные",
                  "Даром",
                  "Электроника",
                  "ВСЕ",
                  "Одежда",
                  "Для дома",
                  "Недвижимость",
                  "Транспорт",
                  "Хобби",
                ].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>

            <div className="mt-[170px] flex items-center justify-between">
              <h1 className="w-[579px] text-[40px] font-bold leading-[40px] text-white">
                Обменивайтесь <span className="text-[#8E8BED]">без продаж</span> и лишних переговоров
              </h1>

              <div className="flex gap-[6px]">
                {["Я знаю", "Я не знаю", "Покажите"].map((t) => (
                  <button
                    key={t}
                    className="h-[48px] rounded-[16px] border border-white border-[0.5px] px-[24px] py-[12px] text-[14px] font-semibold text-white"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-[23px] grid w-[1027px] grid-cols-[560px_454px] gap-[17px]">
              <div className="h-[535px] rounded-[10px] border border-[#CACACA] border-[0.5px] bg-white p-[38px]">
                <h2 className="text-[24px] font-extrabold leading-[32px] text-[#3D3D3D]">Что хотите обменять?</h2>
                <p className="text-[12px] text-[#3D3D3D]">Можно ввести не все поля</p>

                <div className="mt-[20px]">
                  <p className="text-[14px] font-semibold text-[#3D3D3D]">Название</p>
                  <div className="mt-[10px] h-[48px] rounded-[10px] border border-[#CACACA] border-[0.5px] bg-[#F2F4F7] px-[12px] py-[14px] text-[14px] font-semibold text-[#3D3D3D]">
                    MacBook Pro 14&quot; M3 Хо
                  </div>
                </div>

                <div className="mt-[16px] grid grid-cols-[179px_204px] gap-[14px]">
                  <div>
                    <p className="text-[14px] font-semibold text-[#3D3D3D]">Примерная стоимость</p>
                    <div className="mt-[10px] h-[48px] rounded-[10px] border border-[#CACACA] border-[0.5px] bg-[#F2F4F7] px-[12px] py-[14px] text-[14px] font-semibold text-[#3D3D3D]">
                      ~89 000р
                    </div>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#3D3D3D]">Город</p>
                    <div className="mt-[10px] h-[48px] rounded-[10px] border border-[#CACACA] border-[0.5px] bg-[#F2F4F7] px-[12px] py-[14px] text-[14px] font-semibold text-[#3D3D3D]">
                      Москва
                    </div>
                  </div>
                </div>

                <div className="mt-[52px] h-[179px] rounded-[10px] bg-white pt-[34px]">
                  <p className="w-[343px] text-[14px] leading-[20px] text-[#3D3D3D]">
                    Вся информация сохранится для будущего создания объявления
                  </p>
                  <button className="mt-[14px] h-[36px] w-[250px] rounded-[10px] bg-[#8E8BED] text-[14px] font-semibold text-white">
                    + Добавить объявление
                  </button>
                </div>
              </div>

              <div className="relative h-[535px] rounded-[10px] bg-white">
                <h2 className="absolute left-[32px] top-[18px] text-[24px] font-extrabold leading-[32px] text-[#1A1A1A]">
                  Вам может подойти
                </h2>
                <div className="absolute left-[49px] top-[55px]">
                  <ListingCard image={imgHeroCard} h={463} />
                </div>
                <div className="absolute right-[45px] top-[50px] h-[456px] w-[10px] rounded-[10px] bg-[#505050]" />
                <div className="absolute right-[45px] top-[423px] h-[55px] w-[10px] rounded-[10px] bg-[#C8FF00]" />
              </div>

              <button className="absolute left-[448px] top-[259px] h-[163px] w-[163px] rounded-full border border-[#5E5E5E] border-[2px] bg-black text-[16px] font-bold leading-[20px] text-white">
                Подобрать обмен
              </button>
            </div>

            <h3 className="mt-[44px] text-center text-[24px] font-extrabold leading-[32px] text-white">
              Почему <span className="text-[#8E8BED]">Aimena</span>?
            </h3>

            <div className="mt-[12px] flex w-[2118px] items-center gap-[12px] overflow-hidden text-[14px] font-semibold text-white">
              {[
                "Сопровождение сделок до конца",
                "Обмен вместо продажи",
                "Вещи продолжают приносить пользу",
                "Никакого спама в личные сообщения",
                "Каждый получает нужное себе",
                "Показываем то, что вас заинтересует",
                "Сопровождение сделок до конца",
                "Обмен вместо продажи",
              ].map((t, i) => (
                <span key={i} className="rounded-[16.327px] px-[18px] py-[12px] whitespace-nowrap">
                  ⚡ {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute left-0 top-[1133px] h-[109px] w-[1441px] rounded-[20px] bg-[#C8FF00] p-[28px]">
          <h2 className="text-[24px] font-extrabold leading-[32px] text-[#1A1A1A]">Выгодный обмен без лишних слов</h2>
          <p className="text-[16px] font-normal leading-[24px] tracking-[1px] text-[#5A5A5A]">
            Добавьте свою вещь за 2 минуты и начните обмен прямо сейчас
          </p>
          <button className="absolute right-[24px] top-[28px] flex items-center gap-[6px] rounded-[10px] border border-[#8E8BED] border-[0.5px] bg-[#1A1A1A] px-[24px] py-[16px] text-[#F8F8F5]">
            <span className="text-[24px] font-extrabold leading-[32px]">+</span>
            <span className="text-[16px] font-bold leading-[20px]">Добавить объявление</span>
          </button>
        </div>

        <div className="absolute left-0 top-[1310px] h-[660px] w-[1441px]">
          <div className="h-[69px] w-[816px]">
            <h2 className="text-[40px] font-extrabold leading-[40px] text-[#1A1A1A]">Попробуй найти, то что нужно</h2>
            <p style={{ fontFamily: "var(--font-golos)" }} className="mt-[24px] text-[20px] leading-none text-[#3D3D3D]">
              Все товары, которые люди отдают даром
            </p>
          </div>

          <div className="mt-[24px] flex h-[567px] w-[1441px] gap-[24px] rounded-[20px] bg-white p-[28px]">
            <ListingCard image={imgFeedCard} />
            <ListingCard image={imgFeedCard} />
            <ListingCard image={imgFeedCard} />
            <div className="relative">
              <ListingCard image={imgFeedCard} />
              <button className="absolute right-[-6px] top-[190px] h-[86px] w-[86px] rounded-full bg-[#C8FF00] text-[60px] leading-[0.9] text-[#1A1A1A]">
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="absolute left-0 top-[2038px] flex h-[69px] w-[1441px] items-start justify-between">
          <div className="w-[816px]">
            <h2 className="text-[40px] font-extrabold leading-[40px] text-[#1A1A1A]">
              Попробуй <span className="text-[#1A1A1A]">найти</span>, то что <span className="text-[#8E8BED]">нужно</span>
            </h2>
            <p style={{ fontFamily: "var(--font-golos)" }} className="mt-[24px] text-[20px] leading-none text-[#3D3D3D]">
              2 304 предложения
            </p>
          </div>
          <button className="flex h-[30px] items-center gap-[6px] rounded-[10px] border border-[#CACACA] border-[0.5px] bg-white px-[18px] py-[8px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <FilterIcon className="h-[14px] w-[16px] text-[#1A1A1A]" />
            <span className="text-[12px] font-medium leading-[18px]">Фильтры</span>
          </button>
        </div>

        <div className="absolute left-0 top-[2175px] grid h-[1607px] w-[1440px] grid-cols-4 gap-x-[24px] gap-y-[48px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <ListingCard key={i} image={imgFeedCard} />
          ))}
        </div>
        </div>

        <button className="absolute left-[1704px] top-[877px] h-[67px] w-[72px] rounded-[13.267px] border border-black border-[0.332px] bg-[#C8FF00]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <ChatBubbleIcon className="mx-auto h-[28px] w-[31px] text-[#1A1A1A]" />
        </button>
      </div>
    </div>
  );
}
