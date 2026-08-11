import type { Metadata, Viewport } from "next";

import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { TabBar } from "@/components/TabBar";
import { ToastProvider } from "@/components/ui/Toast";
import { themeBootstrapScript } from "@/components/ui/ThemeControl";
import { ensureSeeded } from "@/lib/seed";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PromptShelf — a prompt template library",
    template: "%s · PromptShelf",
  },
  description:
    "Browse and search a public library of prompt templates organised by prompt type: system prompts, few-shot, chain of thought, extraction, agents, image and video, and more.",
  applicationName: "PromptShelf",
  keywords: [
    "prompt library",
    "prompt templates",
    "prompt engineering",
    "system prompts",
    "few-shot",
    "chain of thought",
  ],
  openGraph: {
    title: "PromptShelf — a prompt template library",
    description:
      "A public, searchable library of prompt templates organised by prompt type. Fill in the blanks and copy.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f9" },
    { media: "(prefers-color-scheme: dark)", color: "#161618" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await ensureSeeded();

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <ToastProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-100 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-subheadline focus:shadow-2"
          >
            Skip to content
          </a>

          <div className="flex min-h-dvh flex-col">
            <NavBar />
            <main
              id="main"
              className="flex-1 pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom,0px)+8px)] md:pb-0"
            >
              {children}
            </main>
            <SiteFooter />
          </div>

          <TabBar />
        </ToastProvider>
      </body>
    </html>
  );
}
