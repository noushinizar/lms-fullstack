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
  History,
  Send,
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

const followUpTypes = [
  { value: "call", label: "Phone Call" },

  { value: "whatsapp", label: "WhatsApp" },

  { value: "meeting", label: "Meeting" },

  { value: "email", label: "Email" },

  { value: "other", label: "Other" },
];

const followUpOutcomes = [
  { value: "interested", label: "Interested" },

  { value: "no-answer", label: "No Answer" },

  { value: "callback-requested", label: "Callback Requested" },

  { value: "not-interested", label: "Not Interested" },

  { value: "enrolled", label: "Enrolled" },

  { value: "other", label: "Other" },
];

function formatDateTime(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",

    hour: "numeric",
    minute: "2-digit",
  });
}

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

const getActivityChangeLabel = (change, side) => {
  const labelKey = side === "old" ? "oldLabel" : "newLabel";
  const valueKey = side === "old" ? "oldValue" : "newValue";

  const label = change[labelKey];

  if (label !== undefined && label !== null) {
    return label;
  }

  const value = change[valueKey];

  if (value === null || value === undefined || value === "") {
    return "Not assigned";
  }

  if (
    change.field === "interestedCourse" ||
    change.field === "assignedCounselor"
  ) {
    return "Name unavailable";
  }

  return String(value);
};

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

  const [followUps, setFollowUps] = useState([]);

  const [followUpsLoading, setFollowUpsLoading] = useState(true);

  const [followUpSaving, setFollowUpSaving] = useState(false);

  const [followUpError, setFollowUpError] = useState("");

  const [followUpSuccess, setFollowUpSuccess] = useState("");

  const [followUpForm, setFollowUpForm] = useState({
    type: "call",
    outcome: "other",
    notes: "",
    nextFollowUpDate: "",
  });

  const [followUpHistoryError, setFollowUpHistoryError] = useState("");

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activityError, setActivityError] = useState("");

  let currentUser = null;

  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    currentUser = null;
  }

  const isAdmin = currentUser?.role === "admin";

  // Load the selected lead and populate the editable form.

  const fetchLead = useCallback(
    async ({ showLoading = true } = {}) => {
      try {
        if (showLoading) setLoading(true);

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

        return true;
      } catch (err) {
        console.error("Failed to load lead:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load this lead. It may not exist or you may not have access.",
        );

        return false;
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  // Load course options and, for admins, admission counselor options.

  useEffect(() => {
    let cancelled = false;

    const fetchOptions = async () => {
      const courseRequest = api.get("/courses");

      const counselorRequest = isAdmin ? api.get("/users") : null;

      const [courseResult, counselorResult] = await Promise.allSettled([
        courseRequest,

        ...(isAdmin ? [counselorRequest] : []),
      ]);

      if (cancelled) return;

      if (courseResult.status === "fulfilled") {
        const courseList = extractList(courseResult.value.data, ["courses"]);

        setCourses(courseList);
      } else {
        console.error(
          "Failed to load courses:",

          courseResult.reason,
        );
      }

      if (isAdmin && counselorResult) {
        if (counselorResult.status === "fulfilled") {
          const userList = extractList(counselorResult.value.data, [
            "users",

            "counselors",
          ]);

          const admissionCounselors = userList.filter(
            (user) => user.role === "admission_counselor",
          );

          setCounselors(admissionCounselors);

          setCounselorError("");

          if (admissionCounselors.length === 0) {
            setCounselorError(
              "No admission counselors were returned by the users API.",
            );
          }
        } else {
          console.error(
            "Failed to load admission counselors:",

            counselorResult.reason,
          );

          setCounselors([]);

          setCounselorError(
            counselorResult.reason?.response?.data?.message ||
              "Unable to load counselors. Check the users API and permissions.",
          );
        }
      }
    };

    fetchOptions();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const fetchFollowUps = useCallback(async () => {
    try {
      setFollowUpsLoading(true);
      setFollowUpHistoryError("");

      const response = await api.get(`/leads/${id}/follow-ups`);

      setFollowUps(
        Array.isArray(response.data?.followUps) ? response.data.followUps : [],
      );
    } catch (err) {
      console.error("Failed to load follow-up history:", err);

      setFollowUpHistoryError(
        err.response?.data?.message || "Unable to load follow-up history.",
      );
    } finally {
      setFollowUpsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const fetchLeadActivities = useCallback(async () => {
    try {
      setActivitiesLoading(true);
      setActivityError("");

      const response = await api.get(`/leads/${id}/activities`);

      setActivities(
        Array.isArray(response.data?.activities)
          ? response.data.activities
          : [],
      );
    } catch (err) {
      console.error("Failed to load lead activity history:", err);

      setActivityError(
        err.response?.data?.message || "Unable to load lead activity history.",
      );
    } finally {
      setActivitiesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeadActivities();
  }, [fetchLeadActivities]);

  const handleFollowUpChange = (event) => {
    const { name, value } = event.target;

    setFollowUpForm((previous) => ({ ...previous, [name]: value }));

    setFollowUpError("");

    setFollowUpSuccess("");
  };

  const handleFollowUpSubmit = async () => {
    if (followUpSaving) return;

    setFollowUpSaving(true);
    setFollowUpError("");
    setFollowUpSuccess("");

    const payload = {
      type: followUpForm.type,
      outcome: followUpForm.outcome,
      notes: followUpForm.notes.trim(),
      nextFollowUpDate: followUpForm.nextFollowUpDate || null,
    };

    try {
      const response = await api.post(`/leads/${id}/follow-ups`, payload);

      if (!response.data?.followUp?._id) {
        throw new Error("The server did not confirm the saved follow-up.");
      }

      // The interaction is saved. Clear the form only after this succeeds.
      setFollowUpForm({
        type: "call",
        outcome: "other",
        notes: "",
        nextFollowUpDate: "",
      });

      setFollowUpSuccess("Follow-up recorded successfully.");

      // Refresh the history and the canonical lead data independently.
      // Each function handles its own refresh errors.
      await Promise.all([
        fetchFollowUps(),
        fetchLead({ showLoading: false }),
        fetchLeadActivities(),
      ]);
    } catch (err) {
      console.error("Failed to record follow-up:", err);

      setFollowUpError(
        err.response?.data?.message ||
          err.message ||
          "Unable to record follow-up. Please try again.",
      );
    } finally {
      setFollowUpSaving(false);
    }
  };

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
        payload.assignedCounselor = form.assignedCounselor || null;
      }

      await api.put(`/leads/${id}`, payload);

      await Promise.all([fetchLead(), fetchLeadActivities()]);

      setSuccess("Lead details updated successfully.");
    } catch (err) {
      console.error("Failed to update lead:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update this lead. Please try again.",
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

          <h1 className="text-3xl font-bold text-gray-900">Lead Details</h1>

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

            <p className="truncate font-semibold text-gray-900">{lead.name}</p>
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
                Full Name
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
                Phone Number
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
                    <option key={counselor._id} value={counselor._id}>
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

        {/* Follow-up History */}

        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <History size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Follow-up History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Record interactions and track the next follow-up.
              </p>
            </div>
          </div>

          <div className="space-y-5 border-b border-gray-100 bg-gray-50/70 p-6">
            <h3 className="font-semibold text-gray-900">
              Record a New Interaction
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="followUpType"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Interaction Type
                </label>

                <select
                  id="followUpType"
                  name="type"
                  value={followUpForm.type}
                  onChange={handleFollowUpChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
                >
                  {followUpTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="followUpOutcome"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Outcome
                </label>

                <select
                  id="followUpOutcome"
                  name="outcome"
                  value={followUpForm.outcome}
                  onChange={handleFollowUpChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
                >
                  {followUpOutcomes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="followUpNotes"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Interaction Notes
                </label>

                <textarea
                  id="followUpNotes"
                  name="notes"
                  value={followUpForm.notes}
                  onChange={handleFollowUpChange}
                  rows={3}
                  maxLength={5000}
                  placeholder="What did the student say? What action is needed next?"
                  className="w-full resize-y rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {followUpForm.notes.length}/5000 characters
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="nextFollowUpDate"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <CalendarDays size={16} />
                  Next Follow-up Date
                </label>

                <input
                  id="nextFollowUpDate"
                  name="nextFollowUpDate"
                  type="date"
                  value={followUpForm.nextFollowUpDate}
                  onChange={handleFollowUpChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Leave empty if another follow-up is not scheduled.
                </p>
              </div>
            </div>

            {followUpError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {followUpError}
              </div>
            )}

            {followUpSuccess && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              >
                {followUpSuccess}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleFollowUpSubmit}
                disabled={followUpSaving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {followUpSaving ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}

                {followUpSaving ? "Recording..." : "Record Follow-up"}
              </button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="mb-5 font-semibold text-gray-900">
              Interaction Timeline
            </h3>

            {followUpsLoading ? (
              <div className="flex items-center gap-3 py-6 text-gray-500">
                <RefreshCw size={18} className="animate-spin" />
                Loading follow-up history...
              </div>
            ) : followUpHistoryError ? (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <p>{followUpHistoryError}</p>

                <button
                  type="button"
                  onClick={fetchFollowUps}
                  disabled={followUpsLoading}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 font-medium hover:bg-red-50 disabled:opacity-60"
                >
                  <RefreshCw
                    size={15}
                    className={followUpsLoading ? "animate-spin" : ""}
                  />
                  Retry loading history
                </button>
              </div>
            ) : followUps.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 px-5 py-10 text-center">
                <History className="mx-auto mb-3 text-gray-400" size={30} />

                <p className="font-medium text-gray-700">
                  No follow-ups recorded yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Your recorded calls, messages, and meetings will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {followUps.map((item) => {
                  const typeLabel =
                    followUpTypes.find((option) => option.value === item.type)
                      ?.label || item.type;

                  const outcomeLabel =
                    followUpOutcomes.find(
                      (option) => option.value === item.outcome,
                    )?.label || item.outcome;

                  const creator =
                    typeof item.createdBy === "object"
                      ? item.createdBy?.name
                      : "";

                  return (
                    <article
                      key={item._id}
                      className="relative border-l-2 border-amber-200 pl-5"
                    >
                      <span className="absolute -left-1.75 top-1 h-3 w-3 rounded-full border-2 border-amber-500 bg-white" />

                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {typeLabel}
                          </h4>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDateTime(item.createdAt)}
                          </p>
                        </div>

                        <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
                          {outcomeLabel}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                          {item.notes}
                        </p>
                      )}

                      {item.nextFollowUpDate && (
                        <p className="mt-3 flex items-center gap-2 text-sm text-blue-700">
                          <CalendarDays size={15} />
                          Next follow-up: {formatDate(item.nextFollowUpDate)}
                        </p>
                      )}

                      {creator && (
                        <p className="mt-3 text-xs text-gray-500">
                          Recorded by {creator}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Lead Activity Audit Trail */}
        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <History size={22} />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">
                Lead Activity Timeline
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Track changes made to this lead and who made them.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchLeadActivities}
              disabled={activitiesLoading}
              aria-label="Refresh activity history"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={activitiesLoading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="p-6">
            {activitiesLoading ? (
              <div className="flex items-center gap-3 py-6 text-gray-500">
                <RefreshCw size={18} className="animate-spin" />
                Loading activity history...
              </div>
            ) : activityError ? (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <p>{activityError}</p>

                <button
                  type="button"
                  onClick={fetchLeadActivities}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 font-medium hover:bg-red-50"
                >
                  <RefreshCw size={15} />
                  Retry loading activities
                </button>
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 px-5 py-10 text-center">
                <History className="mx-auto mb-3 text-gray-400" size={30} />
                <p className="font-medium text-gray-700">
                  No activities recorded yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Lead creation and future changes will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity) => {
                  const performer =
                    typeof activity.performedBy === "object"
                      ? activity.performedBy
                      : null;

                  return (
                    <article
                      key={activity._id}
                      className="relative border-l-2 border-purple-200 pl-5"
                    >
                      <span className="absolute -left-1.75 top-1 h-3 w-3 rounded-full border-2 border-purple-500 bg-white" />

                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {activity.action
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (char) => char.toUpperCase()) ||
                              "Lead Activity"}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-gray-700">
                            {activity.description}
                          </p>

                          <p className="mt-2 text-xs text-gray-500">
                            {formatDateTime(activity.createdAt)}
                          </p>
                        </div>

                        <span className="w-fit rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                          Audit Log
                        </span>
                      </div>

                      {Array.isArray(activity.changes) &&
                        activity.changes.length > 0 && (
                          <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Changes
                            </p>

                            {activity.changes.map((change, index) => {
                              const displayValue = (value) => {
                                if (
                                  value === null ||
                                  value === undefined ||
                                  value === ""
                                ) {
                                  return "—";
                                }

                                if (typeof value === "object") {
                                  return (
                                    value.name ||
                                    value.title ||
                                    value.email ||
                                    JSON.stringify(value)
                                  );
                                }

                                return String(value);
                              };

                              return (
                                <div
                                  key={`${change.field}-${index}`}
                                  className="text-sm"
                                >
                                  <p className="font-medium capitalize text-gray-700">
                                    {change.field
                                      ?.replace(/([A-Z])/g, " $1")
                                      .replace(/_/g, " ")}
                                  </p>

                                  <p className="mt-1 wrap-break-word text-gray-600">
                                    <span>
                                      {getActivityChangeLabel(change, "old")}
                                    </span>
                                    <span aria-hidden="true">→</span>
                                    <span>
                                      {getActivityChangeLabel(change, "new")}
                                    </span>
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      <p className="mt-3 text-xs text-gray-500">
                        Performed by: {performer?.name || "Unknown user"}
                        {performer?.email ? ` (${performer.email})` : ""}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
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
