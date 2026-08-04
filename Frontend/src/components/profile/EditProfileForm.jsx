import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { updateProfile } from "../../services/profileService";

function EditProfileForm({ profile, refreshProfile }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    gender: "Other",
    dob: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        gender: profile.gender || "Other",
        dob: profile.dob ? profile.dob.split("T")[0] : "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return toast.error("Name is required");
    }

    try {
      setLoading(true);

      const res = await updateProfile(formData);

      toast.success(res.message);

      refreshProfile();

    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label>Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          />
        </div>

        <div>
          <label>Phone</label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          />
        </div>

        <div>
          <label>Gender</label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label>Date of Birth</label>

          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          />
        </div>

        <div>
          <label>Bio</label>

          <textarea
            rows="4"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          />
        </div>

        <button
          disabled={loading}
          className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>

      </form>
    </div>
  );
}

export default EditProfileForm;