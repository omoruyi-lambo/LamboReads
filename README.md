# LamboReads

Modern free public-domain ebook platform (Version 1) with future-proof Premium & Audiobooks UI.

## Philosophy

**V1 = free books only.** No functional cart — instead: Save to Library, Read Now, Download, Bookmarks, Reading History.

Cart icon + empty cart/checkout pages exist for when Premium launches.

## Stack

- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Gutendex API (Project Gutenberg)

## Run

```bash
cd lamboreads
npm install
npm run dev
```

Open http://localhost:3000

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/library` | Search & browse free books |
| `/book/[id]` | Book details + download |
| `/read/[id]` | In-browser reader |
| `/dashboard` | User reading dashboard |
| `/cart` | Empty cart (future Premium) |
| `/checkout` | Coming soon checkout UI |
| `/premium` | Premium books coming soon |
| `/audiobooks` | Audiobooks coming soon |
| `/admin` | Admin dashboard UI |

## Data

Books fetched live from Gutendex (Project Gutenberg).
