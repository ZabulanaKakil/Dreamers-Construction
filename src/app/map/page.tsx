import { Suspense } from "react";
import MapPageClient from "./MapPageClient";

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-muted">Loading map explorer...</p>
        </div>
      }
    >
      <MapPageClient />
    </Suspense>
  );
}
