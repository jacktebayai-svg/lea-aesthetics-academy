import Link from "next/link";
import { Card, Button, Icon } from "@master-aesthetics-suite/ui";

export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-slate leading-tight mb-4">
        The Master Aesthetics Suite
      </h1>
      <p className="max-w-3xl mx-auto text-lg text-mist mb-12">
        A bespoke platform reflecting the uncompromising standards of Lea's
        Aesthetics Clinical Academy, unifying your clinic and academy into a
        single, seamless experience.
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card className="flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 ease-out-quint">
          <div className="p-4 bg-smoke rounded-full mb-4">
            <img
              src="https://picsum.photos/seed/clinic/64"
              alt="Clinic"
              className="w-16 h-16 rounded-full"
            />
          </div>
          <h2 className="text-2xl font-playfair font-bold text-slate mb-2">
            For Our Clients
          </h2>
          <p className="text-mist mb-6 flex-grow">
            Experience a frictionless and elegant booking system. Select
            services, manage appointments, and feel the luxury of our brand.
          </p>
          <Link href="/clinic">
            <Button variant="primary">
              Book an Appointment{" "}
              <Icon name="chevron-right" className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </Card>

        <Card className="flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 ease-out-quint">
          <div className="p-4 bg-smoke rounded-full mb-4">
            <img
              src="https://picsum.photos/seed/academy/64"
              alt="Academy"
              className="w-16 h-16 rounded-full"
            />
          </div>
          <h2 className="text-2xl font-playfair font-bold text-slate mb-2">
            For Our Students
          </h2>
          <p className="text-mist mb-6 flex-grow">
            Access your exclusive learning hub. Manage courses, track progress,
            and engage with our AI-powered student assistant.
          </p>
          <Link href="/academy">
            <Button variant="secondary">
              Enter Student Portal{" "}
              <Icon name="chevron-right" className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
