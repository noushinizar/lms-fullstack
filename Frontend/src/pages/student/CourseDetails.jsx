import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";
import { getCourseById } from "../../services/courseService";

import {
  createPaymentOrder,
  verifyPayment,
} from "../../services/paymentService";

import { showSuccess, showError } from "../../utils/toast";

function CourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(id);

        setCourse(data);
      } catch (error) {
        console.error("Failed to fetch course:", error);

        showError(
          error.response?.data?.message ||
            "Failed to load course"
        );
      }
    };

    fetchCourse();
  }, [id]);

  // ================= PAYMENT =================

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Check Razorpay script
      if (!window.Razorpay) {
        showError("Razorpay checkout could not be loaded.");
        setLoading(false);
        return;
      }

      // 1. Create Razorpay order
      const orderData = await createPaymentOrder(course._id);

      // 2. Razorpay checkout options
      const options = {
        key: orderData.razorpayKeyId,

        amount: orderData.order.amount,

        currency: orderData.order.currency,

        name: "Astrobyte Academy",

        description: course.title,

        order_id: orderData.order.id,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },

        theme: {
          color: "#1f2937",
        },

        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verificationData = await verifyPayment({
              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature,
            });

            console.log(
              "Payment verified:",
              verificationData
            );

            setLoading(false);

            showSuccess(
              "Payment successful! Your enrollment is waiting for admin approval."
            );

            // Refresh course details
            const updatedCourse = await getCourseById(id);

            setCourse(updatedCourse);
          } catch (error) {
            console.error(
              "Payment verification failed:",
              error
            );

            setLoading(false);

            showError(
              error.response?.data?.message ||
                "Payment verification failed"
            );
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // 4. Open Razorpay checkout
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error(
          "Payment failed:",
          response.error
        );

        setLoading(false);

        showError(
          response.error?.description ||
            "Payment failed"
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);

      setLoading(false);

      showError(
        error.response?.data?.message ||
          "Unable to start payment"
      );
    }
  };

  // ================= LOADING =================

  if (!course) {
    return (
      <StudentLayout>
        <h2>Loading...</h2>
      </StudentLayout>
    );
  }

  // ================= UI =================

  return (
    <StudentLayout>
      <div className="bg-white rounded-xl shadow p-6">
        <img
          src={
            course.thumbnail ||
            "https://placehold.co/1000x400"
          }
          alt={course.title}
          className="w-full h-80 object-cover rounded-lg mb-6"
        />

        <h1 className="text-4xl font-bold mb-4">
          {course.title}
        </h1>

        <p className="text-gray-600 mb-4">
          {course.description}
        </p>

        <p className="mb-2">
          <strong>Category:</strong>{" "}
          {course.category}
        </p>

        <p className="mb-6 text-green-600 font-bold text-2xl">
          ₹{course.price}
        </p>

        {/* ================= APPROVED ================= */}

        {course.enrollmentStatus === "approved" ? (
          <Link
            to="/student/my-courses"
            className="
              inline-block
              bg-green-600
              hover:bg-green-700
              text-white
              px-6
              py-3
              rounded-lg
              font-medium
              transition
            "
          >
            Continue Learning
          </Link>
        ) : course.enrollmentStatus === "pending" ? (
          /* ================= PENDING ================= */

          <button
            disabled
            className="
              bg-yellow-500
              text-white
              px-6
              py-3
              rounded-lg
              cursor-not-allowed
              font-medium
            "
          >
            Waiting For Approval
          </button>
        ) : course.enrollmentStatus === "rejected" ? (
          /* ================= REJECTED ================= */

          <button
            onClick={handlePayment}
            disabled={loading}
            className="
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-gray-400
              text-white
              px-6
              py-3
              rounded-lg
              font-medium
              transition
            "
          >
            {loading
              ? "Processing..."
              : "Pay Again"}
          </button>
        ) : (
          /* ================= NOT ENROLLED ================= */

          <button
            onClick={handlePayment}
            disabled={loading}
            className="
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-gray-400
              text-white
              px-6
              py-3
              rounded-lg
              font-medium
              transition
            "
          >
            {loading
              ? "Processing..."
              : `Buy Course - ₹${course.price}`}
          </button>
        )}
      </div>
    </StudentLayout>
  );
}

export default CourseDetails;