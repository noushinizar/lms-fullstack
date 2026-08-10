import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";

import { getAssignments } from "../../services/assignmentService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

function Assignments() {
  const { id } = useParams();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [id]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setAccessDenied(false);
      setErrorMessage("");

      const data = await getAssignments(id);

      setAssignments(data);
    } catch (error) {
      console.error("Failed to load assignments:", error);

      if (error.response?.status === 403) {
        setAccessDenied(true);

        setErrorMessage(
          error.response?.data?.message ||
            "You are not approved to access this course."
        );
      } else {
        setErrorMessage("Failed to load assignments.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </StudentLayout>
    );
  }

  // ============================
  // ACCESS DENIED
  // ============================

  if (accessDenied) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-lg w-full">

            <div className="text-6xl mb-5">
              🔒
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Access Denied
            </h1>

            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>

            <Link
              to="/student/courses"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Go to My Courses
            </Link>

          </div>
        </div>
      </StudentLayout>
    );
  }

  // ============================
  // OTHER ERROR
  // ============================

  if (errorMessage) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-lg w-full">

            <div className="text-5xl mb-5">
              ⚠️
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Unable to Load Assignments
            </h1>

            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>

            <button
              onClick={fetchAssignments}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Try Again
            </button>

          </div>
        </div>
      </StudentLayout>
    );
  }

  // ============================
  // NO ASSIGNMENTS
  // ============================

  if (assignments.length === 0) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <EmptyState
            title="No Assignments"
            message="There are no assignments available for this course yet."
          />
        </div>
      </StudentLayout>
    );
  }

  // ============================
  // ASSIGNMENTS
  // ============================

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold mb-8">
        Course Assignments
      </h1>

      <div className="space-y-6">

        {assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="bg-white rounded-xl shadow p-6"
          >

            {/* Assignment Header */}
            <div className="flex items-center gap-3 mb-3">

              <span className="text-3xl">
                📄
              </span>

              <h2 className="text-2xl font-bold">
                {assignment.title}
              </h2>

            </div>

            {/* Description */}
            <p className="text-gray-600 mb-5">
              {assignment.description}
            </p>

            {/* Requirements */}
            <div className="bg-gray-50 rounded-xl p-5">

              <h3 className="font-semibold text-lg mb-4">
                Requirements
              </h3>

              <ul className="space-y-2">

                {assignment.requirements?.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="flex gap-3"
                    >
                      <span>✅</span>

                      <span>
                        {item}
                      </span>
                    </li>
                  )
                )}

              </ul>

            </div>

            {/* Assignment Info */}
            <div className="flex justify-between items-center mt-6">

              <div className="flex gap-6 text-gray-600">

                <p>
                  📅 Due :{" "}
                  {new Date(
                    assignment.dueDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  🏆{" "}
                  {assignment.maxMarks}{" "}
                  Marks
                </p>

              </div>

              {/* Submit Button */}
              <Link
                to={`/student/assignment/${assignment._id}`}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg transition"
              >
                Submit Assignment
              </Link>

            </div>

          </div>
        ))}

      </div>
    </StudentLayout>
  );
}

export default Assignments;

