import { useEffect, useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  User,
  BookOpen,
  ExternalLink,
  Trash2,
  XCircle,
} from "lucide-react";

import { getAllLiveClasses, deleteLiveClass } from "../../services/liveClassService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { showSuccess, showError } from "../../utils/toast";

function LiveClasses() {
 const [liveClasses, setLiveClasses] = useState([]);
const [loading, setLoading] = useState(true);
const [deletingId, setDeletingId] = useState(null);

const [confirmDelete, setConfirmDelete] = useState({
  isOpen: false,
  id: null,
});
  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);

      const data = await getAllLiveClasses();

      setLiveClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch live classes:", error);
      showError("Failed to load live classes.");
    } finally {
      setLoading(false);
    }
  };

 const handleDeleteClick = (id) => {
  setConfirmDelete({
    isOpen: true,
    id,
  });
};

const handleCancelDelete = () => {
  if (deletingId) return;

  setConfirmDelete({
    isOpen: false,
    id: null,
  });
};

const handleConfirmDelete = async () => {
  const id = confirmDelete.id;

  if (!id) return;

  try {
    setDeletingId(id);

    await deleteLiveClass(id);

    setLiveClasses((prev) =>
      prev.filter((liveClass) => liveClass._id !== id)
    );

    showSuccess("Live class deleted successfully.");

    setConfirmDelete({
      isOpen: false,
      id: null,
    });
  } catch (error) {
    console.error("Delete live class error:", error);

    showError(
      error.response?.data?.message ||
        "Failed to delete live class."
    );
  } finally {
    setDeletingId(null);
  }
};

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatus = (liveClass) => {
  if (liveClass.status === "cancelled") {
    return {
      label: "Cancelled",
      className: "bg-red-100 text-red-700",
    };
  }

  if (liveClass.status === "completed") {
    return {
      label: "Completed",
      className: "bg-gray-100 text-gray-700",
    };
  }

  if (new Date(liveClass.scheduledAt) <= new Date()) {
    return {
      label: "Completed",
      className: "bg-gray-100 text-gray-700",
    };
  }

  return {
    label: "Upcoming",
    className: "bg-amber-100 text-amber-700",
  };
};

  if (loading) {
    return <LoadingSpinner text="Loading live classes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Live Classes
          </h1>

          <p className="text-gray-500 mt-1">
            Monitor and manage all scheduled live classes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg">
          <Video size={18} />
          <span className="font-semibold">
            {liveClasses.length} Classes
          </span>
        </div>
      </div>

      {/* Empty State */}
      {liveClasses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <EmptyState
            title="No Live Classes"
            message="There are no live classes scheduled yet."
          />
        </div>
      ) : (
        /* Classes */
        <div className="grid gap-5">
          {liveClasses.map((liveClass) => {
            const status = getStatus(liveClass);

            return (
              <div
                key={liveClass._id}
                className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <Video
                        size={24}
                        className="text-amber-600"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-800">
                          {liveClass.title}
                        </h2>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {liveClass.description && (
                        <p className="text-sm text-gray-500 mt-2">
                          {liveClass.description}
                        </p>
                      )}

                      {/* Details */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-600">

                        <span className="flex items-center gap-2">
                          <BookOpen size={16} />
                          {liveClass.courseId?.title || "Course"}
                        </span>

                        <span className="flex items-center gap-2">
                          <User size={16} />
                          {liveClass.createdBy?.name || "Mentor"}
                        </span>

                        <span className="flex items-center gap-2">
                          <Calendar size={16} />
                          {formatDate(liveClass.scheduledAt)}
                        </span>

                        <span className="flex items-center gap-2">
                          <Clock size={16} />
                          {formatTime(liveClass.scheduledAt)}
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">

                    {liveClass.status === "scheduled" && (
                      <a
                        href={liveClass.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm transition"
                      >
                        <ExternalLink size={16} />
                        Open Class
                      </a>
                    )}

                    <button
                      onClick={() => handleDeleteClick(liveClass._id)}
                      disabled={deletingId === liveClass._id}
                      className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-sm transition disabled:opacity-50"
                    >
                      {deletingId === liveClass._id ? (
                        "Deleting..."
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Delete
                        </>
                      )}
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
       <ConfirmDialog
      isOpen={confirmDelete.isOpen}
      title="Delete Live Class"
      message="Are you sure you want to delete this live class? This action cannot be undone."
      onCancel={handleCancelDelete}
      onConfirm={handleConfirmDelete}
      loading={Boolean(deletingId)}
    />
    </div>
  );
}

export default LiveClasses;