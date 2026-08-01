import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1974&auto=format&fit=crop"
          alt="Library"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/80 via-[#0B1220]/50 to-transparent" />
        <div className="relative flex flex-col justify-end h-full p-12 text-white">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <img src="/images/logo.png" alt="LamboReads" className="h-9 w-9 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white">
              LamboReads
            </span>
          </Link>
          <p className="text-2xl font-semibold leading-snug max-w-md">&ldquo;A reader lives a thousand lives before he dies . . . The man who never reads lives only one.&rdquo;</p>
          <p className="mt-2 text-sm text-white/60">- George R.R. Martin</p>
        </div>
      </div>
      <main className="flex flex-col items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 md:p-10 min-h-screen lg:min-h-0">
        {children}
      </main>
    </div>
  );
}