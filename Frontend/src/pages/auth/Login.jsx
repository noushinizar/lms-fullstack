import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaUserGraduate,
  FaCertificate,
  FaChalkboardTeacher,
} from "react-icons/fa";

import illustration from "../../assets/illustration.png";

import { loginUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { showError } from "../../utils/toast";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(formData);

      login(data);

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "mentor") {
        navigate("/mentor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      showError(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-200 via-orange-100 to-yellow-100 flex items-center justify-center px-6 py-10">

      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT */}

        <div className="hidden lg:block">

          <img
            src={illustration}
            alt="Learning"
            className="w-full max-w-lg mx-auto"
          />

          {/* <h1 className="text-5xl font-bold text-gray-800 mt-8">
            Learn.
            <span className="text-amber-600"> Build.</span>
            Grow.
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-8">
            Learn modern technologies through practical courses,
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
              <span>Verified Certificates</span>
            </div>

          </div> */}

        </div>

        {/* RIGHT */}

        <div className="bg-[#f9dcb5] rounded-[40px] p-10 shadow-[20px_20px_60px_#d6bb92,-20px_-20px_60px_#fff6e8]">

          <h2 className="text-4xl font-bold text-center text-gray-800">
            Welcome Back 
          </h2>

          <p className="text-center text-gray-500 mt-3 mb-10">
            Login to continue your learning journey.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">
              <FaEnvelope className="text-amber-600 mr-4" />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              />
            </div>

            <div className="flex items-center rounded-2xl px-5 py-4 bg-[#f9ead6] shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]">
              <FaLock className="text-amber-600 mr-4" />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              />
            </div>

            <div className="text-right">
  <Link
    to="/forgot-password"
    className="text-sm text-amber-700 hover:underline"
  >
    Forgot Password?
  </Link>
</div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-semibold text-lg flex justify-center items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              Login
              <FaArrowRight />
            </button>

          </form>

          <p className="text-center mt-8">
            Don't have an account?

            <Link
              to="/register"
              className="ml-2 text-amber-700 font-semibold hover:underline"
            >
              Register
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;

