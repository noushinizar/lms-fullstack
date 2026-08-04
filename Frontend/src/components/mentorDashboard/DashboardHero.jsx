function DashboardHero() {

  const user = JSON.parse(localStorage.getItem("user"));

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  return (
    <div className="rounded-3xl bg-linear-to-r from-orange-500 to-amber-400 p-10 text-white shadow-xl">

      <h1 className="text-5xl font-bold">
        {greeting}, {user?.name} 👋
      </h1>

      <p className="mt-4 text-xl text-orange-100 max-w-2xl leading-relaxed">
        Welcome back! Keep creating engaging lessons, reviewing submissions,
        and helping your students achieve their learning goals.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">

        <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-sm font-medium">
          📚 Create Courses
        </span>

        <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-sm font-medium">
          🎥 Upload Lessons
        </span>

        <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-sm font-medium">
          📝 Review Assignments
        </span>

        <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-sm font-medium">
          🎯 Publish Quizzes
        </span>

      </div>

    </div>
  );
}

export default DashboardHero;