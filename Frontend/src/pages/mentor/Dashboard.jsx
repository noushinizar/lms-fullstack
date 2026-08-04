import { useEffect, useState } from "react";

import MentorLayout from "../../layouts/MentorLayout";

import DashboardSkeleton from "../../components/mentorDashboard/DashboardSkeleton";

import DashboardHero from "../../components/mentorDashboard/DashboardHero";
import StatsCards from "../../components/mentorDashboard/StatsCards";

import { getMentorDashboard } from "../../services/mentorDashboardService";
import PendingReviews from "../../components/mentorDashboard/PendingReviews";
import AssignedCourses from "../../components/mentorDashboard/AssignedCourses";
import RecentActivity from "../../components/mentorDashboard/RecentActivity";
import QuickActions from "../../components/mentorDashboard/QuickActions";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await getMentorDashboard();

      setDashboard(data);
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
    <>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-8">
          <DashboardHero dashboard={dashboard} />

          <StatsCards dashboard={dashboard} />
          
          <div className="grid lg:grid-cols-2 gap-8">
           
             <RecentActivity
        activities={dashboard.recentActivity}
    />
            <PendingReviews submissions={dashboard.pendingAssignments} />
          </div>
 <AssignedCourses courses={dashboard.assignedCourses} />
        </div>
      )}
    </>
  );
}

export default Dashboard;
