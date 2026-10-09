import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourseById } from "../../services/courseService";

function PublicCourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCourseById(id);

        if (isMounted) {
          setCourse(data);
        }
      } catch (err) {
        console.error("Failed to fetch public course:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load course details. Please try again.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-6">
        {" "}
        <p className="text-gray-600">Loading course details...</p>{" "}
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        {" "}
        <h1 className="text-2xl font-bold text-gray-900">
          Course unavailable{" "}
        </h1>
        <p className="mt-3 text-gray-600">
          {error || "The requested course could not be found."}
        </p>
        <Link
          to="/"
          className="mt-6 rounded-lg bg-amber-600 px-6 py-3 text-white hover:bg-amber-700 transition"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 py-12 md:py-16">
      {" "}
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {" "}
        <Link
          to="/"
          className="mb-8 inline-block text-amber-700 hover:text-amber-800 font-medium"
        >
          ← Back to Courses{" "}
        </Link>
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <img
            src={
              course.thumbnail || "https://placehold.co/1200x500?text=Course"
            }
            alt={course.title}
            className="h-64 w-full object-cover sm:h-80 md:h-96"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src =
                "https://placehold.co/1200x500?text=Course";
            }}
          />

          <div className="p-6 md:p-10">
            <span className="inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
              {course.category || "Course"}
            </span>

            <h1 className="mt-5 text-3xl font-bold text-gray-900 md:text-4xl">
              {course.title}
            </h1>

            <p className="mt-5 whitespace-pre-line leading-7 text-gray-600">
              {course.description ||
                "Explore this course and begin your learning journey with Astrobyte Academy."}
            </p>

            {course.mentor && (
              <p className="mt-5 text-gray-600">
                <span className="font-semibold text-gray-800">Instructor:</span>{" "}
                {typeof course.mentor === "object"
                  ? course.mentor.name || "Astrobyte Academy"
                  : "Astrobyte Academy"}
              </p>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">Course price</p>

              <p className="mt-1 text-3xl font-bold text-green-700">
                {course.price != null ? `₹${course.price}` : "Contact us"}
              </p>
            </div>

            {/* Registration CTA */}
            <div className="mt-10 rounded-xl bg-amber-50 p-6 text-center md:p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Interested in this course?
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-gray-600">
                Register with Astrobyte Academy to get more details and take the
                next step in your learning journey.
              </p>

              <Link
                to="/register"
                className="mt-6 inline-block rounded-lg bg-amber-600 px-8 py-3 font-semibold text-white transition hover:bg-amber-700"
              >
                Register for More Details
              </Link>

              <p className="mt-4 text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-amber-700 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PublicCourseDetails;
