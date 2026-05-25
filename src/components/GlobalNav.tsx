import React, { useEffect, useState } from "react";
import { Terminal, Cpu } from "lucide-react";

export const GlobalNav: React.FC = () => {
  const [isApiConnected, setIsApiConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if backend API is reachable
    fetch("/api/questions/random?count=1")
      .then((res) => {
        if (res.ok) setIsApiConnected(true);
        else setIsApiConnected(false);
      })
      .catch(() => setIsApiConnected(false));
  }, []);

  return (
    <nav 
      className="bg-apple-surface-black text-apple-body-on-dark h-[44px] px-lg flex items-center justify-between border-b border-white/5 select-none"
      aria-label="Global navigation"
    >
      <div className="flex items-center gap-xs">
        <Terminal className="w-4 h-4 text-apple-primary-on-dark" />
        <span className="font-display font-semibold text-xs tracking-tight">
          JUNHA.DEV // INTERVIEW
        </span>
      </div>

      <div className="flex items-center gap-sm">
        <div className="flex items-center gap-xxs text-[11px] text-apple-body-muted font-mono bg-apple-surface-tile-1/50 py-[3px] px-[8px] rounded-sm border border-white/5">
          <Cpu className="w-3 h-3 text-apple-primary-on-dark" />
          <span>v1.0.0-PRO</span>
        </div>

        <div className="flex items-center gap-xxs">
          <span 
            className={`w-[6px] h-[6px] rounded-full inline-block ${
              isApiConnected === true 
                ? "bg-green-500 shadow-[0_0_6px_#22c55e]" 
                : isApiConnected === false 
                ? "bg-red-500 animate-pulse" 
                : "bg-yellow-500"
            }`}
            title={
              isApiConnected === true 
                ? "Backend Connected" 
                : isApiConnected === false 
                ? "Backend Offline" 
                : "Checking Connection..."
            }
          />
          <span className="text-[10px] font-mono text-apple-body-muted uppercase tracking-wider hidden sm:inline">
            {isApiConnected === true ? "SYS.ONLINE" : isApiConnected === false ? "SYS.OFFLINE" : "SYS.CONNECTING"}
          </span>
        </div>
      </div>
    </nav>
  );
};
