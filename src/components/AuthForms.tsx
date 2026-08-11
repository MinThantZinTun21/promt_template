"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInAction, signUpAction, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, FormBanner, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

export function SignInForm({ next, demoEmail }: { next?: string; demoEmail?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signInAction, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <FormBanner tone="error">{state.error}</FormBanner>}

      <Field label="Email" htmlFor="email" error={errors.email} required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={demoEmail}
          placeholder="you@example.com"
          invalid={Boolean(errors.email)}
          required
        />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password} required>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          invalid={Boolean(errors.password)}
          required
        />
      </Field>

      <Button type="submit" variant="filled" size="lg" block disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-footnote text-label-secondary">
        New here?{" "}
        <Link href="/signup" className="font-medium text-[var(--sys-blue)]">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUpAction, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormBanner tone="error">{state.error}</FormBanner>}

      <Field label="Name" htmlFor="name" error={errors.name} required>
        <TextInput
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Maya Chen"
          invalid={Boolean(errors.name)}
          required
        />
      </Field>

      <Field
        label="Handle"
        htmlFor="handle"
        error={errors.handle}
        hint="Optional. Used in your profile URL — we will pick one if you skip it."
      >
        <TextInput
          id="handle"
          name="handle"
          autoCapitalize="none"
          autoComplete="username"
          placeholder="mayachen"
          invalid={Boolean(errors.handle)}
        />
      </Field>

      <Field label="Email" htmlFor="email" error={errors.email} required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          invalid={Boolean(errors.email)}
          required
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        error={errors.password}
        hint="At least 8 characters."
        required
      >
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={8}
          invalid={Boolean(errors.password)}
          required
        />
      </Field>

      <Button type="submit" variant="filled" size="lg" block disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="flex items-start gap-1.5 text-caption-1 text-label-tertiary">
        <Icon name="lock" size={13} className="mt-px shrink-0" />
        Passwords are hashed with bcrypt and the session is a signed, http-only cookie.
      </p>

      <p className="text-center text-footnote text-label-secondary">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-[var(--sys-blue)]">
          Sign in
        </Link>
      </p>
    </form>
  );
}
