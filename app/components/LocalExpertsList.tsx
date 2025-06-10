"use client";
import { useEffect, useState } from "react";

export default function LocalExpertsList({ location }: { location: {lat: number, lng: number} }) {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/local-experts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location),
    })
      .then(res => res.json())
      .then(data => setExperts(data.results || []))
      .finally(() => setLoading(false));
  }, [location]);

  if (loading) return <div>Loading local experts...</div>;
  if (!experts.length) return <div>No clinics found nearby.</div>;

  return (
    <ul className="mt-4 space-y-2">
      {experts.map((e, i) => (
        <li key={i} className="bg-white rounded-lg shadow p-3">
          <div className="font-bold text-[#4B2E19]">{e.name}</div>
          <div className="text-sm text-gray-700">{e.address}</div>
          <div className="text-xs text-gray-500">⭐ {e.rating} ({e.userRatingsTotal} reviews)</div>
        </li>
      ))}
    </ul>
  );
}