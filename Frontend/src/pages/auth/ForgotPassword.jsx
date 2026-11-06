import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/authService";

import { FaEnvelope, FaArrowRight, FaArrowLeft } from "react-icons/fa";

import illustration from "../../assets/illustration.png";
import { showError, showSuccess } from "../../utils/toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();

      const data = await forgotPassword(normalizedEmail);

      showSuccess(data.message);

      navigate("/verify-reset-otp", {
        state: {
          email: normalizedEmail,
        },
      });
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Unable to send verification code. Please try again.",
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
            alt="Forgot Password"
            className="w-full max-w-lg mx-auto"
          />
        </div>

        {/* Right Side */}

        <div className="bg-[#f9dcb5] rounded-[40px] p-10 shadow-[20px_20px_60px_#d6bb92,-20px_-20px_60px_#fff6e8]">
          <h2 className="text-4xl font-bold text-center text-gray-800">
            Forgot Password?
          </h2>

          <p className="text-center text-gray-500 mt-3 mb-8">
            Enter your registered email address. We'll send you a 6-digit
            verification code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}

            <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">
              <FaEnvelope className="text-amber-600 mr-4" />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none"
                autoComplete="email"
                required
              />
            </div>

            {/* Submit Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg flex justify-center items-center gap-2 transition-all duration-300"
            >
              {loading ? (
                "Sending Code..."
              ) : (
                <>
                  Send Verification Code
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:underline"
            >
              <FaArrowLeft />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
