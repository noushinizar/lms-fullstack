import { useEffect, useState } from "react";

import {
  getMyLiveClasses,
  createLiveClass,
  deleteLiveClass,
} from "../../services/liveClassService";

import { getMyCourses } from "../../services/mentorService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

import { showSuccess, showError } from "../../utils/toast";

function LiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    meetingLink: "",
    scheduledAt: "",
  });

  // ==========================================
  // FETCH DATA
  // ==========================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [liveClassData, courseData] = await Promise.all([
        getMyLiveClasses(),
        getMyCourses(),
      ]);

      setLiveClasses(liveClassData);
      setCourses(courseData);
    } catch (error) {
      console.log(error);

      showError(
        error.response?.data?.message ||
          "Failed to load live classes."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORM HANDLING
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // CREATE LIVE CLASS
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.courseId ||
      !formData.title ||
      !formData.meetingLink ||
      !formData.scheduledAt
    ) {
      showError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const newClass = await createLiveClass(formData);

      setLiveClasses((prev) => [
        newClass,
        ...prev,
      ]);

      setFormData({
        courseId: "",
        title: "",
        description: "",
        meetingLink: "",
        scheduledAt: "",
      });

      setShowForm(false);

      showSuccess("Live class scheduled successfully.");
    } catch (error) {
      console.log(error);

      showError(
        error.response?.data?.message ||
          "Failed to schedule live class."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this live class?"
    );

    if (!confirmed) return;

    try {
      await deleteLiveClass(id);

      setLiveClasses((prev) =>
        prev.filter((liveClass) => liveClass._id !== id)
      );

      showSuccess("Live class deleted successfully.");
    } catch (error) {
      console.log(error);

      showError(
        error.response?.data?.message ||
          "Failed to delete live class."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <LoadingSpinner />;
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Live Classes
          </h1>

          <p className="text-gray-500 mt-1">
            Schedule and manage your live classes.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-lg font-semibold transition"
        >
          {showForm
            ? "Cancel"
            : "+ Schedule Live Class"}
        </button>

      </div>

      {/* CREATE FORM */}

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-xl font-bold mb-6">
            Schedule Live Class
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* COURSE */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>

              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">
                  Select Course
                </option>

                {courses.map((course) => (
                  <option
                    key={course._id}
                    value={course._id}
                  >
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* TITLE */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: JavaScript Live Session"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="What will be covered in this class?"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* MEETING LINK */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Link *
              </label>

              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* DATE */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time *
              </label>

              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* SUBMIT */}

            <div className="flex justify-end">

              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {submitting
                  ? "Scheduling..."
                  : "Schedule Class"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* LIVE CLASSES */}

      {liveClasses.length === 0 ? (

        <EmptyState
          icon="🎥"
          title="No Live Classes"
          description="You haven't scheduled any live classes yet."
        />

      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {liveClasses.map((liveClass) => (

            <div
              key={liveClass._id}
              className="bg-white rounded-xl shadow-lg p-6"
            >

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {liveClass.title}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {liveClass.courseId?.title ||
                      "Course"}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700 capitalize">
                  {liveClass.status}
                </span>

              </div>

              {liveClass.description && (
                <p className="text-gray-600 mt-4">
                  {liveClass.description}
                </p>
              )}

              <div className="mt-5 space-y-2 text-sm text-gray-600">

                <p>
                  📅{" "}
                  {new Date(
                    liveClass.scheduledAt
                  ).toLocaleString()}
                </p>

              </div>

              <div className="flex gap-3 mt-6">

                <a
                  href={liveClass.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Join Meeting
                </a>

                <button
                  onClick={() =>
                    handleDelete(liveClass._id)
                  }
                  className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default LiveClasses;