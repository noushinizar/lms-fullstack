
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Users,
  UserRoundX,
  Search,
  BriefcaseBusiness,
  ArrowUpRight,
  Clock3,
  CircleCheck,
} from "lucide-react";
import api from "../../services/api";

const statusLabels = [
  { key: "new", label: "New", color: "blue" },
  { key: "contacted", label: "Contacted", color: "cyan" },
  { key: "interested", label: "Interested", color: "violet" },
  { key: "followUp", label: "Follow-up", color: "amber" },
  { key: "converted", label: "Converted", color: "emerald" },
  { key: "lost", label: "Lost", color: "rose" },
];

const statusStyles = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
];

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  theme,
}) => {
  const themes = {
    violet: "bg-violet-100 text-violet-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${themes[theme]}`}>
          <Icon size={23} strokeWidth={2} />
        </div>

        <ArrowUpRight
          size={19}
          className="text-gray-300 transition group-hover:text-amber-500"
        />
      </div>

      <p className="mt-5 text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
        {value ?? 0}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
};

const CounselorWorkload = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchWorkload = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/leads/dashboard/workload");
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch counselor workload:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load counselor workload. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkload();
  }, [fetchWorkload]);

  const summary = data?.summary;
  const counselors = data?.counselors || [];

  const filteredCounselors = counselors.filter((counselor) => {
    const term = search.trim().toLowerCase();

    return (
      counselor.name?.toLowerCase().includes(term) ||
      counselor.email?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <RefreshCw size={25} className="animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-800">
            Loading counselor insights
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Gathering workload and follow-up data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-7 pb-8">
      {/* Page header */}
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 sm:flex">
            <BriefcaseBusiness size={27} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Counselor Workload
              </h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Live overview
              </span>
            </div>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Monitor assignments, follow-up priorities, and admission
              conversion performance across your team.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchWorkload(true)}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
      </header>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center"
        >
          <AlertCircle size={21} className="shrink-0" />

          <p className="flex-1">{error}</p>

          <button
            type="button"
            onClick={() => fetchWorkload()}
            className="font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {/* KPI cards */}
      {summary && (
        <>
          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">
                Team at a glance
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              <StatCard
                icon={Users}
                label="Admission Counselors"
                value={summary.totalCounselors}
                description="Registered team members"
                theme="violet"
              />

              <StatCard
                icon={CheckCircle2}
                label="Assigned Leads"
                value={summary.totalAssignedLeads}
                description="Currently assigned leads"
                theme="emerald"
              />

              <StatCard
                icon={UserRoundX}
                label="Unassigned Leads"
                value={summary.unassignedLeads}
                description="Waiting for assignment"
                theme="rose"
              />

              <StatCard
                icon={AlertCircle}
                label="Overdue Follow-ups"
                value={summary.totalOverdueFollowUps}
                description="Need timely attention"
                theme="amber"
              />

              <StatCard
                icon={CalendarClock}
                label="Upcoming Follow-ups"
                value={summary.totalUpcomingFollowUps}
                description="Scheduled next actions"
                theme="blue"
              />
            </div>
          </section>

          {/* Follow-up attention banner */}
          {Number(summary.unassignedLeads) > 0 ||
          Number(summary.totalOverdueFollowUps) > 0 ? (
            <section className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                  <Clock3 size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    Attention needed
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {Number(summary.unassignedLeads) > 0 &&
                      `${summary.unassignedLeads} lead(s) are waiting for assignment.`}

                    {Number(summary.unassignedLeads) > 0 &&
                      Number(summary.totalOverdueFollowUps) > 0 &&
                      " "}

                    {Number(summary.totalOverdueFollowUps) > 0 &&
                      `${summary.totalOverdueFollowUps} follow-up(s) are overdue.`}
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <CircleCheck className="shrink-0 text-emerald-600" size={24} />
              <div>
                <p className="font-semibold text-emerald-900">
                  Everything looks on track
                </p>
                <p className="mt-1 text-sm text-emerald-700">
                  No unassigned leads or overdue follow-ups reported.
                </p>
              </div>
            </section>
          )}

          {/* Counselor performance */}
          <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                  Counselor Performance
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Compare lead distribution, status, and conversion rates.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search counselors..."
                  aria-label="Search counselors by name or email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </div>
            </div>

            {counselors.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <Users size={30} />
                </div>
                <h3 className="mt-4 font-semibold text-gray-800">
                  No admission counselors found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Add an admission counselor to see workload statistics.
                </p>
              </div>
            ) : filteredCounselors.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                No counselors match "{search}".
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredCounselors.map((counselor, index) => (
                  <article
                    key={counselor.counselorId}
                    className="p-5 transition hover:bg-gray-50/70 sm:p-6"
                  >
                    {/* Counselor identity and headline metrics */}
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                      <div className="flex min-w-0 items-center gap-3 xl:w-64 xl:shrink-0">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} text-sm font-bold text-white shadow-sm`}
                        >
                          {(counselor.name || "C")
                            .trim()
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-gray-900">
                            {counselor.name}
                          </h3>
                          <p className="mt-1 break-all text-xs text-gray-500">
                            {counselor.email}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Admission counselor
                          </span>
                        </div>
                      </div>

                      <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 xl:gap-5">
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">
                            Total leads
                          </p>
                          <p className="mt-2 text-2xl font-bold text-gray-900">
                            {counselor.total ?? 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-emerald-50/70 p-3">
                          <p className="text-xs text-gray-500">
                            Conversion rate
                          </p>
                          <p className="mt-2 flex items-center gap-1 text-2xl font-bold text-emerald-700">
                            {counselor.conversionRate ?? 0}%
                            <TrendingUp size={16} />
                          </p>
                        </div>

                        <div className="rounded-xl bg-rose-50/70 p-3">
                          <p className="text-xs text-gray-500">
                            Overdue
                          </p>
                          <p className="mt-2 text-2xl font-bold text-rose-600">
                            {counselor.overdueFollowUps ?? 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-blue-50/70 p-3">
                          <p className="text-xs text-gray-500">
                            Upcoming
                          </p>
                          <p className="mt-2 text-2xl font-bold text-blue-700">
                            {counselor.upcomingFollowUps ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lead status breakdown */}
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Lead status breakdown
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {statusLabels.map((status) => {
                          const count =
                            counselor.statuses?.[status.key] ?? 0;

                          return (
                            <div
                              key={status.key}
                              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-inset ${statusStyles[status.color]}`}
                            >
                              <span>{status.label}</span>
                              <span className="rounded-md bg-white/80 px-1.5 py-0.5 tabular-nums">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Workload distribution bar */}
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                        <span className="font-medium text-gray-500">
                          Converted leads
                        </span>
                        <span className="font-bold text-gray-700">
                          {counselor.statuses?.converted ?? 0} of{" "}
                          {counselor.total ?? 0}
                        </span>
                      </div>

                      <div
                        className="h-2 overflow-hidden rounded-full bg-gray-100"
                        role="progressbar"
                        aria-label={`${counselor.name} lead conversion`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(
                          100,
                          Math.max(0, Number(counselor.conversionRate) || 0),
                        )}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                Number(counselor.conversionRate) || 0,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Footer */}
            {counselors.length > 0 && (
              <div className="flex flex-col justify-between gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center">
                <span>
                  Showing {filteredCounselors.length} of {counselors.length} counselors
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw size={12} />
                  Refresh to load the latest figures
                </span>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default CounselorWorkload;
