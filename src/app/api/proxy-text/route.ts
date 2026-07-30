import { NextRequest, NextResponse } from "next/server";
import { fetchWithRetry, logApi } from "@/services/api";

const allowedDomains = ["gutenberg.org", "archive.org"];

function isValidUrl(urlStr: string) {
  try {
    const url = new URL(urlStr);
    for (let i = 0; i < allowedDomains.length; i++) {
      if (url.hostname.indexOf(allowedDomains[i]) !== -1) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  
  if (!url || !isValidUrl(url)) {
    logApi.error("Invalid URL requested", url);
    return NextResponse.json(
      { error: "Invalid or disallowed URL" },
      { status: 400 }
    );
  }
  
  try {
    logApi.info("Proxying text request", { url });
    const res = await fetchWithRetry(url, {}, 2, 20000);
    const text = await res.text();
    logApi.info("Successfully proxied text: " + text.length + " characters");
    
    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    });
    
  } catch (error) {
    logApi.error("Failed to proxy text", error);
    return NextResponse.json(
      { error: "Failed to load book text" },
      { status: 500 }
    );
  }
}
