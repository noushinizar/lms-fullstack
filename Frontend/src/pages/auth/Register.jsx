import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

import illustration from "../../assets/illustration.png";

import { registerUser } from "../../services/authService";
import {
  showError,
  showSuccess,
} from "../../utils/toast";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const[showPassword,setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // =========================
  // HANDLE CONFIRM PASSWORD
  // =========================

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;

    setConfirmPassword(value);

    if (errors.confirmPassword) {
      setErrors({
        ...errors,
        confirmPassword: "",
      });
    }
  };

  // =========================
  // VALIDATE FORM
  // =========================

  const validateForm = () => {
    const newErrors = {};

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;

    // =========================
    // NAME
    // =========================

    if (!name) {
      newErrors.name = "Full name is required.";
    } else if (name.length < 2) {
      newErrors.name =
        "Name must be at least 2 characters.";
    }

    // =========================
    // EMAIL
    // =========================

    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    // =========================
    // PHONE
    // =========================

    if (phone) {
      if (!/^[0-9]{10}$/.test(phone)) {
        newErrors.phone =
          "Phone number must contain exactly 10 digits.";
      }
    }

    // =========================
    // PASSWORD
    // =========================

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters.";
    }

    // =========================
    // CONFIRM PASSWORD
    // =========================

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      showSuccess("Registration Successful");

      navigate("/login");
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Registration Failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-200 via-orange-100 to-yellow-100 flex items-center justify-center px-6 py-10">

      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* ================= LEFT ================= */}

        <div className="hidden lg:block">

          <img
            src={illustration}
            alt="Learning"
            className="w-full max-w-lg mx-auto"
          />

        </div>

        {/* ================= RIGHT ================= */}

        <div className="bg-[#f9dcb5] rounded-[40px] p-10 shadow-[20px_20px_60px_#d6bb92,-20px_-20px_60px_#fff6e8]">

          <h2 className="text-4xl font-bold text-center text-gray-800">
            Create Account
          </h2>

          <p className="text-center text-gray-500 mt-3 mb-8">
            Register and start learning today.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* ================= NAME ================= */}

            <div>

              <div
                className={`
                  flex
                  items-center
                  rounded-2xl
                  px-5
                  py-4
                  bg-[#f9ead6]
                  shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]
                  border-2
                  ${
                    errors.name
                      ? "border-red-500"
                      : "border-transparent"
                  }
                `}
              >

                <FaUser className="text-amber-600 mr-4" />

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                />

              </div>

              {errors.name && (
                <p className="text-red-600 text-sm mt-2 ml-2">
                  {errors.name}
                </p>
              )}

            </div>

            {/* ================= EMAIL ================= */}

            <div>

              <div
                className={`
                  flex
                  items-center
                  rounded-2xl
                  px-5
                  py-4
                  bg-[#f9ead6]
                  shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]
                  border-2
                  ${
                    errors.email
                      ? "border-red-500"
                      : "border-transparent"
                  }
                `}
              >

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

              {errors.email && (
                <p className="text-red-600 text-sm mt-2 ml-2">
                  {errors.email}
                </p>
              )}

            </div>

            {/* ================= PHONE ================= */}

            <div>

              <div
                className={`
                  flex
                  items-center
                  rounded-2xl
                  px-5
                  py-4
                  bg-[#f9ead6]
                  shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]
                  border-2
                  ${
                    errors.phone
                      ? "border-red-500"
                      : "border-transparent"
                  }
                `}
              >

                <FaPhoneAlt className="text-amber-600 mr-4" />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                  maxLength={10}
                />

              </div>

              {errors.phone && (
                <p className="text-red-600 text-sm mt-2 ml-2">
                  {errors.phone}
                </p>
              )}

            </div>

            {/* ================= PASSWORD ================= */}

            <div>

              <div
                className={`
                  flex
                  items-center
                  rounded-2xl
                  px-5
                  py-4
                  bg-[#f9ead6]
                  shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]
                  border-2
                  ${
                    errors.password
                      ? "border-red-500"
                      : "border-transparent"
                  }
                `}
              >

                <FaLock className="text-amber-600 mr-4" />

                <input
                  type={showPassword ? "text":"password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                />
               <button
                 type="button"
                 onClick={()=> setShowPassword(!showPassword)}
                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
               >

               {showPassword ? <FaEyeSlash/> : <FaEye/>}
               </button>
              </div>

              {errors.password && (
                <p className="text-red-600 text-sm mt-2 ml-2">
                  {errors.password}
                </p>
              )}

            </div>

            {/* ================= CONFIRM PASSWORD ================= */}

            <div>

              <div
                className={`
                  flex
                  items-center
                  rounded-2xl
                  px-5
                  py-4
                  bg-[#f9ead6]
                  shadow-[inset_6px_6px_12px_#d8bc92,inset_-6px_-6px_12px_#fff7e9]
                  border-2
                  ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-transparent"
                  }
                `}
              >

                <FaLock className="text-amber-600 mr-4" />

                <input
                  type={showPassword ? "text":"password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="w-full bg-transparent outline-none"
                />
                   <button
                 type="button"
                 onClick={()=> setShowPassword(!showPassword)}
                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
               >

               {showPassword ? <FaEyeSlash/> : <FaEye/>}
               </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-2 ml-2">
                  {errors.confirmPassword}
                </p>
              )}

            </div>

            {/* ================= REGISTER BUTTON ================= */}

            <button
              type="submit"
              className="
                w-full
                bg-amber-500
                hover:bg-amber-600
                text-white
                py-4
                rounded-2xl
                font-semibold
                text-lg
                flex
                justify-center
                items-center
                gap-2
                transition-all
                duration-300
                hover:scale-105
              "
            >
              Create Account
              <FaArrowRight />
            </button>

          </form>

          {/* ================= LOGIN ================= */}

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