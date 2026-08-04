import { useState, useContext } from "react";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import pageTitles from "../../data/pageTitles";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useContext(AuthContext);

  const [open, setOpen] = useState(false);

 const page =
  Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || {
    title: "Dashboard",
    subtitle: "Welcome to Astrobyte LMS",
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-gray-900 text-white shadow-sm border-b border-gray-800 px-8 py-4 flex justify-between items-center relative z-50">

      {/* Page Title */}

      <div>

        <h1 className="text-2xl font-bold">
          {page.title}
        </h1>

        <p className="text-gray-400">
          {page.subtitle}
        </p>

      </div>

      {/* Right Section */}

      <div className="flex items-center gap-6">

        {/* Notifications */}

        <button className="relative">

          <Bell
            size={22}
            className="hover:text-amber-500 transition"
          />

          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>

        </button>

        {/* Profile */}

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

            <div className="text-left">

              <h3 className="font-semibold">
                {user?.name}
              </h3>

              <p className="text-xs text-gray-400 capitalize">
                {user?.role}
              </p>

            </div>

            {/* <ChevronDown size={18} /> */}

          </button>

          {/* Dropdown */}

          {/* {open && (

            <div className="absolute right-0 mt-3 w-56 bg-gray-900 rounded-xl shadow-xl border border-gray-700 overflow-hidden">

              <button
                onClick={() =>
                  navigate(`/${user?.role}/profile`)
                }
                className="flex items-center gap-3 w-full px-5 py-3 hover:bg-gray-800 transition"
              >
                <User size={18} />

                My Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-5 py-3 text-red-500 hover:bg-red-500 hover:text-white transition"
              >
                <LogOut size={18} />

                Logout
              </button>

            </div>

          )} */}

        </div>

      </div>

    </div>
  );
}

export default Navbar;