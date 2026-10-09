import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const FeaturedCourses = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        if (!API_URL) {
          throw new Error("Course API URL is not configured.");
        }

        const response = await fetch(`${API_URL.replace(/\/$/, "")}/courses`);

        if (!response.ok) {
          throw new Error("Unable to load courses.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid course data received from server.");
        }

        setFeaturedCourses(data);
      } catch (err) {
        console.error("Featured courses error:", err);
        setError(err.message || "Something went wrong while loading courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section id="courses" className="py-20 bg-white">
      {" "}
      <div className="max-w-8xl mx-auto px-7">
        {/* Heading */}{" "}
        <div className="text-center mb-12">
          {" "}
          <h2 className="text-4xl font-bold text-gray-900">
            Featured Courses{" "}
          </h2>
          <p className="mt-4 text-gray-600">
            Discover our courses and start learning today.
          </p>
        </div>
        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-600">Loading courses...</p>
        )}
        {/* Error */}
        {!loading && error && (
          <div className="text-center">
            <p className="text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}
        {/* Empty state */}
        {!loading && !error && featuredCourses.length === 0 && (
          <p className="text-center text-gray-600">
            No courses are available at the moment.
          </p>
        )}
        {/* Course cards */}
        {!loading && !error && featuredCourses.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-amber-100 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 hover:-translate-y-2"
              >
                <img
                  src={
                    course.thumbnail ||
                    "https://placehold.co/600x400?text=Course"
                  }
                  alt={course.title}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "https://placehold.co/600x400?text=Course";
                  }}
                />

                <div className="p-5">
                  <span className="inline-block bg-white text-amber-700 text-sm px-3 py-1 rounded-full">
                    {course.category || "Course"}
                  </span>

                  <h3 className="mt-4 text-xl font-semibold text-gray-800">
                    {course.title}
                  </h3>

                  <p className="mt-2 text-gray-600 line-clamp-3">
                    {course.description ||
                      "Explore this course and start learning."}
                  </p>

                  {course.price !== undefined && course.price !== null && (
                    <p className="mt-3 font-semibold text-gray-800">
                      ₹{course.price}
                    </p>
                  )}

                  <Link
                    to={`/courses/${course._id}`}
                    className="mt-6 inline-block w-full text-center bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg transition"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;
