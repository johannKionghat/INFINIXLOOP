export function InfinixLoopLogo({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" width={size} height={size}>
      <path
        d="M3 9C3 6.5 4.8 5 6.5 5C8.2 5 9.2 6.5 9 9C8.8 11.5 9.8 13 11.5 13C13.2 13 15 11.5 15 9"
        stroke="#e11d48"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="3" cy="9" r="1.2" fill="#e11d48" />
      <circle cx="15" cy="9" r="1.2" fill="#e11d48" />
    </svg>
  );
}
