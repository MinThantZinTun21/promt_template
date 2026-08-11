import Link from "next/link";
import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/utils";

export function Card({
  children,
  className,
  interactive,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-[var(--r-xl)] border border-separator bg-card",
        interactive &&
          "transition-[transform,box-shadow] duration-[var(--duration-standard)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:shadow-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Grouped-list container: hairline-separated rows inside one rounded card. */
export function InsetGroup({
  children,
  title,
  footer,
  className,
}: {
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {title && (
        <h2 className="mb-2 px-4 text-footnote font-medium uppercase tracking-[0.06em] text-label-secondary">
          {title}
        </h2>
      )}
      <div className="overflow-hidden rounded-[var(--r-xl)] border border-separator bg-card">
        {children}
      </div>
      {footer && <p className="mt-2 px-4 text-footnote text-label-secondary">{footer}</p>}
    </section>
  );
}

export function ListRow({
  title,
  subtitle,
  icon,
  accent,
  href,
  trailing,
  chevron,
  onClick,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconName;
  accent?: string;
  href?: string;
  trailing?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      {icon && (
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-[var(--r-sm)]"
          style={{
            color: accent ?? "var(--sys-blue)",
            backgroundColor: `color-mix(in srgb, ${accent ?? "var(--sys-blue)"} 14%, transparent)`,
          }}
        >
          <Icon name={icon} size={18} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-callout font-medium text-label">{title}</span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-footnote text-label-secondary">{subtitle}</span>
        )}
      </span>
      {trailing}
      {chevron && <Icon name="chevronRight" size={16} className="shrink-0 text-label-tertiary" />}
    </>
  );

  const shared = cx(
    "flex w-full items-center gap-3 px-4 py-3 text-left",
    "not-last:hairline-b",
    (href || onClick) && "transition-colors hover:bg-fill-quaternary active:bg-fill-tertiary",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={shared}>
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shared}>
        {inner}
      </button>
    );
  }

  return <div className={shared}>{inner}</div>;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-title-2 text-label">{title}</h2>
        {subtitle && <p className="mt-1 text-subheadline text-label-secondary">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon = "magnifier",
  title,
  message,
  action,
}: {
  icon?: IconName;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--r-xl)] border border-separator bg-card px-6 py-16 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-fill-tertiary text-label-secondary">
        <Icon name={icon} size={26} />
      </span>
      <h3 className="text-title-3 text-label">{title}</h3>
      {message && (
        <p className="mt-2 max-w-sm text-subheadline text-label-secondary">{message}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  icon,
}: {
  children: ReactNode;
  tone?: "neutral" | "blue" | "green" | "orange" | "red" | "purple";
  icon?: IconName;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-fill-tertiary text-label-secondary",
    blue: "bg-[color-mix(in_srgb,var(--sys-blue)_14%,transparent)] text-[var(--sys-blue)]",
    green: "bg-[color-mix(in_srgb,var(--sys-green)_16%,transparent)] text-[var(--sys-green)]",
    orange: "bg-[color-mix(in_srgb,var(--sys-orange)_18%,transparent)] text-[var(--sys-orange)]",
    red: "bg-[color-mix(in_srgb,var(--sys-red)_14%,transparent)] text-[var(--sys-red)]",
    purple: "bg-[color-mix(in_srgb,var(--sys-purple)_14%,transparent)] text-[var(--sys-purple)]",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption-1 font-medium",
        tones[tone],
      )}
    >
      {icon && <Icon name={icon} size={12} strokeWidth={2} />}
      {children}
    </span>
  );
}

export function Stat({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon?: IconName;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--r-lg)] bg-fill-quaternary px-4 py-3">
      <span className="flex items-center gap-1.5 text-caption-1 uppercase tracking-[0.06em] text-label-secondary">
        {icon && <Icon name={icon} size={13} />}
        {label}
      </span>
      <span className="text-title-3 tabular-nums text-label">{value}</span>
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cx("border-0 border-t border-separator", className)} />;
}
