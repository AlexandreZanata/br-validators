import styles from './atoms.module.css';

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className={styles.codeBlock}>
      <code>{code}</code>
    </pre>
  );
}
