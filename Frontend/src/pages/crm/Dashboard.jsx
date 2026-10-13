
import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  PhoneCall,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

function CrmDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/leads");
        const data = response.data;

        setLeads(Array.isArray(data) ? data : data.leads || []);
      } catch (err) {
        console.error("Failed to load CRM leads:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load CRM dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

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
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          CRM Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Track enquiries, manage leads, and monitor admissions.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="ml-3 inline-flex items-center gap-2 font-semibold underline"
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
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>
                      <h2 className="mt-3 text-3xl font-bold text-gray-900">
                        {stat.value}
                      </h2>
                    </div>

                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon size={25} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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

              <a
                href="/crm/leads"
                className="font-semibold text-amber-600 hover:text-amber-700"
              >
                View all
              </a>
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
                      <tr key={lead._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {lead.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {lead.phone}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {lead.source || "other"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
                            {lead.status}
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
      )}
    </div>
  );
}

export default CrmDashboard;
