"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchField } from "@/components/ui/SearchField";

/**
 * Search box wired to the URL. Typing replaces history entries after a short
 * debounce so results follow along without filling the back stack.
 */
export function BrowseSearch({
  initialQuery,
  placeholder = "Search prompts, tags, or keywords",
  size = "md",
  autoFocus,
  className,
}: {
  initialQuery: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();
  const timer = useRef<number | null>(null);
  const latest = useRef(initialQuery);

  // Keep in sync when navigation changes the query from elsewhere.
  useEffect(() => {
    if (initialQuery !== latest.current) {
      latest.current = initialQuery;
      setValue(initialQuery);
    }
  }, [initialQuery]);

  const push = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = next.trim();

    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    params.delete("page");

    latest.current = trimmed;
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const onChange = (next: string) => {
    setValue(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => push(next), 260);
  };

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  return (
    <SearchField
      value={value}
      onChange={onChange}
      onSubmit={() => {
        if (timer.current) window.clearTimeout(timer.current);
        push(value);
      }}
      placeholder={placeholder}
      size={size}
      autoFocus={autoFocus}
      busy={pending}
      className={className}
      ariaLabel="Search prompts"
    />
  );
}
