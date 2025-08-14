import React from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  description?: string;
  type: string;
  filePath: string;
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`http://localhost:3001/templates/${id}`, {
    cache: "no-store",
  }); // Assuming API runs on port 3001
  const template: Template = await res.json();

  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-800">Template Not Found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">{template.name}</h1>
      <p className="mb-2 text-gray-600">
        <strong>Type:</strong> {template.type}
      </p>
      {template.description && (
        <p className="mb-4 text-gray-600">
          <strong>Description:</strong> {template.description}
        </p>
      )}
      <p className="mb-4 text-gray-600">
        <strong>File Path:</strong> {template.filePath}
      </p>

      <Link href="/dashboard/templates">
        <a className="text-blue-600 hover:underline">Back to Templates</a>
      </Link>
    </div>
  );
}
