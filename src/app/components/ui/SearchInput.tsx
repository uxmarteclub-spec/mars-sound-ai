interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Barra composta (Descobrir): sem borda própria — o contentor pai define o contorno. */
  variant?: "default" | "toolbar";
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 14L11.1 11.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar músicas ou artistas",
  className = "",
  variant = "default",
}: SearchInputProps) {
  const isToolbar = variant === "toolbar";
  return (
    <div className={`relative w-full min-w-0 ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-brand)]">
        <SearchIcon />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          isToolbar
            ? "w-full min-h-[48px] bg-transparent border-0 rounded-none pl-12 pr-4 py-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-0 transition-colors duration-150"
            : "w-full bg-transparent border border-[var(--color-border-subtle)] rounded-lg px-12 py-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] transition-colors duration-150"
        }
      />
    </div>
  );
}
