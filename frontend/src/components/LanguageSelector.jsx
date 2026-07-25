import { useState, useRef, useEffect } from "react";
import { LANG_ICONS, LANG_COLORS, ChevronDownIcon, SearchIcon } from "./Icons";

const LANG_GROUPS = {
  "Compiled": ["c", "cpp", "java", "go", "rust", "kotlin", "swift", "csharp", "dart"],
  "Interpreted": ["python", "javascript", "typescript", "php", "ruby", "bash"],
  "Data & Query": ["sql"],
  "Web": ["web"],
};

export default function LanguageSelector({ languages, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const current = languages.find((l) => l.id === value);
  const langMap = Object.fromEntries(languages.map((l) => [l.id, l]));

  const filteredGroups = Object.entries(LANG_GROUPS)
    .map(([group, ids]) => ({
      group,
      langs: ids
        .filter((id) => langMap[id])
        .filter(
          (id) =>
            !search ||
            langMap[id].label.toLowerCase().includes(search.toLowerCase()) ||
            id.includes(search.toLowerCase())
        )
        .map((id) => langMap[id]),
    }))
    .filter((g) => g.langs.length > 0);

  const color = LANG_COLORS[value] || "#888";
  const icon = LANG_ICONS[value] || "💻";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass-control flex items-center gap-2.5 px-3.5 py-2 rounded-control text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: 6,
            background: color + "18",
            color: color,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {icon}
        </span>
        <span>{current?.label || "Select language"}</span>
        <ChevronDownIcon
          size={14}
          className="transition-transform"
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0)",
          }}
        />
      </button>

      {open && (
        <div className="lang-dropdown" role="listbox">
          <div className="lang-search">
            <div style={{ position: "relative" }}>
              <SearchIcon
                size={14}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search languages…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 30 }}
              />
            </div>
          </div>

          {filteredGroups.map(({ group, langs }) => (
            <div key={group}>
              <div className="lang-group-title">{group}</div>
              {langs.map((lang) => {
                const lc = LANG_COLORS[lang.id] || "#888";
                const li = LANG_ICONS[lang.id] || "💻";
                return (
                  <button
                    key={lang.id}
                    role="option"
                    aria-selected={lang.id === value}
                    onClick={() => {
                      onChange(lang.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`lang-option ${lang.id === value ? "active" : ""}`}
                  >
                    <span
                      className="lang-option-icon"
                      style={{
                        background: lc + "18",
                        color: lc,
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {li}
                    </span>
                    {lang.label}
                    {lang.id === value && (
                      <span style={{ marginLeft: "auto", color: "var(--sky-secondary)", fontSize: 11, fontWeight: 600 }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div style={{ padding: "16px 14px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No languages match "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
