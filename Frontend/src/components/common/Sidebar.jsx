import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../../context/AuthContext";
import { sidebarMenus } from "../../data/sidebarMenus";

function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  // Get menus based on logged-in user's role
  const menus = sidebarMenus[user?.role] || [];

  return (
    <aside className="w-70 min-h-screen bg-gray-900 shadow-xl sticky top-0 flex flex-col">

      {/* Logo */}

      <div className="p-8 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-center text-amber-500">
          ASTROBYTE
        </h1>

        <h4 className="text-xl text-center text-amber-500">
          ACADEMY
        </h4>
      </div>

      {/* Navigation */}

     <nav className="flex-1 px-4 py-6 space-y-2">
  {menus.map((menu) => {
    const Icon = menu.icon;

    const isLogout = menu.name === "Logout";

    return (
      <NavLink
        key={menu.name}
        to={menu.path}
        className={({ isActive }) =>
          `flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 ${
            isLogout
              ? "text-red-500 hover:bg-red-100 hover:text-red-600"
              : isActive
              ? "bg-amber-500 text-white shadow-lg"
              : "text-gray-400 hover:bg-amber-100 hover:text-amber-600"
          }`
        }
      >
        <Icon size={22} />

        <span className="font-medium">
          {menu.name}
        </span>
      </NavLink>
    );
  })}
</nav>

    </aside>
  );
}

export default Sidebar;