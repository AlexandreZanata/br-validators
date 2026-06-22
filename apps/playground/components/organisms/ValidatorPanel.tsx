import styles from './organisms.module.css';

export function ValidatorPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </header>
      {children}
    </main>
  );
}
