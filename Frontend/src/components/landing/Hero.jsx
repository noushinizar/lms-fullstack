import { Link } from "react-router-dom";
import heroImage from "../../assets/heroimg.png";

const Hero = () => {
  return (
    <section id="home" className="bg-linear-to-r from-orange-500 via-amber-500 to-yellow-400">
      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">

          {/* Left Content */}
          <div>

            <span className="inline-block bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-sm font-medium mb-5">
              🚀 Learn Anytime, Anywhere
            </span>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Learn Skills
              <span className="block text-amber-100">
                Build Your Future
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-8">
              Practical courses, expert mentors, real-world projects,
              and certificates to help you grow your career.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                to="/courses"
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-6 py-3 rounded-lg font-semibold transition"
              >
                Explore Courses
              </Link>

              <Link
                to="/register"
                className="border border-white text-white-800 hover:bg-amber-100 px-6 py-3 rounded-lg font-semibold transition"
              >
                Get Started
              </Link>

            </div>

          </div>

          {/* Right Image */}

          <div className="flex justify-center">
            <img
              src={heroImage}
              alt="Learning"
              className="w-full max-w-md"
            />
          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;