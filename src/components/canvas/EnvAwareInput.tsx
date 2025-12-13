import React from "react";
import EnvVarOverlay from "./EnvVarOverlay";

interface EnvAwareInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange: (next: string) => void;
}

interface OverlayState {
  rect: DOMRect;
  query: string;
  replaceFrom: number;
  caret: number;
}

const EnvAwareInput: React.FC<EnvAwareInputProps> = ({
  value,
  placeholder,
  disabled,
  className,
  onChange,
}) => {
  const [overlay, setOverlay] = React.useState<OverlayState | null>(null);

  const renderWithEnvHighlight = (val: string) => {
    const parts = val.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, i) =>
      part.startsWith("{{") && part.endsWith("}}") ? (
        <span key={i} className="text-rose-300 font-medium">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="relative w-full">
      {/* Highlight layer */}
      <div
        className="
          absolute inset-0
          pointer-events-none
          whitespace-pre
          text-surface-200
        "
      >
        {renderWithEnvHighlight(value)}
      </div>

      {/* Real input */}
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          relative w-full bg-transparent outline-none
          text-transparent caret-surface-200
          placeholder:text-surface-600
          ${className ?? ""}
        `}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val);

          const caret = e.target.selectionStart ?? val.length;
          const upto = val.slice(0, caret);
          const match = upto.match(/\{\{[^}]*$/);

          if (match && match.index != null) {
            setOverlay({
              rect: e.target.getBoundingClientRect(),
              query: match[0].slice(2),
              replaceFrom: match.index,
              caret,
            });
          } else {
            setOverlay(null);
          }
        }}
        onKeyDown={(e) => {
          const isShortcut =
            (e.ctrlKey || e.metaKey) && e.code === "Space";

          if (!isShortcut) return;

          e.preventDefault();

          const input = e.currentTarget;
          const caret = input.selectionStart ?? value.length;

          setOverlay({
            rect: input.getBoundingClientRect(),
            query: "",
            replaceFrom: caret,
            caret,
          });
        }}
        onBlur={() => setOverlay(null)}
      />

      {/* Overlay */}
      {overlay && (
        <EnvVarOverlay
          anchorRect={overlay.rect}
          query={overlay.query}
          onClose={() => setOverlay(null)}
          onSelect={(name) => {
            const prefix = value.slice(0, overlay.replaceFrom);
            const suffix = value.slice(overlay.caret);

            onChange(`${prefix}{{${name}}}${suffix}`);
            setOverlay(null);
          }}
        />
      )}
    </div>
  );
};

export default EnvAwareInput;
