
import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  PhoneCall,
  CheckCircle,
  RefreshCw,
  CalendarClock,
  CalendarX,
  CalendarCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

// Get the local date without converting it to UTC.
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Normalize date-only values to avoid timezone shifts.
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

// Only active leads require follow-up reminders.
function getFollowUpCategory(lead, today) {
  if (["converted", "lost"].includes(lead.status)) {
    return "none";
  }

  const followUpDate = getFollowUpDateKey(lead.followUpDate);

  if (!followUpDate) return "none";
  if (followUpDate < today) return "overdue";
  if (followUpDate === today) return "today";

  return "upcoming";
}

function CrmDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/leads");
        const data = response.data;

        const fetchedLeads = Array.isArray(data)
          ? data
          : data.leads || data.data || [];

        if (isMounted) {
          setLeads(fetchedLeads);
        }
      } catch (err) {
        console.error("Failed to load CRM leads:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load CRM dashboard data."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLeads();

    return () => {
      isMounted = false;
    };
  }, []);

  const today = getLocalDateKey();

  const todayFollowUps = leads.filter(
    (lead) => getFollowUpCategory(lead, today) === "today"
  ).length;

  const upcomingFollowUps = leads.filter(
    (lead) => getFollowUpCategory(lead, today) === "upcoming"
  ).length;

  const overdueFollowUps = leads.filter(
    (lead) => getFollowUpCategory(lead, today) === "overdue"
  ).length;

  const stats = [
    {
      title: "Total Leads",
      value: leads.length,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "New Leads",
      value: leads.filter((lead) => lead.status === "new").length,
      icon: UserPlus,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Contacted",
      value: leads.filter((lead) => lead.status === "contacted").length,
      icon: PhoneCall,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Converted",
      value: leads.filter((lead) => lead.status === "converted").length,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Today's Follow-ups",
      value: todayFollowUps,
      icon: CalendarCheck,
      color: "bg-amber-100 text-amber-600",
      filter: "today",
      linkColor: "text-amber-600 hover:text-amber-700",
    },
    {
      title: "Upcoming Follow-ups",
      value: upcomingFollowUps,
      icon: CalendarClock,
      color: "bg-blue-100 text-blue-600",
      filter: "upcoming",
      linkColor: "text-blue-600 hover:text-blue-700",
    },
    {
      title: "Overdue Follow-ups",
      value: overdueFollowUps,
      icon: CalendarX,
      color: "bg-red-100 text-red-600",
      filter: "overdue",
      linkColor: "text-red-600 hover:text-red-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard heading */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          CRM Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Track enquiries, manage leads, and monitor admissions.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <span className="flex-1">{error}</span>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 font-semibold underline"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow">
          Loading CRM dashboard...
        </div>
      ) : !error ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>

                      <h2
                        className={`mt-3 text-3xl font-bold ${
                          stat.title === "Overdue Follow-ups" &&
                          stat.value > 0
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {stat.value}
                      </h2>
                    </div>

                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon size={25} />
                    </div>
                  </div>

                  {/* Reminder cards open their matching filter */}
                  {stat.filter && (
                    <Link
                      to={`/crm/leads?followUp=${stat.filter}`}
                      className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${stat.linkColor}`}
                    >
                      View leads →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recent leads */}
          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Leads
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  The latest enquiries recorded in your CRM.
                </p>
              </div>

              <Link
                to="/crm/leads"
                className="font-semibold text-amber-600 hover:text-amber-700"
              >
                View all
              </Link>
            </div>

            {leads.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                No leads found. Add your first enquiry from the Leads page.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Phone</th>
                      <th className="px-6 py-4 font-semibold">Source</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {leads.slice(0, 5).map((lead) => (
                      <tr
                        key={lead._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {lead.name}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {lead.phone || "—"}
                        </td>

                        <td className="px-6 py-4 capitalize text-gray-600">
                          {(lead.source || "other").replace("-", " ")}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
                            {(lead.status || "new").replace("-", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default CrmDashboard;
