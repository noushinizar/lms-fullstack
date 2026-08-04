import { useEffect, useState } from "react";

import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../../services/userService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { showSuccess, showError } from "../../utils/toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function People() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState({});
  const [saving, setSaving] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      const initialRoles = {};

      data.forEach((user) => {
        initialRoles[user._id] = user.role;
      });

      setRoles(initialRoles);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleRoleUpdate = async (userId) => {
    try {
      setSaving(userId);

      await updateUserRole(userId, roles[userId]);

      showSuccess("Role updated successfully.");

      fetchUsers();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update role.");
    } finally {
      setSaving(null);
    }
  };
  const handleDeleteUser = async () => {
    try {
      setDeleting(true);

      await deleteUser(selectedUser._id);

      showSuccess("User deleted successfully.");

      setDeleteDialogOpen(false);

      setSelectedUser(null);

      fetchUsers();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };
  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="No Users Found"
        description="Users will appear here after registration."
      />
    );
  }
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">People Management</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="mentor">Mentors</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => {
              const isCurrentUser =
                user._id === (currentUser._id || currentUser.id);

              return (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{user.name}</td>

                  <td className="p-4">{user.email}</td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        disabled={isCurrentUser}
                        value={roles[user._id] || user.role}
                        onChange={(e) =>
                          setRoles({
                            ...roles,
                            [user._id]: e.target.value,
                          })
                        }
                        className="border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                      </select>
                      {isCurrentUser && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Current Account
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        disabled={saving === user._id || isCurrentUser}
                        onClick={() => handleRoleUpdate(user._id)}
                        className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
                      >
                        {saving === user._id ? "Saving..." : "Save"}
                      </button>

                      <button
                        disabled={isCurrentUser}
                        onClick={() => {
                          setSelectedUser(user);
                          setDeleteDialogOpen(true);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}"?`}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        loading={deleting}
      />
    </div>
  );
}

export default People;
