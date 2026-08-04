import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";

function ContinueLearning({ course }) {
  if (!course) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <BookOpen
          size={60}
          className="mx-auto text-gray-300"
        />

        <h2 className="text-2xl font-bold mt-4">
          No Active Course
        </h2>

        <p className="text-gray-500 mt-2">
          Enroll in a course to start learning.
        </p>

        <Link
          to="/student/courses"
          className="inline-block mt-6 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl transition"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">

      <div className="grid md:grid-cols-3">

        {/* Thumbnail */}

        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-fill"
        />

        {/* Details */}

        <div className="md:col-span-2 p-8 flex flex-col justify-between">

          <div>

            <p className="text-sm uppercase tracking-wider text-amber-500 font-semibold">
              Continue Learning
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {course.title}
            </h2>

            <p className="text-gray-500 mt-2">
              {course.completedLessons} of {course.totalLessons} lessons completed
            </p>

            {/* Progress */}

            <div className="mt-6">

              <div className="flex justify-between mb-2">

                <span className="font-medium">
                  Progress
                </span>

                <span className="font-bold text-amber-600">
                  {course.progress}%
                </span>

              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">

                <div
                  className="bg-linear-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-700"
                  style={{
                    width: `${course.progress}%`,
                  }}
                />

              </div>

            </div>

          </div>

          <div className="mt-8">

            <Link
              to={`/student/course/${course._id}`}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl transition"
            >
              Continue Learning

              <ArrowRight size={18} />

            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ContinueLearning;