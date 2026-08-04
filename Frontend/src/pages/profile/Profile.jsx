import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import StudentLayout from "../../layouts/StudentLayout";

import ProfileTabs from "../../components/profile/ProfileTabs";
import ProfileCard from "../../components/profile/ProfileCard";
import EditProfileForm from "../../components/profile/EditProfileForm";
import ChangePasswordForm from "../../components/profile/ChangePasswordForm";

import { getProfile } from "../../services/profileService";

function Profile() {
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();

      setProfile(data);
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
     
        <h2 className="text-center text-2xl mt-20">
          Loading Profile...
        </h2>
      
    );
  }

  return (
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          My Profile
        </h1>

        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="mt-8">

          {activeTab === "profile" && (
            <ProfileCard
              profile={profile}
            />
          )}

          {activeTab === "edit" && (
            <EditProfileForm
              profile={profile}
              refreshProfile={fetchProfile}
            />
          )}

          {activeTab === "password" && (
            <ChangePasswordForm />
          )}

        </div>

      </div>
  );
}

export default Profile;