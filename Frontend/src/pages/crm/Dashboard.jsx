
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  PhoneCall,
  CheckCircle,
  RefreshCw,
  CalendarClock,
  CalendarX,
  CalendarCheck,
  TrendingUp,
  UserX,
  ArrowUpRight,
  Target,
  Activity,
  BarChart3,
  GraduationCap,
  CircleDollarSign,
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
    if (match) return match[0];
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "";

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

const sourceLabels = {
  website: "Website",
  phone: "Phone",
  "walk-in": "Walk-in",
  referral: "Referral",
  "meta-ads": "Meta Ads",
  other: "Other",
};

const statusStyles = {
  new: "bg-blue-50 text-blue-700 ring-blue-600/20",
  contacted: "bg-violet-50 text-violet-700 ring-violet-600/20",
  interested: "bg-amber-50 text-amber-700 ring-amber-600/20",
  "follow-up": "bg-orange-50 text-orange-700 ring-orange-600/20",
  converted: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  lost: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

function CrmDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/leads");
      const data = response.data;

      const fetchedLeads = Array.isArray(data)
        ? data
        : data.leads || data.data || [];

      setLeads(fetchedLeads);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load CRM leads:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load CRM dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const today = getLocalDateKey();

  const metrics = useMemo(() => {
    const total = leads.length;
    const countStatus = (status) =>
      leads.filter((lead) => lead.status === status).length;

    const converted = countStatus("converted");
    const interested = countStatus("interested");
    const lost = countStatus("lost");

    return {
      total,
      newLeads: countStatus("new"),
      contacted: countStatus("contacted"),
      interested,
      converted,
      lost,
      conversionRate:
        total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0",
      todayFollowUps: leads.filter(
        (lead) => getFollowUpCategory(lead, today) === "today"
      ).length,
      upcomingFollowUps: leads.filter(
        (lead) => getFollowUpCategory(lead, today) === "upcoming"
      ).length,
      overdueFollowUps: leads.filter(
        (lead) => getFollowUpCategory(lead, today) === "overdue"
      ).length,
    };
  }, [leads, today]);

  const sourceStats = useMemo(() => {
    const counts = {};

    leads.forEach((lead) => {
      const source = sourceLabels[lead.source] ? lead.source : "other";
      counts[source] = (counts[source] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([source, count]) => ({
        source,
        label: sourceLabels[source] || "Other",
        count,
        percentage:
          leads.length > 0 ? (count / leads.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  const stats = [
    {
      title: "Total Leads",
      value: metrics.total,
      icon: Users,
      accent: "bg-blue-50 text-blue-600",
      note: "All accessible enquiries",
    },
    {
      title: "New Leads",
      value: metrics.newLeads,
      icon: UserPlus,
      accent: "bg-amber-50 text-amber-600",
      note: "Awaiting initial contact",
    },
    {
      title: "Contacted",
      value: metrics.contacted,
      icon: PhoneCall,
      accent: "bg-violet-50 text-violet-600",
      note: "Contact has been made",
    },
    {
      title: "Converted",
      value: metrics.converted,
      icon: GraduationCap,
      accent: "bg-emerald-50 text-emerald-600",
      note: "Successful conversions",
    },
  ];

  const followUpStats = [
    {
      title: "Today's Follow-ups",
      value: metrics.todayFollowUps,
      icon: CalendarCheck,
      color: "text-amber-600",
      background: "bg-amber-50",
      filter: "today",
    },
    {
      title: "Upcoming",
      value: metrics.upcomingFollowUps,
      icon: CalendarClock,
      color: "text-blue-600",
      background: "bg-blue-50",
      filter: "upcoming",
    },
    {
      title: "Overdue",
      value: metrics.overdueFollowUps,
      icon: CalendarX,
      color: "text-rose-600",
      background: "bg-rose-50",
      filter: "overdue",
    },
  ];

  return (
    <div className="min-h-full space-y-7 bg-slate-50/70 p-1 sm:space-y-8 sm:p-2">
      {/* Dashboard header */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-950 via-slate-900 to-amber-950 px-6 py-7 text-white shadow-lg sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-1/3 h-52 w-52 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-amber-200">
              <Activity size={14} />
              Admission overview
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              CRM Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Your admissions at a glance. Track enquiries, follow-ups,
              and student conversions in one place.
            </p>

            {lastUpdated && (
              <p className="mt-4 text-xs text-slate-400">
                Last updated{" "}
                {lastUpdated.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          <div className="relative flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchLeads}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              to="/crm/leads"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
            >
              View leads
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchLeads}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-amber-500"
          />
          <p className="mt-4 font-medium text-slate-700">
            Loading your CRM analytics...
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Fetching the latest lead information.
          </p>
        </div>
      ) : !error ? (
        <>
          {/* Key performance indicators */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
                  Performance
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Lead overview
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                {metrics.total} total records
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.title}
                    className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-slate-200/60 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {stat.title}
                        </p>
                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                          {stat.value}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl p-3 transition group-hover:scale-105 ${stat.accent}`}
                      >
                        <Icon size={23} />
                      </div>
                    </div>

                    <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      {stat.note}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Conversion and follow-up section */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <article className="relative overflow-hidden rounded-2xl bg-linear-to-br from-amber-400 via-orange-400 to-orange-500 p-6 text-slate-950 shadow-sm sm:p-7 xl:col-span-1">
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border-22 border-white/15" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-xl bg-white/25 p-3">
                    <Target size={24} />
                  </div>
                  <TrendingUp size={22} className="opacity-70" />
                </div>

                <p className="mt-6 text-sm font-semibold text-slate-800">
                  Overall conversion rate
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {metrics.conversionRate}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-slate-950 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Number(metrics.conversionRate),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-800">
                  {metrics.converted} converted out of {metrics.total} leads
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7 xl:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
                    Stay on track
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Follow-up schedule
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Keep every enquiry moving forward.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                  <CalendarClock size={22} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {followUpStats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      to={`/crm/leads?followUp=${item.filter}`}
                      className="rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className={`rounded-lg p-2 ${item.background} ${item.color}`}>
                          <Icon size={18} />
                        </div>
                        <ArrowUpRight
                          size={16}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="mt-4 text-2xl font-bold text-slate-900">
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {item.title}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {metrics.overdueFollowUps > 0 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                  <CalendarX size={17} className="mt-0.5 shrink-0" />
                  <p>
                    <strong>{metrics.overdueFollowUps} overdue</strong>{" "}
                    follow-up{metrics.overdueFollowUps === 1 ? "" : "s"} need
                    attention.
                  </p>
                </div>
              )}
            </article>
          </section>

          {/* Lead sources and extra metrics */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
            <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
                    Acquisition
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Lead sources
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Where your enquiries come from.
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <BarChart3 size={22} />
                </div>
              </div>

              {sourceStats.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Lead source analytics will appear when leads are added.
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {sourceStats.map((item, index) => {
                    const barColors = [
                      "bg-amber-500",
                      "bg-blue-500",
                      "bg-violet-500",
                      "bg-emerald-500",
                      "bg-rose-500",
                      "bg-slate-400",
                    ];

                    return (
                      <div key={item.source}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-slate-700">
                            {item.label}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {item.count}
                            <span className="ml-2 text-xs font-normal text-slate-400">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColors[index % barColors.length]}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                  <Activity size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Lead outcomes
                  </h2>
                  <p className="text-sm text-slate-500">
                    Current pipeline summary
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                <div className="flex items-center justify-between rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-sm text-slate-600">
                      Interested
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {metrics.interested}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-600">
                      Converted
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {metrics.converted}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="text-sm text-slate-600">
                      Lost
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {metrics.lost}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-amber-50 p-4">
                  <TrendingUp size={19} className="text-amber-600" />
                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {metrics.interested}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Interested leads
                  </p>
                </div>

                <div className="rounded-xl bg-rose-50 p-4">
                  <UserX size={19} className="text-rose-600" />
                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {metrics.lost}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Lost leads
                  </p>
                </div>
              </div>
            </article>
          </section>

          {/* Recent leads table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
                  Latest activity
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Recent leads
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  The latest enquiries returned by your CRM.
                </p>
              </div>

              <Link
                to="/crm/leads"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
              >
                View all leads
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {leads.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Users size={26} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-800">
                  No leads yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add your first enquiry to start tracking admission activity.
                </p>
                <Link
                  to="/crm/leads"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
                >
                  <UserPlus size={16} />
                  Open leads
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-162.5 text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4 font-semibold">Lead</th>
                      <th className="px-6 py-4 font-semibold">Phone</th>
                      <th className="px-6 py-4 font-semibold">Source</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {leads.slice(0, 5).map((lead) => (
                      <tr
                        key={lead._id}
                        className="transition hover:bg-amber-50/30"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-100 to-orange-100 font-bold text-amber-700">
                              {lead.name?.charAt(0)?.toUpperCase() || "L"}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {lead.name || "Unnamed lead"}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {lead.email || "No email provided"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {lead.phone || "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {sourceLabels[lead.source] || "Other"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                              statusStyles[lead.status] ||
                              "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {(lead.status || "new")
                              .replace("-", " ")
                              .replace(/\b\w/g, (char) =>
                                char.toUpperCase()
                              )}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/crm/leads/${lead._id}`}
                            aria-label={`View ${lead.name || "lead"}`}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                          >
                            View
                            <ArrowUpRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {leads.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-3">
                <p className="text-xs text-slate-500">
                  Showing {Math.min(leads.length, 5)} of {leads.length} accessible leads
                </p>
                <Link
                  to="/crm/leads"
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                >
                  Manage all leads →
                </Link>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default CrmDashboard;
