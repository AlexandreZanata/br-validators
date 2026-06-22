import styles from './atoms.module.css';

type BadgeVariant = 'success' | 'error' | 'warning' | 'neutral';

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  return (
    <span role="status" className={`${styles.badge} ${styles[variant]}`}>
      {children}
    </span>
  );
}
