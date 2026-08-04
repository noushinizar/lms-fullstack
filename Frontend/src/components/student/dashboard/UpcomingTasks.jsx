import { CalendarClock, FileText, ClipboardList } from "lucide-react";

function UpcomingTasks({ tasks = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case "assignment":
        return (
          <ClipboardList
            className="text-orange-500"
            size={20}
          />
        );

      case "quiz":
        return (
          <FileText
            className="text-blue-500"
            size={20}
          />
        );

      default:
        return (
          <CalendarClock
            className="text-gray-500"
            size={20}
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 h-full">

      <h2 className="text-2xl font-bold mb-6">
        Upcoming Tasks
      </h2>

      {tasks.length === 0 ? (
        <p className="text-gray-500">
          No upcoming tasks.
        </p>
      ) : (
        <div className="space-y-5">

          {tasks.map((task, index) => (
            <div
              key={`${task.type}-${task.title}-${index}`}
              className="flex gap-4 items-start  bg-amber-100 p-3 rounded-2xl"
            >
              <div>

                {getIcon(task.type)}

              </div>

              <div className="flex-1">

                <h3 className="font-semibold">
                  {task.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {task.course}
                </p>

                <p className="text-sm text-amber-600 mt-1">
                  Due :{" "}
                  {new Date(task.dueDate).toLocaleDateString("en-IN", {
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

export default UpcomingTasks;