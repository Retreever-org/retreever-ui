import type React from "react";

const EnvDisplay: React.FC = () => {
  return (
    <div className="hidden rounded-full border border-surface-600 bg-surface-800/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-surface-200 sm:inline-flex">
      Local · dev
    </div>
  );
};


export default EnvDisplay;