export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1920&q=80')] bg-cover bg-center opacity-10"></div>
        </div>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8 relative z-10">
          <h1 className="font-display text-4xl font-semibold text-[#111827] sm:text-5xl">Terms of Service</h1>
          <p className="mt-2 text-[#64748B]">Rules and guidelines for using LamboReads</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {[
            { title: "1. Acceptance of Terms", content: "By accessing and using LamboReads, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service." },
            { title: "2. Use License", content: "Permission is granted to temporarily download one copy of the materials (information or software) on LamboReads for personal, non-commercial transitory viewing only." },
            { title: "3. Disclaimer", content: "The materials on LamboReads are provided on an as is basis. LamboReads makes no warranties, expressed or implied." },
            { title: "4. Limitations", content: "In no event shall LamboReads or its suppliers be liable for any damages arising out of the use or inability to use the materials on LamboReads." },
            { title: "5. Accuracy of Materials", content: "The materials appearing on LamboReads could include technical, typographical, or photographic errors." },
            { title: "6. Modifications", content: "LamboReads may revise these terms of service for its website at any time without notice." },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-[#111827] mb-2">{section.title}</h2>
              <p className="text-[#64748B] leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
