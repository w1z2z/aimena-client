/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { Header } from "@/widgets/header/Header";

import styles from "./AboutPage.module.css";

const listingTypes = [
  {
    title: "Вещи",
    text: "Отдайте то, что лежит без дела, и получите нужное взамен.",
    tone: "lilac" as const,
  },
  {
    title: "Услуги",
    text: "Обменивайтесь навыками: помощь, ремонт, обучение и другое.",
    tone: "lime" as const,
  },
  {
    title: "Даром",
    text: "Отдайте бесплатно — другому человеку достаточно запросить получение.",
    tone: "ink" as const,
  },
];

const flowSteps = [
  {
    n: "01",
    title: "Находите предложение",
    text: "Ищите в каталоге, по городу и категориям или в разделе «Отдаю даром».",
  },
  {
    n: "02",
    title: "Отправляете оффер",
    text: "Выбираете свои объявления взамен — или просто запрашиваете даром.",
  },
  {
    n: "03",
    title: "Договариваетесь в чате",
    text: "Владелец принимает предложение, дальше детали сделки — в переписке.",
  },
  {
    n: "04",
    title: "Подтверждаете и завершаете",
    text: "Фиксируете условия, завершаете обмен и оставляете отзыв.",
  },
];

export function AboutPageView() {
  return (
    <div className={styles.page}>
      <Header />

      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.brand}>Aimena</p>
            <h1 className={styles.heroTitle}>
              Обмен без продаж —{" "}
              <span className={styles.heroAccent}>вещи, услуги и даром</span>
            </h1>
            <p className={styles.heroLead}>
              Платформа, где ценность создаётся договорённостью людей, а не ценником.
              Ниже — как устроен весь путь от объявления до отзыва.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/create-listing" className={styles.ctaPrimary}>
                <svg viewBox="0 0 10 10" fill="none" aria-hidden className={styles.ctaPlus}>
                  <path d="M5 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Разместить объявление</span>
              </Link>
              <Link href="/listings" className={styles.ctaGhost}>
                Смотреть каталог
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden>
            <img
              src="/images/about/swap-cards.svg"
              alt=""
              className={styles.heroGraphic}
            />
            <img src="/images/about/star.svg" alt="" className={styles.starA} />
            <img src="/images/about/star.svg" alt="" className={styles.starB} />
            <img src="/images/about/star.svg" alt="" className={styles.starC} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Что можно разместить</h2>
            <p>Три формата предложений — под разные сценарии обмена.</p>
          </div>
          <div className={styles.types}>
            {listingTypes.map((item) => (
              <article
                key={item.title}
                className={`${styles.type} ${styles[`type--${item.tone}`]}`}
              >
                <span className={styles.typeMark} aria-hidden />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.flowSection}`}>
          <div className={styles.sectionHead}>
            <h2>Как проходит обмен</h2>
            <p>Короткий путь от интереса к завершённой сделке.</p>
          </div>

          <ol className={styles.flow}>
            {flowSteps.map((step, index) => (
              <li key={step.n} className={styles.flowStep}>
                <div className={styles.flowNum}>{step.n}</div>
                <div className={styles.flowBody}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                {index < flowSteps.length - 1 ? (
                  <span className={styles.flowConnector} aria-hidden />
                ) : null}
              </li>
            ))}
          </ol>

          <div className={styles.flowChart} aria-hidden>
            {(
              [
                { label: "Поиск", accent: false },
                { label: "Оффер", accent: false },
                { label: "Чат", accent: false },
                { label: "Отзыв", accent: true },
              ] as const
            ).map((item, index, list) => (
              <div key={item.label} className={styles.chartItem}>
                <span className={styles.chartLabel}>{item.label}</span>
                <div className={styles.chartNode}>
                  <i
                    className={
                      item.accent
                        ? `${styles.chartDot} ${styles.chartDotAccent}`
                        : styles.chartDot
                    }
                  />
                  {index < list.length - 1 ? (
                    <i className={styles.chartLine} />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.split}`}>
          <div className={styles.splitIntro}>
            <h2>Чаты и уведомления рядом со сделкой</h2>
            <p>
              Переговоры не теряются во внешних мессенджерах: входящие предложения, ответы
              и системные события живут в Aimena. История общения всегда рядом с обменом.
            </p>
          </div>

          <div className={styles.splitRow}>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <span className={`${styles.featureIcon} ${styles.featureIconLilac}`} aria-hidden>
                  01
                </span>
                <div>
                  <strong>Чаты</strong>
                  <p>Предложения обмена приходят прямо в переписку.</p>
                </div>
              </li>
              <li className={styles.featureItem}>
                <span className={`${styles.featureIcon} ${styles.featureIconLime}`} aria-hidden>
                  02
                </span>
                <div>
                  <strong>Сделка</strong>
                  <p>Условия подтверждаются в интерфейсе обмена.</p>
                </div>
              </li>
              <li className={styles.featureItem}>
                <span className={`${styles.featureIcon} ${styles.featureIconInk}`} aria-hidden>
                  03
                </span>
                <div>
                  <strong>Отзыв</strong>
                  <p>После завершения можно оценить опыт обмена.</p>
                </div>
              </li>
            </ul>

            <div className={styles.splitVisual}>
              <img src="/images/about/chat-preview.svg" alt="" />
              <img src="/images/about/star.svg" alt="" className={styles.splitStar} />
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.safety}`}>
          <div className={styles.sectionHead}>
            <h2>На что обратить внимание</h2>
            <p>Несколько простых правил, чтобы обмен проходил спокойнее.</p>
          </div>
          <div className={styles.safetyGrid}>
            <p>
              <strong>Уточняйте детали</strong>
              Читайте описание и спрашивайте в чате до встречи.
            </p>
            <p>
              <strong>Фиксируйте условия</strong>
              Подтверждайте договорённости в сделке, а не только словами.
            </p>
            <p>
              <strong>Без денег «в обход»</strong>
              Aimena — про обмен, не про продажи.
            </p>
            <p>
              <strong>Оставляйте отзыв</strong>
              Честная репутация помогает всему сообществу.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
