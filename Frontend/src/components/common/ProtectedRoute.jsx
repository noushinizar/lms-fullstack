import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;