
import { Outlet } from "react-router-dom";

import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

function MentorLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-70 min-h-screen min-w-0">
        {/* Fixed Navbar */}
        <div className="sticky top-0 z-40">
          <Navbar />
        </div>

        {/* Scrollable Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MentorLayout;
