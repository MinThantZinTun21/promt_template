"use client";

import { useState } from "react";

import { recordCopyAction } from "@/app/actions/prompts";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { cx } from "@/lib/utils";

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API needs a secure context; fall back to a hidden textarea.
    try {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(field);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({
  text,
  promptId,
  label = "Copy prompt",
  copiedLabel = "Copied",
  variant = "filled",
  size = "md",
  iconOnly,
  className,
}: {
  text: string;
  promptId?: string;
  label?: string;
  copiedLabel?: string;
  variant?: "filled" | "gray" | "tinted";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  className?: string;
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const ok = await writeToClipboard(text);

    if (!ok) {
      toast.show("Could not access the clipboard", { tone: "error" });
      return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
    toast.show(copiedLabel === "Copied" ? "Copied to clipboard" : copiedLabel, {
      tone: "success",
    });

    if (promptId) {
      try {
        await recordCopyAction(promptId);
      } catch {
        // A failed counter update should never block the copy.
      }
    }
  };

  const variants = {
    filled: "text-white bg-[var(--sys-blue)] hover:bg-[var(--sys-blue-hover)]",
    gray: "bg-fill-tertiary text-label hover:bg-fill-secondary",
    tinted:
      "bg-[color-mix(in_srgb,var(--sys-blue)_13%,transparent)] text-[var(--sys-blue)] hover:bg-[color-mix(in_srgb,var(--sys-blue)_20%,transparent)]",
  } as const;

  const sizes = {
    sm: iconOnly ? "size-8" : "h-8 px-3 text-footnote gap-1.5",
    md: iconOnly ? "size-10" : "h-10 px-4 text-subheadline gap-2",
    lg: iconOnly ? "size-12" : "h-12 px-5 text-body gap-2",
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      className={cx(
        "pressable inline-flex items-center justify-center rounded-[var(--r-md)] font-semibold",
        variants[variant],
        sizes[size],
        iconOnly && "rounded-full",
        className,
      )}
    >
      <Icon
        name={copied ? "checkmark" : "copy"}
        size={size === "sm" ? 15 : 17}
        strokeWidth={2}
        className={copied ? "animate-pop" : undefined}
      />
      {!iconOnly && (copied ? copiedLabel : label)}
    </button>
  );
}
