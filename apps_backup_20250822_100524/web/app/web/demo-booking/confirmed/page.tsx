"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmedContent() {
  const p = useSearchParams();
  const id = p.get("id");
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold mb-2">Booking Confirmed</h1>
      <p>Your appointment has been created with status PENDING_DEPOSIT.</p>
      {id && <p className="mt-2 text-sm">Appointment ID: {id}</p>}
    </main>
  );
}

export default function Confirmed() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ConfirmedContent />
    </Suspense>
  );
}
