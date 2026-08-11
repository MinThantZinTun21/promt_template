import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/utils";

type Variant = "filled" | "tinted" | "gray" | "plain" | "bordered" | "destructive";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  filled:
    "text-white bg-[var(--sys-blue)] hover:bg-[var(--sys-blue-hover)] shadow-[0_1px_2px_rgba(0,0,0,0.12)]",
  tinted:
    "text-[var(--sys-blue)] bg-[color-mix(in_srgb,var(--sys-blue)_13%,transparent)] hover:bg-[color-mix(in_srgb,var(--sys-blue)_20%,transparent)]",
  gray: "text-label bg-fill-tertiary hover:bg-fill-secondary",
  plain: "text-[var(--sys-blue)] hover:bg-fill-quaternary",
  bordered: "text-label bg-card border border-separator hover:bg-fill-quaternary",
  destructive:
    "text-[var(--sys-red)] bg-[color-mix(in_srgb,var(--sys-red)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--sys-red)_18%,transparent)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 gap-1.5 text-footnote font-medium rounded-[var(--r-sm)]",
  md: "h-10 px-4 gap-2 text-subheadline font-semibold rounded-[var(--r-md)]",
  lg: "h-12 px-5 gap-2 text-body font-semibold rounded-[var(--r-lg)]",
};

const ICON_SIZE: Record<Size, number> = { sm: 15, md: 17, lg: 19 };

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconTrailing?: IconName;
  pill?: boolean;
  block?: boolean;
  children?: ReactNode;
  className?: string;
};

function classes({ variant = "filled", size = "md", pill, block, className }: CommonProps) {
  return cx(
    "pressable inline-flex select-none items-center justify-center whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    pill && "rounded-full",
    block && "w-full",
    className,
  );
}

export function Button({
  variant,
  size = "md",
  icon,
  iconTrailing,
  pill,
  block,
  children,
  className,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={classes({ variant, size, pill, block, className })}
      {...rest}
    >
      {icon && <Icon name={icon} size={ICON_SIZE[size]} strokeWidth={1.85} />}
      {children}
      {iconTrailing && <Icon name={iconTrailing} size={ICON_SIZE[size]} strokeWidth={1.85} />}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size = "md",
  icon,
  iconTrailing,
  pill,
  block,
  children,
  className,
  prefetch,
  target,
  rel,
}: CommonProps & {
  href: string;
  prefetch?: boolean;
  target?: string;
  rel?: string;
}) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      target={target}
      rel={rel}
      className={classes({ variant, size, pill, block, className })}
    >
      {icon && <Icon name={icon} size={ICON_SIZE[size]} strokeWidth={1.85} />}
      {children}
      {iconTrailing && <Icon name={iconTrailing} size={ICON_SIZE[size]} strokeWidth={1.85} />}
    </Link>
  );
}

/** Circular icon-only control sized to the 44pt minimum hit target. */
export function IconButton({
  icon,
  label,
  variant = "gray",
  size = 36,
  className,
  ...rest
}: {
  icon: IconName;
  label: string;
  variant?: Variant;
  size?: number;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className={cx(
        "pressable inline-flex shrink-0 items-center justify-center rounded-full",
        "disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={Math.round(size * 0.52)} strokeWidth={1.8} />
    </button>
  );
}
