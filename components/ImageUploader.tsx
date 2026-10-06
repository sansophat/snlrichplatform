"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

export function ImageUploader({
  name,
  label,
  defaultValue = "",
  helpText,
  aspect = "square", // "square" | "banner" | "avatar"
}: {
  name: string;
  label?: string;
  defaultValue?: string | null;
  helpText?: string;
  aspect?: "square" | "banner" | "avatar";
}) {
  const [url, setUrl] = useState<string>(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }
      setUrl(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  const aspectClass =
    aspect === "banner"
      ? "h-36 w-full"
      : aspect === "avatar"
      ? "h-24 w-24 rounded-full"
      : "h-40 w-40 rounded-xl";

  return (
    <div className="space-y-2">
      {label && <label className="label">{label}</label>}

      {/* Hidden input to ensure the value gets submitted with the form */}
      <input type="hidden" name={name} value={url} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Preview box */}
        <div
          className={`relative flex items-center justify-center overflow-hidden border border-slate-200 bg-slate-50 transition ${aspectClass} ${
            aspect !== "avatar" ? "rounded-xl" : ""
          }`}
        >
          {url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Uploaded preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setUrl("")}
                className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/70 p-1 text-white shadow backdrop-blur transition hover:bg-red-600"
                title="Remove image"
              >
                <X size={13} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-center text-slate-400">
              <ImageIcon size={28} className="mb-1 opacity-60" />
              <span className="text-[11px]">No image</span>
            </div>
          )}
        </div>

        {/* Upload Action Controls */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary btn-sm flex items-center gap-1.5 font-semibold hover:border-navy-400"
            >
              {uploading ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-navy-600" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>{url ? "Change image" : "Upload photo"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowManualUrl(!showManualUrl)}
              className="btn btn-outline btn-sm text-xs text-slate-500"
              title="Enter image URL manually"
            >
              <LinkIcon size={12} />
              <span>URL</span>
            </button>
          </div>

          {helpText && <p className="text-xs text-slate-400">{helpText}</p>}
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          {showManualUrl && (
            <div className="mt-1">
              <input
                type="text"
                placeholder="https://... or /images/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input text-xs !py-1 !px-2.5 max-w-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
