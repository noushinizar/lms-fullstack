import {
  BookOpen,
  UserPlus,
  GraduationCap,
  Briefcase,
} from "lucide-react";

function PlatformActivity({ activities }) {
  const getIcon = (type) => {
    switch (type) {
      case "course":
        return (
          <BookOpen
            size={18}
            className="text-amber-600"
          />
        );

      case "student":
        return (
          <UserPlus
            size={18}
            className="text-blue-600"
          />
        );

      case "mentor":
        return (
          <Briefcase
            size={18}
            className="text-purple-600"
          />
        );

      case "enrollment":
        return (
          <GraduationCap
            size={18}
            className="text-green-600"
          />
        );

      default:
        return (
          <BookOpen
            size={18}
            className="text-gray-500"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <div className="mb-6">

        <h2 className="text-xl font-bold">
          Platform Activity
        </h2>

        <p className="text-gray-500 text-sm">
          Recent events across the LMS
        </p>

      </div>

      <div className="space-y-5">

        {activities.map((activity, index) => (

          <div
            key={index}
            className="flex gap-4"
          >

            {/* Timeline */}

            <div className="flex flex-col items-center">

              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">

                {getIcon(activity.type)}

              </div>

              {index !== activities.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 mt-2"></div>
              )}

            </div>

            {/* Content */}

            <div className="flex-1 pb-6">

              <h3 className="font-medium text-gray-800">
                {activity.title}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {new Date(activity.date).toLocaleString()}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default PlatformActivity;