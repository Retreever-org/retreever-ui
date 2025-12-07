import React from "react"
import { DocumentIcon, HeadersIcon, ShortcutIcon, VariableIcon } from "../svgs/svgs"
import { useDockStore } from "../stores/dock-store"

const SidebarRight: React.FC = () => {
  const toggleDock = useDockStore((state) => state.toggleDock)

  return (
    <div className="border-l border-surface-500/30 h-full flex flex-col justify-start items-center">

      {/* Document Panel Toggle */}
      <Button onClick={toggleDock} icon={<DocumentIcon />} />

      {/* Other icons (no action yet) */}
      <Button icon={<HeadersIcon />} />
      <Button icon={<VariableIcon />} />
      <Button icon={<ShortcutIcon />} />
    </div>
  )
}

export default SidebarRight


// ---------------------------- Button Component ----------------------------
function Button({
  icon,
  onClick,
}: {
  icon?: React.ReactNode
  onClick?: () => void
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
  )
}

