import { Outlet } from "react-router-dom";

import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

function AdminLayout() {
  return (
   
<div className="min-h-screen">
  <Sidebar />

  <div className="ml-70 min-w-0">
    <Navbar />

    <main className="p-6">
      <Outlet />
    </main>
  </div>
</div>

  );
}

export default AdminLayout;