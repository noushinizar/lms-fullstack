import { CheckCircle, ClipboardCheck, Award, BookOpen } from "lucide-react";

function RecentActivity({ activities = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case "lesson":
        return <CheckCircle className="text-green-500" size={20} />;

      case "assignment":
        return <ClipboardCheck className="text-blue-500" size={20} />;

      case "certificate":
        return <Award className="text-amber-500" size={20} />;

      default:
        return <BookOpen className="text-purple-500" size={20} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

      {activities.length === 0 ? (
        <p className="text-gray-500">No recent activity.</p>
      ) : (
        <div className="space-y-5">
          {activities.map((activity,index) => (
            <div
              key={`${activity.type}-${activity.date}-${index}`}
              className="flex items-start gap-4 bg-amber-100 p-3 rounded-2xl"
            >
              <div className="mt-1">{getIcon(activity.type)}</div>

              <div className="flex-1">
                <p className="font-medium">{activity.title}</p>

               <p className="text-sm text-gray-500">
  {new Date(activity.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}
</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;
