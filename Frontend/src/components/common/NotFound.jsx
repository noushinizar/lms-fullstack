import { Link } from "react-router-dom";
import { TriangleAlert } from "lucide-react";

function NotFound() {
  const user = JSON.parse(localStorage.getItem("user"));

  const dashboardLink = !user
    ? "/"
    : user.role === "admin"
    ? "/admin/dashboard"
    : user.role === "mentor"
    ? "/mentor/dashboard"
    : "/student/dashboard";

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">

        <TriangleAlert
          size={70}
          className="mx-auto text-amber-500"
        />

        <h1 className="mt-6 text-6xl font-bold text-gray-800">
          404
        </h1>

        <h2 className="text-2xl font-semibold mt-2">
          Page Not Found
        </h2>

        <p className="mt-4 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">

          {/* <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl border border-amber-500 text-amber-600 font-semibold hover:bg-amber-50 transition"
          >
            ← Go Back
          </button> */}

          <Link
            to={dashboardLink}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
          >
            {user ? "Go to Dashboard" : "Back to Home"}
          </Link>

        </div>

      </div>
    </div>
  );
}

export default NotFound;