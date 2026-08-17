import { useState, useContext } from "react";
import { Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import pageTitles from "../../data/pageTitles";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useContext(AuthContext);

  const [open, setOpen] = useState(false);

  // ===============================
  // FIND CURRENT PAGE TITLE
  // ===============================

  const getPageTitle = () => {
    const currentPath = location.pathname;

    // First try exact match
    if (pageTitles[currentPath]) {
      return pageTitles[currentPath];
    }

    // Handle dynamic routes such as:
    // /student/course/:id/lessons
    // /student/course/:id/assignments
    // /student/course/:id/quizzes
    // /student/course/:id/progress

    const matchedPage = Object.entries(pageTitles).find(([path]) => {
      const pathParts = path.split("/");
      const currentParts = currentPath.split("/");

      if (pathParts.length !== currentParts.length) {
        return false;
      }

      return pathParts.every((part, index) => {
        // :id, :courseId, etc.
        if (part.startsWith(":")) {
          return true;
        }

        return part === currentParts[index];
      });
    });

    // Handle normal nested routes
    if (matchedPage) {
      return matchedPage[1];
    }

    return {
      title: "Dashboard",
      subtitle: "Welcome to Astrobyte LMS",
    };
  };

  const page = getPageTitle();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-gray-900 text-white shadow-sm border-b border-gray-800 px-8 py-4 flex justify-between items-center relative z-50">

      {/* ================= PAGE TITLE ================= */}

      <div>
        <h1 className="text-2xl font-bold">
          {page.title}
        </h1>

        <p className="text-gray-400">
          {page.subtitle}
        </p>
      </div>

      {/* ================= RIGHT SECTION ================= */}

      <div className="flex items-center gap-6">

        {/* Notifications */}

        <button className="relative">
          <Bell
            size={22}
            className="hover:text-amber-500 transition"
          />

          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* ================= PROFILE ================= */}

        <div className="relative">

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3"
          >

            {/* Avatar */}

            <div
              className="
                w-10
                h-10
                rounded-full
                bg-linear-to-r
                from-amber-500
                to-orange-500
                flex
                items-center
                justify-center
                font-bold
                text-white
                shadow-md
              "
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            {/* User Information */}

            <div className="text-left">

              <h3 className="font-semibold">
                {user?.name}
              </h3>

              <p className="text-xs text-gray-400 capitalize">
                {user?.role}
              </p>

            </div>

          </button>

        </div>

      </div>

    </div>
  );
}

export default Navbar;