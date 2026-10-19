import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Upload,
  Download,
  RefreshCw,
  X,
  Eye,
  Users,
  AlertCircle,
  Trash2,
  CalendarDays,
  Clock,
  CalendarCheck,
  CalendarClock,
  CalendarX,
} from "lucide-react";

import api from "../../services/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  interestedCourse: "",
  source: "website",
  status: "new",
  followUpDate: "",
  notes: "",
};

const statusOptions = [
  "new",
  "contacted",
  "interested",
  "follow-up",
  "converted",
  "lost",
];

const sourceOptions = [
  "website",
  "phone",
  "walk-in",
  "referral",
  "meta-ads",
  "other",
];

const statusStyles = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-purple-100 text-purple-700",
  interested: "bg-emerald-100 text-emerald-700",
  "follow-up": "bg-amber-100 text-amber-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const followUpStyles = {
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-700",
  },
  today: {
    label: "Due Today",
    className: "bg-amber-100 text-amber-800",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-100 text-blue-700",
  },
  none: {
    label: "No Date",
    className: "bg-gray-100 text-gray-600",
  },
};

const followUpFilters = [
  {
    value: "all",
    label: "All Leads",
    icon: Users,
    description: "Every matching lead",
  },
  {
    value: "today",
    label: "Due Today",
    icon: CalendarCheck,
    description: "Follow-ups scheduled today",
  },
  {
    value: "overdue",
    label: "Overdue",
    icon: Clock,
    description: "Past-due follow-ups",
  },
  {
    value: "upcoming",
    label: "Upcoming",
    icon: CalendarClock,
    description: "Future follow-ups",
  },
  {
    value: "none",
    label: "No Date",
    icon: CalendarX,
    description: "Leads without a follow-up date",
  },
];

const validFollowUpFilters = ["today", "overdue", "upcoming", "none"];

function getValidFollowUpFilter(value) {
  return validFollowUpFilters.includes(value) ? value : "all";
}

// Return a local YYYY-MM-DD date without UTC conversion.
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Normalize dates so date-only values do not shift between time zones.
function getFollowUpDateKey(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);

    if (match) {
      return match[0];
    }
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return getLocalDateKey(parsed);
}

function getFollowUpCategory(lead, today) {
  // Converted and lost leads no longer need active follow-up reminders.
  if (["converted", "lost"].includes(lead.status)) {
    return "none";
  }

  const date = getFollowUpDateKey(lead.followUpDate);

  if (!date) return "none";
  if (date < today) return "overdue";
  if (date === today) return "today";

  return "upcoming";
}

function formatDate(date) {
  if (!date) return "—";

  const dateKey = getFollowUpDateKey(date);

  if (!dateKey) return "—";

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString();
}

function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [leads, setLeads] = useState([]);
  const [courses, setCourses] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // Initialize the filter from the dashboard URL, if provided.
  const [followUpFilter, setFollowUpFilter] = useState(() =>
    getValidFollowUpFilter(searchParams.get("followUp")),
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);

  // Spreadsheet import state
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");

  // Read the logged-in role to control UI visibility.
  const [isAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.role === "admin";
    } catch {
      return false;
    }
  });

  // Keep the selected filter synchronized with URL/browser navigation.
  useEffect(() => {
    setFollowUpFilter(getValidFollowUpFilter(searchParams.get("followUp")));
  }, [searchParams]);

  // Update the URL whenever a follow-up card is selected.
  const handleFollowUpFilterChange = (value) => {
    const validValue = getValidFollowUpFilter(value);

    setFollowUpFilter(validValue);

    const nextParams = new URLSearchParams(searchParams);

    if (validValue === "all") {
      nextParams.delete("followUp");
    } else {
      nextParams.set("followUp", validValue);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;

      const response = await api.get("/leads", { params });
      const data = response.data;

      setLeads(Array.isArray(data) ? data : data.leads || data.data || []);
    } catch (err) {
      console.error("Failed to fetch leads:", err);

      setError(err.response?.data?.message || "Unable to load leads.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        const data = response.data;

        setCourses(
          Array.isArray(data) ? data : data.courses || data.data || [],
        );
      } catch (err) {
        console.error("Unable to load courses:", err);
      }
    };

    fetchCourses();
  }, []);

  const today = getLocalDateKey();

  // Counts reflect leads currently loaded after server-side filters.
  const followUpCounts = {
    all: leads.length,
    today: 0,
    overdue: 0,
    upcoming: 0,
    none: 0,
  };

  leads.forEach((lead) => {
    const category = getFollowUpCategory(lead, today);
    followUpCounts[category] += 1;
  });

  const filteredLeads = leads.filter((lead) => {
    if (followUpFilter === "all") {
      return true;
    }

    return getFollowUpCategory(lead, today) === followUpFilter;
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateLead = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        interestedCourse: form.interestedCourse || null,
        followUpDate: form.followUpDate || null,
      };

      await api.post("/leads", payload);

      setForm(initialForm);
      setShowForm(false);
      setFollowUpFilter("all");

      // Clear the URL filter too, so it cannot reapply the old selection.
      setSearchParams({}, { replace: true });

      setSuccess("Lead created successfully.");

      await fetchLeads();
    } catch (err) {
      console.error("Failed to create lead:", err);

      setError(err.response?.data?.message || "Unable to create lead.");
    } finally {
      setSaving(false);
    }
  };

  const handleImportSubmit = async (event) => {
    event.preventDefault();

    if (!importFile) {
      setImportError("Please select a CSV or Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      setImporting(true);
      setImportError("");
      setImportResult(null);
      setError("");
      setSuccess("");

      const response = await api.post("/leads/import", formData);

      setImportResult(response.data.results);
      setImportFile(null);

      await fetchLeads();
    } catch (err) {
      console.error("Failed to import leads:", err);

      setImportError(
        err.response?.data?.message ||
          "Unable to import leads. Please try again.",
      );
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "name",
      "phone",
      "email",
      "interestedCourse",
      "source",
      "status",
      "followUpDate",
      "notes",
    ];

    const csvContent = `\uFEFF${headers.join(",")}\r\n`;
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "astrobyte-leads-template.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const handleDeleteLead = async () => {
    if (!isAdmin || !confirmDelete || deletingId) return;

    const lead = confirmDelete;

    try {
      setDeletingId(lead._id);
      setError("");
      setSuccess("");
      setConfirmDelete(null);

      await api.delete(`/leads/${lead._id}`);

      setLeads((previous) => previous.filter((item) => item._id !== lead._id));

      setSuccess(`Lead "${lead.name}" deleted successfully.`);

      await fetchLeads();
    } catch (err) {
      console.error("Failed to delete lead:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete lead. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSourceFilter("");
    setFollowUpFilter("all");
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>

          <p className="mt-2 text-gray-600">
            Manage enquiries and track admission opportunities.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setImportError("");
              setImportResult(null);
              setImportFile(null);
              setShowImport(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500 px-5 py-3 font-semibold text-amber-700 transition hover:bg-amber-50"
          >
            <Upload size={20} />
            Import Leads
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            <Plus size={20} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <p className="flex-1">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
        >
          <p>{success}</p>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss message"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Follow-up overview */}
      <section aria-label="Follow-up schedule">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={21} className="text-amber-600" />

          <h2 className="text-lg font-bold text-gray-900">
            Follow-up Schedule
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {followUpFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = followUpFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleFollowUpFilterChange(filter.value)}
                aria-pressed={isActive}
                className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  isActive
                    ? "border-amber-400 ring-2 ring-amber-100"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-lg p-2 ${
                      isActive
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon size={20} />
                  </span>

                  <span className="text-2xl font-bold text-gray-900">
                    {loading ? "—" : followUpCounts[filter.value]}
                  </span>
                </div>

                <p className="mt-3 font-semibold text-gray-900">
                  {filter.label}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {filter.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search and filters */}
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or phone..."
              aria-label="Search leads by name, email, or phone"
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-amber-500"
          >
            <option value="">All statuses</option>

            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace("-", " ")}
              </option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            aria-label="Filter by source"
            className="rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-amber-500"
          >
            <option value="">All sources</option>

            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {source.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            {loading
              ? "Loading leads..."
              : `${filteredLeads.length} lead(s) found`}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Clear filters
            </button>

            <button
              type="button"
              onClick={fetchLeads}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Lead table */}
      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="rounded-full bg-amber-50 p-4">
              <Users size={30} className="text-amber-600" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No leads found
            </h2>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              Try changing your filters, or add a new enquiry to get started.
            </p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowForm(true);
              }}
              className="mt-5 rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-white hover:bg-amber-600"
            >
              Add a lead
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-275 text-left text-sm">
              <thead className="bg-amber-200 text-xs uppercase tracking-wide text-amber-700">
                <tr>
                  <th className="px-5 py-4">Lead</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Interested Course</th>
                  <th className="px-5 py-4">Source</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Follow-up</th>
                  <th className="px-5 py-4">Counselor</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => {
                  const category = getFollowUpCategory(lead, today);
                  const followUp = followUpStyles[category];

                  return (
                    <tr key={lead._id} className="transition hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {lead.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {lead.email || "No email"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {lead.phone || "—"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {lead.interestedCourse?.title ||
                          lead.interestedCourse?.name ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 capitalize text-gray-600">
                        {(lead.source || "other").replace("-", " ")}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            statusStyles[lead.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {(lead.status || "new").replace("-", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${followUp.className}`}
                          >
                            {followUp.label}
                          </span>

                          <span className="whitespace-nowrap text-xs text-gray-500">
                            {formatDate(lead.followUpDate)}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {lead.assignedCounselor?.name || "Unassigned"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/crm/leads/${lead._id}`}
                            aria-label={`View ${lead.name}`}
                            title="View lead"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 font-medium text-gray-700 hover:border-amber-400 hover:text-amber-700"
                          >
                            <Eye size={16} />
                            View
                          </Link>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(lead)}
                              disabled={deletingId !== null}
                              aria-label={`Delete ${lead.name}`}
                              title="Delete lead"
                              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === lead._id ? (
                                <RefreshCw size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-lead-title"
            aria-describedby="delete-lead-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={23} />
            </div>

            <h2
              id="delete-lead-title"
              className="mt-4 text-xl font-bold text-gray-900"
            >
              Delete this lead?
            </h2>

            <p
              id="delete-lead-description"
              className="mt-2 text-sm leading-6 text-gray-600"
            >
              Are you sure you want to delete{" "}
              <strong>{confirmDelete.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId !== null}
                className="rounded-lg border border-gray-200 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteLead}
                disabled={deletingId !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />
                {deletingId !== null ? "Deleting..." : "Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add lead modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-lead-title"
            className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2
                  id="add-lead-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Add New Lead
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Record a new enquiry for Astrobyte Academy.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    maxLength={100}
                    placeholder="Enter lead name"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleFormChange}
                    required
                    maxLength={20}
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    maxLength={254}
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="interestedCourse"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Interested Course
                  </label>

                  <select
                    id="interestedCourse"
                    name="interestedCourse"
                    value={form.interestedCourse}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
                  >
                    <option value="">Not selected</option>

                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title || course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="source"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Lead Source *
                  </label>

                  <select
                    id="source"
                    name="source"
                    value={form.source}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
                  >
                    {sourceOptions.map((source) => (
                      <option key={source} value={source}>
                        {source.replace("-", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Status *
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("-", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="followUpDate"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Follow-up Date
                  </label>

                  <input
                    id="followUpDate"
                    name="followUpDate"
                    type="date"
                    value={form.followUpDate}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    rows={4}
                    maxLength={5000}
                    placeholder="Add enquiry details or follow-up notes..."
                    className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import leads modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-leads-title"
            className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2
                  id="import-leads-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Import Leads
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload a CSV or Excel spreadsheet.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!importing) setShowImport(false);
                }}
                disabled={importing}
                aria-label="Close import modal"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-5 p-6">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Before uploading</p>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-400 px-3 py-2 font-semibold text-amber-800 hover:bg-amber-100"
                >
                  <Download size={16} />
                  Download CSV Template
                </button>
                <p className="mt-2">
                  Your spreadsheet must include <strong>name</strong> and{" "}
                  <strong>phone</strong> columns. Optional columns include
                  email, interestedCourse, source, status, followUpDate, and
                  notes.
                </p>
                <p className="mt-2">
                  Supported formats: CSV and XLSX. Maximum file size: 2 MB.
                </p>
              </div>

              <div>
                <label
                  htmlFor="lead-import-file"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Select spreadsheet *
                </label>

                <input
                  id="lead-import-file"
                  type="file"
                  accept=".csv,.xlsx"
                  required
                  disabled={importing}
                  onChange={(event) => {
                    setImportFile(event.target.files?.[0] || null);
                    setImportError("");
                    setImportResult(null);
                  }}
                  className="block w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:font-semibold file:text-amber-800"
                />

                {importFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected: {importFile.name}
                  </p>
                )}
              </div>

              {importError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {importError}
                </div>
              )}

              {importResult && (
                <div
                  role="status"
                  className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="font-semibold text-gray-900">
                    Import completed
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="text-2xl font-bold text-green-700">
                        {importResult.imported}
                      </p>
                      <p className="text-xs text-gray-600">Imported</p>
                    </div>

                    <div className="rounded-lg bg-amber-50 p-3">
                      <p className="text-2xl font-bold text-amber-700">
                        {importResult.skipped}
                      </p>
                      <p className="text-xs text-gray-600">Skipped</p>
                    </div>

                    <div className="rounded-lg bg-red-50 p-3">
                      <p className="text-2xl font-bold text-red-700">
                        {importResult.failed}
                      </p>
                      <p className="text-xs text-gray-600">Failed</p>
                    </div>
                  </div>

                  {importResult.errors?.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium text-gray-700">
                        View row details ({importResult.errors.length})
                      </summary>

                      <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                        {importResult.errors.map((item, index) => (
                          <li
                            key={`${item.row}-${index}`}
                            className="text-red-700"
                          >
                            Row {item.row}: {item.reason}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowImport(false)}
                  disabled={importing}
                  className="rounded-lg border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {importResult ? "Close" : "Cancel"}
                </button>

                {!importResult && (
                  <button
                    type="submit"
                    disabled={importing || !importFile}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {importing && (
                      <RefreshCw size={18} className="animate-spin" />
                    )}
                    {importing ? "Importing..." : "Upload and Import"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
