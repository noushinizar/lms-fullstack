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

  useEffect(() => {
    fetchAssignments();
  }, [id]);

  const fetchAssignments = async () => {
    try {
      const data = await getAssignments(id);

      setAssignments(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner text="Loading Assignments..." />
      </StudentLayout>
    );
  }

  if (assignments.length === 0) {
    return (
      <StudentLayout>
        <EmptyState
          icon="📄"
          title="No Assignments Available"
          description="Your mentor hasn't added any assignments yet."
        />
      </StudentLayout>
    );
  }

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

            <div className="flex items-center gap-3 mb-3">

              <span className="text-3xl">
                📄
              </span>

              <h2 className="text-2xl font-bold">
                {assignment.title}
              </h2>

            </div>

            <p className="text-gray-600 mb-5">
              {assignment.description}
            </p>

            <div className="bg-gray-50 rounded-xl p-5">

              <h3 className="font-semibold text-lg mb-4">
                Requirements
              </h3>

              <ul className="space-y-2">

                {assignment.requirements.map((item, index) => (

                  <li
                    key={index}
                    className="flex gap-3"
                  >
                    <span>✅</span>

                    <span>{item}</span>

                  </li>

                ))}

              </ul>

            </div>

            <div className="flex justify-between items-center mt-6">

              <div className="flex gap-6 text-gray-600">

                <p>
                  📅 Due :
                  {" "}
                  {new Date(
                    assignment.dueDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  🏆
                  {" "}
                  {assignment.maxMarks}
                  {" "}
                  Marks
                </p>

              </div>

              <Link
                to={`/student/assignment/${assignment._id}`}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg"
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