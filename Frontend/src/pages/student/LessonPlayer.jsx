import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";
import { getLessonById, getLessons } from "../../services/lessonService";

import {
  markLessonComplete,
  getProgress,
} from "../../services/progressService";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { showSuccess, showError } from "../../utils/toast";
function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [progress, setProgress] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      // Current Lesson
      const lessonData = await getLessonById(id);

      // All Lessons
      const lessonList = await getLessons(lessonData.courseId);

      // Student Progress
      const progressData = await getProgress(lessonData.courseId);

      // Current Lesson Index
      const index = lessonList.findIndex((item) => item._id === lessonData._id);

      // Helper function
      const lessonCompleted = (lessonId) => {
        return (
          progressData.completedLessons?.some(
            (item) => item._id === lessonId,
          ) || false
        );
      };

      // Check if lesson is unlocked
      const lessonUnlocked = (lessonIndex) => {
        if (lessonIndex === 0) return true;

        return lessonCompleted(lessonList[lessonIndex - 1]._id);
      };

      // Redirect if locked
      if (!lessonUnlocked(index)) {
        const firstUnlocked = lessonList.findIndex((_, i) => lessonUnlocked(i));

        navigate(`/student/lesson/${lessonList[firstUnlocked]._id}`, {
          replace: true,
        });

        return;
      }

      setLesson(lessonData);
      setLessons(lessonList);
      setCurrentIndex(index);
      setProgress(progressData);

      setCompleted(lessonCompleted(lessonData._id));
    } catch (error) {
      if (error.response?.status === 403) {
        showError(error.response.data.message);

        navigate(-1);

        return;
      }

      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Check if lesson completed
  const isLessonCompleted = (lessonId) => {
    if (!progress) return false;

    return progress.completedLessons?.some((lesson) => lesson._id === lessonId);
  };

  // Check if lesson unlocked
  const isLessonUnlocked = (index) => {
    if (index === 0) return true;

    return isLessonCompleted(lessons[index - 1]._id);
  };

  // Previous Lesson
  const goToPrevious = () => {
    if (currentIndex > 0) {
      navigate(`/student/lesson/${lessons[currentIndex - 1]._id}`);
    }
  };

  // Next Lesson
  const goToNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < lessons.length && isLessonUnlocked(nextIndex)) {
      navigate(`/student/lesson/${lessons[nextIndex]._id}`);
    }
  };

  // Mark Lesson Complete
  const handleCompleteLesson = async () => {
    try {
      await markLessonComplete(lesson.courseId, lesson._id);

      fetchLesson();
    } catch (error) {
      showError(error.response?.data?.message || "Something went wrong.");
    }
  };

  // Convert YouTube URL
  const getEmbedUrl = (url) => {
    if (!url) return "";

    const regExp =
      /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]{11}).*/;

    const match = url.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    return "";
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner text=" Loading lesson..." />
       </StudentLayout>
    );
  }

  if (!lesson) {
    return (
      <StudentLayout>
        <EmptyState icon="🎓" title="No Lessons Yet" />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>

        {progress && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Course Progress</span>

              <span>{Math.round(progress.percentage)}%</span>
            </div>

            <div className="w-full bg-gray-300 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{
                  width: `${progress.percentage}%`,
                }}
              />
            </div>

            <p className="text-sm text-gray-600 mt-2">
              {progress.completed} / {progress.totalLessons} Lessons Completed
            </p>
          </div>
        )}

        <div className="w-full mb-8">
          <iframe
            className="w-full h-125 rounded-lg"
            src={getEmbedUrl(lesson.videoUrl)}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Description</h2>

          <p className="text-gray-700 leading-7">{lesson.description}</p>
        </div>

        <div className="flex justify-between mb-10">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-40"
          >
            ⬅ Previous
          </button>

          <button
            onClick={goToNext}
            disabled={
              currentIndex === lessons.length - 1 ||
              !isLessonUnlocked(currentIndex + 1)
            }
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-40"
          >
            Next ➡
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleCompleteLesson}
            disabled={completed}
            className={`px-8 py-3 rounded-lg text-white transition ${
              completed
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {completed ? "✔ Lesson Completed" : "✅ Mark Lesson Complete"}
          </button>
        </div>
      </div>
    </StudentLayout>
  );
}

export default LessonPlayer;
