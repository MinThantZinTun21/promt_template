import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/utils";

const CONTROL =
  "w-full rounded-[var(--r-md)] border border-separator bg-fill-quaternary px-3.5 text-callout text-label outline-none transition-[background-color,border-color] placeholder:text-label-tertiary focus:border-[var(--sys-blue)] focus:bg-card disabled:opacity-50";

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  trailing,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-footnote font-semibold text-label">
          {label}
          {required && <span className="ml-0.5 text-[var(--sys-red)]">*</span>}
        </label>
        {trailing}
      </div>

      {children}

      {error ? (
        <p className="flex items-center gap-1 text-footnote text-[var(--sys-red)]">
          <Icon name="warning" size={13} strokeWidth={2} />
          {error}
        </p>
      ) : (
        hint && <p className="text-footnote text-label-secondary">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({
  className,
  invalid,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cx(CONTROL, "h-11", invalid && "border-[var(--sys-red)]", className)}
      {...rest}
    />
  );
}

export function TextArea({
  className,
  invalid,
  mono,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; mono?: boolean }) {
  return (
    <textarea
      className={cx(
        CONTROL,
        "resize-y py-3 leading-relaxed",
        mono && "font-mono text-subheadline",
        invalid && "border-[var(--sys-red)]",
        className,
      )}
      {...rest}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cx(CONTROL, "h-11 cursor-pointer appearance-none pr-10", className)}
        {...rest}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-label-secondary">
        <Icon name="chevronUpDown" size={16} strokeWidth={1.9} />
      </span>
    </div>
  );
}

export function FormBanner({
  tone = "error",
  children,
}: {
  tone?: "error" | "info" | "success";
  children: ReactNode;
}) {
  const tones = {
    error: {
      color: "var(--sys-red)",
      icon: "warning" as const,
    },
    info: {
      color: "var(--sys-blue)",
      icon: "infoCircle" as const,
    },
    success: {
      color: "var(--sys-green)",
      icon: "checkmarkCircleFill" as const,
    },
  }[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="flex items-start gap-2.5 rounded-[var(--r-md)] px-3.5 py-3 text-subheadline"
      style={{
        color: tones.color,
        backgroundColor: `color-mix(in srgb, ${tones.color} 11%, transparent)`,
      }}
    >
      <Icon name={tones.icon} size={17} strokeWidth={1.9} className="mt-px shrink-0" />
      <span className="min-w-0 text-label">{children}</span>
    </div>
  );
}
