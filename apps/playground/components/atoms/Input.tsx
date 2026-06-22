import styles from './atoms.module.css';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: Props) {
  return <input className={styles.input} {...props} />;
}
