import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Trophy,
  ClipboardList,
  Video,
  User,
  Users,
  LogOut,
  UserPlus,
  ContactRound,
  Contact,
  ChartNoAxesCombined,
} from "lucide-react";

export const sidebarMenus = {
  student: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
    { name: "Explore Courses", icon: BookOpen, path: "/student/courses" },
    { name: "My Learning", icon: GraduationCap, path: "/student/my-courses" },
    { name: "Certificates", icon: Trophy, path: "/student/certificates" },
    {
      name: "Submissions",
      icon: ClipboardList,
      path: "/student/my-submissions",
    },
    { name: "Live Classes", icon: Video, path: "/student/live-classes" },
    { name: "Profile", icon: User, path: "/student/profile" },
    { name: "Logout", icon: LogOut, path: "/login" },
  ],

  mentor: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/mentor/dashboard" },
    { name: "Courses", icon: BookOpen, path: "/mentor/courses" },
    { name: "Live Classes", icon: Video, path: "/mentor/live-classes" },
    { name: "Profile", icon: User, path: "/mentor/profile" },
    { name: "Logout", icon: LogOut, path: "/login" },
  ],

  admin: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Enrollment Requests", icon: UserPlus, path: "/admin/enrollments" },
    { name: "Courses", icon: BookOpen, path: "/admin/courses" },
    { name: "Live Classes", icon: Video, path: "/admin/live-classes" },
    { name: "People", icon: Users, path: "/admin/people" },
    { name: "Counselors", icon: ContactRound, path: "/admin/counselors" },

    // CRM navigation
    { name: "CRM Dashboard", icon: LayoutDashboard, path: "/crm/dashboard" },
    { name: "Leads", icon: Contact, path: "/crm/leads" },
    {
      name: "CRM Reports",
      icon: ChartNoAxesCombined,
      path: "/crm/workload",
    },

    { name: "Profile", icon: User, path: "/admin/profile" },
    { name: "Logout", icon: LogOut, path: "/login" },
  ],

  admission_counselor: [
    { name: "CRM Dashboard", icon: LayoutDashboard, path: "/crm/dashboard" },
    { name: "Leads", icon: Contact, path: "/crm/leads" },
    {
      name: "CRM Reports",
      icon: ChartNoAxesCombined,
      path: "/crm/workload",
    },
    { name: "Logout", icon: LogOut, path: "/login" },
  ],
};
