type Props = { className?: string };

export function SunIcon({ className }: Props) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.22" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.35" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.5 4.5l1.55 1.55M17.95 17.95l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.5 19.5l1.55-1.55M17.95 6.05l1.55-1.55"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className }: Props) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 14.2A8.5 8.5 0 0 1 8.8 3.2 7.2 7.2 0 1 0 20.5 14.2Z"
        fill="currentColor"
        fillOpacity="0.28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparklesIcon({ className }: Props) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.2 4.2L17.4 8.4 13.2 9.6 12 13.8 10.8 9.6 6.6 8.4 10.8 7.2 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M18 14l.8 2.8L21.6 17.6 19.8 18.4 18 21.2 16.2 18.4 13.4 17.6 16.2 16.8 18 14Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuIcon({ className }: Props) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
