import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../services/questionService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { showSuccess, showError } from "../../utils/toast";

import QuestionModal from "../../components/mentor/QuestionModal";
import QuestionForm from "../../components/mentor/QuestionForm";

function QuestionManagement() {
  const { quizId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const fetchQuestions = async () => {
    try {
      const data = await getQuestions(quizId);


      setQuestions(data);
    } catch (error) {
      console.log(error);
      showError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (questionData) => {
    try {
      setSaving(true);

      await createQuestion({
        quizId,
        ...questionData,
      });

      showSuccess("Question created successfully.");

      setModalOpen(false);

      fetchQuestions();
    } catch (error) {
      console.log(error.response?.data);

      showError(
        error.response?.data?.message ||
          "Failed to create question."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuestion = async (questionData) => {
    try {
      setSaving(true);

      await updateQuestion(editingQuestion._id, questionData);

      showSuccess("Question updated successfully.");

      setEditingQuestion(null);

      setModalOpen(false);

      fetchQuestions();
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Failed to update question."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      setDeleting(true);

      await deleteQuestion(selectedQuestion._id);

      showSuccess("Question deleted successfully.");

      setDeleteDialogOpen(false);

      setSelectedQuestion(null);

      fetchQuestions();
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Failed to delete question."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Questions..." />;
  }

  return (
    <div>
      {/* Header */}

      <div className="flex justify-between items-center m-5">
        <h1 className="text-3xl font-bold">
          Questions
        </h1>

        <button
          onClick={() => {
            setEditingQuestion(null);
            setModalOpen(true);
          }}
          className="bg-amber-600 text-white px-5 py-3 rounded-lg hover:bg-amber-700 transition"
        >
          + Add Question
        </button>
      </div>

      {/* Empty State */}

      {questions.length === 0 ? (
        <EmptyState
          icon="❓"
          title="No Questions Yet"
          description="Create your first question."
        />
      ) : (
        questions.map((question, index) => (
          <div
            key={question._id}
            className="bg-white rounded-xl shadow p-5 mb-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">
                  Q{index + 1}. {question.question}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Marks : {question.marks}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              {question.options.map((option, i) => (
                <div
                  key={i}
                  className={`border rounded-lg p-3 ${
                    option === question.correctAnswer
                      ? "bg-green-100 border-green-500"
                      : ""
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setEditingQuestion(question);
                  setModalOpen(true);
                }}
                className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  setSelectedQuestion(question);
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

      {/* Question Modal */}

      <QuestionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingQuestion(null);
        }}
        title={
          editingQuestion
            ? "Edit Question"
            : "Add Question"
        }
      >
        <QuestionForm
          initialData={editingQuestion}
          loading={saving}
          onSubmit={
            editingQuestion
              ? handleEditQuestion
              : handleCreateQuestion
          }
        />
      </QuestionModal>

      {/* Delete Dialog */}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Question"
        message={`Are you sure you want to delete "${selectedQuestion?.question}"?`}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedQuestion(null);
        }}
        onConfirm={handleDeleteQuestion}
        loading={deleting}
      />
    </div>
  );
}

export default QuestionManagement;