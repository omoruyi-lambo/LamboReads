import Link from "next/link";

export const metadata = { title: "Author Studio — LamboReads" };

export default function AuthorLandingPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#111827]">
          Author Studio
        </h1>
        <p className="mt-3 text-[#64748B]">
          Publish on LamboReads, manage your catalog, and track your performance.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/author/signup"
            className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 hover:border-[#10B981] hover:bg-white transition-colors"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
              Get Started
            </p>
            <p className="mt-2 text-lg font-semibold text-[#111827]">
              Apply as an author
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              Create your author profile and start uploading books.
            </p>
          </Link>

          <Link
            href="/author/dashboard"
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 hover:border-[#0B1220] transition-colors"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Returning
            </p>
            <p className="mt-2 text-lg font-semibold text-[#111827]">
              Go to dashboard
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              Access your author workspace (requires author access).
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}

