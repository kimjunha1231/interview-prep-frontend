import { useState, useEffect } from "react";
import { SubNav } from "./components/SubNav";
import { HandbookDashboard } from "./features/handbook/components/HandbookDashboard";
import { InterviewDashboard } from "./features/interview/components/InterviewDashboard";

function App() {
  const [activeMode, setActiveMode] = useState<"handbook" | "interview">("handbook");
  
  // Theme state: default to 'dark' to respect the original design, but support toggling
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-apple-ink dark:text-white flex flex-col font-sans antialiased transition-colors duration-200 selection:bg-apple-primary/30 selection:text-white">

      {/* 52px main navigation header with mode toggle (persistent across pages) */}
      <SubNav 
        activeMode={activeMode} 
        onChangeMode={setActiveMode} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 flex flex-col">
        {/* Switch Mode Dashboards via visibility to preserve state, scroll position and ongoing sessions */}
        <div className={`flex-1 flex flex-col ${activeMode === "handbook" ? "" : "hidden"}`}>
          <HandbookDashboard 
            onSwitchMode={() => setActiveMode("interview")} 
          />
        </div>
        <div className={`flex-1 flex flex-col ${activeMode === "interview" ? "" : "hidden"}`}>
          <InterviewDashboard />
        </div>
      </main>
    </div>
  );
}

export default App;
