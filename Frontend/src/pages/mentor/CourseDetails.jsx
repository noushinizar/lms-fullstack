import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getCourseById } from "../../services/courseService";
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../../services/lessonService";

import AssignmentTab from "../../components/mentor/AssignmentTab";
import LessonModal from "../../components/mentor/LessonModal";
import LessonForm from "../../components/mentor/LessonForm";
import StudentsTab from "../../components/mentor/StudentsTab";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import QuizTab from "../../components/mentor/QuizTab";
import { showSuccess, showError } from "../../utils/toast";
function CourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("lessons");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingLesson, setEditingLesson] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const courseData = await getCourseById(id);
      setCourse(courseData);

      const lessonData = await getLessons(id);
      setLessons(lessonData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (lessonData) => {
    try {
      setSaving(true);

      await createLesson({
        courseId: id,
        title: lessonData.title,
        description: lessonData.description,
        videoUrl: lessonData.videoUrl,
        order: lessons.length + 1,
      });

      showSuccess("Lesson created successfully.");

      setModalOpen(false);

      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to create lesson.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditLesson = async (lessonData) => {
    try {
      setSaving(true);

      await updateLesson(editingLesson._id, {
        ...lessonData,
        order: editingLesson.order,
      });

      showSuccess("Lesson updated successfully.");

      setEditingLesson(null);

      setModalOpen(false);

      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update lesson.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    try {
      setDeleting(true);

      await deleteLesson(selectedLesson._id);

      showSuccess("Lesson deleted successfully.");

      setDeleteDialogOpen(false);

      setSelectedLesson(null);

      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete lesson.");
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Course Information */}

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-3">{course.title}</h1>

        <p className="text-gray-600 mb-6">{course.description}</p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold">Category</h3>
            <p>{course.category}</p>
          </div>

          <div>
            <h3 className="font-semibold">Price</h3>
            <p>₹ {course.price}</p>
          </div>

          <div>
            <h3 className="font-semibold">Mentor</h3>
            <p>{course.mentor?.name}</p>
          </div>

          <div>
            <h3 className="font-semibold">Total Lessons</h3>
            <p>{lessons.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === "lessons"
                ? "bg-amber-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === "quizzes"
                ? "bg-amber-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Quizzes
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === "students"
                ? "bg-amber-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-6 py-2 rounded-lg ${
              activeTab === "assignments"
                ? "bg-amber-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Assignments
          </button>
        </div>

        {/* LESSON TAB */}

        {activeTab === "lessons" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Lessons</h2>

              <button
                onClick={() => {
                  setEditingLesson(null);
                  setModalOpen(true);
                }}
                className="bg-amber-600 text-white px-5 py-3 rounded-lg hover:bg-amber-700"
              >
                + Add Lesson
              </button>
            </div>

            {lessons.length === 0 ? (
              <EmptyState
                icon="🎥"
                title="No Lessons Yet"
                description="Create your first lesson to start teaching."
                buttonText="Add Lesson"
                onButtonClick={() => {
                  setEditingLesson(null);
                  setModalOpen(true);
                }}
              />
            ) : (
              lessons.map((lesson, index) => (
                <div
                  key={lesson._id}
                  className="flex justify-between items-center  bg-amber-200 rounded-xl p-4 m-4"
                >
                  <div>
                    <h3 className="font-semibold">
                      Lesson {index + 1}: {lesson.title}
                    </h3>

                    <p className="text-gray-600 text-sm">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditingLesson(lesson);
                        setModalOpen(true);
                      }}
                      className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setSelectedLesson(lesson);
                        setDeleteDialogOpen(true);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* QUIZ TAB */}
        {activeTab === "quizzes" && <QuizTab courseId={id} />}
        {activeTab === "assignments" && <AssignmentTab courseId={id} />}

        {/* STUDENTS TAB */}

        {activeTab === "students" && <StudentsTab courseId={id} />}
      </div>

      <LessonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLesson ? "Edit Lesson" : "Create Lesson"}
      >
        <LessonForm
          initialData={editingLesson}
          loading={saving}
          onSubmit={editingLesson ? handleEditLesson : handleCreateLesson}
        />
      </LessonModal>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Lesson"
        message={`Are you sure you want to delete "${selectedLesson?.title}"?`}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedLesson(null);
        }}
        onConfirm={handleDeleteLesson}
        loading={deleting}
      />
    </div>
  );
}

export default CourseDetails;
