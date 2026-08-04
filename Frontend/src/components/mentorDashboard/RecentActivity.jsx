import {
  BookOpen,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";

const activityConfig = {
  lesson: {
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600",
  },

  assignment: {
    icon: ClipboardList,
    color: "bg-orange-100 text-orange-600",
  },

  quiz: {
    icon: GraduationCap,
    color: "bg-purple-100 text-purple-600",
  },
};

function RecentActivity({ activities }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Recent Activity
        </h2>

        <span className="text-sm text-gray-500">
          {activities.length} Activities
        </span>

      </div>

      {/* Activity List */}

      <div className="space-y-4">

        {activities.length === 0 ? (

          <div className="text-center py-10 text-gray-500">

            No recent activity.

          </div>

        ) : (

          activities.map((activity, index) => {

            const config =
              activityConfig[activity.type];

            const Icon = config.icon;

            return (

              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-amber-50 transition"
              >

                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${config.color}`}
                >

                  <Icon size={22} />

                </div>

                <div className="flex-1">

                  <h3 className="font-semibold">
                    {activity.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">

                    {formatDistanceToNow(
                      new Date(activity.date),
                      {
                        addSuffix: true,
                      }
                    )}

                  </p>

                </div>

              </div>

            );

          })

        )}

      </div>

    </div>
  );
}

export default RecentActivity;