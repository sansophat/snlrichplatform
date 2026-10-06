"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryModal } from "./CategoryModal";
import { deleteCategoryAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { getCategoryImage, CategoryIcon } from "@/components/CategoryIcon";
import { Search, ExternalLink, Trash2, Layers, AlertTriangle } from "lucide-react";

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  imageUrl: string | null;
  createdAt: Date;
  _count: {
    products: number;
  };
};

export function CategoryTable({ categories }: { categories: CategoryWithCount[] }) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = categories.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !py-1.5 !pl-9 text-xs"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-navy-900">{filtered.length}</span> of {categories.length} categories
        </div>
      </div>

      {/* Categories Table */}
      <div className="card overflow-hidden border border-slate-200 p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4 text-center">Products</th>
                <th className="py-3 px-4 text-center">Thumbnail Pod</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Layers size={32} className="mx-auto mb-2 opacity-40 text-navy-400" />
                    No categories found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => {
                  const img = getCategoryImage(cat.slug, cat.imageUrl);
                  const hasProducts = cat._count.products > 0;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg border border-slate-200 shadow-xs">
                            {cat.emoji || "🛍️"}
                          </span>
                          <div>
                            <div className="font-bold text-navy-900 text-sm">{cat.name}</div>
                            <div className="text-[11px] text-slate-400">ID: {cat.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 border border-slate-200">
                          {cat.slug}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-bold text-navy-800">
                          {cat._count.products} products
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {img ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-xs">
                              <Image
                                src={img}
                                alt={cat.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                              <CategoryIcon slug={cat.slug} size={18} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/category/${cat.slug}`}
                            target="_blank"
                            className="btn btn-outline btn-sm !py-1 !px-2 text-xs text-slate-600 hover:text-navy-900"
                            title="View category page"
                          >
                            <ExternalLink size={12} className="mr-1" /> View
                          </Link>

                          <CategoryModal category={cat} />

                          {hasProducts ? (
                            <button
                              disabled
                              title="Cannot delete category with associated products. Reassign products first."
                              className="btn btn-outline btn-sm !py-1 !px-2 text-xs opacity-40 cursor-not-allowed text-slate-400"
                            >
                              <Trash2 size={12} />
                            </button>
                          ) : deletingId === cat.id ? (
                            <form action={deleteCategoryAction} className="inline-flex items-center gap-1">
                              <input type="hidden" name="id" value={cat.id} />
                              <SubmitButton className="btn btn-danger btn-sm !py-1 !px-2 text-xs" pendingText="…">
                                Confirm Delete
                              </SubmitButton>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="btn btn-outline btn-sm !py-1 !px-1.5 text-xs"
                              >
                                ✕
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingId(cat.id)}
                              className="btn btn-outline btn-sm !py-1 !px-2 text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
                              title="Delete category"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
