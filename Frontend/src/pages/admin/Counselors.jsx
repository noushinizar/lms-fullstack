
import { useEffect, useState } from "react";
import {
  UserPlus,
  Users,
  Search,
  RefreshCw,
  Pencil,
  X,
  Save,
} from "lucide-react";

import {
  getUsers,
  createCounselor,
  updateCounselor,
} from "../../services/userService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { showSuccess, showError } from "../../utils/toast";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

const initialEditForm = {
  name: "",
  email: "",
  phone: "",
};

function Counselors() {
  const [counselors, setCounselors] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [editingCounselor, setEditingCounselor] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [updating, setUpdating] = useState(false);

  const fetchCounselors = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const users = await getUsers();

      setCounselors(
        users.filter(
          (user) => user.role === "admission_counselor"
        )
      );
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Failed to load counselors."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCounselors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!name || !email || !form.password) {
      showError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 8) {
      showError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setCreating(true);

      await createCounselor({
        name,
        email,
        phone,
        password: form.password,
      });

      showSuccess("Counselor account created successfully.");
      setForm(initialForm);

      await fetchCounselors();
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Unable to create counselor account."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (counselor) => {
    setEditingCounselor(counselor);

    setEditForm({
      name: counselor.name || "",
      email: counselor.email || "",
      phone: counselor.phone || "",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    const name = editForm.name.trim();
    const email = editForm.email.trim().toLowerCase();
    const phone = editForm.phone.trim();

    if (!name || !email) {
      showError("Name and email are required.");
      return;
    }

    try {
      setUpdating(true);

      await updateCounselor(editingCounselor._id, {
        name,
        email,
        phone,
      });

      showSuccess("Counselor updated successfully.");
      setEditingCounselor(null);
      setEditForm(initialEditForm);

      await fetchCounselors();
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Unable to update counselor."
      );
    } finally {
      setUpdating(false);
    }
  };

  const filteredCounselors = counselors.filter((counselor) => {
    const query = search.trim().toLowerCase();

    return (
      counselor.name?.toLowerCase().includes(query) ||
      counselor.email?.toLowerCase().includes(query) ||
      counselor.phone?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <LoadingSpinner text="Loading counselors..." />;
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Counselor Management
        </h1>

        <p className="mt-2 text-gray-600">
          Create, view, and update admission counselor accounts.
        </p>
      </div>

      {/* Create counselor form */}
      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-3">
            <UserPlus className="text-amber-700" size={24} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add New Counselor
            </h2>

            <p className="text-sm text-gray-500">
              Accounts can only be created by an administrator.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="counselor-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full name *
              </label>

              <input
                id="counselor-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                autoComplete="name"
                required
                placeholder="Enter counselor name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="counselor-email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address *
              </label>

              <input
                id="counselor-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                placeholder="counselor@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="counselor-phone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Phone number
              </label>

              <input
                id="counselor-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="counselor-password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Temporary password *
              </label>

              <input
                id="counselor-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Minimum 8 characters"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus size={18} />

            {creating ? "Creating account..." : "Create Counselor"}
          </button>
        </form>
      </section>

      {/* Counselor list */}
      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Existing Counselors
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {counselors.length} counselor
              {counselors.length === 1 ? "" : "s"} registered
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchCounselors(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or phone..."
            aria-label="Search counselors"
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Results */}
        {filteredCounselors.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No Counselors Found"
            description={
              counselors.length === 0
                ? "Create your first admission counselor using the form above."
                : "No counselors match your search."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-sm text-gray-600">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCounselors.map((counselor) => (
                  <tr
                    key={counselor._id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {counselor.name}
                    </td>

                    <td className="p-4 text-gray-600">
                      {counselor.email}
                    </td>

                    <td className="p-4 text-gray-600">
                      {counselor.phone || "—"}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                        <Users size={13} />
                        Admission Counselor
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleEditClick(counselor)}
                        className="inline-flex items-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit counselor modal */}
      {editingCounselor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !updating
            ) {
              setEditingCounselor(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-counselor-title"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  id="edit-counselor-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  Edit Counselor
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update the counselor's details.
                </p>
              </div>

              <button
                type="button"
                disabled={updating}
                onClick={() => setEditingCounselor(null)}
                aria-label="Close edit form"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label
                  htmlFor="edit-counselor-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full name *
                </label>

                <input
                  id="edit-counselor-name"
                  name="name"
                  type="text"
                  value={editForm.name}
                  onChange={handleEditChange}
                  maxLength={100}
                  autoComplete="name"
                  required
                  disabled={updating}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-counselor-email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email address *
                </label>

                <input
                  id="edit-counselor-email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  autoComplete="email"
                  required
                  disabled={updating}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-counselor-phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Phone number
                </label>

                <input
                  id="edit-counselor-phone"
                  name="phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  autoComplete="tel"
                  disabled={updating}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setEditingCounselor(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Counselors;
