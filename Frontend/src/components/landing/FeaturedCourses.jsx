import { Link } from "react-router-dom";

const FeaturedCourses = () => {
  const featuredCourses = [
    {
      id: 1,
      title: "MERN Stack Development",
      level: "Beginner",
      lessons: 32,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyj41x5ZkIiqWmcFdLXHYwV_SqWGwKSiqUR5LMYK9lJg&s=10",
    },
    {
      id: 2,
      title: "Flutter Development",
      level: "Intermediate",
      lessons: 28,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsJ8kJp5VicfBnT_AygsQ5KTG9TH8Mocvw6ajK4xx56A&s=10",
    },
    {
      id: 3,
      title: "React.js Masterclass",
      level: "Beginner",
      lessons: 24,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg3J2WBgKHam0DdoGipLz2pfUg0d1VPFcYDP67cV2o_Q&s=10",
    },
    {
      id: 4,
      title: "Node.js & Express",
      level: "Advanced",
      lessons: 30,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdd1AUKSlY6jVWiPh-pF5ft58NOiR9ji5Fo_caUhEKOg&s=10",
    },
  ];

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="max-w-8xl mx-auto px-7 ">

        {/* Heading */}
        <div className="text-center mb-12 ">
          <h2 className="text-4xl font-bold text-gray-900">
            Featured Courses
          </h2>

          <p className="mt-4 text-gray-600">
            Discover our most popular courses and start learning today.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4  ">

          {featuredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-amber-100 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 hover:-translate-y-2"
            >
              <img
                src={course.image}
                alt={course.title}
                className="h-48 w-full object-cover"
              />

              <div className="p-5">

                <span className="inline-block bg-amber-100 text-amber-700 text-sm px-3 py-1 rounded-full">
                  {course.level}
                </span>

                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  {course.title}
                </h3>

                <p className="mt-2 text-gray-500">
                  {course.lessons} Lessons
                </p>

                <Link
                  to="/courses"
                  className="mt-6 inline-block w-full text-center bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg transition"
                >
                  View Course
                </Link>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default FeaturedCourses;