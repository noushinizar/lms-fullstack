import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../../services/assignmentService";

import AssignmentModal from "./AssignmentModal";
import AssignmentForm from "./AssignmentForm";

import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";
import ConfirmDialog from "../common/ConfirmDialog";

import { showSuccess, showError } from "../../utils/toast";

function AssignmentTab({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingAssignment, setEditingAssignment] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      const data = await getAssignments(courseId);

      setAssignments(data);
    } catch (error) {
      showError("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (assignmentData) => {
    try {
      setSaving(true);

      await createAssignment({
        courseId,
        ...assignmentData,
      });

      showSuccess("Assignment created successfully.");

      setModalOpen(false);

      fetchAssignments();
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to create assignment.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditAssignment = async (assignmentData) => {
    try {
      setSaving(true);

      await updateAssignment(editingAssignment._id, assignmentData);

      showSuccess("Assignment updated successfully.");

      setEditingAssignment(null);

      setModalOpen(false);

      fetchAssignments();
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to update assignment.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      setDeleting(true);

      await deleteAssignment(selectedAssignment._id);

      showSuccess("Assignment deleted successfully.");

      setDeleteDialogOpen(false);

      setSelectedAssignment(null);

      fetchAssignments();
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to delete assignment.",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Assignments..." />;
  }

 if (assignments.length === 0) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6 ">
        <h2 className="text-2xl font-bold">
          Assignments
        </h2>

        <button
          onClick={() => {
            setEditingAssignment(null);
            setModalOpen(true);
          }}
          className="bg-amber-600 text-white px-5 py-3 rounded-lg hover:bg-amber-700"
        >
          + Create Assignment
        </button>
      </div>

      <EmptyState
        icon="📄"
        title="No Assignments"
        description="Create your first assignment."
      />

      {/* Modal */}
      <AssignmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAssignment(null);
        }}
        title="Create Assignment"
      >
        <AssignmentForm
          initialData={null}
          loading={saving}
          onSubmit={handleCreateAssignment}
        />
      </AssignmentModal>
    </div>
  );
}

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Assignments</h2>

        <button
          onClick={() => {
            setEditingAssignment(null);
            setModalOpen(true);
          }}
          className="bg-amber-600 text-white px-5 py-3 rounded-lg hover:bg-amber-700"
        >
          + Create Assignment
        </button>
      </div>

      {assignments.map((assignment) => (
  <div
    key={assignment._id}
    className="bg-amber-200 rounded-xl shadow-md border border-gray-100 p-6 mb-6"
  >
    {/* Assignment Title */}

    <div className="flex items-center gap-3 mb-3">
      <span className="text-3xl">📄</span>

      <h3 className="text-2xl font-bold">
        {assignment.title}
      </h3>
    </div>

    {/* Description */}

    <p className="text-gray-600 mb-5">
      {assignment.description}
    </p>

    {/* Requirements */}

    <div className=" rounded-xl p-5">

      <h4 className="font-semibold text-lg mb-4">
        Requirements
      </h4>

      <ul className="space-y-3">

        {assignment.requirements.map((item, index) => (

          <li
            key={index}
            className="flex items-start gap-3"
          >
            <span className="text-green-600">
              ✅
            </span>

            <span>{item}</span>

          </li>

        ))}

      </ul>

    </div>

    {/* Due Date & Marks */}

    <div className="flex flex-wrap gap-6 mt-6 text-gray-600">

      <div className="flex items-center gap-2">
        📅
        <span>
          Due :
          {" "}
          {new Date(
            assignment.dueDate
          ).toLocaleDateString()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        🏆
        <span>
          {assignment.maxMarks} Marks
        </span>
      </div>

    </div>

    {/* Buttons */}

    <div className="flex justify-end gap-3 mt-6">

      <button
        onClick={() => {
          setEditingAssignment(assignment);
          setModalOpen(true);
        }}
        className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg"
      >
        Edit
      </button>

      <button
        onClick={() => {
          setSelectedAssignment(assignment);
          setDeleteDialogOpen(true);
        }}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
      >
        Delete
      </button>

      <Link
        to={`/mentor/assignments/${assignment._id}/submissions`}
        className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg"
      >
        View Submissions
      </Link>

    </div>

  </div>
))}
      <AssignmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAssignment(null);
        }}
        title={editingAssignment ? "Edit Assignment" : "Create Assignment"}
      >
        <AssignmentForm
          initialData={editingAssignment}
          loading={saving}
          onSubmit={
            editingAssignment ? handleEditAssignment : handleCreateAssignment
          }
        />
      </AssignmentModal>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Assignment"
        message={`Delete "${selectedAssignment?.title}" ?`}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedAssignment(null);
        }}
        onConfirm={handleDeleteAssignment}
        loading={deleting}
      />
    </div>
  );
}

export default AssignmentTab;
