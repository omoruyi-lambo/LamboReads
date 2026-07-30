import { requireAdmin } from "@/lib/supabase/admin";
import { AddBookForm } from "./AddBookForm";

export const metadata = { title: "Add Book — Admin" };

export default async function AdminNewBookPage() {
  const { user } = await requireAdmin();
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Add Book</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">
          Upload a new book to the catalog. Files are stored in Supabase Storage.
        </p>
      </div>
      <AddBookForm userId={user.id} />
    </div>
  );
}
