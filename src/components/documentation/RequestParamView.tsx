import { useViewingEndpoint } from "../../stores/viewing-doc-store";
import type {
  EndpointHeader,
  EndpointPathVariable,
  EndpointQueryParam,
  PrimitiveFieldType,
} from "../../types/response.types";
import { useEffect, useRef, useState } from "react";

interface RequestParams {
  pathVariables?: EndpointPathVariable[];
  queryParams?: EndpointQueryParam[];
  headers?: EndpointHeader[];
}

interface ParamItem {
  name: string;
  type: PrimitiveFieldType | string;
  required: boolean;
  description: string | null;
  default_value?: string | number | null;
  constraints: string[];
}

const RequestParamView: React.FC<RequestParams> = ({
  pathVariables,
  queryParams,
  headers,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endpoint = useViewingEndpoint();

  const [hoverInfo, setHoverInfo] = useState<{
    visible: boolean;
    top: number;
    left: number;
    data: ParamItem | null;
  }>({ visible: false, top: 0, left: 0, data: null });

  // track both trigger and card separately
  const [isHoveringTrigger, setIsHoveringTrigger] = useState(false);

  useEffect(() => {
    setIsHoveringTrigger(false);
    setHoverInfo({ visible: false, top: 0, left: 0, data: null });
  },[endpoint])

  const paramGroups = [
    {
      label: "Path Variables",
      items:
        pathVariables?.map((p) => ({
          name: p.name,
          type: p.type,
          required: p.required,
          description: p.description,
          constraints: p.constraints,
        })) || [],
    },
    {
      label: "Query Params",
      items:
        queryParams?.map((q) => ({
          name: q.name,
          type: q.type,
          required: q.required,
          description: q.description,
          default_value: q.default_value,
          constraints: q.constraints,
        })) || [],
    },
    {
      label: "Headers",
      items:
        headers?.map((h) => ({
          name: h.name,
          type: h.type,
          required: h.required,
          description: h.description,
          constraints: [],
        })) || [],
    },
  ].filter((g) => g.items.length > 0);

  const showHoverCard = (
    e: React.MouseEvent<HTMLTableRowElement>,
    data: ParamItem
  ) => {
    const rowRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (!containerRect) {
      setHoverInfo({
        visible: true,
        top: rowRect.bottom + 4,
        left: rowRect.left,
        data: { ...data },
      });
      setIsHoveringTrigger(true);
      return;
    }

    const top = rowRect.bottom - containerRect.top + 4;
    const left = rowRect.left - containerRect.left;

    setHoverInfo({
      visible: true,
      top,
      left,
      data: { ...data },
    });
    setIsHoveringTrigger(true);
  };

  const handleTriggerLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
    setIsHoveringTrigger(false);

    const related = e.relatedTarget as Node | null;
    // if moving into the card (which is inside container), do not hide
    if (
      related &&
      containerRef.current &&
      containerRef.current.contains(related)
    ) {
      return;
    }

    // left trigger and not going to card → hide
    setHoverInfo({ visible: false, top: 0, left: 0, data: null });
  };

  const handleCardEnter = () => {
    setHoverInfo((prev) => ({ ...prev, visible: true }));
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {

    const related = e.relatedTarget as Node | null;
    // if going back to a trigger row (inside container), keep visible
    if (
      related &&
      containerRef.current &&
      containerRef.current.contains(related)
    ) {
      return;
    }

    // left card and not on trigger → hide
    if (!isHoveringTrigger) {
      setHoverInfo({ visible: false, top: 0, left: 0, data: null });
    }
  };

  return (
    <section ref={containerRef} className="w-full relative">
      <table className="w-full border-collapse text-sm bg-transparent">
        <tbody>
          {paramGroups.map((group, groupIdx) => (
            <tr key={group.label} className="align-top">
              {/* LEFT COLUMN (LABELS) */}
              <td
                className={[
                  "w-48 px-6 py-2 text-surface-200 border-r border-surface-500/50",
                  groupIdx !== paramGroups.length - 1
                    ? "border-b border-surface-500/50"
                    : "",
                ].join(" ")}
              >
                {group.label}
              </td>

              {/* RIGHT COLUMN (INNER TABLE) */}
              <td
                className={
                  groupIdx !== paramGroups.length - 1
                    ? "border-b border-surface-500/50"
                    : ""
                }
              >
                <table className="w-full border-collapse bg-transparent">
                  <tbody>
                    {group.items.map((item, itemIdx) => (
                      <tr
                        key={item.name}
                        className={[
                          "cursor-default transition-colors ease-in-out duration-150",
                          itemIdx !== group.items.length - 1
                            ? "border-b border-surface-500/30"
                            : "",
                          "hover:bg-black/10",
                        ].join(" ")}
                        onMouseEnter={(e) => showHoverCard(e, item)}
                        onMouseLeave={handleTriggerLeave}
                      >
                        <td className="px-6 py-2 w-full text-sm">
                          <span>{item.name}</span>
                          <span className="text-danger/80 text-md">
                            {item.required ? " *" : ""}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* HOVER CARD: displayed just below the row; stays visible when hovered */}
      {hoverInfo.visible && hoverInfo.data && (
        <>
          <div
            className="absolute z-50 p-4 rounded-lg shadow-xl border border-surface-500/50 bg-surface-700/95 backdrop-blur-sm max-w-sm min-w-3/6 text-sm max-h-80 overflow-y-auto"
            style={{
              top: hoverInfo.top,
              left: hoverInfo.left,
            }}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
          >
            <div className="font-medium text-foreground mb-2 flex w-full">
              {hoverInfo.data.required && (
                <span className="px-1 font-normal text-rose-400 bg-rose-500/30 rounded-sm">
                  Required
                </span>
              )}
            </div>
            <div className="space-y-2 text-foreground/90">
              <div>
                <span className="font-medium">Type:</span>{" "}
                <span className="font-mono bg-surface-600/50 px-2 py-0.5 rounded text-xs">
                  {hoverInfo.data.type}
                </span>
              </div>

              {hoverInfo.data.default_value !== undefined &&
                hoverInfo.data.default_value !== null && (
                  <div>
                    <span className="font-medium">Default:</span>{" "}
                    <code className="bg-surface-600/50 px-2 py-0.5 rounded text-xs">
                      {hoverInfo.data.default_value}
                    </code>
                  </div>
                )}

              {hoverInfo.data.description && (
                <div>
                  <span className="font-medium">Description:</span>{" "}
                  {hoverInfo.data.description}
                </div>
              )}

              {hoverInfo.data.constraints?.length > 0 && (
                <div>
                  <span className="font-medium">Constraints:</span>
                  <ul className="mt-1 ml-4 list-disc list-inside space-y-0.5">
                    {hoverInfo.data.constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default RequestParamView;
