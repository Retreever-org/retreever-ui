import React from "react";
import { createPortal } from "react-dom";
import {
  uploadFile,
  deleteFile,
  deleteAllFiles,
} from "../../storage/file-storage";
import { DeleteIcon } from "../../svgs/svgs";

interface Props {
  value: string; // JSON string of fileIds[]
  onChange: (nextValue: string) => void;
}

interface StoredFile {
  id: string;
  name: string;
}

const FileUploadInput: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = React.useState<StoredFile[]>([]);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  /* ---------------- sync from value ---------------- */

  React.useEffect(() => {
    try {
      const ids: string[] = value ? JSON.parse(value) : [];
      setFiles(ids.map((id) => ({ id, name: id })));
    } catch {
      setFiles([]);
    }
  }, [value]);

  /* ---------------- outside click ---------------- */

  React.useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* ---------------- upload ---------------- */

  const handleFiles = async (list: FileList) => {
    const uploaded: StoredFile[] = [];

    for (const file of Array.from(list)) {
      const id = await uploadFile(file);
      uploaded.push({ id, name: file.name });
    }

    setFiles((prev) => {
      const next = [...prev, ...uploaded];
      onChange(JSON.stringify(next.map((f) => f.id)));
      return next;
    });
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  /* ---------------- delete ---------------- */

  const removeFile = async (id: string) => {
    await deleteFile(id);
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      onChange(JSON.stringify(next.map((f) => f.id)));
      return next;
    });
  };

  const removeAll = async () => {
    await deleteAllFiles();
    setFiles([]);
    onChange("[]");
    setOpen(false);
  };

  /* ---------------- render ---------------- */

  const empty = files.length === 0;
  const rect = rootRef.current?.getBoundingClientRect();

  return (
    <div
      ref={rootRef}
      className="relative h-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* EMPTY */}
      {empty && (
        <label
          className="
            w-full h-8 flex items-center justify-start gap-1
            cursor-pointer
            text-surface-300
            rounded-md text-left
          "
        >
          <span>
            <FileSvg />
          </span>
          <span>Upload files</span>
          <input
            type="file"
            multiple
            className="hidden w-full h-full"
            onChange={onInputChange}
          />
        </label>
      )}

      {/* SELECTED */}
      {!empty && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="
            w-full h-full text-left
            text-surface-200
            flex items-center gap-1
          "
        >
          <span>
            <FileSvg />
          </span>
          <span>
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </span>
        </button>
      )}

      {/* DROPDOWN */}
      {open &&
        rect &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: rect.bottom + 6,
              left: rect.left,
              width: 280,
            }}
            className="
                z-9999
                bg-black/30 backdrop-blur-md
                border border-surface-500/50
                rounded-md shadow-lg
                overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center py-2 px-3 justify-between border-b border-surface-500/40">
              <span className="text-xs text-surface-300">Selected files</span>
              <button
                onClick={removeAll}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Clear all
              </button>
            </div>

            {/* Scrollable file list */}
            <div className="max-h-64 overflow-y-auto  scroll-thin">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="
                    group
                    py-2 px-3 space-x-2
                    flex items-center justify-between
                    text-surface-200 text-xs
                    hover:bg-surface-800/40
                  "
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>
                      <FileSvg />
                    </span>
                    <span className="truncate">{f.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="
                        hidden group-hover:inline-flex
                        text-red-400 hover:text-red-300
                    "
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default FileUploadInput;

const FileSvg: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    className="size-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
    />
  </svg>
);
