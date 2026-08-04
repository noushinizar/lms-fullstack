import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getAssignmentSubmissions,
  reviewSubmission,
} from "../../services/assignmentSubmissionService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ReviewSubmissionModal from "../../components/mentor/ReviewSubmissionModal";
import ReviewSubmissionForm from "../../components/mentor/ReviewSubmissionForm";

import { showSuccess, showError } from "../../utils/toast";

function AssignmentSubmissions() {
  const { assignmentId } = useParams();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

const [selectedSubmission, setSelectedSubmission] = useState(null);

const [savingReview, setSavingReview] = useState(false);
  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const data = await getAssignmentSubmissions(assignmentId);

      setSubmissions(data);
    } catch (error) {
      showError("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmission = async (reviewData) => {
  try {
    setSavingReview(true);

    await reviewSubmission(
      selectedSubmission._id,
      reviewData
    );

    showSuccess("Submission reviewed successfully.");

    setReviewModalOpen(false);

    setSelectedSubmission(null);

    fetchSubmissions();

  } catch (error) {

    showError(
      error.response?.data?.message ||
      "Failed to review submission."
    );

  } finally {

    setSavingReview(false);

  }
};

  if (loading) {
    return <LoadingSpinner text="Loading submissions..." />;
  }

  if (submissions.length === 0) {
    return (
      <EmptyState
        icon="📄"
        title="No Submissions Yet"
        description="Students haven't submitted this assignment yet."
      />
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Assignment Submissions
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
                   {submission.studentId.name}
                </h2>

                <p className="text-gray-500">
                  {submission.studentId.email}
                </p>

                <p className="mt-4">
                  📅 Submitted:{" "}
                  {new Date(
                    submission.createdAt
                  ).toLocaleDateString()}
                </p>

                <div className="mt-5 space-y-3">

                  <p>
                    🔗 <strong>GitHub:</strong>{" "}
                    <a
                      href={submission.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open Repository
                    </a>
                  </p>

                  {submission.liveDemoLink && (
                    <p>
                      🌐 <strong>Live Demo:</strong>{" "}
                      <a
                        href={submission.liveDemoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Open Website
                      </a>
                    </p>
                  )}

                  {submission.driveLink && (
                    <p>
                      📁 <strong>Drive:</strong>{" "}
                      <a
                        href={submission.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Open Drive
                      </a>
                    </p>
                  )}

                  {submission.notes && (
                    <div>
                      <p className="font-semibold">
                        Notes
                      </p>

                      <p className="text-gray-600">
                        {submission.notes}
                      </p>
                    </div>
                  )}

                </div>

              </div>

              <div className="text-right">

                <span
                  className={`px-4 py-2 rounded-full text-white ${
                    submission.status === "Pending"
                      ? "bg-yellow-500"
                      : submission.status === "Reviewed"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {submission.status}
                </span>

                <br />

               <button
  onClick={() => {
    setSelectedSubmission(submission);
    setReviewModalOpen(true);
  }}
  className="mt-6 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg"
>
  {submission.status === "Reviewed"
    ? "View Review"
    : "Review"}
</button>

              </div>

            </div>
          </div>
        ))}
      </div>
      <ReviewSubmissionModal
  isOpen={reviewModalOpen}
  onClose={() => {
    setReviewModalOpen(false);
    setSelectedSubmission(null);
  }}
  title="Review Assignment"
>
  <ReviewSubmissionForm
    initialData={selectedSubmission}
    loading={savingReview}
    onSubmit={handleReviewSubmission}
  />
</ReviewSubmissionModal>
    </div>
  );
}

export default AssignmentSubmissions;