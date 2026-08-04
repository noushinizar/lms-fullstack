import {
  BookOpen,
  ClipboardList,
  Award,
  TrendingUp,
} from "lucide-react";

const cards = [
  {
    title: "Courses",
    key: "totalCourses",
    icon: BookOpen,
    color: "bg-blue-500",
  },
  {
    title: "Assignments",
    key: "pendingAssignments",
    icon: ClipboardList,
    color: "bg-orange-500",
  },
  {
    title: "Certificates",
    key: "certificates",
    icon: Award,
    color: "bg-green-500",
  },
  {
    title: "Progress",
    key: "averageProgress",
    icon: TrendingUp,
    color: "bg-purple-500",
    suffix: "%",
  },
];

function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex justify-between items-center"
          >
            <div>

              <p className="text-gray-500">
                {card.title}
              </p>

              <h2 className="text-3xl font-bold mt-2">

                {stats?.[card.key]}
                {card.suffix || ""}

              </h2>

            </div>

            <div
              className={`${card.color} p-4 rounded-full text-white`}
            >
              <Icon size={28} />
            </div>

          </div>
        );
      })}
    </div>
  );
}

export default DashboardStats;