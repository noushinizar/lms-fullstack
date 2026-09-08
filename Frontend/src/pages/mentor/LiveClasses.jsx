import { useEffect, useState } from "react";

import {
  getMyLiveClasses,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
} from "../../services/liveClassService";

import { getMyCourses } from "../../services/mentorService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { showSuccess, showError } from "../../utils/toast";

function LiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ==========================================
  // EDIT MODE
  // ==========================================

  const [editingId, setEditingId] = useState(null);

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

      console.log("Live Classes:", liveClassData);

      setLiveClasses(liveClassData || []);
      setCourses(courseData || []);
    } catch (error) {
      console.error("Fetch Live Classes Error:", error);

      showError(
        error.response?.data?.message || "Failed to load live classes.",
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
  // FORMAT DATE FOR DISPLAY
  // ==========================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Date not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      console.error("Invalid scheduledAt value:", dateValue);

      return "Invalid date";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ==========================================
  // CONVERT DATE TO DATETIME-LOCAL FORMAT
  // ==========================================

  const formatDateForInput = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      console.error("Invalid date for input:", dateValue);

      return "";
    }

    /*
     * datetime-local requires:
     *
     * YYYY-MM-DDTHH:mm
     *
     * We use the user's local timezone.
     */

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");

    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      courseId: "",
      title: "",
      description: "",
      meetingLink: "",
      scheduledAt: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // ==========================================
  // START EDITING
  // ==========================================

  const handleEdit = (liveClass) => {
    console.log("Editing Live Class:", liveClass);

    setEditingId(liveClass._id);

    setFormData({
      courseId: liveClass.courseId?._id || liveClass.courseId || "",

      title: liveClass.title || "",

      description: liveClass.description || "",

      meetingLink: liveClass.meetingLink || "",

      scheduledAt: formatDateForInput(liveClass.scheduledAt),
    });

    setShowForm(true);

    /*
     * Scroll to the form after opening it.
     */

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CREATE / UPDATE LIVE CLASS
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !formData.courseId ||
      !formData.title.trim() ||
      !formData.meetingLink.trim() ||
      !formData.scheduledAt
    ) {
      showError("Please fill in all required fields.");

      return;
    }

    // ==========================================
    // VALIDATE MEETING LINK
    // ==========================================

    try {
      new URL(formData.meetingLink);
    } catch {
      showError("Please enter a valid meeting link.");

      return;
    }

    // ==========================================
    // VALIDATE DATE
    // ==========================================

    const selectedDate = new Date(formData.scheduledAt);

    if (Number.isNaN(selectedDate.getTime())) {
      showError("Please select a valid date and time.");

      return;
    }

    try {
      setSubmitting(true);

      // ==========================================
      // PREPARE DATA
      // ==========================================

      const liveClassData = {
        courseId: formData.courseId,

        title: formData.title.trim(),

        description: formData.description.trim(),

        meetingLink: formData.meetingLink.trim(),

        scheduledAt: selectedDate.toISOString(),
      };

      console.log("Sending Live Class Data:", liveClassData);

      // ==========================================
      // UPDATE
      // ==========================================

      if (editingId) {
        await updateLiveClass(editingId, liveClassData);

        showSuccess("Live class updated successfully.");
      }

      // ==========================================
      // CREATE
      // ==========================================
      else {
        await createLiveClass(liveClassData);

        showSuccess("Live class scheduled successfully.");
      }

      // ==========================================
      // REFRESH DATA
      // ==========================================

      await fetchData();

      // ==========================================
      // RESET
      // ==========================================

      resetForm();
    } catch (error) {
      console.error(
        editingId ? "Update Live Class Error:" : "Create Live Class Error:",
        error,
      );

      showError(
        error.response?.data?.message ||
          (editingId
            ? "Failed to update live class."
            : "Failed to schedule live class."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);

      await deleteLiveClass(deleteId);

      setLiveClasses((prev) =>
        prev.filter((liveClass) => liveClass._id !== deleteId),
      );

      if (editingId === deleteId) {
        resetForm();
      }

      showSuccess("Live class deleted successfully.");

      setShowDeleteDialog(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Delete Live Class Error:", error);

      showError(
        error.response?.data?.message || "Failed to delete live class.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (deleting) return;

    setShowDeleteDialog(false);
    setDeleteId(null);
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
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>

          <p className="text-gray-500 mt-1">
            Schedule and manage your live classes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-lg font-semibold transition"
        >
          {showForm ? "Cancel" : "+ Schedule Live Class"}
        </button>
      </div>

      {/* ==========================================
          CREATE / EDIT FORM
      ========================================== */}

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">
            {editingId ? "Edit Live Class" : "Schedule Live Class"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* COURSE */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>

              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">Select Course</option>

                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
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
                required
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
                required
                placeholder="https://meet.google.com/..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* DATE & TIME */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time *
              </label>

              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* SUBMIT BUTTONS */}

            <div className="flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition"
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {submitting
                  ? editingId
                    ? "Updating..."
                    : "Scheduling..."
                  : editingId
                    ? "Update Class"
                    : "Schedule Class"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          LIVE CLASSES
      ========================================== */}

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
              {/* HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {liveClass.title}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {liveClass.courseId?.title || "Course"}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700 capitalize">
                  {liveClass.status || "scheduled"}
                </span>
              </div>

              {/* DESCRIPTION */}

              {liveClass.description && (
                <p className="text-gray-600 mt-4">{liveClass.description}</p>
              )}

              {/* DATE */}

              <div className="mt-5 space-y-2 text-sm text-gray-600">
                <p>📅 {formatDate(liveClass.scheduledAt)}</p>
              </div>

              {/* ACTIONS */}

              <div className="flex gap-3 mt-6">
                <a
                  href={liveClass.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Join Meeting
                </a>

                {/* EDIT */}

                <button
                  type="button"
                  onClick={() => handleEdit(liveClass)}
                  className="px-4 py-2 border border-amber-300 text-amber-600 hover:bg-amber-50 rounded-lg transition font-semibold"
                >
                  Edit
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() => handleDeleteClick(liveClass._id)}
                  className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Live Class"
        message="Are you sure you want to delete this live class? This action cannot be undone."
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}

export default LiveClasses;
