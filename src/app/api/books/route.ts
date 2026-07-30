import { NextRequest, NextResponse } from "next/server";
import { getBooksFromCatalog } from "@/lib/books/catalog";

function scoreBook(book: any, preferredGenres: string[]) {
  const subjects = (book.subjects || []).map((subject: string) => subject.toLowerCase());
  return preferredGenres.reduce((score, genre) => {
    const genreLower = genre.toLowerCase();
    return score + subjects.filter((subject: string) => subject.includes(genreLower)).length;
  }, 0);
}

export async function GET(req: NextRequest) {
  const params: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    params[k] = v;
  });

  const preferredGenresParam = req.nextUrl.searchParams.get("preferredGenres");
  const preferredGenres = preferredGenresParam
    ? preferredGenresParam.split(",").map((genre) => genre.trim()).filter(Boolean)
    : [];

  try {
    const data = await getBooksFromCatalog(params);
    if (preferredGenres.length > 0 && Array.isArray(data.results)) {
      const results = [...data.results].sort((a, b) => {
        return scoreBook(b, preferredGenres) - scoreBook(a, preferredGenres);
      });
      return NextResponse.json({ ...data, results });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "We're having trouble reaching our book provider. Showing available books from our library.", results: [] }, { status: 200 });
  }
}
