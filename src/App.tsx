import Canvas from "./layouts/Canvas";
import { Navbar } from "./layouts/Navbar";
import Sidebar from "./layouts/Sidebar";

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-linear-to-b from-surface-700 to-surface-800 text-gray-300">
      {/* Top navbar */}
      <Navbar />

      {/* Side navbar */}
      <div className="flex h-[calc(100vh-3rem)] w-full">
        <aside className="w-72 overflow-hidden">
          <Sidebar />
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full w-full overflow-auto">
            <Canvas />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
