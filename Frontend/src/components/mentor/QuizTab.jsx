import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "../../services/quizService";

import QuizModal from "./QuizModal";
import QuizForm from "./QuizForm";

import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";

import { showSuccess, showError } from "../../utils/toast";

function QuizTab({ courseId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingQuiz, setEditingQuiz] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      const data = await getQuizzes(courseId);
      setQuizzes(data);
    } catch (error) {
      showError("Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (quizData) => {
    try {
      setSaving(true);

      await createQuiz({
        courseId,
        title: quizData.title,
        description: quizData.description,
        duration: quizData.duration,
        dueDate: quizData.dueDate,
      });

      showSuccess("Quiz created successfully.");

      setModalOpen(false);

      fetchQuizzes();
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to create quiz."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuiz = async (quizData) => {
    try {
      setSaving(true);

      await updateQuiz(editingQuiz._id, quizData);

      showSuccess("Quiz updated successfully.");

      setEditingQuiz(null);
      setModalOpen(false);

      fetchQuizzes();
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to update quiz."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      setDeleting(true);

      await deleteQuiz(selectedQuiz._id);

      showSuccess("Quiz deleted successfully.");

      setDeleteDialogOpen(false);
      setSelectedQuiz(null);

      fetchQuizzes();
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to delete quiz."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading quizzes..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quizzes</h2>

        <button
          onClick={() => {
            setEditingQuiz(null);
            setModalOpen(true);
          }}
          className="bg-amber-600 text-white px-5 py-3 rounded-lg hover:bg-amber-700"
        >
          + Create Quiz
        </button>
      </div>

      {/* Empty State */}
      {quizzes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No Quizzes Found"
          description="Create your first quiz."
        />
      ) : (
        quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className=" rounded-xl p-5 mb-4 shadow-sm flex justify-between items-center bg-amber-200"
          >
            <div>
              <h3 className="text-xl font-semibold">
                {quiz.title}
              </h3>

              <p className="text-gray-600">
                {quiz.description}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Duration: {quiz.duration} Minutes
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingQuiz(quiz);
                  setModalOpen(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  setSelectedQuiz(quiz);
                  setDeleteDialogOpen(true);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>

              <Link
                to={`/mentor/quizzes/${quiz._id}`}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
              >
                Questions
              </Link>
            </div>
          </div>
        ))
      )}

      {/* Quiz Modal */}
      <QuizModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingQuiz(null);
        }}
        title={editingQuiz ? "Edit Quiz" : "Create Quiz"}
      >
        <QuizForm
          initialData={editingQuiz}
          loading={saving}
          onSubmit={
            editingQuiz
              ? handleEditQuiz
              : handleCreateQuiz
          }
        />
      </QuizModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${selectedQuiz?.title}"?`}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedQuiz(null);
        }}
        onConfirm={handleDeleteQuiz}
        loading={deleting}
      />
    </div>
  );
}
export default QuizTab;