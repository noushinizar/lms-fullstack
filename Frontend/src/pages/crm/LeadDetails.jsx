import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  UserRound,
  Phone,
  Mail,
  BookOpen,
  CalendarDays,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const statusOptions = [
  "new",
  "contacted",
  "interested",
  "follow-up",
  "converted",
  "lost",
];

const sourceLabels = {
  website: "Website",
  phone: "Phone",
  "walk-in": "Walk-in",
  referral: "Referral",
  "meta-ads": "Meta Ads",
  other: "Other",
};

// Extract arrays from common API response structures.
function extractList(responseData, keys = []) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(responseData[key])) {
      return responseData[key];
    }
  }

  if (responseData.data) {
    return extractList(responseData.data, keys);
  }

  return [];
}

function toDateInputValue(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  if (!date) return "Not scheduled";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getReferenceName(value) {
  if (!value) return "—";

  if (typeof value === "string") return value;

  return value.name || value.title || "—";
}

function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [courses, setCourses] = useState([]);
  const [counselors, setCounselors] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interestedCourse: "",
    source: "other",
    status: "new",
    assignedCounselor: "",
    followUpDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [counselorError, setCounselorError] = useState("");

  let currentUser = null;

  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    currentUser = null;
  }

  const isAdmin = currentUser?.role === "admin";

  // Load the selected lead and populate the editable form.
  const fetchLead = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/leads/${id}`);
      const data = response.data;
      const item = data.lead || data;

      setLead(item);

      setForm({
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || "",
        interestedCourse:
          typeof item.interestedCourse === "object"
            ? item.interestedCourse?._id || ""
            : item.interestedCourse || "",
        source: item.source || "other",
        status: item.status || "new",
        assignedCounselor:
          typeof item.assignedCounselor === "object"
            ? item.assignedCounselor?._id || ""
            : item.assignedCounselor || "",
        followUpDate: toDateInputValue(item.followUpDate),
        notes: item.notes || "",
      });
    } catch (err) {
      console.error("Failed to load lead:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load this lead. It may not exist or you may not have access."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  // Load course options and, for admins, admission counselor options.
  useEffect(() => {
    let cancelled = false;

    const fetchOptions = async () => {
      const courseRequest = api.get("/courses");

      const counselorRequest = isAdmin
        ? api.get("/users")
        : null;

      const [courseResult, counselorResult] = await Promise.allSettled([
        courseRequest,
        ...(isAdmin ? [counselorRequest] : []),
      ]);

      if (cancelled) return;

      if (courseResult.status === "fulfilled") {
        const courseList = extractList(courseResult.value.data, [
          "courses",
        ]);

        setCourses(courseList);
      } else {
        console.error(
          "Failed to load courses:",
          courseResult.reason
        );
      }

      if (isAdmin && counselorResult) {
        if (counselorResult.status === "fulfilled") {
          const userList = extractList(counselorResult.value.data, [
            "users",
            "counselors",
          ]);

          const admissionCounselors = userList.filter(
            (user) => user.role === "admission_counselor"
          );

          setCounselors(admissionCounselors);
          setCounselorError("");

          if (admissionCounselors.length === 0) {
            setCounselorError(
              "No admission counselors were returned by the users API."
            );
          }
        } else {
          console.error(
            "Failed to load admission counselors:",
            counselorResult.reason
          );

          setCounselors([]);
          setCounselorError(
            counselorResult.reason?.response?.data?.message ||
              "Unable to load counselors. Check the users API and permissions."
          );
        }
      }
    };

    fetchOptions();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        interestedCourse: form.interestedCourse || null,
        source: form.source,
        status: form.status,
        followUpDate: form.followUpDate || null,
        notes: form.notes,
      };

      // Only admins can assign or reassign a counselor.
      if (isAdmin) {
        payload.assignedCounselor =
          form.assignedCounselor || null;
      }

      await api.put(`/leads/${id}`, payload);

      await fetchLead();
      setSuccess("Lead details updated successfully.");
    } catch (err) {
      console.error("Failed to update lead:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update this lead. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-gray-500">
        <RefreshCw size={20} className="animate-spin" />
        Loading lead details...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4 rounded-xl bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle size={24} />
          <h1 className="text-xl font-bold">Unable to open lead</h1>
        </div>

        <p className="text-gray-600">
          {error || "The requested lead could not be found."}
        </p>

        <Link
          to="/crm/leads"
          className="inline-flex items-center gap-2 font-semibold text-amber-600 hover:text-amber-700"
        >
          <ArrowLeft size={18} />
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/crm/leads"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-amber-600"
          >
            <ArrowLeft size={17} />
            Back to Leads
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Lead Details
          </h1>

          <p className="mt-2 text-gray-600">
            View enquiry information and manage admission follow-ups.
          </p>
        </div>

        <span className="w-fit rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold capitalize text-amber-700">
          {form.status.replace("-", " ")}
        </span>
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
        >
          {success}
        </div>
      )}

      {/* Contact summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <UserRound size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Lead Name</p>
            <p className="truncate font-semibold text-gray-900">
              {lead.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="rounded-lg bg-green-50 p-3 text-green-600">
            <Phone size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Phone Number</p>
            <p className="truncate font-semibold text-gray-900">
              {lead.phone || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
            <Mail size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Email Address</p>
            <p className="truncate font-semibold text-gray-900">
              {lead.email || "Not provided"}
            </p>
          </div>
        </div>
      </section>

      {/* Editable lead form */}
      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900">
              Enquiry Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update the lead's contact and course information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
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
                onChange={handleChange}
                required
                maxLength={100}
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
                onChange={handleChange}
                required
                maxLength={20}
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
                onChange={handleChange}
                maxLength={254}
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
                onChange={handleChange}
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
                Lead Source
              </label>
              <select
                id="source"
                name="source"
                value={form.source}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
              >
                {Object.entries(sourceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Lead Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin-only counselor assignment */}
            {isAdmin && (
              <div>
                <label
                  htmlFor="assignedCounselor"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Assigned Counselor
                </label>

                <select
                  id="assignedCounselor"
                  name="assignedCounselor"
                  value={form.assignedCounselor}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
                >
                  <option value="">Unassigned</option>

                  {counselors.map((counselor) => (
                    <option
                      key={counselor._id}
                      value={counselor._id}
                    >
                      {counselor.name}
                      {counselor.email ? ` (${counselor.email})` : ""}
                    </option>
                  ))}
                </select>

                {counselorError && (
                  <p className="mt-2 text-xs text-amber-700">
                    {counselorError}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="followUpDate"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <CalendarDays size={16} />
                Follow-up Date
              </label>
              <input
                id="followUpDate"
                name="followUpDate"
                type="date"
                value={form.followUpDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
            <FileText size={20} className="text-amber-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Follow-up Notes
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Keep enquiry details and follow-up notes together.
              </p>
            </div>
          </div>

          <div className="p-6">
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
              onChange={handleChange}
              rows={6}
              maxLength={5000}
              placeholder="Record the conversation, student requirements, next steps, and other important details..."
              className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-amber-500"
            />
            <p className="mt-2 text-right text-xs text-gray-400">
              {form.notes.length}/5000 characters
            </p>
          </div>
        </section>

        {/* Record information */}
        <section className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="mt-1 font-medium text-gray-800">
              {formatDate(lead.createdAt)}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={14} />
              Last Updated
            </p>
            <p className="mt-1 font-medium text-gray-800">
              {formatDate(lead.updatedAt)}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <BookOpen size={14} />
              Course
            </p>
            <p className="mt-1 font-medium text-gray-800">
              {getReferenceName(lead.interestedCourse)}
            </p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/crm/leads")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
            Back to Leads
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LeadDetails;