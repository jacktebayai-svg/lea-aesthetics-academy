"use client";

import React, { useState } from "react";
import type { Service } from "@/lib/shared/types";
import { Card } from "@/lib/ui/components/Card";
import { Button } from "@/lib/ui/components/Button";
import Icon from "@/lib/ui/Icon";

const servicesData: Service[] = [
  {
    id: "1",
    name: "Microneedling",
    description: "Advanced skin rejuvenation to improve texture and tone.",
    price: 250,
    duration: 60,
  },
  {
    id: "2",
    name: "Chemical Peel",
    description: "Exfoliate and reveal brighter, smoother skin.",
    price: 150,
    duration: 45,
  },
  {
    id: "3",
    name: "Laser Hair Removal",
    description: "Long-term hair reduction for silky-smooth skin.",
    price: 300,
    duration: 30,
  },
  {
    id: "4",
    name: "Dermal Fillers",
    description: "Restore volume and soften facial lines.",
    price: 600,
    duration: 60,
  },
];

const TimeSlot: React.FC<{
  time: string;
  selected: boolean;
  onSelect: () => void;
}> = ({ time, selected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`px-4 py-2 rounded-lg border-2 w-full text-center transition-colors duration-200 ${selected ? "bg-slate text-ivory border-slate" : "bg-transparent border-smoke hover:border-mist"}`}
    aria-pressed={selected}
  >
    {time}
  </button>
);

export default function ClinicPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };

  const goToNextStep = () => setStep((s) => s + 1);
  const goToPrevStep = () => setStep((s) => s - 1);

  const resetFlow = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedTime(null);
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-playfair font-bold text-slate">
          Book Your Appointment
        </h1>
        <p className="text-mist mt-2">
          Follow the steps below to schedule your visit.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-playfair font-semibold text-slate mb-6">
              Step 1: Select a Service
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {servicesData.map((service) => (
                <div
                  key={service.id}
                  className="bg-ivory p-6 rounded-xl border border-smoke flex flex-col items-start"
                >
                  <h3 className="text-xl font-bold font-playfair text-slate">
                    {service.name}
                  </h3>
                  <p className="text-mist my-2 flex-grow">
                    {service.description}
                  </p>
                  <div className="flex justify-between w-full items-center mt-4">
                    <span className="text-lg font-semibold text-slate">
                      ${service.price}
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => handleSelectService(service)}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedService && (
          <div>
            <h2 className="text-2xl font-playfair font-semibold text-slate mb-2">
              Step 2: Choose Date & Time
            </h2>
            <p className="text-mist mb-6">
              You've selected:{" "}
              <span className="font-semibold text-slate">
                {selectedService.name}
              </span>
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-slate mb-3">Select Date</h3>
                <input
                  type="date"
                  className="w-full p-3 border-2 border-smoke rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <h3 className="font-semibold text-slate mb-3">
                  Available Times
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    "09:00 AM",
                    "10:00 AM",
                    "11:00 AM",
                    "01:00 PM",
                    "02:00 PM",
                    "03:00 PM",
                  ].map((time) => (
                    <TimeSlot
                      key={time}
                      time={time}
                      selected={selectedTime === time}
                      onSelect={() => handleSelectTime(time)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="secondary" onClick={goToPrevStep}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={goToNextStep}
                disabled={!selectedTime}
              >
                Next <Icon name="chevron-right" className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && selectedService && selectedTime && (
          <div>
            <h2 className="text-2xl font-playfair font-semibold text-slate mb-6">
              Step 3: Confirm Your Details
            </h2>
            <div className="bg-ivory p-6 rounded-xl border border-smoke mb-6">
              <h3 className="font-semibold text-lg text-slate mb-4">
                Booking Summary
              </h3>
              <div className="space-y-2 text-mist">
                <p>
                  <strong>Service:</strong>{" "}
                  <span className="text-slate">{selectedService.name}</span>
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  <span className="text-slate">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString()}
                  </span>
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  <span className="text-slate">{selectedTime}</span>
                </p>
                <p className="text-xl font-bold text-slate mt-2">
                  <strong>Total:</strong> ${selectedService.price}
                </p>
              </div>
            </div>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-3 border-2 border-smoke rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border-2 border-smoke rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="jane.doe@example.com"
                  required
                />
              </div>
            </form>

            <div className="flex justify-between mt-8">
              <Button variant="secondary" onClick={goToPrevStep}>
                Back
              </Button>
              <Button variant="primary" onClick={() => setStep(4)}>
                Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="check" className="w-8 h-8 text-gold" />
            </div>
            <h2 className="text-3xl font-playfair font-bold text-slate">
              Booking Confirmed!
            </h2>
            <p className="text-mist mt-2 mb-8">
              An email confirmation has been sent to you. We look forward to
              seeing you.
            </p>
            <Button variant="primary" onClick={resetFlow}>
              Book Another Appointment
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
