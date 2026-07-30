"use client";
import { useTransition } from "react";
import { deleteReview, moderateReview } from "./actions";

export function ReviewActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return <div className="flex items-center gap-2">{status !== "published" && <button disabled={pending} onClick={() => start(() => moderateReview(id, "published"))} className="text-xs font-medium text-emerald-600">Restore</button>}{status === "published" && <button disabled={pending} onClick={() => start(() => moderateReview(id, "hidden"))} className="text-xs font-medium text-amber-600">Hide</button>}<button disabled={pending} onClick={() => { if (window.confirm("Delete this review permanently?")) start(() => deleteReview(id)); }} className="text-xs font-medium text-red-600">Delete</button></div>;
}
