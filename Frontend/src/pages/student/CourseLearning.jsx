import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";

import { getLessons } from "../../services/lessonService";
import { getProgress } from "../../services/progressService";

function CourseLearning() {
  const { id } = useParams();

  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);

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
    }
  };

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold mb-6">
        Course Learning
      </h1>

      {/* Lesson Progress */}

      {/* {progress && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex justify-between mb-3">
            <h2 className="font-semibold text-lg">
              Lesson Progress
            </h2>

            <span className="font-bold">
              {Math.round(progress.percentage)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${progress.percentage}%`,
              }}
            />
          </div>

          <p className="text-gray-600 mt-3">
            {progress.completed} / {progress.totalLessons} Lessons Completed
          </p>
        </div>
      )} */}

      {/* Learning Modules */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Lessons */}

        <Link
          to={`/student/course/${id}/lessons`}
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
        >
          <div className="text-5xl mb-4">📚</div>

          <h2 className="text-2xl font-bold mb-2">
            Continue Learning
          </h2>

          <p className="text-gray-600">
            Watch course lessons and continue where you left off.
          </p>

          <div className="mt-5 text-amber-600 font-semibold">
            Open Lessons →
          </div>
        </Link>

        {/* Quizzes */}

        <Link
          to={`/student/course/${id}/quizzes`}
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
        >
          <div className="text-5xl mb-4">📝</div>

          <h2 className="text-2xl font-bold mb-2">
            Quizzes
          </h2>

          <p className="text-gray-600">
            Test your knowledge by attempting quizzes.
          </p>

          <div className="mt-5 text-amber-600 font-semibold">
            View Quizzes →
          </div>
        </Link>

        {/* Assignments */}

        <Link
          to={`/student/course/${id}/assignments`}
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
        >
          <div className="text-5xl mb-4">📄</div>

          <h2 className="text-2xl font-bold mb-2">
            Assignments
          </h2>

          <p className="text-gray-600">
            Complete and submit your assignments.
          </p>

          <div className="mt-5 text-amber-600 font-semibold">
            Open Assignments →
          </div>
        </Link>

        {/* Overall Course Progress */}

        <Link
          to={`/student/course/${id}/progress`}
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
        >
          <div className="text-5xl mb-4">📊</div>

          <h2 className="text-2xl font-bold mb-2">
            Overall Progress
          </h2>

          <p className="text-gray-600">
            View your overall course progress including lessons, quizzes and assignments.
          </p>

          <div className="mt-5 text-amber-600 font-semibold">
            View Progress →
          </div>
        </Link>

      </div>
    </StudentLayout>
  );
}

export default CourseLearning;

