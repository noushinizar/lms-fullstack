import { Users, GraduationCap } from "lucide-react";

function RecentEnrollments({ enrollments = [] }) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          Recent Enrollments
        </h2>

        <p className="text-gray-500 text-sm">
          Latest student enrollments
        </p>
      </div>

      {/* Empty State */}
      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-amber-100 mb-4">
            <Users
              className="text-amber-500"
              size={26}
            />
          </div>

          <h3 className="font-semibold text-gray-700">
            No Students Enrolled
          </h3>

          <p className="text-sm text-gray-500 text-center mt-1">
            Students will appear here once they enroll in a course.
          </p>
        </div>
      ) : (
        /* Enrollment List */
        <div className="space-y-3">
          {enrollments.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 bg-amber-200 rounded-xl p-4"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <GraduationCap
                  size={20}
                  className="text-amber-600"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">
                  {item.studentId?.name || "Unknown Student"}
                </h3>

                <p className="text-sm text-gray-600 truncate">
                  {item.courseId?.title || "Unknown Course"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentEnrollments;

