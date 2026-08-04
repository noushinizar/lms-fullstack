import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";

import { getLessons } from "../../services/lessonService";
import { getProgress } from "../../services/progressService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

function Lessons() {
  const { id } = useParams();

  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const lessonData = await getLessons(id);
      setLessons(lessonData);

      const progressData = await getProgress(id);
      setProgress(progressData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId) => {
    if (!progress) return false;

    return progress.completedLessons.some(
      (lesson) => lesson._id === lessonId
    );
  };

  const isLessonUnlocked = (index) => {
    if (index === 0) return true;

    return isLessonCompleted(lessons[index - 1]._id);
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner text="Loading lessons..." />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold mb-6">
        Course Lessons
      </h1>

      {progress && (
        <div className="bg-white rounded-xl shadow p-5 mb-8">
          <div className="flex justify-between mb-2">
            <h2 className="font-semibold">
              Course Progress
            </h2>

            <span>
              {Math.round(progress.percentage)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full"
              style={{
                width: `${progress.percentage}%`,
              }}
            />
          </div>

          <p className="text-gray-600 mt-2">
            {progress.completed} / {progress.totalLessons} Lessons Completed
          </p>
        </div>
      )}

      {lessons.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No Lessons Found"
          description="Lessons will appear here when your mentor adds them."
        />
      ) : (
        lessons.map((lesson, index) => (
          <div
            key={lesson._id}
            className="bg-white shadow rounded-xl p-5 mb-4 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-bold">
                {isLessonCompleted(lesson._id)
                  ? "✅"
                  : isLessonUnlocked(index)
                  ? "▶️"
                  : "🔒"}{" "}
                Lesson {index + 1}: {lesson.title}
              </h2>

              <p className="text-gray-600 mt-2">
                {lesson.description}
              </p>
            </div>

            {isLessonUnlocked(index) ? (
              <Link
                to={`/student/lesson/${lesson._id}`}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
              >
                Open
              </Link>
            ) : (
              <button
                disabled
                className="bg-gray-400 text-white px-5 py-2 rounded-lg cursor-not-allowed"
              >
                Locked
              </button>
            )}
          </div>
        ))
      )}
    </StudentLayout>
  );
}

export default Lessons;