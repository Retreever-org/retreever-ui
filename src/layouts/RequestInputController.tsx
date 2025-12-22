import React from "react";
import { useViewingDocStore } from "../stores/viewing-doc-store";
import type { BodyType, EditingType } from "../types/editor.types";
import RawBodyDropdown from "../components/canvas/RawBodyDropdown";

const BODY_OPTIONS: { key: BodyType; label: string }[] = [
  { key: "none", label: "none" },
  { key: "form-data", label: "form-data" },
  { key: "x-www-form-urlencoded", label: "x-www-form-urlencoded" },
  { key: "binary", label: "binary" },
  { key: "raw", label: "raw" },
];

const EDITING_OPTIONS: { key: EditingType; label: string }[] = [
  { key: "params", label: "Params" },
  { key: "headers", label: "Headers" },
  { key: "body", label: "Body" },
];

const RequestInputController: React.FC = () => {
  const { endpoint, tabDoc, updateUiRequest } = useViewingDocStore();

  if (!tabDoc) return null;

  const { editing, bodyType, rawType } = tabDoc.uiRequest;
  const noBodyMethods = ["GET", "DELETE"];
  const noBody = noBodyMethods.includes(
    endpoint?.method.toLocaleUpperCase() || ""
  );

  return (
    <div
      className={`flex flex-col justify-center items-start text-xs w-full`}
    >
      {/* Editing tabs */}
      <div className="flex gap-3">
        {EDITING_OPTIONS.map((opt) => {
          const active = opt.key === editing;
          if (noBody && opt.key === "body") {
            return null;
          }
          return (
            <SwitchBtn
              key={opt.key}
              name={opt.label}
              active={active}
              onClick={() => updateUiRequest({ editing: opt.key })}
            />
          );
        })}
      </div>

      {/* Body / Consumes */}
      {/* {!noBody && hasConsumes && <ConsumesOption />} */}

      {!noBody && editing === "body" && (
        <BodySelector
          value={bodyType}
          onChange={(v) =>
            updateUiRequest({
              bodyType: v,
              rawType: v === "raw" ? rawType ?? "JSON" : undefined,
            })
          }
        />
      )}
    </div>
  );
};

export default RequestInputController;

/* --------------------------
   SwitchBtn
   -------------------------- */
interface SwitchBtnProps {
  name: string;
  active?: boolean;
  onClick?: () => void;
}

const SwitchBtn: React.FC<SwitchBtnProps> = ({
  name,
  active = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex justify-center items-center gap-1 px-2 py-1.5 text-xs rounded-t-md ${
        active ? "text-surface-100" : "text-surface-300"
      } hover:text-surface-100`}
    >
      {name}
    </button>
  );
};

/* --------------------------
   BodySelector
   -------------------------- */
interface BodySelectorProps {
  value: BodyType;
  onChange: (v: BodyType) => void;
}

const BodySelector: React.FC<BodySelectorProps> = ({ value, onChange }) => {
  const { endpoint } = useViewingDocStore();
  const hasConsumes = endpoint?.consumes && endpoint.consumes.length > 0;

  const selectedStyles = "text-surface-100 shadow-sm";
  const unselectedStyles = "text-surface-300 hover:text-surface-100";

  return (
    <div className="flex items-center gap-4">
      <div className="inline-flex items-center gap-6 rounded-md bg-transparent p-1">
        {BODY_OPTIONS.map((opt) => {
          const selected = opt.key === value;
          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              disabled={hasConsumes}
              type="button"
              className={`inline-flex items-center gap-1.5 py-1.5 text-xs transition-colors disabled:cursor-not-allowed ${
                selected ? selectedStyles : unselectedStyles
              }`}
              aria-pressed={selected}
            >
              <span
                className={`flex-none h-4 w-4 rounded-full ${
                  selected
                    ? "bg-white border-[4.8px] border-primary-400"
                    : "border-surface-600 border"
                }`}
              />
              <span className="whitespace-nowrap">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {value === "raw" && (
        <div className="flex items-center gap-2 relative">
          <RawBodyDropdown />
        </div>
      )}
    </div>
  );
};
