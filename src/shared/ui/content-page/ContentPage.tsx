import type { ReactNode } from "react";

import { Header } from "@/widgets/header/Header";

import styles from "./ContentPage.module.css";

type ContentPageProps = {
  title: string;
  lead?: string;
  children: ReactNode;
};

export function ContentPage({ title, lead, children }: ContentPageProps) {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <article className={styles.article}>
          <h1 className={styles.title}>{title}</h1>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
          <div className={styles.body}>{children}</div>
        </article>
      </main>
    </div>
  );
}
