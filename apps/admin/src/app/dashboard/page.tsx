import React from "react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="mb-8 text-4xl font-bold text-gray-800">
        Welcome to the Admin Dashboard!
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/templates"
          className="flex flex-col items-center justify-center rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105"
        >
          <h2 className="mb-2 text-xl font-semibold text-gray-700">
            Manage Templates
          </h2>
          <p className="text-gray-600">
            View and organize your document templates.
          </p>
        </Link>
        {/* Add more dashboard links here */}
      </div>
    </div>
  );
}
