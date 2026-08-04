import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";
import { getCourseProgress } from "../../services/courseProgressService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { showError } from "../../utils/toast";

function Progress() {
  const { courseId } = useParams();

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [courseId]);

  const fetchProgress = async () => {
    try {
      const data = await getCourseProgress(courseId);
      setProgress(data);
    } catch (error) {
      showError("Failed to load course progress.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner text="Loading Progress..." />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6">
          📊 {progress.courseId.title}
        </h1>

       <div className="space-y-6">

  {/* Overall Progress */}

  <div className="bg-gray-100 rounded-xl p-6">

    <div className="flex justify-between mb-2">

      <h2 className="text-xl font-semibold">
        Overall Progress
      </h2>

      <span className="font-bold text-amber-600">
        {progress.progress}%
      </span>

    </div>

    <div className="w-full bg-gray-300 rounded-full h-5">

      <div
        className="bg-amber-500 h-5 rounded-full transition-all duration-700"
        style={{
          width: `${progress.progress}%`,
        }}
      ></div>

    </div>

  </div>

  {/* Statistics */}

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    <div className="bg-white border rounded-xl p-6 shadow">

      <h3 className="text-lg font-semibold mb-3">
        📚 Lessons
      </h3>

      <p className="text-3xl font-bold">
        {progress.lessonsCompleted} / {progress.totalLessons}
      </p>

    </div>

    <div className="bg-white border rounded-xl p-6 shadow">

      <h3 className="text-lg font-semibold mb-3">
        📝 Quizzes
      </h3>

      <p className="text-3xl font-bold">
        {progress.quizzesCompleted} / {progress.totalQuizzes}
      </p>

    </div>

    <div className="bg-white border rounded-xl p-6 shadow">

      <h3 className="text-lg font-semibold mb-3">
        📄 Assignments
      </h3>

      <p className="text-3xl font-bold">
        {progress.assignmentsCompleted} / {progress.totalAssignments}
      </p>

    </div>

  </div>

  {/* Status */}

  <div className="bg-white rounded-xl shadow p-6">

    <h2 className="text-xl font-semibold mb-4">
      Course Status
    </h2>

    <span
      className={`px-5 py-2 rounded-full text-white ${
        progress.completed
          ? "bg-green-600"
          : "bg-yellow-500"
      }`}
    >
      {progress.completed
        ? "🎉 Completed"
        : "📖 In Progress"}
    </span>

  </div>

</div>
      </div>
    </StudentLayout>
  );
}

export default Progress;