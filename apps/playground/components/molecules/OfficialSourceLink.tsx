import styles from './molecules.module.css';

export function OfficialSourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a className={styles.link} href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}
