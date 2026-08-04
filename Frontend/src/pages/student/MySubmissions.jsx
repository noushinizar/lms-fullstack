import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";

import { getMySubmissions } from "../../services/assignmentSubmissionService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

import { showError } from "../../utils/toast";

function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const data = await getMySubmissions();

      setSubmissions(data);

    } catch (error) {

      showError("Failed to load submissions.");

    } finally {

      setLoading(false);

    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner text="Loading submissions..." />
      </StudentLayout>
    );
  }

  if (submissions.length === 0) {
    return (
      <StudentLayout>
        <EmptyState
          icon="📄"
          title="No Submissions Yet"
          description="You haven't submitted any assignments."
        />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>

      <h1 className="text-3xl font-bold mb-8">
        📝 My Assignment Submissions
      </h1>

      <div className="space-y-6">

        {submissions.map((submission) => (

          <div
            key={submission._id}
            className="bg-white rounded-xl shadow p-6"
          >

            <div className="flex justify-between items-start">

              <div>

                <h2 className="text-2xl font-bold">
                  {submission.assignmentId.title}
                </h2>

                <p className="text-gray-500 mt-2">
                  Submitted :
                  {" "}
                  {new Date(
                    submission.createdAt
                  ).toLocaleDateString()}
                </p>

                <div className="mt-4">

                  <span
                    className={`px-4 py-2 rounded-full text-white ${
                      submission.status === "Reviewed"
                        ? "bg-green-600"
                        : "bg-yellow-500"
                    }`}
                  >
                    {submission.status}
                  </span>

                </div>

                {submission.status === "Reviewed" && (

                  <div className="mt-5 space-y-2">

                    <p>
                      <strong>Marks :</strong>
                      {" "}
                      {submission.marksObtained}
                    </p>

                    <p>
                      <strong>Feedback :</strong>
                    </p>

                    <div className="bg-gray-100 rounded-lg p-3">
                      {submission.feedback}
                    </div>

                  </div>

                )}

              </div>

              <div>

                <Link
                  to={`/student/assignment/${submission.assignmentId._id}`}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-lg"
                >
                  View Details
                </Link>

              </div>

            </div>

          </div>

        ))}

      </div>

    </StudentLayout>
  );
}

export default MySubmissions;