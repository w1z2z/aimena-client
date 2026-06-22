import styles from "./PageStub.module.css";

type PageStubProps = {
  title: string;
  description: string;
};

export function PageStub({ title, description }: PageStubProps) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </main>
  );
}
