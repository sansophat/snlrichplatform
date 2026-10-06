"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyField({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex gap-2">
      <input readOnly value={value} className="input font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
      <button
        type="button"
        className="btn btn-outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          } catch {}
        }}
      >
        {done ? <Check size={16} /> : <Copy size={16} />} {done ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
