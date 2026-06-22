import styles from './molecules.module.css';

export function ResultSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      {title ? <h2 className={styles.sectionTitle}>{title}</h2> : null}
      {children}
    </section>
  );
}
