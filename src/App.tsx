import Canvas from "./layouts/Canvas";
import { Navbar } from "./layouts/Navbar";
import Sidebar from "./layouts/Sidebar";
import { useIsInitializing } from "./stores/doc-store";
import { useAppInitializer } from "./hooks/useAppInitializer";
import { useApiHealthMonitor } from "./hooks/useApiHealthMonitor";
import { FloatingDock } from "./layouts/FloatingDock";
import UtilityBar from "./layouts/UtilityBar";
import { RightDisplayPanel } from "./components/utility/RightDisplayPanel";
import { useEnvInitializer } from "./hooks/useEnvInitializer";
import "./services/auto-refresh-service";

function App() {
  const isInitializing = useIsInitializing();
  useAppInitializer();
  useApiHealthMonitor();
  useEnvInitializer();

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-surface-800 text-surface-300 flex items-center justify-center">
        <div>Loading Retreever...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-linear-to-b from-surface-700 to-surface-800 text-gray-300 relative">
      <Navbar />

      <div className="flex h-[calc(100vh-3rem)] w-full relative">
        <Sidebar />

        <main className="flex-1 overflow-hidden bg-black/10">
          <Canvas />
        </main>

        {/* RIGHT-SIDE STACKED COMPONENTS */}
        <UtilityBar />
        <RightDisplayPanel />
      </div>

      <FloatingDock />
    </div>
  );
}

export default App;
