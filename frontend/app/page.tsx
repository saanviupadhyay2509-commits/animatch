// app/page.tsx
// Server component that fetches metadata, then hands off to client components

import { Suspense } from "react";
import { fetchMeta } from "@/lib/api";
import { ClientPage } from "./ClientPage";

export default async function Page() {
  // Fetch metadata on the server (genres, moods, eras list)
  // This runs at request time — no loading spinner needed for the initial form
  let meta;
  try {
    meta = await fetchMeta();
  } catch {
    // If the backend is asleep (Render free tier), show a graceful fallback
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
