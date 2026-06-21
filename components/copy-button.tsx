"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button type="button" onClick={copy} className="btn-secondary">
      <Copy size={15} />
      {copied ? "已复制" : "复制"}
    </button>
  );
}
