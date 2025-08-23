"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ett fel har uppstått</h1>
            <p className="text-gray-600 mb-6">Förlåt, något gick fel. Försök igen eller gå tillbaka till startsidan.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => reset()} className="bg-[#014421] text-white px-6 py-3 rounded-lg hover:bg-[#116530]">Försök igen</button>
              <a href="/" className="px-6 py-3 rounded-lg border border-gray-300">Startsida</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 