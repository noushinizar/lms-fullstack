import {
  FaUserGraduate,
  FaBookOpen,
  FaChalkboardTeacher,
  FaAward,
} from "react-icons/fa";

const stats = [
  {
    id: 1,
    value: "500+",
    label: "Students",
    icon: FaUserGraduate,
  },
  {
    id: 2,
    value: "20+",
    label: "Courses",
    icon: FaBookOpen,
  },
  {
    id: 3,
    value: "10+",
    label: "Mentors",
    icon: FaChalkboardTeacher,
  },
  {
    id: 4,
    value: "95%",
    label: "Completion Rate",
    icon: FaAward,
  },
];

const Stats = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6 ">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 ">

          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                  <Icon className="text-3xl text-amber-500" />
                </div>

                <h3 className="mt-5 text-3xl font-bold text-gray-900">
                  {item.value}
                </h3>

                <p className="mt-2 text-gray-600">
                  {item.label}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default Stats;