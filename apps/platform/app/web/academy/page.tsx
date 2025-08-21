import React from "react";
import type { Course } from "@leas-academy/shared";
import { Card } from "@leas-academy/ui";
import StudentAssistant from "@/components/academy/StudentAssistant";

const coursesData: Course[] = [
  {
    id: "c1",
    title: "Advanced Dermal Fillers",
    description: "Master the art and science of injectable fillers.",
    modules: 8,
    progress: 75,
  },
  {
    id: "c2",
    title: "Cosmetic Dermatology Principles",
    description: "Fundamental knowledge for aesthetic practitioners.",
    modules: 12,
    progress: 45,
  },
  {
    id: "c3",
    title: "Laser & Light Therapy",
    description: "Comprehensive training on energy-based devices.",
    modules: 10,
    progress: 90,
  },
];

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <div className="bg-ivory p-6 rounded-xl border border-smoke">
      <h3 className="text-xl font-bold font-playfair text-slate">
        {course.title}
      </h3>
      <p className="text-mist my-2">{course.description}</p>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-mist mb-1">
          <span>Progress</span>
          <span>{course.progress}%</span>
        </div>
        <div
          className="w-full bg-smoke rounded-full h-2.5"
          role="progressbar"
          aria-label={`Course progress for ${course.title}`}
          aria-valuenow={course.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="bg-gold h-2.5 rounded-full"
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default function AcademyPage() {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-playfair font-bold text-slate">
          Student Portal
        </h1>
        <p className="text-mist mt-2">
          Welcome back! Here are your courses and your personal AI assistant.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-2xl font-playfair font-semibold text-slate mb-6">
              My Courses
            </h2>
            <div className="space-y-6">
              {coursesData.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <StudentAssistant />
        </div>
      </div>
    </div>
  );
}
