import { useEffect, useMemo, useState } from "react";

import {
  getEnrollmentRequests,
  approveEnrollment,
  rejectEnrollment,
} from "../../services/enrollmentService";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import { showSuccess, showError } from "../../utils/toast";

const EnrollmentRequests = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");

  // Status Filter
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchEnrollments = async () => {
    try {
      const data = await getEnrollmentRequests();
      setEnrollments(data.enrollments);
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Failed to load enrollment requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveEnrollment(id);
      showSuccess("Enrollment approved successfully.");
      fetchEnrollments();
    } catch (error) {
      showError(error.response?.data?.message || "Approval failed.");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectEnrollment(id);
      showSuccess("Enrollment rejected.");
      fetchEnrollments();
    } catch (error) {
      showError(error.response?.data?.message || "Rejection failed.");
    }
  };

  // Search + Filter
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((item) => {
      const studentName =
        item.studentId?.name?.toLowerCase() || "";

      const studentEmail =
        item.studentId?.email?.toLowerCase() || "";

      const courseTitle =
        item.courseId?.title?.toLowerCase() || "";

      const matchesSearch =
        studentName.includes(search.toLowerCase()) ||
        studentEmail.includes(search.toLowerCase()) ||
        courseTitle.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, search, statusFilter]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">

      {/* Header */}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

        <div className="px-6 py-5 flex justify-between bg-linear-to-r from-amber-100 to-amber-200">
            <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Enrollment Requests
          </h1>

          <p className="text-gray-500 mt-1">
            Review and manage student enrollment requests.
          </p>
         </div>

         
        {/* Search & Filter */}
          <input
            type="text"
            placeholder="Search by student, email or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 px-3 py-2 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-300 outline-none  "
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="px-4 py-2 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-300 outline-none "
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

        </div>


       

        {/* Table */}

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead className="bg-amber-500 border-b border-gray-200">

              <tr>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Course
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Requested
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>
                              {filteredEnrollments.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 text-gray-500"
                  >
                    No enrollment requests found.
                  </td>
                </tr>

              ) : (

                filteredEnrollments.map((item) => (

                  <tr
                    key={item._id}
                    className="border-b hover:bg-gray-50 transition"
                  >

                    {/* Student */}

                    <td className="px-6 py-4">

                      <div className="font-semibold text-gray-800">
                        {item.studentId?.name || "Unknown"}
                      </div>

                      <div className="text-sm text-gray-500">
                        {item.studentId?.email || "-"}
                      </div>

                    </td>


                    {/* Course */}

                    <td className="px-6 py-4">

                      <div className="font-medium text-gray-700">
                        {item.courseId?.title || "Course removed"}
                      </div>

                    </td>


                    {/* Date */}

                    <td className="px-6 py-4 text-gray-600">

                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}

                    </td>


                    {/* Status */}

                    <td className="px-6 py-4">

                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            item.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : item.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        `}
                      >

                        {item.status}

                      </span>

                    </td>


                    {/* Actions */}

                    <td className="px-6 py-4">

                      <div className="flex justify-center gap-3">


                        {item.status === "pending" && (

                          <>

                            <button
                              onClick={() =>
                                handleApprove(item._id)
                              }
                              className="
                                px-4 py-2 rounded-lg
                                bg-green-500 text-white
                                text-sm font-medium
                                hover:bg-green-600
                                transition
                              "
                            >
                              Approve
                            </button>


                            <button
                              onClick={() =>
                                handleReject(item._id)
                              }
                              className="
                                px-4 py-2 rounded-lg
                                bg-red-500 text-white
                                text-sm font-medium
                                hover:bg-red-600
                                transition
                              "
                            >
                              Reject
                            </button>

                          </>

                        )}


                        {item.status === "approved" && (

                          <span className="text-green-600 font-medium text-sm">
                            Approved
                          </span>

                        )}


                        {item.status === "rejected" && (

                          <span className="text-red-600 font-medium text-sm">
                            Rejected
                          </span>

                        )}

                      </div>

                    </td>


                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default EnrollmentRequests;