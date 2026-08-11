import { ACCENT_VAR, type AccentColor } from "@/lib/taxonomy";
import { cx, hashToIndex, initials } from "@/lib/utils";

const TINTS: AccentColor[] = [
  "blue",
  "green",
  "indigo",
  "orange",
  "pink",
  "purple",
  "red",
  "teal",
  "mint",
  "brown",
  "cyan",
  "yellow",
];

/** Monogram avatar with a deterministic system-color tint per person. */
export function Avatar({
  name,
  handle,
  size = 32,
  className,
}: {
  name: string;
  handle: string;
  size?: number;
  className?: string;
}) {
  const tint = ACCENT_VAR[TINTS[hashToIndex(handle, TINTS.length)]];

  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: `linear-gradient(160deg, ${tint}, color-mix(in srgb, ${tint} 62%, black))`,
      }}
    >
      {initials(name || handle)}
    </span>
  );
}
