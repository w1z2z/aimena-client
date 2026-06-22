import styles from "./ListingCard.module.css";

type ListingCardProps = {
  title: string;
  city: string;
  wants: string;
};

export function ListingCard({ title, city, wants }: ListingCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cover}>Фото</div>
      <h3>{title}</h3>
      <p className={styles.city}>{city}</p>
      <p className={styles.wants}>Хочу получить: {wants}</p>
    </article>
  );
}
