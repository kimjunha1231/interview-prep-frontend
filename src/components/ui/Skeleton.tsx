import React from "react";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "h-[58px]",
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-apple-pulse rounded-lg border border-white/5 bg-apple-surface-tile-1/10 ${className}`}
          role="status"
          aria-live="polite"
        />
      ))}
    </>
  );
};
