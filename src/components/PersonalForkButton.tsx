"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { PersonalPromptRecord } from "@/lib/personal-store";
import { duplicatePersonalPrompt, upsertPersonalPrompt } from "@/lib/personal-store";
import { IconButton, Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function PersonalForkButton({
  prompt,
  withLabel = true,
  className,
}: {
  prompt: PersonalPromptRecord;
  withLabel?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const onClick = () => {
    setPending(true);
    try {
      const next = duplicatePersonalPrompt(prompt);
      upsertPersonalPrompt(next);
      toast.show("Created another draft in your private shelf", { tone: "success", icon: "fork" });
      router.push(`/p/${next.id}/edit`);
    } finally {
      setPending(false);
    }
  };

  if (!withLabel) {
    return (
      <IconButton
        type="button"
        icon="fork"
        label="Fork this draft"
        variant="gray"
        disabled={pending}
        className={className}
        onClick={onClick}
      />
    );
  }

  return (
    <Button
      type="button"
      variant="filled"
      disabled={pending}
      icon={pending ? undefined : "fork"}
      onClick={onClick}
      className={className}
    >
      {pending ? "Forking…" : "Fork"}
    </Button>
  );
}

