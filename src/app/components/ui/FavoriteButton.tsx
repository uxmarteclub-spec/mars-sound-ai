import { forwardRef, useState } from "react";

export interface FavoriteButtonProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onClick"> {
  isFavorite: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  /** Mesmo estilo do botão “playlist” em cards (círculo escuro + ícone claro). */
  variant?: "default" | "overlay";
  className?: string;
}

function HeartIcon({ filled, size }: { filled?: boolean; size: number }) {
  if (filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export const FavoriteButton = forwardRef<HTMLButtonElement, FavoriteButtonProps>(
  function FavoriteButton(
    {
      isFavorite,
      onToggle,
      size = "md",
      variant = "default",
      className = "",
      onClick: propsOnClick,
      type = "button",
      style: styleProp,
      ...rest
    },
    ref
  ) {
    const [isAnimating, setIsAnimating] = useState(false);

    const sizeMap = {
      sm: { cls: "w-8 h-8", iconSize: 16 },
      md: { cls: "w-9 h-9", iconSize: 18 },
      lg: { cls: "w-10 h-10", iconSize: 22 },
    };

    const isOverlay = variant === "overlay";
    const { cls, iconSize } = isOverlay
      ? { cls: "w-9 h-9", iconSize: 16 }
      : sizeMap[size];

    const overlayCls = isOverlay
      ? "rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/90 transition-colors"
      : "";

    const iconColor = isOverlay
      ? isFavorite
        ? "#ff164c"
        : "#f8f8f8"
      : "#ff164c";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      propsOnClick?.(e);
      e.stopPropagation();
      setIsAnimating(true);
      window.setTimeout(() => setIsAnimating(false), 300);
      onToggle();
    };

    return (
      <button
        ref={ref}
        type={type}
        {...rest}
        onClick={handleClick}
        className={`shrink-0 cursor-pointer flex items-center justify-center ${cls} ${overlayCls} ${className}`}
        style={{
          color: iconColor,
          transform: isAnimating ? "scale(1.3)" : "scale(1)",
          transition:
            "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.15s",
          ...styleProp,
        }}
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        aria-pressed={isFavorite}
      >
        <HeartIcon filled={isFavorite} size={iconSize} />
      </button>
    );
  }
);

FavoriteButton.displayName = "FavoriteButton";
