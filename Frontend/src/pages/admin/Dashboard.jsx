import { useEffect, useState } from "react";

import { getDashboardStats } from "../../services/dashboardService";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import DashboardHero from "../../components/admin/DashboardHero";
import StatCards from "../../components/admin/StatCard";
import RecentEnrollments from "../../components/admin/RecentEnrollments";
import LatestCourses from "../../components/admin/LatestCourses";
import PlatformActivity from "../../components/admin/PlatformActivity";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">

      <DashboardHero />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

  <StatCards
    title="Students"
    value={stats.totalStudents}
  />

  <StatCards
    title="Mentors"
    value={stats.totalMentors}
  />

  <StatCards
    title="Courses"
    value={stats.totalCourses}
  />

  <StatCards
    title="Enrollments"
    value={stats.totalEnrollments}
  />

</div>

      <div className="grid lg:grid-cols-2 gap-8">

        <LatestCourses
          courses={stats.latestCourses}
        />

        <RecentEnrollments
          enrollments={stats.recentEnrollments}
        />

      
      </div>

      <PlatformActivity
    activities={stats.platformActivity}
/>

    </div>
  );
}

export default Dashboard;