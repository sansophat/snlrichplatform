"use client";

import { useState, useActionState, useEffect } from "react";
import { saveCategoryAction } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageUploader } from "@/components/ImageUploader";
import { Plus, X, Layers, Check, AlertCircle, Edit3 } from "lucide-react";

type CategoryData = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  imageUrl?: string | null;
};

export function CategoryModal({ category }: { category?: CategoryData }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(saveCategoryAction, undefined);

  useEffect(() => {
    if (state?.ok) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state?.ok]);

  const isEditing = !!category;

  return (
    <>
      {isEditing ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-outline btn-sm !py-1 !px-2 text-xs"
        >
          <Edit3 size={12} className="mr-1" /> Edit
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-primary btn-sm flex items-center gap-1.5 font-semibold"
        >
          <Plus size={16} /> Add Category
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-navy-700" />
                <h3 className="text-lg font-bold text-navy-900">
                  {isEditing ? `Edit Category: ${category.name}` : "Create New Product Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form action={action} className="mt-4 space-y-4">
              {category && <input type="hidden" name="id" value={category.id} />}

              {state?.error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}
              {state?.ok && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
                  <Check size={15} className="shrink-0" />
                  <span>{state.ok}</span>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="label">Category Name *</label>
                  <input
                    name="name"
                    required
                    defaultValue={category?.name ?? ""}
                    placeholder="e.g. Gaming & Gear"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="label">Emoji Icon</label>
                  <input
                    name="emoji"
                    defaultValue={category?.emoji ?? "🛍️"}
                    maxLength={4}
                    className="input text-center text-sm"
                  />
                </div>
              </div>

              <div>
                <ImageUploader
                  name="imageUrl"
                  label="Category Thumbnail / Pod Image"
                  defaultValue={category?.imageUrl}
                  helpText="Displayed in the 'Browse By Categories' pods and header dropdown menu."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <SubmitButton className="btn btn-primary btn-sm" pendingText="Saving Category…">
                  {isEditing ? "Save Changes" : "Create Category"}
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
