import React from "react";
import { DocumentIcon, ShortcutIcon, VariableIcon } from "../svgs/svgs";
import { useRightPanelStore } from "../stores/right-panel-store";
import { useDockStore } from "../stores/dock-store";

const UtilityBar: React.FC = () => {
  const { closePanel, openPanel, panelName } = useRightPanelStore();
  const { open, openDock, closeDock } = useDockStore();

  const handleClick = (element: React.ReactNode, newPanelName: string) => {
    if (panelName === newPanelName) {
      console.log("closing");
      closePanel();
      return;
    }
    console.log("opening");
    openPanel(element, newPanelName);
  };

  return (
    <div
      id="utility-drawer"
      className="absolute z-20 bg-linear-to-b from-surface-700 to-surface-800 top-0 right-0 h-full w-12 border-l border-surface-500/30 flex flex-col items-center"
    >
      <Button
        icon={<DocumentIcon />}
        onClick={() => (open ? closeDock() : openDock())}
      />
      <Button
        icon={<VariableIcon />}
        onClick={() => handleClick(<div>Env Vars</div>, "env-btn")}
      />
      <Button
        icon={<ShortcutIcon />}
        onClick={() => handleClick(<div>Shortcuts</div>, "shortcut-btn")}
      />
    </div>
  );
};

export default UtilityBar;

// ---------------------------- Button Component ----------------------------
function Button({
  icon,
  onClick,
}: {
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full py-6 border-b border-surface-500/30 
        flex justify-center items-center 
        hover:bg-surface-800 
        transition-all
      "
    >
      {/* Icon wrapper — only this animates */}
      <span className="transition-transform active:scale-90 active:-translate-y-[0.05px]">
        {icon}
      </span>
    </button>
  );
}
