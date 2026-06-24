// app/page.tsx
// Server component that fetches metadata, then hands off to client components

import { Suspense } from "react";
import type { SiteMeta } from "@/lib/api";
import { getMeta } from "@/lib/recommend";
import { ClientPage } from "./ClientPage";

// Meta (genres/moods/eras) is identical for everyone — bake it at build time.
export const dynamic = "force-static";

export default async function Page() {
  // The trained model runs in this app's own serverless routes — read its
  // metadata (genres, moods, eras) directly on the server.
  let meta: SiteMeta;
  try {
    meta = getMeta();
  } catch {
    meta = {
      total_anime: 5000,
      available_genres: [
        "Action","Adventure","Animation","Comedy","Crime","Documentary",
        "Drama","Family","Fantasy","History","Horror","Music","Mystery",
        "Romance","Sci-Fi","Sport","Thriller",
      ],
      min_rating: 1.0,
      max_rating: 9.9,
      eras: ["any","classic","nineties","two-thousands","twenty-tens","recent"],
      moods: ["hype","cry","romance","spooky","chill"],
    };
  }

  return (
    <main className="relative min-h-screen">
      <Suspense>
        <ClientPage meta={meta} />
      </Suspense>
    </main>
  );
}
