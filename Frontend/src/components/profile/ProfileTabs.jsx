function ProfileTabs({
  activeTab,
  setActiveTab,
}) {

  const tabs = [
    {
      id: "profile",
      label: "Profile",
    },
    {
      id: "edit",
      label: "Edit Profile",
    },
    {
      id: "password",
      label: "Change Password",
    },
  ];

  return (
    <div className="flex gap-4 border-b">

      {tabs.map((tab) => (

        <button
          key={tab.id}
          onClick={() =>
            setActiveTab(tab.id)
          }
          className={`px-6 py-3 font-medium transition
          ${
            activeTab === tab.id
              ? "border-b-4 border-amber-500 text-amber-600"
              : "text-gray-500 hover:text-amber-500"
          }`}
        >
          {tab.label}
        </button>

      ))}

    </div>
  );
}

export default ProfileTabs;