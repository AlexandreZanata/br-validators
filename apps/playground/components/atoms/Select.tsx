import styles from './atoms.module.css';

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select(props: Props) {
  return <select className={styles.select} {...props} />;
}
