import {
  BookOpen,
  PlayCircle,
  ClipboardList,
  CircleHelp,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function QuickActions() {

  const navigate = useNavigate();

  const actions = [
    {
      title: "Create Course",
      description: "Add a new course",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
      path: "/mentor/courses",
    },
    {
      title: "Add Lesson",
      description: "Upload lesson videos",
      icon: PlayCircle,
      color: "bg-green-100 text-green-600",
      path: "/mentor/courses",
    },
    {
      title: "Create Assignment",
      description: "Create student tasks",
      icon: ClipboardList,
      color: "bg-orange-100 text-orange-600",
      path: "/mentor/courses",
    },
    {
      title: "Create Quiz",
      description: "Build a new quiz",
      icon: CircleHelp,
      color: "bg-purple-100 text-purple-600",
      path: "/mentor/courses",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-6">
        Quick Actions
      </h2>

      <div className="space-y-4">

        {actions.map((action) => {

          const Icon = action.icon;

          return (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className="
                w-full
                flex
                items-center
                justify-between
                p-4
                rounded-xl
                border
                hover:border-orange-400
                hover:bg-orange-50
                transition-all
                duration-300
              "
            >
              <div className="flex items-center gap-4">

                <div
                  className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center`}
                >
                  <Icon size={22}/>
                </div>

                <div className="text-left">

                  <h3 className="font-semibold">
                    {action.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {action.description}
                  </p>

                </div>

              </div>

              <ArrowRight
                size={20}
                className="text-gray-400"
              />

            </button>
          );

        })}

      </div>

    </div>
  );
}

export default QuickActions;