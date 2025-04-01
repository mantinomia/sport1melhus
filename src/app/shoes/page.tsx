import { Suspense } from "react";
import ShoesClient from "@/components/ShoesClient";

export const dynamic = "force-dynamic"; // Sikrer SSR og unngår statisk generering

export default function ShoesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Shoes at Sport 1 Melhus 👟</h1>
      <Suspense fallback={<p>Loading filters...</p>}>
        <ShoesClient />
      </Suspense>
    </div>
  );
}
