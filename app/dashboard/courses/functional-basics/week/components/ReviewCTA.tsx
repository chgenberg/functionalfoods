"use client";
import { useState } from "react";
import CourseReviewForm from "@/app/components/CourseReviewForm";

export default function ReviewCTA({
  courseId,
  userId,
}: {
  courseId: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Hur var programmet?</h3>
          <p className="text-gray-600 text-sm">
            Berätta gärna — det tar 2–3 minuter.
          </p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary"
        >
          Lämna omdöme
        </button>
      </div>
      {open && (
        <div className="mt-4">
          <CourseReviewForm courseId={courseId} userId={userId} />
        </div>
      )}
    </div>
  );
}
