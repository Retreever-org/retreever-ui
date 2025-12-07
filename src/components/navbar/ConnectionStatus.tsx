import {
  useApiLastHeartbeat,
  useIsApiOnline,
} from "../../stores/api-state-store";
import { useState } from "react";

const ConnectionStatus: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isOnline = useIsApiOnline();
  const lastHeartbeat = useApiLastHeartbeat();

  const statusText = isOnline ? "Connected" : "Disconnected";

  const formatDateTime = (timestamp: string | null) => {
    if (!timestamp) return "Not yet connected";
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="relative inline-block">
      <button
        className="hidden items-center gap-1 rounded-md border border-surface-500/80 hover:border-surface-500 px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 sm:inline-flex"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
            isOnline ? "bg-success" : "bg-danger animate-pulse"
          }`}
        />
        <span
          className={`${
            isOnline
              ? "text-surface-200 hover:text-green-50"
              : "text-surface-200 hover:text-orange-50"
          }`}
        >
          {statusText}
        </span>
      </button>

      {showTooltip && (
        <div
          className="
            absolute
            left-1/2 -translate-x-1/2
            top-full mt-4
            z-50 w-64
            bg-surface-800 border border-surface-500
            rounded-lg p-3 shadow-xl
            animate-in fade-in slide-in-from-top-2 duration-200
          "
        >
          <div className="text-[12px] font-medium text-surface-200 mb-1">
            {isOnline ? "Connection Healthy" : "Connection Failed"}
          </div>

          <div className="space-y-1 text-[11px] text-surface-400">
            <div>
              <span className="font-medium">Last Connected At:</span>{" "}
              <span>{formatDateTime(lastHeartbeat)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
