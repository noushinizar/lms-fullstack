import {
  FaBookOpen,
  FaChalkboardTeacher,
  FaAward,
  FaLaptopCode,
} from "react-icons/fa";

const features = [
  {
    id: 1,
    title: "Quality Courses",
    description:
      "Learn with well-structured courses designed for beginners and professionals.",
    icon: FaBookOpen,
  },
  {
    id: 2,
    title: "Expert Mentors",
    description:
      "Get guidance and support from experienced mentors throughout your learning journey.",
    icon: FaChalkboardTeacher,
  },
  {
    id: 3,
    title: "Certificates",
    description:
      "Receive verified certificates after successfully completing your courses.",
    icon: FaAward,
  },
  {
    id: 4,
    title: "Hands-on Projects",
    description:
      "Build real-world projects that strengthen your portfolio and practical skills.",
    icon: FaLaptopCode,
  },
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="bg-amber-50 py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900">
            Why Choose Us?
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We provide practical learning, expert mentorship, and recognized
            certificates to help you build real-world skills.
          </p>
        </div>

        {/* Cards */}
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 ">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.id}
                className="bg-amber-100 rounded-xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                  <Icon className="text-4xl text-amber-600" />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-gray-800">
                  {feature.title}
                </h3>

                <p className="mt-3 text-gray-600 leading-7">
                  {feature.description}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;