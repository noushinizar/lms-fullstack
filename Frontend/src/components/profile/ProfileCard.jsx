function ProfileCard({ profile }) {
  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        Loading Profile...
      </div>
    );
  }

  return (
    
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Avatar */}

      <div className="flex flex-col items-center">
        <img
          src={
            profile.avatar ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(profile.name) +
              "&background=f59e0b&color=fff&size=200"
          }
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-amber-500"
        />

        <h2 className="text-3xl font-bold mt-5">
          {profile.name}
        </h2>

        <p className="text-gray-500 capitalize">
          {profile.role}
        </p>
      </div>

      {/* Information */}

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <InfoItem
          label="Email"
          value={profile.email}
        />

        <InfoItem
          label="Phone"
          value={profile.phone || "-"}
        />

        <InfoItem
          label="Gender"
          value={profile.gender}
        />

        <InfoItem
          label="Date of Birth"
          value={
            profile.dob
              ? new Date(profile.dob).toLocaleDateString()
              : "-"
          }
        />

        <InfoItem
          label="Joined On"
          value={new Date(profile.createdAt).toLocaleDateString()}
        />
      </div>

      {/* Bio */}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">
          Bio
        </h3>

        <p className="text-gray-600">
          {profile.bio || "No bio added yet."}
        </p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">
        {label}
      </p>

      <h4 className="font-semibold text-lg">
        {value}
      </h4>
    </div>
  );
}

export default ProfileCard;