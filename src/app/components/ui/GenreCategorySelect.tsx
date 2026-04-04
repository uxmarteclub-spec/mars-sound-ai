import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import svgPaths from "../../../imports/svg-r7seo7qk5p";

export interface GenreCategorySelectProps {
  value: string;
  allValue: string;
  allLabel: string;
  options: readonly string[];
  onChange: (next: string) => void;
  onCreateGenre?: (displayName: string) => Promise<void>;
  triggerClassName?: string;
  dropdownClassName?: string;
  "aria-label"?: string;
}

type PanelPos = { top: number; left: number; width: number };

export function GenreCategorySelect({
  value,
  allValue,
  allLabel,
  options,
  onChange,
  onCreateGenre,
  triggerClassName = "",
  dropdownClassName = "",
  "aria-label": ariaLabel,
}: GenreCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const q = search.trim().toLowerCase();
  const filtered = options.filter((c) => c.toLowerCase().includes(q));
  const canCreate =
    !!onCreateGenre &&
    search.trim().length > 0 &&
    !options.some((c) => c.toLowerCase() === search.trim().toLowerCase());

  const updatePanelPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.max(r.width, 280);
    let left = r.left;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }
    setPanelPos({
      top: r.bottom + 6,
      left,
      width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }
    updatePanelPosition();
    const onWin = () => updatePanelPosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
      setSearch("");
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const triggerText = value === allValue ? allLabel : value;

  const handleCreate = useCallback(async () => {
    if (!onCreateGenre || !canCreate) return;
    const name = search.trim();
    setCreating(true);
    try {
      await onCreateGenre(name);
      onChange(name);
      setSearch("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }, [canCreate, onChange, onCreateGenre, search]);

  const dropdown =
    open && panelPos
      ? createPortal(
          <div
            ref={panelRef}
            className={`fixed z-[10050] overflow-hidden shadow-lg rounded-md ${dropdownClassName}`}
            style={{
              top: panelPos.top,
              left: panelPos.left,
              width: panelPos.width,
              maxHeight: "min(320px, calc(100vh - 24px))",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-subtle)",
            }}
            role="listbox"
            aria-label="Lista de categorias"
          >
            <div
              className="p-2"
              style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar categoria..."
                className="w-full bg-transparent px-3 py-1.5 text-[14px] outline-none placeholder:text-[var(--color-text-muted)]"
                style={{
                  color: "var(--color-text-primary)",
                  caretColor: "var(--color-brand)",
                }}
                autoFocus
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-[220px] overflow-y-auto scrollbar-hide">
              <button
                type="button"
                role="option"
                className="w-full text-left px-6 py-2.5 text-[14px] font-semibold transition-colors hover:bg-[var(--color-hover-bg)] min-h-[44px]"
                style={{
                  color:
                    value === allValue
                      ? "var(--color-brand)"
                      : "var(--color-text-primary)",
                }}
                onClick={() => {
                  onChange(allValue);
                  setSearch("");
                  setOpen(false);
                }}
              >
                {allLabel}
              </button>
              {filtered.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="option"
                  className="w-full text-left px-6 py-2.5 text-[14px] font-semibold transition-colors hover:bg-[var(--color-hover-bg)] min-h-[44px]"
                  style={{
                    color:
                      value === cat
                        ? "var(--color-brand)"
                        : "var(--color-text-primary)",
                  }}
                  onClick={() => {
                    onChange(cat);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  {cat}
                </button>
              ))}
              {filtered.length === 0 && !canCreate ? (
                <div
                  className="px-6 py-3 text-[13px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Nenhuma categoria encontrada
                </div>
              ) : null}
              {canCreate ? (
                <button
                  type="button"
                  disabled={creating}
                  className="w-full text-left px-6 py-2.5 text-[14px] font-semibold transition-colors hover:bg-[var(--color-hover-bg)] min-h-[44px] disabled:opacity-50 border-t border-[var(--color-border-subtle)]"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => void handleCreate()}
                >
                  {creating
                    ? "A criar…"
                    : `Adicionar “${search.trim()}” como nova categoria`}
                </button>
              ) : null}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={`relative min-w-0 ${dropdownClassName}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`w-full flex items-center justify-between gap-2 px-4 sm:px-6 py-3 text-left transition-colors min-h-[48px] ${triggerClassName}`}
        style={{
          border: "none",
          color: "var(--color-text-primary)",
          background: "transparent",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`font-semibold text-[15px] sm:text-[16px] leading-[1.5] truncate ${
            value === allValue ? "text-[var(--color-text-secondary)]" : ""
          }`}
        >
          {triggerText}
        </span>
        <svg
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 9.33439 4.7821"
          aria-hidden
        >
          <path d={svgPaths.p3c6a5200} fill="var(--color-brand)" />
        </svg>
      </button>
      {dropdown}
    </div>
  );
}
