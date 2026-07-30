import { Suspense } from "react";
import LibraryClient from "./LibraryClient";

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading library…</div>}>
      <LibraryClient />
    </Suspense>
  );
}
