import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";
import { getMyCourses } from "../../services/enrollmentService";
import EmptyState from "../../components/common/EmptyState";

function MyEnrolledCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getMyCourses();
        setCourses(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <EmptyState
            icon="🎓"
            title="No Enrolled Courses"
            description="Browse courses and start learning today."
          />

          <Link
            to="/student/courses"
            className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <img
                src={item.courseId?.thumbnail || "https://placehold.co/600x300"}
                alt={item.courseId?.title}
                className="w-full h-48 object-cover"
              />

              <div className="p-5">
                <h2 className="text-xl font-bold mb-2">
                  {item.courseId?.title}
                </h2>

                <p className="text-gray-600 mb-4">
                  {item.courseId?.description}
                </p>

                <Link
                  to={`/student/course/${item.courseId?._id}`}
                  className="inline-block bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
                >
                  Continue Learning
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}

export default MyEnrolledCourses;
