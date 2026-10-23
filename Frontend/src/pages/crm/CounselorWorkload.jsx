
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  CircleCheck,
  Clock3,
  Download,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  UserRoundX,
  Users,
  BriefcaseBusiness,
  ChevronRight,
  Target,
  Sparkles,
} from "lucide-react";

import api from "../../services/api";

const statusLabels = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  "follow-up": "Follow-up",
  converted: "Converted",
  lost: "Lost",
};

const statusStyles = {
  new: "bg-blue-50 text-blue-700 ring-blue-100",
  contacted: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  interested: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "follow-up": "bg-amber-50 text-amber-700 ring-amber-100",
  converted: "bg-green-50 text-green-700 ring-green-100",
  lost: "bg-red-50 text-red-700 ring-red-100",
};

const avatarColors = [
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
];

const sourceLabels = {
  website: "Website",
  phone: "Phone",
  "walk-in": "Walk-in",
  referral: "Referral",
  "meta-ads": "Meta Ads",
  other: "Other",
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const formatPercent = (value) =>
  `${Number(value || 0).toFixed(1)}%`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getPresetDates = (preset) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (preset === "today") {
    end.setDate(end.getDate() + 1);
  } else if (preset === "week") {
    const mondayOffset = (start.getDay() + 6) % 7;

    start.setDate(start.getDate() - mondayOffset);
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 7);
  } else {
    start.setDate(1);
    end.setFullYear(start.getFullYear(), start.getMonth() + 1, 1);
  }

  const lastIncludedDay = new Date(end);
  lastIncludedDay.setDate(lastIncludedDay.getDate() - 1);

  return {
    startDate: getLocalDateString(start),
    endDate: getLocalDateString(lastIncludedDay),
  };
};

const getCurrentRole = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}")?.role || "";
  } catch {
    return "";
  }
};

const Card = ({ children, className = "" }) => (
  <section
    className={`rounded-2xl border border-gray-200/80 bg-white shadow-sm ${className}`}
  >
    {children}
  </section>
);

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-orange-600",
  iconBg = "bg-orange-50",
  accent = "bg-orange-500",
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
    <div
      className={`absolute inset-x-0 top-0 h-1 ${accent} opacity-80`}
    />
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
          {value ?? 0}
        </p>
        {subtitle && (
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={`rounded-xl p-3 transition-transform group-hover:scale-105 ${iconBg} ${iconColor}`}
      >
        <Icon size={21} />
      </div>
    </div>
  </div>
);

const SectionTitle = ({
  icon: Icon,
  title,
  subtitle,
  children,
}) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900">
        <span className="rounded-lg bg-orange-50 p-2 text-orange-600">
          <Icon size={18} />
        </span>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
    {children}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/70 px-4 py-10 text-center">
    <BarChart3 size={28} className="mx-auto text-gray-300" />
    <p className="mt-3 text-sm text-gray-500">{message}</p>
  </div>
);

const LoadingState = () => (
  <div className="flex min-h-87.5 items-center justify-center">
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
        <RefreshCw size={25} className="animate-spin text-orange-600" />
      </div>
      <p className="mt-4 font-semibold text-gray-800">
        Preparing your CRM reports
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Fetching the latest report data...
      </p>
    </div>
  </div>
);

const CounselorWorkload = () => {
  const initialDates = getPresetDates("month");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [datePreset, setDatePreset] = useState("month");
  const [customStart, setCustomStart] = useState(initialDates.startDate);
  const [customEnd, setCustomEnd] = useState(initialDates.endDate);
  const [dateError, setDateError] = useState("");

  const role = getCurrentRole();
  const isAdmin = role === "admin";
  const isCounselor = role === "admission_counselor";

  const fetchWorkload = useCallback(
    async (isRefresh = false, requestedPreset = datePreset) => {
      setError("");
      setDateError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        let dates;

        if (requestedPreset === "custom") {
          if (!customStart || !customEnd) {
            setDateError("Please select both start and end dates.");
            return;
          }

          if (customEnd < customStart) {
            setDateError("The end date must be on or after the start date.");
            return;
          }

          dates = {
            startDate: customStart,
            endDate: customEnd,
          };
        } else {
          dates = getPresetDates(requestedPreset);
        }

        const start = new Date(`${dates.startDate}T00:00:00`);
        const endExclusive = new Date(`${dates.endDate}T00:00:00`);
        endExclusive.setDate(endExclusive.getDate() + 1);

        const response = await api.get("/leads/dashboard/workload", {
          params: {
            startDate: start.toISOString(),
            endDate: endExclusive.toISOString(),
          },
        });

        const result = response.data?.data ?? response.data;
        setData(result);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load the CRM report. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [datePreset, customStart, customEnd]
  );

  useEffect(() => {
    fetchWorkload(false, datePreset);
  }, [fetchWorkload, datePreset]);

  const summary = data?.summary || {};

  const counselors = Array.isArray(data?.counselors)
    ? data.counselors
    : [];

  const sources = Array.isArray(data?.sources)
    ? data.sources
    : [];

  // Backend returns funnel as an object, not an array.
  const funnel = useMemo(() => {
    const rawFunnel = data?.funnel;

    if (Array.isArray(rawFunnel)) {
      return rawFunnel.map((item) => ({
        ...item,
        status:
          item.status === "followUp" ? "follow-up" : item.status,
        count: Number(item.count ?? item.total ?? 0),
      }));
    }

    if (rawFunnel && typeof rawFunnel === "object") {
      return Object.entries(rawFunnel).map(([status, count]) => ({
        status: status === "followUp" ? "follow-up" : status,
        count: Number(count || 0),
      }));
    }

    return [];
  }, [data?.funnel]);

  const normalizedSources = useMemo(
    () =>
      sources.map((item) => ({
        ...item,
        total: Number(
          item.totalLeads ?? item.total ?? item.count ?? 0
        ),
        converted: Number(
          item.convertedLeads ??
            item.converted ??
            item.convertedCount ??
            0
        ),
        lost: Number(
          item.lostLeads ?? item.lost ?? item.lostCount ?? 0
        ),
      })),
    [sources]
  );

  const normalizedCounselors = useMemo(
    () =>
      counselors.map((counselor) => {
        const statuses =
          counselor.statuses || counselor.statusCounts || {};

        return {
          ...counselor,
          id:
            counselor.counselorId ||
            counselor._id ||
            counselor.id,
          totalLeads: Number(
            counselor.totalLeads ??
              counselor.totalAssignedLeads ??
              counselor.total ??
              0
          ),
          statuses: {
            new: Number(counselor.new ?? statuses.new ?? 0),
            contacted: Number(
              counselor.contacted ?? statuses.contacted ?? 0
            ),
            interested: Number(
              counselor.interested ?? statuses.interested ?? 0
            ),
            followUp: Number(
              counselor.followUp ??
                counselor.followUpCount ??
                statuses.followUp ??
                statuses["follow-up"] ??
                0
            ),
            converted: Number(
              counselor.converted ?? statuses.converted ?? 0
            ),
            lost: Number(counselor.lost ?? statuses.lost ?? 0),
          },
        };
      }),
    [counselors]
  );

  const filteredCounselors = normalizedCounselors.filter(
    (counselor) => {
      const query = search.trim().toLowerCase();

      if (!query) return true;

      return (
        String(counselor.name || counselor.fullName || "")
          .toLowerCase()
          .includes(query) ||
        String(counselor.email || "")
          .toLowerCase()
          .includes(query)
      );
    }
  );

  const selectedDates =
    datePreset === "custom"
      ? { startDate: customStart, endDate: customEnd }
      : getPresetDates(datePreset);

  const applyCustomDates = () => {
    if (!customStart || !customEnd) {
      setDateError("Please select both start and end dates.");
      return;
    }

    if (customEnd < customStart) {
      setDateError("The end date must be on or after the start date.");
      return;
    }

    setDateError("");

    if (datePreset === "custom") {
      fetchWorkload(true, "custom");
    } else {
      setDatePreset("custom");
    }
  };

  const exportReportCsv = () => {
    const rows = [
      ["Astrobyte Academy CRM Report"],
      ["Report start date", selectedDates.startDate],
      ["Report end date", selectedDates.endDate],
      ["Report view", isAdmin ? "Organization" : "Personal"],
      [],
      ["Summary"],
      ["Metric", "Value"],
      ...(isAdmin
        ? [
            ["Total counselors", summary.totalCounselors ?? 0],
            ["Unassigned leads", summary.unassignedLeads ?? 0],
          ]
        : []),
      ["Total assigned leads", summary.totalAssignedLeads ?? 0],
      ["Leads created in period", summary.leadsCreated ?? 0],
      ["Previous period leads", summary.previousLeadsCreated ?? 0],
      ["Conversions in period", summary.conversionsInPeriod ?? 0],
      ["Previous period conversions", summary.previousConversionsInPeriod ?? 0],
      ["Conversion rate", summary.conversionRate ?? 0],
      ["Previous conversion rate", summary.previousConversionRate ?? 0],
      ["Conversion rate change", summary.conversionRateChange ?? 0],
      ["Follow-ups due today", summary.followUpsDueToday ?? 0],
      ["Overdue follow-ups", summary.totalOverdueFollowUps ?? 0],
      ["Upcoming follow-ups", summary.totalUpcomingFollowUps ?? 0],
      [],
      ["Lead Sources"],
      ["Source", "Leads created", "Converted leads", "Lost leads"],
      ...normalizedSources.map((item) => [
        sourceLabels[item.source] || item.source || "Other",
        item.total,
        item.converted,
        item.lost,
      ]),
      [],
      ["Current Lead Status Funnel"],
      ["Status", "Count"],
      ...funnel.map((item) => [
        statusLabels[item.status] || item.status || "Unknown",
        item.count,
      ]),
      [],
      [isAdmin ? "Counselor Performance" : "My Performance"],
      [
        "Counselor",
        "Email",
        "Total Leads",
        "New",
        "Contacted",
        "Interested",
        "Follow-up",
        "Converted",
        "Lost",
        "Conversion Rate",
        "Overdue Follow-ups",
        "Upcoming Follow-ups",
        "Follow-ups Due Today",
      ],
      ...normalizedCounselors.map((counselor) => [
        counselor.name || counselor.fullName || "Unknown",
        counselor.email || "",
        counselor.totalLeads,
        counselor.statuses.new,
        counselor.statuses.contacted,
        counselor.statuses.interested,
        counselor.statuses.followUp,
        counselor.statuses.converted,
        counselor.statuses.lost,
        counselor.conversionRate ?? 0,
        counselor.overdueFollowUps ?? 0,
        counselor.upcomingFollowUps ?? 0,
        counselor.followUpsDueToday ?? 0,
      ]),
    ];

    const escapeCell = (value) => {
      const textValue = String(value ?? "");
      return `"${textValue.replace(/"/g, '""')}"`;
    };

    const csv = rows
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `astrobyte-crm-report-${selectedDates.startDate}-to-${selectedDates.endDate}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-full space-y-6 bg-gray-50/50 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-gray-950 via-gray-900 to-orange-950 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-orange-100">
              <Sparkles size={14} />
              ASTROBYTE ACADEMY · CRM ANALYTICS
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {isAdmin ? "CRM Reports & Insights" : "My CRM Performance"}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base">
              {isAdmin
                ? "Understand lead generation, enrollment conversions, follow-up activity, and your team's workload in one place."
                : "Track your assigned leads, conversion activity, lead sources, and follow-up priorities."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-300">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2">
                <CalendarDays size={14} />
                {formatDate(selectedDates.startDate)} –{" "}
                {formatDate(selectedDates.endDate)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2">
                <CircleCheck size={14} />
                {isAdmin ? "Administrator view" : "Personal report view"}
              </span>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportReportCsv}
              disabled={!data}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              <Download size={17} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => fetchWorkload(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load report</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => fetchWorkload(true)}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Date filters */}
      <Card className="p-5 sm:p-6">
        <SectionTitle
          icon={CalendarRange}
          title="Report Period"
          subtitle="Choose a period to update your analytics."
        />

        <div className="flex flex-wrap gap-2">
          {[
            { value: "today", label: "Today" },
            { value: "week", label: "This Week" },
            { value: "month", label: "This Month" },
            { value: "custom", label: "Custom Range" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setDateError("");

                if (option.value === "custom") {
                  setDatePreset("custom");
                } else {
                  setDatePreset(option.value);
                }
              }}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                datePreset === option.value
                  ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {datePreset === "custom" && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label
                htmlFor="reportStartDate"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Start date
              </label>
              <input
                id="reportStartDate"
                type="date"
                value={customStart}
                max={customEnd || undefined}
                onChange={(event) => setCustomStart(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label
                htmlFor="reportEndDate"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                End date
              </label>
              <input
                id="reportEndDate"
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <button
              type="button"
              onClick={applyCustomDates}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Filter size={16} />
              Apply Dates
            </button>
          </div>
        )}

        {dateError && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={16} />
            {dateError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Displaying data from{" "}
            <span className="font-semibold text-gray-700">
              {formatDate(selectedDates.startDate)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-700">
              {formatDate(selectedDates.endDate)}
            </span>
          </p>
          {refreshing && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600">
              <RefreshCw size={13} className="animate-spin" />
              Updating data...
            </span>
          )}
        </div>
      </Card>

      {/* Workload overview */}
      <section>
        <SectionTitle
          icon={BriefcaseBusiness}
          title={isAdmin ? "Organization Overview" : "My Workload"}
          subtitle={
            isAdmin
              ? "A live snapshot of your CRM assignment and follow-up workload."
              : "A snapshot of your assigned leads and follow-up priorities."
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isAdmin && (
            <StatCard
              title="Counselors"
              value={formatNumber(summary.totalCounselors)}
              subtitle="Available counselor accounts"
              icon={Users}
              iconColor="text-violet-600"
              iconBg="bg-violet-50"
              accent="bg-violet-500"
            />
          )}

          <StatCard
            title="Assigned Leads"
            value={formatNumber(summary.totalAssignedLeads)}
            subtitle="Currently assigned leads"
            icon={BriefcaseBusiness}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            accent="bg-blue-500"
          />

          {isAdmin && (
            <StatCard
              title="Unassigned Leads"
              value={formatNumber(summary.unassignedLeads)}
              subtitle="Awaiting counselor assignment"
              icon={UserRoundX}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
              accent="bg-purple-500"
            />
          )}

          <StatCard
            title="Overdue Follow-ups"
            value={formatNumber(summary.totalOverdueFollowUps)}
            subtitle="Past their scheduled due date"
            icon={AlertCircle}
            iconColor="text-red-600"
            iconBg="bg-red-50"
            accent="bg-red-500"
          />

          <StatCard
            title="Upcoming Follow-ups"
            value={formatNumber(summary.totalUpcomingFollowUps)}
            subtitle="Scheduled for a future date"
            icon={CalendarDays}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            accent="bg-emerald-500"
          />

          <StatCard
            title="Due Today"
            value={formatNumber(summary.followUpsDueToday)}
            subtitle="Follow-ups scheduled for today"
            icon={Clock3}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            accent="bg-amber-500"
          />
        </div>
      </section>

      {/* Period performance */}
      <section>
        <SectionTitle
          icon={TrendingUp}
          title="Period Performance"
          subtitle="Lead creation and recorded conversion activity in the selected period."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Leads Created"
            value={formatNumber(summary.leadsCreated)}
            subtitle="Created during this period"
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            accent="bg-blue-500"
          />

          <StatCard
            title="Conversion Events"
            value={formatNumber(summary.conversionsInPeriod)}
            subtitle="Conversions recorded in this period"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            accent="bg-emerald-500"
          />

          <StatCard
            title="Conversion Rate"
            value={formatPercent(summary.conversionRate)}
            subtitle="Period conversions ÷ leads created"
            icon={Target}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
            accent="bg-orange-500"
          />

          <StatCard
            title="Previous Leads"
            value={formatNumber(summary.previousLeadsCreated)}
            subtitle="Leads in the preceding period"
            icon={CalendarRange}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            accent="bg-purple-500"
          />
        </div>

        <Card className="mt-4 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-gray-900">
                Previous Period Comparison
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Compare this period with the preceding period of equal duration.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
              <CalendarDays size={14} />
              {formatDate(data?.period?.previousStartDate)} –{" "}
              {formatDate(
                data?.period?.previousEndDateExclusive
                  ? new Date(
                      new Date(
                        data.period.previousEndDateExclusive
                      ).getTime() - 86400000
                    )
                  : ""
              )}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-sm text-gray-500">Previous Conversions</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatNumber(summary.previousConversionsInPeriod)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-sm text-gray-500">Previous Conversion Rate</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatPercent(summary.previousConversionRate)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-sm text-gray-500">Rate Change</p>
              <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
                {Number(summary.conversionRateChange || 0) > 0 ? (
                  <ArrowUpRight size={22} className="text-emerald-600" />
                ) : Number(summary.conversionRateChange || 0) < 0 ? (
                  <ArrowDownRight size={22} className="text-red-600" />
                ) : null}
                {formatPercent(summary.conversionRateChange)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Change in percentage points
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Attention needed: admin only for unassigned leads */}
      {((isAdmin && Number(summary.unassignedLeads || 0) > 0) ||
        Number(summary.totalOverdueFollowUps || 0) > 0) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-5">
          <div className="rounded-xl bg-white p-2 text-amber-700 shadow-sm">
            <AlertCircle size={21} />
          </div>
          <div>
            <h3 className="font-bold text-amber-950">
              Attention Needed
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-amber-900">
              {isAdmin && Number(summary.unassignedLeads || 0) > 0 &&
                `${formatNumber(summary.unassignedLeads)} lead(s) need assignment. `}
              {Number(summary.totalOverdueFollowUps || 0) > 0 &&
                `${formatNumber(summary.totalOverdueFollowUps)} overdue follow-up(s) need attention.`}
            </p>
          </div>
        </div>
      )}

      {/* Lead source report */}
      <Card className="p-5 sm:p-6">
        <SectionTitle
          icon={BarChart3}
          title="Lead Source Report"
          subtitle="Lead sources for the selected period. Conversion and loss reflect current lead statuses."
        />

        {normalizedSources.length === 0 ? (
          <EmptyState message="No lead source data is available for this period." />
        ) : (
          <div className="space-y-6">
            {normalizedSources.map((item, index) => {
              const total = item.total;
              const converted = item.converted;
              const lost = item.lost;
              const safeTotal = Math.max(total, 1);
              const convertedWidth = Math.min(
                100,
                (converted / safeTotal) * 100
              );
              const lostWidth = Math.min(
                100 - convertedWidth,
                (lost / safeTotal) * 100
              );

              return (
                <div key={item.source || index}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {sourceLabels[item.source] || item.source || "Other"}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {total
                          ? `${formatPercent((converted / total) * 100)} converted`
                          : "No leads"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatNumber(total)}
                      </p>
                      <p className="text-xs text-gray-500">Leads</p>
                    </div>
                  </div>

                  <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${convertedWidth}%` }}
                      title={`Converted: ${converted}`}
                    />
                    <div
                      className="h-full bg-red-400 transition-all duration-500"
                      style={{ width: `${lostWidth}%` }}
                      title={`Lost: ${lost}`}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                    <span>
                      <span className="font-semibold text-emerald-700">
                        {formatNumber(converted)}
                      </span>{" "}
                      converted
                    </span>
                    <span>
                      <span className="font-semibold text-red-600">
                        {formatNumber(lost)}
                      </span>{" "}
                      lost
                    </span>
                    <span>
                      {formatNumber(
                        Math.max(0, total - converted - lost)
                      )}{" "}
                      other statuses
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-xs text-gray-600">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                Converted
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-red-400" />
                Lost
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-gray-200" />
                Other statuses
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Current lead status */}
      <Card className="p-5 sm:p-6">
        <SectionTitle
          icon={TrendingUp}
          title="Current Lead Status"
          subtitle="Distribution of accessible leads by their current status."
        />

        {funnel.length === 0 ? (
          <EmptyState message="No lead status data is available." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {funnel.map((item) => {
              const count = item.count;
              const total = Math.max(
                funnel.reduce((sum, entry) => sum + entry.count, 0),
                1
              );
              const percentage = (count / total) * 100;

              return (
                <div
                  key={item.status}
                  className="rounded-2xl border border-gray-100 bg-linear-to-br from-white to-gray-50/70 p-4 transition hover:border-orange-200 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                        statusStyles[item.status] ||
                        "bg-gray-100 text-gray-700 ring-gray-200"
                      }`}
                    >
                      {statusLabels[item.status] || item.status || "Unknown"}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatNumber(count)}
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-orange-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    {percentage.toFixed(1)}% of accessible leads
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Counselor performance */}
      <section>
        <SectionTitle
          icon={Users}
          title={isAdmin ? "Counselor Performance" : "My Performance"}
          subtitle={
            isAdmin
              ? "Review each counselor's assignments, statuses, conversions, and follow-ups."
              : "Review your assigned leads, current statuses, and follow-up activity."
          }
        >
          {isAdmin && (
            <div className="relative w-full sm:w-72">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search counselor..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>
          )}
        </SectionTitle>

        {filteredCounselors.length === 0 ? (
          <EmptyState
            message={
              search
                ? "No counselors match your search."
                : "No counselor workload data is available."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredCounselors.map((counselor, index) => {
              const statuses = counselor.statuses;
              const name =
                counselor.name ||
                counselor.fullName ||
                counselor.email ||
                "Counselor";
              const totalLeads = counselor.totalLeads;
              const conversionRate = Number(
                counselor.conversionRate || 0
              );
              const overdue = Number(counselor.overdueFollowUps || 0);
              const upcoming = Number(counselor.upcomingFollowUps || 0);
              const dueToday = Number(counselor.followUpsDueToday || 0);

              return (
                <article
                  key={counselor.id || counselor.email || name}
                  className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="border-b border-gray-100 bg-linear-to-r from-white to-orange-50/40 p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
                          avatarColors[index % avatarColors.length]
                        }`}
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-gray-900">
                          {name}
                        </h3>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {counselor.email || "No email available"}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                          <CircleCheck size={13} />
                          {isAdmin ? "Counselor report" : "Your report"}
                        </span>
                      </div>

                      <div className="shrink-0 rounded-xl bg-white px-3 py-2 text-right shadow-sm ring-1 ring-gray-100">
                        <p className="text-xl font-bold text-gray-900">
                          {formatNumber(totalLeads)}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Assigned leads
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">
                          Conversion rate
                        </span>
                        <span className="font-bold text-emerald-700">
                          {formatPercent(conversionRate)}
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-emerald-400 to-green-600 transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, conversionRate)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-3">
                    {[
                      { label: "New", value: statuses.new, status: "new" },
                      {
                        label: "Contacted",
                        value: statuses.contacted,
                        status: "contacted",
                      },
                      {
                        label: "Interested",
                        value: statuses.interested,
                        status: "interested",
                      },
                      {
                        label: "Follow-up",
                        value: statuses.followUp,
                        status: "follow-up",
                      },
                      {
                        label: "Converted",
                        value: statuses.converted,
                        status: "converted",
                      },
                      { label: "Lost", value: statuses.lost, status: "lost" },
                    ].map((item) => (
                      <div
                        key={item.status}
                        className="bg-white p-4 transition hover:bg-gray-50"
                      >
                        <span
                          className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${
                            statusStyles[item.status]
                          }`}
                        >
                          {item.label}
                        </span>
                        <p className="mt-2 text-xl font-bold text-gray-900">
                          {formatNumber(item.value)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                    <div className="p-4">
                      <p className="text-xs text-gray-500">Overdue</p>
                      <p
                        className={`mt-1 text-lg font-bold ${
                          overdue > 0 ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {formatNumber(overdue)}
                      </p>
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-gray-500">Upcoming</p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {formatNumber(upcoming)}
                      </p>
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-gray-500">Due today</p>
                      <p
                        className={`mt-1 text-lg font-bold ${
                          dueToday > 0 ? "text-amber-600" : "text-gray-900"
                        }`}
                      >
                        {formatNumber(dueToday)}
                      </p>
                    </div>
                  </div>

                  {(overdue > 0 || dueToday > 0) && (
                    <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50 px-5 py-3 text-xs font-medium text-amber-800">
                      <AlertCircle size={15} />
                      {overdue > 0
                        ? `${formatNumber(overdue)} overdue follow-up(s) need attention`
                        : `${formatNumber(dueToday)} follow-up(s) due today`}
                    </div>
                  )}

                  <div className="border-t border-gray-100 px-5 py-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>View based on current assignments</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Report notes */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50 p-5 text-sm text-blue-900">
        <div className="rounded-xl bg-white p-2 text-blue-600 shadow-sm">
          <CircleCheck size={19} />
        </div>
        <div>
          <p className="font-bold">Understanding these reports</p>
          <p className="mt-1 leading-relaxed text-blue-800">
            Period conversion rate uses conversion events recorded during the
            selected period divided by leads created during that period. It is
            not a cohort conversion rate. Source and status reports reflect
            current lead statuses. Counselor conversion rates are calculated
            from the workload data returned by the backend.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CounselorWorkload;
