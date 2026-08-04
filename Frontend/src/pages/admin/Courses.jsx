import { useEffect, useState } from "react";

import CourseCard from "../../components/admin/CourseCard";
import CourseForm from "../../components/admin/CourseForm";
import CourseModal from "../../components/admin/CourseModal";
import { showSuccess, showError } from "../../utils/toast";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../services/courseService";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { getMentors } from "../../services/authService";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [mentors, setMentors] = useState([]);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [courseData, mentorData] = await Promise.all([
        getCourses(),
        getMentors(),
      ]);

      setCourses(courseData);

      setMentors(mentorData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (formData) => {
    try {
      setSaving(true);

      await createCourse(formData);

      showSuccess("Course created successfully");

      setModalOpen(false);

      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to create course.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCourse = async (formData) => {
    try {
      setSaving(true);

      await updateCourse(editingCourse._id, formData);

      showSuccess("Course updated successfully.");

      setEditingCourse(null);

      setModalOpen(false);

      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update course.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      setDeleting(true);

      await deleteCourse(selectedCourse._id);

      showSuccess("Course deleted successfully.");

      setDeleteDialogOpen(false);

      setSelectedCourse(null);

      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Course Management</h1>

        <button
          onClick={() => {
            setEditingCourse(null);
            setModalOpen(true);
          }}
          className="bg-amber-600 text-white px-5 py-3 rounded-lg hover:bg-amber-700"
        >
          + Create Course
        </button>
      </div>

      {/* Modal */}
      <CourseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCourse(null);
        }}
        title={editingCourse ? "Edit Course" : "Create Course"}
      >
        <CourseForm
          mentors={mentors}
          initialData={editingCourse}
          onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
          loading={saving}
        />
      </CourseModal>

      {loading ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <h2 className="text-xl font-semibold">Loading Courses...</h2>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <h2 className="text-xl font-semibold">No Courses Found</h2>

          <p className="text-gray-500 mt-2">
            Click "Create Course" to add your first course.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={(course) => {
                setEditingCourse(course);
                setModalOpen(true);
              }}
              onDelete={(course) => {
                setSelectedCourse(course);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Course"
        message={`Are you sure you want to delete "${selectedCourse?.title}"? This action cannot be undone.`}
        loading={deleting}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleDeleteCourse}
      />
    </div>
  );
}

export default Courses;
