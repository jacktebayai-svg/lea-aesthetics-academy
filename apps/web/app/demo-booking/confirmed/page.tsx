"use client";
import { useSearchParams } from "next/navigation";

export default function Confirmed() {
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
