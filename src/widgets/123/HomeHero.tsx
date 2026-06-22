import Link from "next/link";
import styles from "./HomeHero.module.css";

export function HomeHero() {
  return (
    <section className={styles.hero}>
      <header className={styles.header}>
        <div className={styles.logo}>Штука.ру</div>
        <nav className={styles.nav}>
          <Link href="/listings">Лента</Link>
          <Link href="/create-listing">Создать объявление</Link>
          <Link href="/profile">Профиль</Link>
          <Link href="/chats">Чаты</Link>
        </nav>
      </header>

      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder="Найти подходящую вещь"
          className={styles.searchInput}
        />
        <button type="button" className={styles.searchButton}>
          Найти
        </button>
      </div>
    </section>
  );
}
