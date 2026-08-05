import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";
import { getCourseById } from "../../services/courseService";
import { requestEnrollment } from "../../services/enrollmentService";
import { showSuccess, showError } from "../../utils/toast";

function CourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(id);

        setCourse(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      const response = await requestEnrollment(course._id);

      // Immediately update the enrollment status
      setCourse((prevCourse) => ({
        ...prevCourse,
        enrollmentStatus: "pending",
      }));

      showSuccess(response.message);
    } catch (error) {
      showError(
        error.response?.data?.message || "Enrollment failed"
      );
    }
  };

  if (!course) {
    return (
      <StudentLayout>
        <h2>Loading...</h2>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="bg-white rounded-xl shadow p-6">

        <img
          src={course.thumbnail || "https://placehold.co/1000x400"}
          alt={course.title}
          className="
            w-full
            h-80
            object-cover
            rounded-lg
            mb-6
          "
        />

        <h1 className="text-4xl font-bold mb-4">
          {course.title}
        </h1>

        <p className="text-gray-600 mb-4">
          {course.description}
        </p>

        <p className="mb-2">
          <strong>Category:</strong> {course.category}
        </p>

        <p className="mb-6 text-green-600 font-bold text-2xl">
          ₹{course.price}
        </p>

        {/* ================= ENROLLMENT STATUS ================= */}

        {course.enrollmentStatus === "approved" ? (
          <Link
            to="/student/my-courses"
            className="
              inline-block
              bg-green-600
              text-white
              px-6
              py-3
              rounded
              hover:bg-green-700
              transition
            "
          >
            Continue Learning
          </Link>
        ) : course.enrollmentStatus === "pending" ? (
          <button
            disabled
            className="
              bg-yellow-500
              text-white
              px-6
              py-3
              rounded
              cursor-not-allowed
              opacity-90
            "
          >
            Waiting For Approval
          </button>
        ) : (
          <button
            onClick={handleEnroll}
            className="
              bg-green-600
              text-white
              px-6
              py-3
              rounded
              hover:bg-green-700
              transition
            "
          >
            Enroll Now
          </button>
        )}

      </div>
    </StudentLayout>
  );
}

export default CourseDetails;