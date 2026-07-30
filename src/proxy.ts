/**
 * DEPRECATED — all route protection and admin role checks live in
 * middleware.ts at the project root.
 *
 * Next.js 16 requires proxy.ts to export a function when the file exists,
 * so this re-exports a pass-through that simply calls NextResponse.next().
 * The real auth logic is NOT here — it is in middleware.ts and
 * src/lib/supabase/admin.ts.
 */
import { NextResponse, type NextRequest } from 'next/server'

export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
