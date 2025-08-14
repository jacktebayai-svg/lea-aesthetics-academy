import React from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  description?: string;
  type: string;
}

export default async function TemplatesPage() {
  const res = await fetch("http://localhost:3001/templates", {
    cache: "no-store",
  }); // Assuming API runs on port 3001
  const templates: Template[] = await res.json();

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">
        Manage Templates
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div key={template.id} className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-xl font-semibold text-gray-700">
              {template.name}
            </h2>
            <p className="mb-4 text-gray-600">Type: {template.type}</p>
            {template.description && (
              <p className="mb-4 text-gray-600">{template.description}</p>
            )}
            <Link href={`/dashboard/templates/${template.id}`}>
              <a className="text-blue-600 hover:underline">View Details</a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
