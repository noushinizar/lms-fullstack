import { useContext, useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { AuthContext } from "../../context/AuthContext";

import WelcomeBanner from "../../components/student/dashboard/WelcomeBanner";
import DashboardStats from "../../components/student/dashboard/DashboardStats";
import ContinueLearning from "../../components/student/dashboard/ContinueLearning";
import RecentActivity from "../../components/student/dashboard/RecentActivity";
import UpcomingTasks from "../../components/student/dashboard/UpcomingTasks";
import LearningChart from "../../components/student/dashboard/LearningChart";

import { getStudentDashboard } from "../../services/studentDashboardService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function Dashboard() {
  const { user } = useContext(AuthContext);

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await getStudentDashboard();

      setDashboard(data);
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
       <LoadingSpinner/>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        <WelcomeBanner user={user} continueCourse={dashboard?.continueCourse} />

        <DashboardStats stats={dashboard} />
        <ContinueLearning course={dashboard?.continueCourse} />
    <div className="grid lg:grid-cols-3 gap-6">

    <div className="lg:col-span-2">

        <RecentActivity
            activities={dashboard?.recentActivity}
        />

    </div>

    <UpcomingTasks
        tasks={dashboard?.upcomingDeadlines}
    />

</div>
<div className="grid lg:grid-cols-3 gap-6 mt-6">

  <div className="lg:col-span-2">

    <LearningChart
      progress={dashboard?.averageProgress}
    />

  </div>

  <div className="bg-linear-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white flex flex-col justify-center">

    <h2 className="text-3xl font-bold">
      Keep Going! 🚀
    </h2>

    <p className="mt-3 text-white/90">
      Every lesson completed brings you one step closer to mastering your skills.
    </p>

  </div>

</div>
      </div>
    </StudentLayout>
  );
}

export default Dashboard;
