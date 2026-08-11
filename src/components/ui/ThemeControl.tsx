"use client";

import { useCallback, useSyncExternalStore } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/utils";

export const THEME_STORAGE_KEY = "promptshelf-appearance";

type Appearance = "light" | "auto" | "dark";

const OPTIONS: Array<{ id: Appearance; label: string; icon: IconName }> = [
  { id: "light", label: "Light", icon: "sun" },
  { id: "auto", label: "Automatic", icon: "circleHalf" },
  { id: "dark", label: "Dark", icon: "moon" },
];

/** Inlined before paint so the stored appearance never flashes the wrong theme. */
export const themeBootstrapScript = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

// The appearance lives in localStorage and on <html>, so it is read through an
// external store rather than mirrored into component state.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Appearance {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "auto") return stored;
  } catch {
    // Blocked storage: fall back to following the system.
  }
  return "auto";
}

function getServerSnapshot(): Appearance {
  return "auto";
}

function setAppearance(appearance: Appearance) {
  const root = document.documentElement;
  if (appearance === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", appearance);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, appearance);
  } catch {
    // Private browsing: the choice applies now but will not persist.
  }

  for (const listener of listeners) listener();
}

export function ThemeControl({ className }: { className?: string }) {
  const appearance = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const select = useCallback((next: Appearance) => setAppearance(next), []);

  const index = OPTIONS.findIndex((option) => option.id === appearance);

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className={cx(
        "relative isolate inline-grid h-8 grid-cols-3 rounded-full bg-fill-tertiary p-0.5",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0.5 -z-10 w-[calc((100%-4px)/3)] rounded-full bg-card shadow-1 transition-transform duration-[var(--duration-standard)] ease-[var(--ease-out)]"
        style={{ transform: `translateX(${Math.max(index, 0) * 100}%)` }}
      />

      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={appearance === option.id}
          aria-label={option.label}
          title={option.label}
          onClick={() => select(option.id)}
          className={cx(
            "flex size-7 items-center justify-center rounded-full transition-colors",
            appearance === option.id
              ? "text-label"
              : "text-label-tertiary hover:text-label-secondary",
          )}
        >
          <Icon name={option.icon} size={15} strokeWidth={1.9} />
        </button>
      ))}
    </div>
  );
}
