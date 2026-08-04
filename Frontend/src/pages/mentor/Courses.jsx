import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyCourses } from "../../services/mentorService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

function Courses() {
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getMyCourses();

      setCourses(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>

     {courses.length === 0 ? (

  <EmptyState
    icon="📚"
    title="No Courses Yet"
    description="You haven't been assigned any courses yet."
  />

) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              to={`/mentor/course/${course._id}`}
              key={course._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition block"
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover"
              />

              <div className="p-5">
                <h2 className="text-xl font-bold">{course.title}</h2>

                <p className="text-gray-600 mt-2">{course.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;
