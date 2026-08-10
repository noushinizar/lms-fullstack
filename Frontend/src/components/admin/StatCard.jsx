import {
  Users,
  UserCheck,
  BookOpen,
  GraduationCap,
} from "lucide-react";

function StatCard({ title, value = 0 }) {
  const config = {
    Students: {
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },

    Mentors: {
      icon: UserCheck,
      color: "from-purple-500 to-pink-500",
    },

    Courses: {
      icon: BookOpen,
      color: "from-orange-500 to-amber-500",
    },

    Enrollments: {
      icon: GraduationCap,
      color: "from-green-500 to-emerald-500",
    },
  };

  const {
    icon: Icon,
    color,
  } = config[title] || {
    icon: BookOpen,
    color: "from-gray-500 to-gray-700",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between gap-4">
        {/* Stat Information */}
        <div>
          <p className="text-sm text-gray-500 font-medium">
            {title}
          </p>

          <h2 className="text-4xl font-bold text-gray-900 mt-2">
            {value ?? 0}
          </h2>
        </div>

        {/* Icon */}
        <div
          className={`
            w-14
            h-14
            rounded-2xl
            bg-linear-to-r
            ${color}
            flex
            items-center
            justify-center
            text-white
            shadow-lg
          `}
        >
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;

