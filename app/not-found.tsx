export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sidan kunde inte hittas</h1>
        <p className="text-gray-600 mb-6">Länken kan vara felaktig eller sidan har flyttats.</p>
        <a href="/" className="inline-block bg-[#014421] text-white px-6 py-3 rounded-lg hover:bg-[#116530]">Till startsidan</a>
      </div>
    </div>
  );
} 