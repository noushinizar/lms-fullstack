import { useState } from "react";
import { toast } from "react-toastify";

import { changePassword } from "../../services/profileService";

function ChangePasswordForm() {

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      return toast.error("All fields are required");
    }

    if (formData.newPassword.length < 8) {
      return toast.error(
        "Password must be at least 8 characters"
      );
    }

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      return toast.error("Passwords do not match");
    }

    try {

      setLoading(true);

      const res = await changePassword(formData);

      toast.success(res.message);

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
          "Password change failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div>
          <label>Current Password</label>

          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          />
        </div>

        <div>
          <label>New Password</label>

          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          />
        </div>

        <div>
          <label>Confirm Password</label>

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          />
        </div>

        <button
          disabled={loading}
          className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>

      </form>

    </div>
  );
}

export default ChangePasswordForm;