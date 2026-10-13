
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role, roles }) {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Support one role or multiple roles
  const allowedRoles = roles ?? (role ? [role] : []);

  // Logged in but not authorized
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
