"use client";
import { useEffect, useState } from "react";
import AdminLayout from '@/components/layout/AdminLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3333";

type Service = {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  basePrice: number;
  durationMin: number;
  category: string;
  description?: string | null;
};

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [form, setForm] = useState({
    tenantId: "tn_demo",
    name: "",
    slug: "",
    basePrice: 12000,
    durationMin: 30,
    category: "injectables",
    description: "",
  });
  const [status, setStatus] = useState("");

  async function load() {
    const r = await fetch(`${API_BASE}/v1/services`);
    const d = await r.json();
    setItems(d);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setStatus("Saving...");
    try {
      const r = await fetch(`${API_BASE}/v1/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error(`create ${r.status}`);
      setForm({ ...form, name: "", slug: "", description: "" });
      await load();
      setStatus("Created");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'An error occurred');
    }
  }

  async function remove(id: string) {
    setStatus("Deleting...");
    try {
      const r = await fetch(`${API_BASE}/v1/services/${id}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error(`delete ${r.status}`);
      await load();
      setStatus("");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'An error occurred');
    }
  }

  return (
    <AdminLayout 
      title="Services" 
      subtitle="Manage your clinic services and pricing"
    >
      <div className="space-y-8 animate-fade-in">

      <section className="space-y-2 max-w-xl">
        <h2 className="font-medium">Create</h2>
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2"
            type="number"
            placeholder="Price (cents)"
            value={form.basePrice}
            onChange={(e) =>
              setForm({ ...form, basePrice: Number(e.target.value) })
            }
          />
          <input
            className="border rounded px-3 py-2"
            type="number"
            placeholder="Duration (min)"
            value={form.durationMin}
            onChange={(e) =>
              setForm({ ...form, durationMin: Number(e.target.value) })
            }
          />
        </div>
        <textarea
          className="border rounded px-3 py-2 w-full"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button
          className="bg-blue-600 text-white rounded px-4 py-2"
          onClick={create}
        >
          Create
        </button>
        {status && <div className="text-sm">{status}</div>}
      </section>

      <section>
        <h2 className="font-medium mb-2">List</h2>
        <ul className="space-y-2">
          {items.map((s) => (
            <li
              key={s.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-600">
                  {s.slug} · {s.category} · {s.durationMin}m · £
                  {(s.basePrice / 100).toFixed(2)}
                </div>
              </div>
              <button className="text-red-600" onClick={() => remove(s.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </AdminLayout>
  );
}
