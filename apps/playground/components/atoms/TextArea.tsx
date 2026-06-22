import styles from './atoms.module.css';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea(props: Props) {
  return <textarea className={styles.textarea} {...props} />;
}
