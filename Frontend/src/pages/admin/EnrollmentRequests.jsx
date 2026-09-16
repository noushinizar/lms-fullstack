import { useEffect, useMemo, useState } from "react";

import {
  getEnrollmentRequests,
  approveEnrollment,
  rejectEnrollment,
  revokeEnrollment,
} from "../../services/enrollmentService";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { showSuccess, showError } from "../../utils/toast";

const EnrollmentRequests = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");

  // Status Filter
  const [statusFilter, setStatusFilter] = useState("all");

  // Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    id: null,
  });

  const [actionLoading, setActionLoading] = useState(false);

  // ===============================================
  // Fetch Enrollment + Payment Data
  // ===============================================
  const fetchEnrollments = async () => {
    try {
      const data = await getEnrollmentRequests();

      setEnrollments(data.enrollments || []);
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Failed to load enrollment requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // ===============================================
  // Approve
  // ===============================================
  const handleApprove = async (id) => {
    try {
      setActionLoading(true);

      await approveEnrollment(id);

      showSuccess("Enrollment approved successfully.");

      await fetchEnrollments();
    } catch (error) {
      showError(
        error.response?.data?.message || "Approval failed.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ===============================================
  // Reject
  // ===============================================
  const handleReject = async (id) => {
    try {
      setActionLoading(true);

      await rejectEnrollment(id);

      showSuccess("Enrollment rejected.");

      await fetchEnrollments();
    } catch (error) {
      showError(
        error.response?.data?.message || "Rejection failed.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ===============================================
  // Revoke
  // ===============================================
  const handleRevoke = async (id) => {
    try {
      setActionLoading(true);

      await revokeEnrollment(id);

      showSuccess(
        "Student removed from the course successfully.",
      );

      await fetchEnrollments();
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Failed to remove student.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ===============================================
  // Confirm Action
  // ===============================================
  const handleConfirmAction = async () => {
    if (!confirmDialog.id || !confirmDialog.type) return;

    if (confirmDialog.type === "reject") {
      await handleReject(confirmDialog.id);
    }

    if (confirmDialog.type === "revoke") {
      await handleRevoke(confirmDialog.id);
    }

    setConfirmDialog({
      isOpen: false,
      type: null,
      id: null,
    });
  };

  // ===============================================
  // Search + Filter
  // ===============================================
  const filteredEnrollments = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return enrollments.filter((item) => {
      const enrollment = item.enrollment;
      const payment = item.payment;

      const studentName =
        enrollment?.studentId?.name?.toLowerCase() || "";

      const studentEmail =
        enrollment?.studentId?.email?.toLowerCase() || "";

      const courseTitle =
        enrollment?.courseId?.title?.toLowerCase() || "";

      const paymentId =
        payment?.paymentId?.toLowerCase() || "";

      const orderId =
        payment?.orderId?.toLowerCase() || "";

      const matchesSearch =
        studentName.includes(searchValue) ||
        studentEmail.includes(searchValue) ||
        courseTitle.includes(searchValue) ||
        paymentId.includes(searchValue) ||
        orderId.includes(searchValue);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : enrollment?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, search, statusFilter]);

  // ===============================================
  // Format Amount
  // ===============================================
  const formatAmount = (amount, currency = "INR") => {
    if (!amount) return "-";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  // ===============================================
  // Format Date
  // ===============================================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ===============================================
  // Loading
  // ===============================================
  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* ==========================================
            Header
        ========================================== */}
        <div className="px-6 py-5 bg-linear-to-r from-amber-100 to-amber-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Payments & Enrollment Requests
              </h1>

              <p className="text-gray-600 mt-1">
                Review student payments and manage course access.
              </p>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Search student, course, payment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300 outline-none"
              />

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300 outline-none"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==========================================
            Summary
        ========================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">
              Total Requests
            </p>

            <p className="text-2xl font-bold text-gray-800 mt-1">
              {enrollments.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {
                enrollments.filter(
                  (item) =>
                    item.enrollment?.status === "pending",
                ).length
              }
            </p>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">
              Approved
            </p>

            <p className="text-2xl font-bold text-green-600 mt-1">
              {
                enrollments.filter(
                  (item) =>
                    item.enrollment?.status === "approved",
                ).length
              }
            </p>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">
              Paid
            </p>

            <p className="text-2xl font-bold text-blue-600 mt-1">
              {
                enrollments.filter(
                  (item) =>
                    item.payment?.status === "paid",
                ).length
              }
            </p>
          </div>
        </div>

        {/* ==========================================
            Table
        ========================================== */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-amber-500 border-b border-amber-600">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Student
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Course
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Amount
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Payment
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Enrollment
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Date
                </th>

                <th className="px-5 py-4 text-center text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-12 text-gray-500"
                  >
                    No enrollment requests found.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((item) => {
                  const enrollment = item.enrollment;
                  const payment = item.payment;

                  return (
                    <tr
                      key={enrollment?._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {/* Student */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800">
                          {enrollment?.studentId?.name ||
                            "Unknown"}
                        </div>

                        <div className="text-sm text-gray-500">
                          {enrollment?.studentId?.email ||
                            "-"}
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-700">
                          {enrollment?.courseId?.title ||
                            "Course removed"}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800">
                          {formatAmount(
                            payment?.amount,
                            payment?.currency,
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          Course: ₹
                          {enrollment?.courseId?.price ||
                            0}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            payment?.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : payment?.status ===
                                  "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payment?.status
                            ? payment.status.toUpperCase()
                            : "NO PAYMENT"}
                        </span>

                        {payment?.paymentId && (
                          <div className="text-xs text-gray-500 mt-1">
                            {payment.paymentId}
                          </div>
                        )}
                      </td>

                      {/* Enrollment */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            enrollment?.status ===
                            "approved"
                              ? "bg-green-100 text-green-700"
                              : enrollment?.status ===
                                  "rejected"
                                ? "bg-red-100 text-red-700"
                                : enrollment?.status ===
                                    "revoked"
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {enrollment?.status
                            ?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(
                          payment?.paidAt ||
                            enrollment?.requestedAt ||
                            enrollment?.createdAt,
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          {/* Pending */}
                          {enrollment?.status ===
                            "pending" && (
                            <>
                              <button
                                disabled={actionLoading}
                                onClick={() =>
                                  handleApprove(
                                    enrollment._id,
                                  )
                                }
                                className="px-3 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition disabled:opacity-50"
                              >
                                Approve
                              </button>

                              <button
                                disabled={actionLoading}
                                onClick={() =>
                                  setConfirmDialog({
                                    isOpen: true,
                                    type: "reject",
                                    id: enrollment._id,
                                  })
                                }
                                className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Approved */}
                          {enrollment?.status ===
                            "approved" && (
                            <>
                              <span className="px-2 py-2 text-green-600 font-medium text-sm">
                                Approved
                              </span>

                              <button
                                disabled={actionLoading}
                                onClick={() =>
                                  setConfirmDialog({
                                    isOpen: true,
                                    type: "revoke",
                                    id: enrollment._id,
                                  })
                                }
                                className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </>
                          )}

                          {/* Rejected */}
                          {enrollment?.status ===
                            "rejected" && (
                            <span className="text-red-600 font-medium text-sm">
                              Rejected
                            </span>
                          )}

                          {/* Revoked */}
                          {enrollment?.status ===
                            "revoked" && (
                            <span className="text-gray-600 font-medium text-sm">
                              Revoked
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          Confirm Dialog
      ========================================== */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.type === "reject"
            ? "Reject Enrollment"
            : "Remove Student"
        }
        message={
          confirmDialog.type === "reject"
            ? "Are you sure you want to reject this enrollment request?"
            : "Are you sure you want to remove this student from the course?"
        }
        confirmText={
          confirmDialog.type === "reject"
            ? "Reject"
            : "Remove Student"
        }
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setConfirmDialog({
            isOpen: false,
            type: null,
            id: null,
          })
        }
        loading={actionLoading}
      />
    </div>
  );
};

export default EnrollmentRequests;
