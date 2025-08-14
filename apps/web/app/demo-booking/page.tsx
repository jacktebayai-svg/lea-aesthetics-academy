"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3333";

export default function DemoBookingPage() {
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [clientEmail, setClientEmail] = useState("");
  const [status, setStatus] = useState<string>("");

  // Seed IDs from db/src/seed.ts
  const tenantId = "tn_demo";
  const locationId = "loc_demo";
  const serviceId = "svc_botox";

  const fromIso = useMemo(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return d.toISOString();
  }, []);
  const toIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setMinutes(0, 0, 0);
    return d.toISOString();
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const url = `${API_BASE}/v1/availability?tenant_id=${tenantId}&location_id=${locationId}&service_id=${serviceId}&from=${encodeURIComponent(
          fromIso
        )}&to=${encodeURIComponent(toIso)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`availability ${res.status}`);
        const data = await res.json();
        if (!ignore) setSlots(data.slots || []);
      } catch (e: any) {
        setStatus(e.message || "Failed to load availability");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [fromIso, toIso]);

  async function book() {
    if (!selected) return;
    setStatus("Booking...");
    try {
      const startTs = selected;
      const endTs = new Date(new Date(selected).getTime() + 60 * 60 * 1000).toISOString();
      const body = {
        tenantId,
        clientId: `client_${Math.random().toString(36).slice(2, 8)}`,
        practitionerId: `prac_demo`,
        serviceId,
        locationId,
        startTs,
        endTs,
        email: clientEmail,
      };
      const res = await fetch(`${API_BASE}/v1/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`create appt ${res.status}`);
      const appt = await res.json();
      setStatus(`Booked with status ${appt.status}. Appointment ID: ${appt.id}`);
    } catch (e: any) {
      setStatus(e.message || "Booking failed");
    }
  }

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-xl font-semibold">Demo Booking</h1>
      <div>
        <label className="block mb-2">Client Email</label>
        <input
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="you@example.com"
          className="border rounded px-3 py-2 w-full max-w-md"
        />
      </div>
      <div>
        <h2 className="font-medium mb-2">Available Slots (next 24h)</h2>
        {loading ? (
          <div>Loading availability…</div>
        ) : slots.length === 0 ? (
          <div>No slots found.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {slots.map((s) => (
              <li key={s.start}>
                <button
                  className={`border rounded px-3 py-2 w-full text-left ${
                    selected === s.start ? "bg-black text-white" : "bg-white"
                  }`}
                  onClick={() => setSelected(s.start)}
                >
                  {new Date(s.start).toLocaleString()} → {new Date(s.end).toLocaleTimeString()}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-2">
        <button
          disabled={!selected || !clientEmail}
          onClick={book}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          Book Selected Slot
        </button>
      </div>
      {status && <div className="mt-4 text-sm">{status}</div>}
    </main>
  );
}

