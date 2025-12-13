import React, { useEffect } from "react";
import { useCanvasState } from "../stores/canvas-controller-store";
import { useViewingDocStore } from "../stores/viewing-doc-store";
import type { BodyType, RawBodyType, EditingType } from "../types/editor.types";
import ConsumesOption from "../components/canvas/ConsumesOption";
import RawBodyDropdown from "../components/canvas/RawBodyDropdown";

const BODY_OPTIONS: { key: BodyType; label: string }[] = [
  { key: "none", label: "none" },
  { key: "form-data", label: "form-data" },
  { key: "x-www-form-urlencoded", label: "x-www-form-urlencoded" },
  { key: "binary", label: "binary" },
  { key: "raw", label: "raw" },
];

const RAW_OPTIONS: RawBodyType[] = [
  "text",
  "JSON",
  "XML",
  "HTML",
  "JavaScript",
];

const EDITING_OPTIONS: { key: EditingType; label: string }[] = [
  { key: "params", label: "Params" },
  { key: "headers", label: "Headers" },
  { key: "body", label: "Body" },
];

const RequestInputController: React.FC = () => {
  const { endpoint } = useViewingDocStore();

  // zustand store selectors
  const { editing, bodyType, rawType, setEditing, setBodyType, setRawType } =
    useCanvasState();

  useEffect(() => {
    console.log(editing, bodyType, rawType);
  }, [editing, bodyType, rawType]);

  const consumes = endpoint?.consumes && endpoint.consumes.length > 0;

  return (
    <div
      className={`flex ${
        consumes
          ? "flex-row items-center justify-start gap-4"
          : "flex-col justify-center items-start "
      } text-xs w-full`}
    >
      <div className="flex gap-3">
        {EDITING_OPTIONS.map((opt) => {
          const active = opt.key === editing;
          return (
            <SwitchBtn
              key={opt.key}
              name={opt.label}
              type={opt.key}
              active={active}
              onClick={() => setEditing(opt.key)}
            />
          );
        })}
      </div>

      {consumes ? (
        <ConsumesOption />
      ) : (
        <div className="flex items-center gap-4 mr-3">
          <BodySelector
            value={bodyType}
            onChange={(v) => setBodyType(v)}
            rawValue={rawType ?? "JSON"}
            onRawChange={(r) => setRawType(r)}
          />
        </div>
      )}
    </div>
  );
};

export default RequestInputController;

/* --------------------------
   SwitchBtn - small tab-style control
   -------------------------- */
interface SwitchBtnProps {
  name: string;
  type: EditingType;
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
      <span>{name}</span>
    </button>
  );
};

/* --------------------------
   BodySelector - radio-like controls + custom raw dropdown
   -------------------------- */
interface BodySelectorProps {
  value: BodyType;
  onChange: (v: BodyType) => void;
  rawValue: RawBodyType;
  onRawChange: (r: RawBodyType) => void;
}

const BodySelector: React.FC<BodySelectorProps> = ({
  value,
  onChange,
  rawValue,
  onRawChange,
}) => {
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
              type="button"
              className={`inline-flex items-center gap-1.5 py-1.5 text-xs transition-colors duration-150 ${
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
                aria-hidden="true"
              />
              <span className="whitespace-nowrap">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {value === "raw" && (
        <div className="flex items-center gap-2 relative">
          <RawBodyDropdown
            value={rawValue}
            options={RAW_OPTIONS}
            onChange={(r) => onRawChange(r)}
          />
        </div>
      )}
    </div>
  );
};
