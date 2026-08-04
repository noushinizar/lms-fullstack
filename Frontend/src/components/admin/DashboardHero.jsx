import {
  ShieldCheck,
  CalendarDays,
} from "lucide-react";

function DashboardHero() {
  const user = JSON.parse(localStorage.getItem("user"));

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-3xl bg-linear-to-r from-orange-500 via-amber-500 to-yellow-400 p-10 text-white shadow-xl">

      <div className="flex justify-between items-start">

        <div>

          <h1 className="text-5xl font-bold">
            {greeting}, {user?.name} 👋
          </h1>

          <p className="mt-4 text-lg text-orange-100 max-w-2xl">
            Welcome back! Manage courses, mentors, students and
            keep your learning platform running smoothly.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <div className="flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full">

              <ShieldCheck size={18} />

              <span className="font-medium">
                System Status : Operational
              </span>

            </div>

            <div className="flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full">

              <CalendarDays size={18} />

              <span>
                {today}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DashboardHero;