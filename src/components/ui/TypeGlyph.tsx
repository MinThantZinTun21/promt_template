import { Icon, type IconName } from "@/components/ui/Icon";
import { ACCENT_VAR, type AccentColor } from "@/lib/taxonomy";
import { cx } from "@/lib/utils";

/** Rounded-square icon tile in the style of an app or Settings row glyph. */
export function TypeGlyph({
  icon,
  accent,
  size = 36,
  filled,
  className,
}: {
  icon: IconName;
  accent: AccentColor;
  size?: number;
  filled?: boolean;
  className?: string;
}) {
  const tint = ACCENT_VAR[accent];

  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.29),
        color: filled ? "#fff" : tint,
        background: filled
          ? `linear-gradient(165deg, ${tint}, color-mix(in srgb, ${tint} 72%, black))`
          : `color-mix(in srgb, ${tint} 14%, transparent)`,
        boxShadow: filled ? "0 1px 3px rgba(0,0,0,0.18)" : "none",
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.56)} strokeWidth={1.8} />
    </span>
  );
}
