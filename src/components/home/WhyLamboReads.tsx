import { BookOpen, Download, Bookmark, Library } from "lucide-react";

export function WhyLamboReads() {
  const features = [
    {
      icon: BookOpen,
      title: "Read In-Browser",
      description: "No downloads needed. Open any book and start reading immediately with our built-in reader.",
    },
    {
      icon: Library,
      title: "Save to Library",
      description: "Curate your personal collection. Save your favorite books for easy access anytime.",
    },
    {
      icon: Bookmark,
      title: "Bookmark Pages",
      description: "Never lose your place. Save specific pages and pick up right where you left off.",
    },
    {
      icon: Download,
      title: "Download Books",
      description: "Get PDF, EPUB, or TXT files. Read offline on any device, completely free.",
    },
  ];

  return (
    <section className="bg-[#F8FAFC] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-[#111827]">Why LamboReads?</h2>
          <p className="mt-1 text-sm text-[#64748B]">Everything you need for a perfect reading experience</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="border border-[#E5E7EB] rounded-lg p-5 bg-white">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#d1fae5] text-[#10B981] mb-3">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-[#111827] mb-1">{feature.title}</h3>
              <p className="text-sm text-[#64748B]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
