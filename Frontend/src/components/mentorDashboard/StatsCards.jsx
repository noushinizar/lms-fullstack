import {
  BookOpen,
  Users,
  PlayCircle,
  ClipboardCheck,
} from "lucide-react";

const cards = [
  {
    title: "Courses",
    key: "totalCourses",
    icon: BookOpen,
    color: "bg-blue-500",
  },
  {
    title: "Students",
    key: "totalStudents",
    icon: Users,
    color: "bg-green-500",
  },
  {
    title: "Pending Reviews",
    key: "pendingReviews",
    icon: ClipboardCheck,
    color: "bg-red-500",
  },
];

function StatsCards({ dashboard }) {

  return (

<div className="grid md:grid-cols-3 gap-6">

      {cards.map((card) => {

        const Icon = card.icon;

        return (

          <div
            key={card.title}
            className="bg-white rounded-2xl shadow-md p-8 flex justify-between items-center"
          >

            <div>

              <p className="text-gray-500">
                {card.title}
              </p>

              <h2 className="text-4xl font-bold mt-2">

                {dashboard[card.key]}

              </h2>

            </div>

            <div
              className={`${card.color} w-16 h-16 rounded-full flex items-center justify-center text-white`}
            >

              <Icon size={30} />

            </div>

          </div>

        );

      })}

    </div>

  );

}

export default StatsCards;