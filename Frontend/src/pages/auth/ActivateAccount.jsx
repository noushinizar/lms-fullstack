import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FaLock,
  FaArrowRight,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";

import illustration from "../../assets/illustration.png";
import { showError, showSuccess, showWarning } from "../../utils/toast";
import { activateAccount } from "../../services/authService";

function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      return showError("Invalid or missing activation link.");
    }

    if (password.length < 6) {
      return showWarning("Password must contain at least 6 characters.");
    }

    if (password !== confirmPassword) {
      return showWarning("Passwords do not match.");
    }

    try {
      setLoading(true);

      const data = await activateAccount(token, password);

      showSuccess(data.message || "Your account has been activated successfully!");

      navigate("/login");
    } catch (error) {
      showError(
        error.response?.data?.message ||
          error.message ||
          "Account activation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.length < 10) return "Medium";
    return "Strong";
  };

  const strengthColor = () => {
    if (password.length < 6) return "text-red-500";
    if (password.length < 10) return "text-yellow-500";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-200 via-orange-100 to-yellow-100 flex items-center justify-center px-6 py-10">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Side */}

        <div className="hidden lg:block">
          <img
            src={illustration}
            alt="Activate Student Account"
            className="w-full max-w-lg mx-auto"
          />

          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome to Astrobyte!
            </h2>

            <p className="mt-4 text-gray-600 text-lg">
              Activate your student account and begin your learning journey.
            </p>
          </div>
        </div>

        {/* Right Side */}

        <div className="bg-[#f9dcb5] rounded-[40px] p-10 shadow-[20px_20px_60px_#d6bb92,-20px_-20px_60px_#fff6e8]">

          <div className="flex justify-center mb-5">
            <FaShieldAlt className="text-amber-600 text-5xl" />
          </div>

          <h2 className="text-4xl font-bold text-center text-gray-800">
            Activate Account
          </h2>

          <p className="text-center text-gray-600 mt-3 mb-8">
            Create your password to activate your student account.
          </p>

          {!token ? (
            <div className="text-center space-y-5">
              <p className="text-red-600 font-medium">
                This activation link is invalid or incomplete.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:underline"
              >
                <FaArrowLeft />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Password */}

              <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">
                <FaLock className="text-amber-600 mr-4" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-600" />
                  ) : (
                    <FaEye className="text-gray-600" />
                  )}
                </button>
              </div>

              {/* Password Strength */}

              {password && (
                <p className={`text-sm font-medium ${strengthColor()}`}>
                  Password Strength: {getStrength()}
                </p>
              )}

              {/* Confirm Password */}

              <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">
                <FaLock className="text-amber-600 mr-4" />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent outline-none"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="text-gray-600" />
                  ) : (
                    <FaEye className="text-gray-600" />
                  )}
                </button>
              </div>

              {/* Activate Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg flex justify-center items-center gap-2 transition-all duration-300"
              >
                {loading ? "Activating..." : "Activate Account"}
                {!loading && <FaArrowRight />}
              </button>

            </form>
          )}

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

export default ActivateAccount;