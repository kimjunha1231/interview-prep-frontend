import React from "react";

interface CardProps {
  hoverable?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  children,
  className = "",
  onClick,
}) => {
  const baseClass = "bg-apple-surface-tile-1/30 border border-white/5 rounded-lg p-md md:p-lg transition-all duration-300 ease-out-expo";
  const hoverClass = hoverable 
    ? "hover:bg-apple-surface-tile-1/50 hover:border-white/15 cursor-pointer hover:scale-[1.002]" 
    : "";

  return (
    <div
      onClick={onClick}
      className={`${baseClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};
