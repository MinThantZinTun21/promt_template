import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/AuthForms";
import { Icon } from "@/components/ui/Icon";
import { currentUser } from "@/lib/auth";
import { SEED_PASSWORD, SEED_USERS } from "@/lib/seed-data";
import type { RawSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save prompts and contribute to the library.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const next = typeof raw.next === "string" && raw.next.startsWith("/") ? raw.next : undefined;

  const user = await currentUser();
  if (user) redirect(next ?? "/library");
  const demo = SEED_USERS.find((seedUser) => seedUser.role === "admin");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
      <div className="mb-7 text-center">
        <span
          className="mx-auto mb-4 flex size-12 items-center justify-center rounded-[14px] text-white"
          style={{
            background:
              "linear-gradient(160deg, var(--sys-blue), color-mix(in srgb, var(--sys-indigo) 82%, black))",
          }}
        >
          <Icon name="shelf" size={24} strokeWidth={1.8} />
        </span>
        <h1 className="text-title-1 text-label">Welcome back</h1>
        <p className="mt-1.5 text-subheadline text-label-secondary">
          Sign in to save prompts, fork templates, and publish your own.
        </p>
      </div>

      <div className="rounded-[var(--r-xl)] border border-separator bg-card p-5">
        <SignInForm next={next} />
      </div>

      {demo && (
        <div className="mt-5 rounded-[var(--r-lg)] border border-separator bg-fill-quaternary p-4">
          <h2 className="flex items-center gap-1.5 text-footnote font-semibold text-label">
            <Icon name="key" size={14} className="text-label-secondary" />
            Demo accounts
          </h2>
          <p className="mt-1.5 text-footnote text-label-secondary">
            Every seeded account uses the password{" "}
            <code className="rounded bg-fill-tertiary px-1 py-0.5 font-mono text-caption-1 text-label">
              {SEED_PASSWORD}
            </code>
            . Sign in as{" "}
            <code className="rounded bg-fill-tertiary px-1 py-0.5 font-mono text-caption-1 text-label">
              {demo.email}
            </code>{" "}
            for the reviewer view, or any contributor such as{" "}
            <code className="rounded bg-fill-tertiary px-1 py-0.5 font-mono text-caption-1 text-label">
              {SEED_USERS[1]?.email}
            </code>
            .
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-footnote text-label-tertiary">
        Just browsing?{" "}
        <Link href="/browse" className="font-medium text-[var(--sys-blue)]">
          The library is public
        </Link>
      </p>
    </div>
  );
}
