import { BookOpen, Calendar, User } from "lucide-react";

function LatestCourses({ courses }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-xl font-bold">
            Latest Courses
          </h2>

          <p className="text-gray-500 text-sm">
            Recently published courses
          </p>

        </div>

        <BookOpen className="text-amber-500" size={24} />

      </div>

      <div className="space-y-5">

        {courses.map((course) => (

          <div
            key={course._id}
            className="flex items-center  gap-4 bg-amber-200  rounded-xl  p-4"
          >

            {/* Thumbnail */}

            <img
              src={
                course.thumbnail ||
                "https://placehold.co/80x60?text=Course"
              }
              alt={course.title}
              className="w-20 h-14 rounded-lg object-cover"
            />

            {/* Details */}

            <div className="flex-1">

              <h3 className="font-semibold">
                {course.title}
              </h3>

              <p className="text-sm text-gray-500">
                {course.category}
              </p>

              <div className="flex gap-4 mt-2 text-xs text-gray-400">

                <span className="flex items-center gap-1">
                  <User size={14} />
                  {course.mentor?.name || "Unknown"}
                </span>

                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default LatestCourses;