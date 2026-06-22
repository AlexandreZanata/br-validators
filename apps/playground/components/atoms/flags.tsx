/** lipis/flag-icons (MIT) — same assets as TABELA-ANP-COMBUSTIVEIS `app/src/main/assets/flags/` */

type FlagProps = {
  className?: string;
};

export function FlagBr({ className }: FlagProps) {
  return (
    <img
      className={className}
      src="/flags/br.svg"
      alt=""
      width={20}
      height={15}
      decoding="async"
      draggable={false}
    />
  );
}

export function FlagUs({ className }: FlagProps) {
  return (
    <img
      className={className}
      src="/flags/us.svg"
      alt=""
      width={20}
      height={15}
      decoding="async"
      draggable={false}
    />
  );
}
