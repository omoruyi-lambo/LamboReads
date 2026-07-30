export default function Challenges() {
  return (
    <main className="bg-white min-h-screen py-20 px-4 relative">
      <div className="mx-auto max-w-5xl">
        <div className="relative mb-12">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80')] bg-cover bg-center opacity-10"></div>
          </div>
          <h1 className="text-4xl font-semibold text-[#111827] mb-4">Reading Challenges</h1>
          <p className="text-[#64748B]">Join our community and complete reading challenges to earn badges and connect with other readers</p>
        </div>

        <div className="p-12 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl text-center">
          <div className="text-6xl mb-6">🚀</div>
          <h3 className="text-2xl font-semibold text-[#111827] mb-3">Challenges Coming Soon</h3>
          <p className="text-[#64748B] mb-6">We&apos;re working on an interactive challenges system with leaderboards, rewards, and community features. Stay tuned!</p>
          <a href="/library" className="inline-block px-6 py-3 rounded-xl bg-[#0B1220] text-white font-semibold hover:bg-[#162032] transition-all">
            Browse Library
          </a>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#10B981] mb-2">🏆</div>
            <h4 className="text-lg font-semibold text-[#111827] mb-2">Earn Badges</h4>
            <p className="text-[#64748B]">Complete challenges to unlock exclusive badges and showcase your reading achievements</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#10B981] mb-2">👥</div>
            <h4 className="text-lg font-semibold text-[#111827] mb-2">Join Community</h4>
            <p className="text-[#64748B]">Connect with fellow readers, share your progress, and motivate each other</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#10B981] mb-2">📊</div>
            <h4 className="text-lg font-semibold text-[#111827] mb-2">Track Progress</h4>
            <p className="text-[#64748B]">Monitor your reading statistics and see how you compare with other readers</p>
          </div>
        </div>
      </div>
    </main>
  );
}
