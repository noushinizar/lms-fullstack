import { BookOpen, Sparkles } from "lucide-react";

function WelcomeBanner({ user, continueCourse }) {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 via-orange-500 to-yellow-500 text-white p-8 shadow-xl">

      {/* Decorative Circles */}

      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>

      <div className="absolute bottom-0 right-32 w-20 h-20 bg-white/10 rounded-full"></div>

      <div className="relative flex flex-col md:flex-row justify-between items-center">

        <div>

          <h1 className="text-4xl font-bold">

            {greeting}, {user?.name} 👋

          </h1>

          <p className="mt-3 text-lg text-white/90">

            Keep learning and achieve your goals.

          </p>

          {continueCourse && (
            <p className="mt-4 font-semibold flex items-center gap-2">

              <Sparkles size={20} />

              You're {continueCourse.progress}% through{" "}
              <span className="font-bold">
                {continueCourse.title}
              </span>

            </p>
          )}

        </div>

        <div className="hidden md:flex">

          <BookOpen size={120} className="opacity-20" />

        </div>

      </div>

    </div>
  );
}

export default WelcomeBanner;