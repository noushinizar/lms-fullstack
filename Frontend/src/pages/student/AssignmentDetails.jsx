import { useEffect, useState } from "react";

import StudentLayout from "../../layouts/StudentLayout";

import { getAssignmentById } from "../../services/assignmentService";

import { useParams } from "react-router-dom";

import {
  submitAssignment,
  getMySubmission,
} from "../../services/assignmentSubmissionService";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import { showSuccess, showError } from "../../utils/toast";

function AssignmentDetails() {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [mySubmission, setMySubmission] = useState(null);

  const [githubLink, setGithubLink] = useState("");
  const [liveDemoLink, setLiveDemoLink] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  useEffect(() => {
    if (assignment) {
      fetchMySubmission();
    }
  }, [assignment]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      setAccessDenied(false);
      setErrorMessage("");

      const data = await getAssignmentById(assignmentId);

      setAssignment(data);
    } catch (error) {
      console.error("Assignment error:", error);

      if (error.response?.status === 403) {
        setAccessDenied(true);

        setErrorMessage(
          error.response?.data?.message ||
            "You are not approved to access this course."
        );
      } else if (error.response?.status === 404) {
        setErrorMessage("Assignment not found.");
      } else {
        setErrorMessage("Failed to load assignment.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubmission = async () => {
    try {
      const data = await getMySubmission(assignmentId);

      setMySubmission(data);
    } catch (error) {
      // 404 means the student has not submitted yet.
      if (error.response?.status === 404) {
        setMySubmission(null);
        return;
      }

      console.error("Submission error:", error);
      setMySubmission(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await submitAssignment({
        assignmentId,
        githubLink,
        liveDemoLink,
        driveLink,
        notes,
      });

      showSuccess(response.message);

      await fetchMySubmission();
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Failed to submit assignment."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </StudentLayout>
    );
  }

  // ==============================
  // ACCESS DENIED
  // ==============================

  if (accessDenied) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-lg w-full">
            <div className="text-6xl mb-5">🔒</div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Access Denied
            </h1>

            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>

            <button
              onClick={() => window.history.back()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go Back
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // ==============================
  // OTHER ERROR
  // ==============================

  if (!assignment) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-lg w-full">
            <div className="text-5xl mb-5">⚠️</div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Unable to Load Assignment
            </h1>

            <p className="text-gray-600 mb-6">
              {errorMessage || "Something went wrong."}
            </p>

            <button
              onClick={() => window.history.back()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go Back
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="bg-white rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-3">
          📄 {assignment.title}
        </h1>

        <p className="text-gray-600 mb-6">
          {assignment.description}
        </p>

        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Requirements
          </h2>

          <ul className="space-y-3">
            {assignment.requirements?.map((item, index) => (
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

        <div className="flex gap-8 mb-8">
          <p>
            📅 Due :{" "}
            {new Date(
              assignment.dueDate
            ).toLocaleDateString()}
          </p>

          <p>
            🏆 {assignment.maxMarks} Marks
          </p>
        </div>

        {mySubmission ? (
          <div className="space-y-6">

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">

              <h2 className="text-2xl font-bold text-green-700 mb-5">
                ✅ Assignment Submitted
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <p className="font-semibold mb-2">
                    Status
                  </p>

                  <span
                    className={`px-4 py-2 rounded-full text-white ${
                      mySubmission.status === "Reviewed"
                        ? "bg-green-600"
                        : "bg-yellow-500"
                    }`}
                  >
                    {mySubmission.status}
                  </span>
                </div>

                <div>
                  <p className="font-semibold mb-2">
                    Marks
                  </p>

                  <p className="text-xl font-bold">
                    {mySubmission.status === "Reviewed"
                      ? `${mySubmission.marksObtained} / ${assignment.maxMarks}`
                      : "--"}
                  </p>
                </div>

              </div>

              <div className="mt-6">
                <p className="font-semibold mb-2">
                  Mentor Feedback
                </p>

                <div className="bg-white rounded-lg border p-4">
                  {mySubmission.status === "Reviewed"
                    ? mySubmission.feedback
                    : "Waiting for mentor review..."}
                </div>
              </div>

              <div className="mt-8 space-y-4">

                <div>
                  <p className="font-semibold">
                    GitHub Repository
                  </p>

                  <a
                    href={mySubmission.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {mySubmission.githubLink}
                  </a>
                </div>

                {mySubmission.liveDemoLink && (
                  <div>
                    <p className="font-semibold">
                      Live Demo
                    </p>

                    <a
                      href={mySubmission.liveDemoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {mySubmission.liveDemoLink}
                    </a>
                  </div>
                )}

                {mySubmission.driveLink && (
                  <div>
                    <p className="font-semibold">
                      Google Drive
                    </p>

                    <a
                      href={mySubmission.driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {mySubmission.driveLink}
                    </a>
                  </div>
                )}

                {mySubmission.notes && (
                  <div>
                    <p className="font-semibold">
                      Your Notes
                    </p>

                    <div className="bg-white rounded-lg border p-4">
                      {mySubmission.notes}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="block font-semibold mb-2">
                GitHub Repository *
              </label>

              <input
                type="url"
                value={githubLink}
                onChange={(e) =>
                  setGithubLink(e.target.value)
                }
                placeholder="https://github.com/username/project"
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Live Demo
              </label>

              <input
                type="url"
                value={liveDemoLink}
                onChange={(e) =>
                  setLiveDemoLink(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Google Drive Link
              </label>

              <input
                type="url"
                value={driveLink}
                onChange={(e) =>
                  setDriveLink(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Notes
              </label>

              <textarea
                rows={5}
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {saving
                ? "Submitting..."
                : "Submit Assignment"}
            </button>

          </form>
        )}

      </div>
    </StudentLayout>
  );
}

export default AssignmentDetails;