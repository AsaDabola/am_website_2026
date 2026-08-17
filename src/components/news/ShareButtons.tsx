"use client";

import { useState } from "react";
import { FacebookIcon, MailIcon } from "@/components/ui/icons";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — nothing further to do.
    }
  }

  const iconButtonClass =
    "flex size-9 items-center justify-center rounded-full border border-black/10 text-ink-muted transition-colors hover:border-brand-blue hover:text-brand-blue";

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on Facebook"
        className={iconButtonClass}
      >
        <FacebookIcon />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on X"
        className={iconButtonClass}
      >
        <span className="text-sm font-bold">𝕏</span>
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
        aria-label="Share by email"
        className={iconButtonClass}
      >
        <MailIcon />
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-brand-blue hover:text-brand-blue"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
