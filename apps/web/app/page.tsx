import Link from "next/link";

export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Master Aesthetics Suite</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link href="/demo-booking">Demo Booking Flow</Link>
        </li>
      </ul>
    </main>
  );
}
