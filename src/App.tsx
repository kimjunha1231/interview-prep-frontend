import { useState } from "react";
import { SubNav } from "./components/SubNav";
import { HandbookDashboard } from "./features/handbook/components/HandbookDashboard";
import { InterviewDashboard } from "./features/interview/components/InterviewDashboard";

function App() {
  const [activeMode, setActiveMode] = useState<"handbook" | "interview">("handbook");

  return (
    <div className="min-h-screen bg-apple-surface-black text-apple-body-on-dark flex flex-col font-sans antialiased selection:bg-apple-primary/30 selection:text-white">

      {/* 52px sub navigation with mode toggle - only shown for interview mode */}
      {activeMode === "interview" && (
        <SubNav activeMode={activeMode} onChangeMode={setActiveMode} />
      )}

      <main className="flex-1 flex flex-col">
        {/* Switch Mode Dashboards */}
        {activeMode === "handbook" ? (
          <HandbookDashboard onSwitchMode={() => setActiveMode("interview")} />
        ) : (
          <InterviewDashboard />
        )}
      </main>
    </div>
  );
}

export default App;
