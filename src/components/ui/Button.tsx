import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark-utility" | "ghost" | "white" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  type = "button",
  ariaLabel,
  disabled,
  ...props
}) => {
  // Base classes for Apple Minimalist buttons (including spring scaling)
  const baseClass = "inline-flex items-center justify-center gap-xs font-semibold select-none transition-all duration-300 ease-out-expo active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100";
  
  // Style variations matching DESIGN.md
  const variants = {
    primary: "bg-apple-primary hover:bg-apple-primary-focus text-white rounded-pill shadow-[0_4px_12px_rgba(0,102,204,0.15)]",
    secondary: "bg-transparent border border-apple-primary hover:border-apple-primary-focus text-apple-primary hover:text-apple-primary-focus rounded-pill",
    "dark-utility": "bg-apple-canvas-parchment dark:bg-apple-surface-tile-1 border border-black/10 dark:border-white/10 hover:bg-gray-200 dark:hover:border-white/20 text-apple-ink dark:text-white rounded-md",
    ghost: "bg-transparent text-apple-primary hover:text-apple-primary-focus",
    white: "bg-white hover:bg-apple-canvas-parchment text-apple-ink rounded-md",
    danger: "bg-red-500 hover:bg-red-600 text-white rounded-pill shadow-[0_4px_12px_rgba(239,68,68,0.2)]",
  };

  const sizes = {
    sm: "px-sm py-xxs text-[12px]",
    md: "px-md py-sm text-[13px]",
    lg: "px-lg py-md text-[14px]",
  };

  const selectedVariant = variants[variant] || variants.primary;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseClass} ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
