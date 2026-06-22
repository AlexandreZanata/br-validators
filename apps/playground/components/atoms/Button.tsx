import styles from './atoms.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
};

export function Button({
  variant = 'ghost',
  size = 'md',
  className,
  icon,
  children,
  ...props
}: Props) {
  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${sizeClass} ${className ?? ''}`.trim()}
      {...props}
    >
      <span className={styles.buttonInner}>
        {icon ? <span className={styles.buttonIcon}>{icon}</span> : null}
        {children ? <span>{children}</span> : null}
      </span>
    </button>
  );
}
