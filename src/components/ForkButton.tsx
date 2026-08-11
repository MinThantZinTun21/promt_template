"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Prompt } from "@/lib/prompts";
import { createPersonalPromptFromPublic, upsertPersonalPrompt } from "@/lib/personal-store";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { isCategoryId, isPromptTypeId } from "@/lib/taxonomy";

export function ForkButton({
  prompt,
  withLabel = true,
  className,
}: {
  prompt: Prompt;
  withLabel?: boolean;
  className?: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onClick = () => {
    setPending(true);
    try {
      if (!isPromptTypeId(prompt.promptType) || !isCategoryId(prompt.category)) {
        toast.show("This prompt cannot be forked.", { tone: "error" });
        return;
      }

      const personal = createPersonalPromptFromPublic({
        publicId: prompt.id,
        publicSlug: prompt.slug,
        publicTitle: prompt.title,
        values: {
          title: prompt.title,
          summary: prompt.summary,
          body: prompt.body,
          usageNotes: prompt.usageNotes ?? "",
          promptType: prompt.promptType,
          category: prompt.category,
          tags: prompt.tags,
          models: prompt.models,
          contributor: prompt.contributor,
        },
      });
      upsertPersonalPrompt(personal);

      toast.show("Forked into your private shelf", { tone: "success", icon: "fork" });
      router.push(`/p/${personal.id}/edit`);
    } finally {
      setPending(false);
    }
  };

  if (!withLabel) {
    return (
      <IconButton
        type="button"
        icon="fork"
        label="Fork into your private shelf"
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
      iconTrailing={undefined}
      onClick={onClick}
      className={className}
    >
      {pending ? "Forking…" : "Fork"}
    </Button>
  );
}

