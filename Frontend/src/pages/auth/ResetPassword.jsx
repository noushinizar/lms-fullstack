import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import {
  FaLock,
  FaArrowRight,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaCertificate,
  FaUserGraduate,
} from "react-icons/fa";

import illustration from "../../assets/login-illustration.png";
import { showError, showSuccess, showWarning } from "../../utils/toast";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    return showWarning("Passwords do not match");
  }

  try {

    const data = await resetPassword(
      token,
      password
    );

    showSuccess(data.message);

    navigate("/login");

  } catch (error) {
  console.log(error);
  

  showError(
    error.response?.data?.message ||
    error.message ||
    "Password reset failed"
  );
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
            alt="Reset Password"
            className="w-full max-w-lg mx-auto"
          />

          <h1 className="text-5xl font-bold text-gray-800 mt-8">
            Create a
            <span className="text-amber-600"> New Password</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-8">
            Choose a strong password to keep your LMS account secure.
          </p>

          <div className="mt-10 space-y-5">

            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-amber-600 text-xl" />
              <span>Secure Account Protection</span>
            </div>

            <div className="flex items-center gap-3">
              <FaUserGraduate className="text-amber-600 text-xl" />
              <span>Continue Your Learning Journey</span>
            </div>

            <div className="flex items-center gap-3">
              <FaCertificate className="text-amber-600 text-xl" />
              <span>Your Progress Stays Safe</span>
            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="bg-[#f9dcb5] rounded-[40px] p-10 shadow-[20px_20px_60px_#d6bb92,-20px_-20px_60px_#fff6e8]">

          <h2 className="text-4xl font-bold text-center text-gray-800">
            Reset Password
          </h2>

          <p className="text-center text-gray-500 mt-3 mb-8">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Password */}

            <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">

              <FaLock className="text-amber-600 mr-4" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none"
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
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full bg-transparent outline-none"
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

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-semibold text-lg flex justify-center items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              Reset Password
              <FaArrowRight />
            </button>

          </form>

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

export default ResetPassword;