import { EndpointTabStrip } from "./EndpointTabStrip";

const Canvas: React.FC = () => {
  return (
    <div className="border-b h-full static overflow-auto bg-transparent text-surface-200 text-sm">
      <EndpointTabStrip />
    </div>
  );
};

export default Canvas;
