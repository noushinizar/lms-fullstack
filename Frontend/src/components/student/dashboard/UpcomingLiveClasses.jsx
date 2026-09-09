import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Video, ArrowRight } from "lucide-react";

import { getStudentLiveClasses } from "../../../services/liveClassService";
import LoadingSpinner from "../../common/LoadingSpinner";

function UpcomingLiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const data = await getStudentLiveClasses();

      const classes = Array.isArray(data)
        ? data
        : data?.liveClasses || data?.data || [];

      const upcoming = classes
        .filter(
          (liveClass) =>
            new Date(liveClass.scheduledAt) > new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledAt) -
            new Date(b.scheduledAt)
        )
        .slice(0, 3);

      setLiveClasses(upcoming);
    } catch (error) {
      console.error("Failed to load live classes:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <LoadingSpinner text="Loading live classes..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Upcoming Live Classes
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Don't miss your upcoming sessions
          </p>
        </div>

        <Link
          to="/student/live-classes"
          className="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700"
        >
          View All
          <ArrowRight size={16} />
        </Link>

      </div>

      {/* Empty State */}

      {liveClasses.length === 0 ? (
        <div className="text-center py-8">

          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Video
              size={26}
              className="text-amber-600"
            />
          </div>

          <h3 className="font-semibold text-gray-700">
            No upcoming live classes
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Your upcoming classes will appear here.
          </p>

        </div>
      ) : (

        /* Classes */

        <div className="space-y-4">

          {liveClasses.map((liveClass) => (

            <div
              key={liveClass._id}
              className="border rounded-xl p-4 hover:shadow-md transition"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div className="flex items-start gap-3">

                  <div className="w-11 h-11 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <Video
                      size={21}
                      className="text-red-600"
                    />
                  </div>

                  <div>

                    <h3 className="font-semibold text-gray-800">
                      {liveClass.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {liveClass.courseId?.title ||
                        liveClass.course?.title ||
                        "Course"}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">

                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(liveClass.scheduledAt)}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatTime(liveClass.scheduledAt)}
                      </span>

                    </div>

                  </div>

                </div>

                <Link
                  to="/student/live-classes"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center transition"
                >
                  View Class
                </Link>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default UpcomingLiveClasses;

