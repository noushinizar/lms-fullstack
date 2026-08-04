import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

function Unauthorized() {
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-100 flex items-center justify-center px-6">

      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-10 text-center">

        <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center">
          <ShieldX size={50} className="text-red-500" />
        </div>

        <h1 className="mt-6 text-4xl font-bold text-gray-800">
          Access Denied
        </h1>

        <p className="mt-4 text-gray-600 leading-relaxed">
          You don't have permission to access this page.
          <br />
          Please log in with an account that has the required role.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">

          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
          >
            Go Home
          </Link>

          <Link
            to="/login"
            className="px-6 py-3 rounded-xl border border-amber-500 text-amber-600 font-semibold hover:bg-amber-50 transition"
          >
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Unauthorized;