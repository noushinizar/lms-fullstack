import { useEffect, useState } from "react";

import { getStudentLiveClasses } from "../../services/liveClassService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

import { showError } from "../../utils/toast";

const LiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);

      const data = await getStudentLiveClasses();

      setLiveClasses(data);
    } catch (error) {
      console.error(error);

      showError(
        error.response?.data?.message ||
          "Failed to load live classes"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Live Classes
        </h1>

        <p className="text-gray-500 mt-1">
          Join live classes from your enrolled courses.
        </p>
      </div>

      {liveClasses.length === 0 ? (
        <EmptyState
          title="No live classes"
          message="There are no live classes scheduled for your enrolled courses."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveClasses.map((liveClass) => (
            <div
              key={liveClass._id}
              className="bg-white rounded-xl shadow-sm border p-5"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {liveClass.title}
              </h2>

              <p className="text-sm text-amber-600 font-medium mt-2">
                {liveClass.courseId?.title}
              </p>

              {liveClass.description && (
                <p className="text-sm text-gray-600 mt-3">
                  {liveClass.description}
                </p>
              )}

              <div className="mt-4 text-sm text-gray-500">
                <p>
                  📅{" "}
                  {new Date(
                    liveClass.scheduledAt
                  ).toLocaleDateString()}
                </p>

                <p className="mt-1">
                  🕐{" "}
                  {new Date(
                    liveClass.scheduledAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <button
                onClick={() =>
                  window.open(
                    liveClass.meetingLink,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="w-full mt-5 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition"
              >
                Join Class
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveClasses;