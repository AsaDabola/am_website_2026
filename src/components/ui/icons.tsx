type IconProps = {
  className?: string;
};

export function ArrowRightIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.333 8h9.334M8.667 3.667 13 8l-4.333 4.333"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className = "size-2.5" }: IconProps) {
  return (
    <svg viewBox="0 0 10 6" fill="none" className={className} aria-hidden="true">
      <path
        d="M1 1l4 4 4-4"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ className = "size-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth={1.6} />
      <path d="M16 16l-3.5-3.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function PlayIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M4 2.8v10.4a.6.6 0 0 0 .92.5l8.16-5.2a.6.6 0 0 0 0-1l-8.16-5.2A.6.6 0 0 0 4 2.8Z" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className = "size-[17px]" }: IconProps) {
  return (
    <svg viewBox="0 0 17 17" fill="none" className={className} aria-hidden="true">
      <path
        d="M11.3 9.06h-2v6.6H6.7v-6.6H5.1V6.85h1.6V5.3c0-1.61.65-2.9 2.98-2.9h1.98v2.2h-1.24c-.55 0-.62.34-.62.68v1.57h1.9l-.42 2.21Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramIcon({ className = "size-[17px]" }: IconProps) {
  return (
    <svg viewBox="0 0 17 17" fill="none" className={className} aria-hidden="true">
      <rect x="2.3" y="2.3" width="12.4" height="12.4" rx="3.2" stroke="currentColor" strokeWidth={1.4} />
      <circle cx="8.5" cy="8.5" r="3" stroke="currentColor" strokeWidth={1.4} />
      <circle cx="12.1" cy="4.9" r="0.85" fill="currentColor" />
    </svg>
  );
}

export function YoutubeIcon({ className = "size-[17px]" }: IconProps) {
  return (
    <svg viewBox="0 0 17 17" fill="none" className={className} aria-hidden="true">
      <rect x="1.5" y="4" width="14" height="9" rx="2.6" stroke="currentColor" strokeWidth={1.4} />
      <path d="M7.3 6.6v3.8l3.4-1.9-3.4-1.9Z" fill="currentColor" />
    </svg>
  );
}

export function MailIcon({ className = "size-[17px]" }: IconProps) {
  return (
    <svg viewBox="0 0 17 17" fill="none" className={className} aria-hidden="true">
      <rect x="1.8" y="3.6" width="13.4" height="9.8" rx="1.8" stroke="currentColor" strokeWidth={1.4} />
      <path d="M2.5 4.6l6 5 6-5" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BookIcon({ className = "size-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 8.2C6 7 7 6 8.2 6H16v20H8.2C7 26 6 25 6 23.8V8.2Z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <path
        d="M26 8.2C26 7 25 6 23.8 6H16v20h7.8c1.2 0 2.2-1 2.2-2.2V8.2Z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PinIcon({ className = "size-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 27s9-8.1 9-14.6C25 7.7 21 4 16 4S7 7.7 7 12.4C7 18.9 16 27 16 27Z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <circle cx="16" cy="12.4" r="3.2" stroke="currentColor" strokeWidth={1.7} />
    </svg>
  );
}

export function PeopleIcon({ className = "size-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="11" r="3.6" stroke="currentColor" strokeWidth={1.7} />
      <circle cx="21.5" cy="12.5" r="2.8" stroke="currentColor" strokeWidth={1.7} />
      <path d="M4.5 26c.7-4.4 4-7 7.5-7s6.8 2.6 7.5 7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
      <path d="M19.5 19.4c2.9.4 5.2 2.7 5.8 6.6" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ className = "size-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 26.5S5.5 20.1 5.5 12.9C5.5 9.1 8.4 6 12.1 6c1.7 0 3.3.8 4.4 2.1a5.9 5.9 0 0 1 4.4-2.1c3.7 0 6.6 3.1 6.6 6.9 0 7.2-10.5 13.6-10.5 13.6Z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </svg>
  );
}
