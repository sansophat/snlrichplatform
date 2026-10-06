"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "btn btn-primary",
  pendingText,
  disabled = false,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  disabled?: boolean;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} title={title}>
      {pending ? (pendingText ?? "Please wait…") : children}
    </button>
  );
}
