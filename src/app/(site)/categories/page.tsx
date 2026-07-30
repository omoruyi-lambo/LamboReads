import { CategoriesSection } from "@/components/home/CategoriesSection";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1920&q=80')] bg-cover bg-center opacity-10"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 relative z-10">
          <h1 className="font-display text-4xl font-semibold text-[#111827] sm:text-5xl">Explore Categories</h1>
          <p className="mt-2 text-[#64748B]">Find your next favorite book</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CategoriesSection />
      </div>
    </div>
  );
}
