// app/page.tsx

"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-6 py-12 gap-12 bg-white dark:bg-black font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-3xl font-bold text-center text-black dark:text-white">
        Velg hva du vil gjøre
      </h1>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        <Link
          href="/shoes"
          className="text-center bg-black text-white dark:bg-white dark:text-black text-lg font-semibold py-4 rounded-2xl shadow-md hover:scale-[1.02] transition-transform"
        >
          Gå til oversikt
        </Link>
        <Link
          href="/quiz"
          className="text-center bg-black text-white dark:bg-white dark:text-black text-lg font-semibold py-4 rounded-2xl shadow-md hover:scale-[1.02] transition-transform"
        >
          Ta quizen
        </Link>
      </div>
    </div>
  );
}
