import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaArrowRight,
  FaUserGraduate,
  FaCertificate,
  FaChalkboardTeacher,
} from "react-icons/fa";

import illustration from "../../assets/illustration.png";
import { registerUser } from "../../services/authService";
import { showError, showSuccess, showWarning } from "../../utils/toast";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      return showWarning("Passwords do not match");
    }

    try {
      await registerUser(formData);

      showSuccess("Registration Successful");

      navigate("/login");
    } catch (error) {
      showError(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-200 via-orange-100 to-yellow-100 flex items-center justify-center px-6 py-10">

      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Side */}

        <div className="hidden lg:block">

          <img
            src={illustration}
            alt="Learning"
            className="w-full max-w-lg mx-auto"
          />

          {/* <h1 className="text-5xl font-bold text-gray-800 mt-8">
            Start Your
            <span className="text-amber-600"> Learning Journey</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-8">
            Join thousands of learners and build practical skills with
            expert mentors and real-world projects.
          </p>

          <div className="mt-10 space-y-5">

            <div className="flex items-center gap-3">
              <FaUserGraduate className="text-amber-600 text-xl" />
              <span>Hands-on Projects</span>
            </div>

            <div className="flex items-center gap-3">
              <FaChalkboardTeacher className="text-amber-600 text-xl" />
              <span>Expert Mentors</span>
            </div>

            <div className="flex items-center gap-3">
              <FaCertificate className="text-amber-600 text-xl" />
              <span>Course Certificates</span>
            </div>

          </div> */}

        </div>

        {/* Right Side */}

        <div className="bg-[#f9dcb5] rounded-[40px] p-10 shadow-[20px_20px_60px_#d6bb92,-20px_-20px_60px_#fff6e8]">

          <h2 className="text-4xl font-bold text-center text-gray-800">
            Create Account
          </h2>

          <p className="text-center text-gray-500 mt-3 mb-8">
            Register and start learning today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}

            <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">
              <FaUser className="text-amber-600 mr-4" />

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
                required
              />
            </div>

            {/* Email */}

            <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">
              <FaEnvelope className="text-amber-600 mr-4" />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
                required
              />
            </div>

            {/* Phone */}

            <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">
              <FaPhoneAlt className="text-amber-600 mr-4" />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              />
            </div>

            {/* Password */}

            <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">
              <FaLock className="text-amber-600 mr-4" />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
                required
              />
            </div>

            {/* Confirm Password */}

            <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">
              <FaLock className="text-amber-600 mr-4" />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-semibold text-lg flex justify-center items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              Create Account
              <FaArrowRight />
            </button>

          </form>

          <p className="text-center mt-8">
            Already have an account?

            <Link
              to="/login"
              className="ml-2 text-amber-700 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;