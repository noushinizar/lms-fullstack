import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { verifyResetOtp } from "../../services/authService";

import {
  FaEnvelope,
  FaArrowRight,
  FaArrowLeft,
  FaShieldAlt,
} from "react-icons/fa";

import illustration from "../../assets/illustration.png";

import {
  showError,
  showSuccess,
  showWarning,
} from "../../utils/toast";

function VerifyResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!email) {
      showError("Email not found. Please request a new code.");
      navigate("/forgot-password", { replace: true });
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      return showWarning("Please enter a valid 6-digit code");
    }

    try {
      setLoading(true);

      const data = await verifyResetOtp(email, otp);

      showSuccess(data.message || "Verification successful");

      navigate("/reset-password", {
        replace: true,
        state: {
          resetToken: data.resetToken,
        },
      });

    } catch (error) {
      showError(
        error.response?.data?.message ||
        "Unable to verify code. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-200 via-orange-100 to-yellow-100 flex items-center justify-center px-6 py-10">

      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Side */}

        <div className="hidden lg:block">
          <img
            src={illustration}
            alt="Verify OTP"
            className="w-full max-w-lg mx-auto"
          />
        </div>

        {/* Right Side */}

        <div className="bg-[#f9dcb5] rounded-[40px] p-10 shadow-[20px_20px_60px_#d6bb92,-20px_-20px_60px_#fff6e8]">

          <div className="flex justify-center mb-5">
            <FaShieldAlt className="text-amber-600 text-5xl" />
          </div>

          <h2 className="text-4xl font-bold text-center text-gray-800">
            Verify OTP
          </h2>

          <p className="text-center text-gray-500 mt-3 mb-3">
            Enter the 6-digit verification code sent to your email.
          </p>

          {email && (
            <p className="text-center text-amber-700 font-semibold mb-8 break-all">
              {email}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* OTP Input */}

            <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">

              <FaEnvelope className="text-amber-600 mr-4" />

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full bg-transparent outline-none tracking-[8px] font-semibold text-lg"
                maxLength={6}
                required
              />

            </div>

            {/* Submit Button */}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg flex justify-center items-center gap-2 transition-all duration-300"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Verify Code
                  <FaArrowRight />
                </>
              )}
            </button>

          </form>

          <div className="mt-8 text-center">

            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:underline"
            >
              <FaArrowLeft />
              Request Another Code
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default VerifyResetOtp;
