"use client";

import { useActionState, useState } from "react";

import { updateProfileAction, type AuthFormState } from "@/app/actions/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";

export function ProfileEditor({
  name,
  handle,
  bio,
}: {
  name: string;
  handle: string;
  bio: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    updateProfileAction,
    {},
  );
  const errors = state.fieldErrors ?? {};

  return (
    <>
      <div className="flex items-center gap-3.5 rounded-[var(--r-xl)] border border-separator bg-card p-4">
        <Avatar name={name} handle={handle} size={48} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-headline text-label">{name}</p>
          <p className="truncate text-footnote text-label-secondary">@{handle}</p>
          {bio && <p className="mt-1 truncate-2 text-footnote text-label-secondary">{bio}</p>}
        </div>

        <Button variant="gray" size="sm" icon="pencil" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        description="Your name and bio appear on prompts you publish."
        width="sm"
      >
        <form action={formAction} className="flex flex-col gap-4">
          <Field label="Name" htmlFor="profile-name" error={errors.name} required>
            <TextInput
              id="profile-name"
              name="name"
              defaultValue={name}
              maxLength={60}
              invalid={Boolean(errors.name)}
              required
            />
          </Field>

          <Field
            label="Bio"
            htmlFor="profile-bio"
            error={errors.bio}
            hint="Up to 280 characters. What you work on, and what you write prompts for."
          >
            <TextArea id="profile-bio" name="bio" rows={3} defaultValue={bio} maxLength={280} />
          </Field>

          {state.ok && (
            <p className="flex items-center gap-1.5 text-footnote text-[var(--sys-green)]">
              <Icon name="checkmarkCircleFill" size={14} />
              Profile saved.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="gray" onClick={() => setOpen(false)}>
              Done
            </Button>
            <Button type="submit" variant="filled" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Sheet>
    </>
  );
}
