import { requireAuthor } from "@/lib/supabase/author";
import { AuthorUploadForm } from "./AuthorUploadForm";

export const metadata = { title: "Upload Book — Author Studio" };

export default async function AuthorUploadPage() {
  const { user, profile } = await requireAuthor();

  return (
    <div className="max-w-4xl mx-auto space-y-5 p-5 sm:p-7">
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Upload a Book</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">
          Your book will be reviewed by the LamboReads team before going live.
        </p>
      </div>

      {/* Workflow info */}
      <div className="flex items-stretch gap-0 rounded-xl border border-[#E5E7EB] bg-white overflow-hidden text-sm">
        {[
          { step: "1", label: "You upload",    desc: "Fill in the form and submit your book" },
          { step: "2", label: "We review",     desc: "Admin team checks quality and content" },
          { step: "3", label: "Goes live",     desc: "Approved books become publicly visible" },
        ].map((item, i) => (
          <div key={item.step} className={`flex-1 px-4 py-3 ${i < 2 ? "border-r border-[#E5E7EB]" : ""}`}>
            <p className="text-xs font-bold text-[#10B981] mb-0.5">Step {item.step}</p>
            <p className="font-semibold text-[#111827]">{item.label}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      <AuthorUploadForm
        authorName={profile.full_name ?? profile.email?.split("@")[0] ?? ""}
      />
    </div>
  );
}
