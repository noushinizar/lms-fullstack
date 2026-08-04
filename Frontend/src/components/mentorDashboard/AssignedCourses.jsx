import { Users, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function AssignedCourses({ courses }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Assigned Courses
        </h2>

        <span className="text-sm text-gray-500">
          {courses.length} Courses
        </span>

      </div>

      <div className="space-y-4">

        {courses.length === 0 ? (

          <p className="text-gray-500 text-center py-10">
            No courses assigned.
          </p>

        ) : (

          courses.map((course) => (

            <div
              key={course._id}
              className="border rounded-xl p-4 hover:shadow-md transition bg-amber-100 border-amber-300"
            >

              <div className="flex gap-4">

                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-24 h-20 rounded-lg object-cover"
                />

                <div className="flex-1">

                  <h3 className="font-bold text-lg">
                    {course.title}
                  </h3>

                  <div className="flex gap-5 mt-3 text-gray-500 text-sm">

                    <span className="flex items-center gap-2">
                      <Users size={16}/>
                      {course.students}
                    </span>

                    <span className="flex items-center gap-2">
                      <BookOpen size={16}/>
                      {course.lessons}
                    </span>

                  </div>

                </div>

                <Link
                  to={`/mentor/course/${course._id}`}
                  className="text-orange-500 hover:text-orange-600 flex items-center"
                >
                  <ArrowRight />
                </Link>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default AssignedCourses;